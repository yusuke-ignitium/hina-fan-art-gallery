// images/ 配下の画像から images.json を生成する。
// created はファイルが git に最初に追加されたコミットの日時(未コミットなら fs の mtime)。
// ローカル確認・GitHub Actions のデプロイ時の両方で使う。
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const IMAGES_DIR = 'images';
const EXT = /\.(png|jpe?g|webp|gif|avif)$/i;

function createdMs(file) {
  try {
    const out = execFileSync(
      'git',
      ['log', '--follow', '--diff-filter=A', '--format=%ct', '--', join(IMAGES_DIR, file)],
      { encoding: 'utf8' }
    ).trim();
    if (out) {
      const lines = out.split('\n');
      return Number(lines[lines.length - 1]) * 1000; // 最初に追加されたコミット
    }
  } catch {
    // git が使えない環境では mtime にフォールバック
  }
  return Math.floor(statSync(join(IMAGES_DIR, file)).mtimeMs);
}

const items = readdirSync(IMAGES_DIR)
  .filter(f => EXT.test(f))
  .map(file => ({ file, created: createdMs(file) }))
  .sort((a, b) => b.created - a.created);

writeFileSync('images.json', JSON.stringify(items, null, 2) + '\n');
console.log(`images.json を生成しました (${items.length} 件)`);
