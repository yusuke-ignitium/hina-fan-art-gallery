// HINA FAN ART GALLERY
// Google Drive フォルダ内の画像を一覧表示するギャラリー Web アプリ。
// 画像はリポジトリに置かず、下記フォルダが原本。追加・削除は次回アクセスから自動反映される。

const FOLDER_ID = '1DxO5Q7rvJ0lJWuqxck_JonADy_rxdrU6';
const PROP_SPREADSHEET_ID = 'SPREADSHEET_ID';
const LIKES_SHEET_NAME = 'likes';
const LIKES_HEADER = ['timestamp', 'fileId', 'respondentId', 'action'];

/**
 * 初期セットアップ(オーナーがエディタから1回実行)。
 * - LIKE 記録用スプレッドシートを作成し、IDをスクリプトプロパティに保存
 * - 画像フォルダを「リンクを知っている全員が閲覧可」に設定
 *   (匿名の閲覧者に画像を配信するために必須)
 */
function setup() {
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty(PROP_SPREADSHEET_ID);
  if (!ssId) {
    const ss = SpreadsheetApp.create('hina-fan-art-gallery');
    const sheet = ss.getSheets()[0];
    sheet.setName(LIKES_SHEET_NAME);
    sheet.getRange(1, 1, 1, LIKES_HEADER.length).setValues([LIKES_HEADER]);
    ssId = ss.getId();
    props.setProperty(PROP_SPREADSHEET_ID, ssId);
  }
  DriveApp.getFolderById(FOLDER_ID)
    .setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  Logger.log('スプレッドシート: https://docs.google.com/spreadsheets/d/' + ssId + '/edit');
  Logger.log('画像フォルダを「リンクを知っている全員が閲覧可」に設定しました');
}

function doGet() {
  const template = HtmlService.createTemplateFromFile('Index');
  template.initialDataJson = JSON.stringify(getGalleryData_());
  return template
    .evaluate()
    .setTitle('HINA FAN ART GALLERY')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** フォルダ内の画像一覧と LIKE 集計を返す */
function getGalleryData_() {
  const items = [];
  const files = DriveApp.getFolderById(FOLDER_ID).getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType().indexOf('image/') !== 0) continue;
    items.push({
      id: file.getId(),
      // 拡張子を除いたファイル名。区切り文字→スペース変換は表示時にクライアントで行う
      name: file.getName().replace(/\.[^.]+$/, ''),
      created: file.getDateCreated().getTime(),
    });
  }
  return { items: items, likes: getLikeCounts_() };
}

/**
 * LIKE 送信。1リアクション=1行で likes シートに追記する。
 * action は 'add'(LIKE) か 'remove'(取り消し)。
 * 集計は fileId × respondentId ごとに最後の action が 'add' のユニーク数。
 */
function submitLike(fileId, respondentId, action) {
  if (typeof fileId !== 'string' || !/^[\w-]{10,100}$/.test(fileId)) {
    throw new Error('invalid fileId');
  }
  if (typeof respondentId !== 'string' || !/^[\w-]{8,64}$/.test(respondentId)) {
    throw new Error('invalid respondentId');
  }
  if (action !== 'add' && action !== 'remove') {
    throw new Error('invalid action');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10 * 1000);
  try {
    getLikesSheet_().appendRow([new Date(), fileId, respondentId, action]);
  } finally {
    lock.releaseLock();
  }
}

function getLikesSheet_() {
  const ssId = PropertiesService.getScriptProperties().getProperty(PROP_SPREADSHEET_ID);
  if (!ssId) throw new Error('setup() が未実行です');
  return SpreadsheetApp.openById(ssId).getSheetByName(LIKES_SHEET_NAME);
}

/** fileId → LIKE 数(respondentId ユニーク・最終 action ベース) */
function getLikeCounts_() {
  const sheet = getLikesSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};
  const rows = sheet.getRange(2, 1, lastRow - 1, LIKES_HEADER.length).getValues();
  const latest = {}; // fileId -> respondentId -> 'add' | 'remove'
  rows.forEach(function (row) {
    const fileId = row[1];
    const respondentId = row[2];
    const action = row[3];
    if (!fileId || !respondentId) return;
    if (!latest[fileId]) latest[fileId] = {};
    latest[fileId][respondentId] = action;
  });
  const counts = {};
  Object.keys(latest).forEach(function (fileId) {
    counts[fileId] = Object.keys(latest[fileId]).filter(function (rid) {
      return latest[fileId][rid] === 'add';
    }).length;
  });
  return counts;
}
