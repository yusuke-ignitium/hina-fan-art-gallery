# hina-fan-art-gallery

Google Drive フォルダの画像を一覧表示するファンアートギャラリー。
LIKE をスプレッドシートに記録し、LIKE 多い順(デフォルト)・新しい順・古い順で表示できる。
アーキテクチャは kirinuki-survey 準拠。

## 構成

- **ホスティング**: Google Apps Script Web App(匿名アクセス可・オーナーとして実行)
- **画像**: [Drive フォルダ](https://drive.google.com/drive/folders/1DxO5Q7rvJ0lJWuqxck_JonADy_rxdrU6)が原本。リポジトリにはコミットしない。doGet 時に DriveApp で一覧するため、画像の追加・削除は再デプロイ不要で反映される
- **データストア**: Google Sheets(likes シート。1リアクション=1行: timestamp / fileId / respondentId / action)
- **デプロイ**: clasp によるローカルデプロイ。各利用者が自分のGoogleアカウントで `clasp login` する(認証情報・`.clasp.json` はコミットしない)

```
src/Code.gs      setup / doGet / submitLike / LIKE集計
src/Index.html   ギャラリーUI(グリッド+ライトボックスカルーセル)
tools/build-preview.mjs   モックデータ入り .preview/preview.html 生成(ローカルUI確認用)
```

## コマンド

```powershell
npm run push     # clasp push -f
clasp update-deployment <デプロイID>   # WebアプリのURLを変えずに新バージョン反映
node tools/build-preview.mjs   # ローカルUI確認用HTML生成(.claude/launch.json の preview で開く)
```

## 仕様メモ

- タイトルはファイル名から拡張子を除去したもの。`-` / `_` → スペース置換は**表示時のみ**クライアントで行う(データ上は原本のまま)
- 画像URLは `lh3.googleusercontent.com/d/<id>` を使用。フォルダが「リンクを知っている全員が閲覧可」であることが前提(setup() が設定する)
- LIKE は localStorage の respondentId で匿名識別。集計は respondentId ユニーク・最終 action ベース
- デザインは god-selection-xxx.com 参考のミニマル白背景・黒テキスト。ヘッダは「HINA FAN ART GALLERY」のテキストのみ(ヒーロー画像なし)

## ルール・注意

- UI(`src/Index.html`)のデザイン変更はユーザーの明示的な指示がある場合のみ
- `.clasprc.json` / `.clasp.json` は絶対にコミットしない(gitignore済み)
- コミットは `/commit` スキルの構造化フォーマットに従う
