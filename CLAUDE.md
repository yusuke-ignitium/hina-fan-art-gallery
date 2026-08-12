# hina-fan-art-gallery

ファンアート画像の静的ギャラリーサイト。GitHub Pages でホスティング。
サーバー・データストア・外部権限は一切なし(以前の GAS + Drive + スプシ構成は廃止済み)。

## 構成

- **ホスティング**: GitHub Pages(GitHub Actions でデプロイ)
- **画像**: `images/` にコミットされたファイルが原本。追加は PR(GitHub Web UI のアップロードでも可)
- **一覧データ**: `images.json`。Actions がデプロイ時に `tools/build-manifest.mjs` で生成。
  created は git に最初に追加されたコミット日時(未コミットファイルは mtime フォールバック)

```
index.html                 ギャラリーUI(グリッド+ライトボックスカルーセル、依存なし)
images/                    画像の原本
tools/build-manifest.mjs   images.json 生成
.github/workflows/pages.yml  Pages デプロイ
```

## コマンド

```powershell
node tools/build-manifest.mjs   # images.json 生成
npx -y http-server . -p 8791    # ローカル確認(.claude/launch.json の preview でも可)
```

## 仕様メモ

- タイトルはファイル名から拡張子を除去したもの。`-` / `_` → スペース置換は**表示時のみ**クライアントで行う(ファイル名は原本のまま)
- 並び順: 新しい順(デフォルト)/古い順。LIKE 機能は権限問題の議論の末に**意図的に削除**した(復活させる場合はスプシバインド + spreadsheets.currentonly の GAS を検討)
- デザインは god-selection-xxx.com 参考のミニマル白背景・黒テキスト。ヘッダは「HINA FAN ART GALLERY」のテキストのみ(ヒーロー画像なし)

## ルール・注意

- UI(`index.html`)のデザイン変更はユーザーの明示的な指示がある場合のみ
- 画像の削除・リネームはしない(タイトルとURLが変わるため。必要ならユーザーに確認)
- コミットは `/commit` スキルの構造化フォーマットに従う
