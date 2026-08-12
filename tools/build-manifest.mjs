// images/ 配下の画像から images.json を生成する。
// created / author はファイルが git に最初に追加されたコミットの日時と author 名
// (未コミットなら mtime / author なしにフォールバック)。
// ローカル確認・GitHub Actions のデプロイ時の両方で使う。
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const IMAGES_DIR = 'images';
const EXT = /\.(png|jpe?g|webp|gif|avif)$/i;

function gitInfo(file) {
  try {
    const out = execFileSync(
      'git',
      ['log', '--follow', '--format=%ct%x09%an', '--', join(IMAGES_DIR, file)],
      { encoding: 'utf8' }
    ).trim();
    if (out) {
      const lines = out.split('\n');
      const [firstCt, firstAn] = lines[lines.length - 1].split('\t'); // 最初に追加されたコミット
      const [lastCt] = lines[0].split('\t'); // 最後に変更されたコミット
      return {
        created: Number(firstCt) * 1000,
        updated: Number(lastCt) * 1000,
        author: firstAn || null,
      };
    }
  } catch {
    // git が使えない環境ではフォールバック
  }
  const mtime = Math.floor(statSync(join(IMAGES_DIR, file)).mtimeMs);
  return { created: mtime, updated: mtime, author: null };
}

const items = readdirSync(IMAGES_DIR)
  .filter(f => EXT.test(f))
  .map(file => ({ file, ...gitInfo(file) }))
  .sort((a, b) => b.created - a.created);

writeFileSync('images.json', JSON.stringify(items, null, 2) + '\n');
console.log(`images.json を生成しました (${items.length} 件)`);
