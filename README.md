# HINA FAN ART GALLERY

ファンアート画像を一覧表示する静的ギャラリーサイト。GitHub Pages でホスティングする。

**公開URL**: https://yusuke-ignitium.github.io/hina-fan-art-gallery/

- `images/` 配下の画像が原本。リポジトリがすべて(外部ストレージ・サーバー・APIキーなし)
- タイトルはファイル名から拡張子を除いたもの。`-` / `_` は表示上のみスペースに置き換わる
- 並び順は新しい順(デフォルト)・古い順。「新しさ」は画像が git に最初に追加されたコミット日時
- クリックで拡大表示。カルーセルは矢印キー・マウスホイール・スワイプで前後移動

## 画像の追加

`images/` に画像を置いて PR を作るだけ。GitHub の Web UI なら images フォルダを開いて
「Add file → Upload files」にドラッグ&ドロップで PR が作れる。
マージされると GitHub Actions が `images.json` を再生成して自動デプロイする。

## 仕組み

```
index.html                 ギャラリー本体(依存なしの静的HTML)
images/                    画像(原本)
images.json                画像一覧+追加日時(Actions がデプロイ時に生成)
tools/build-manifest.mjs   images.json 生成スクリプト
.github/workflows/pages.yml  push 時に manifest 生成 + Pages デプロイ
```

## ローカル確認

```powershell
node tools/build-manifest.mjs   # images.json を生成
npx -y http-server . -p 8791    # http://localhost:8791 で確認
```

## 初回セットアップ(済んでいれば不要)

1. GitHub にリポジトリを作成して push
2. リポジトリの Settings → Pages → Source を「GitHub Actions」にする
   (初回の workflow 実行が自動で有効化するため、通常は操作不要)
3. main に push すると `https://<owner>.github.io/<repo>/` に公開される
