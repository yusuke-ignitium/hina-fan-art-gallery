# HINA FAN ART GALLERY

Google Drive フォルダ内のファンアート画像を一覧表示するギャラリーサイト。
Google Apps Script Web App としてホスティングする(匿名アクセス可)。

- 画像はリポジトリに置かない。[Drive フォルダ](https://drive.google.com/drive/folders/1DxO5Q7rvJ0lJWuqxck_JonADy_rxdrU6)が原本で、画像を追加すれば次回アクセスから自動反映される
- タイトルはファイル名から拡張子を除いたもの。`-` / `_` は表示上のみスペースに置き換わる
- LIKE はスプレッドシートに記録され、表示順は LIKE 多い順(デフォルト)・新しい順・古い順から選べる

## 初期セットアップ(初回のみ)

前提: Node.js がインストールされていること。

```powershell
# 1. clasp をインストール
npm install -g @google/clasp

# 2. Google Apps Script API を有効化(ブラウザで、初回のみ)
#    https://script.google.com/home/usersettings

# 3. 自分のGoogleアカウントでログイン(ブラウザ認証が開く)
clasp login

# 4. Apps Script プロジェクトを作成(.clasp.json が生成される)
clasp create-script --title "HINA FAN ART GALLERY" --rootDir src
git checkout -- src/appsscript.json  # create-scriptが上書きするマニフェストを戻す

# 5. コードをアップロード
npm run push

# 6. エディタを開く
clasp open-script
```

1. エディタ上部のプルダウンで **`setup`** を選択して実行 → 権限を承認
   - LIKE 記録用スプレッドシートが作成される(URLは実行ログに出る)
   - 画像フォルダが「リンクを知っている全員が閲覧可」になる(匿名閲覧者への画像配信に必須)
2. デプロイを作成:

```powershell
clasp create-deployment --description "initial"
```

3. ギャラリーURLは `https://script.google.com/macros/s/<デプロイID>/exec`

## 画像の追加

Drive フォルダに画像をアップロードするだけ。デプロイ操作は不要。

## コード修正の反映

```powershell
npm run push
clasp update-deployment <デプロイID>
```

(デプロイIDは `clasp list-deployments` で確認。URLは変わらない)

## LIKE の確認

スプレッドシートの `likes` シートに 1 リアクション = 1 行で追記される
(`timestamp` / `fileId` / `respondentId` / `action`)。
集計は fileId × respondentId ごとに最後の action が `add` のユニーク数。
