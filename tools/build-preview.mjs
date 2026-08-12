// src/Index.html からローカル確認用の .preview/preview.html を生成する。
// GAS テンプレートトークンをモックデータに、Drive 画像URLをプレースホルダ画像に置き換える。
// 使い方: node tools/build-preview.mjs → .claude/launch.json の "preview" サーバーで開く
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const mockData = {
  items: [
    { id: '101', name: 'neon_city-night_walk', created: 1723500000000 },
    { id: '102', name: 'ChatGPT Image 2026年8月13日', created: 1723400000000 },
    { id: '103', name: 'hina-summer_festival', created: 1723300000000 },
    { id: '104', name: 'rainy-day_sketch', created: 1723200000000 },
    { id: '105', name: 'portrait_study-01', created: 1723100000000 },
    { id: '106', name: 'beach-episode_fanart', created: 1723000000000 },
  ],
  likes: { 103: 5, 101: 2, 105: 1 },
};

const html = readFileSync('src/Index.html', 'utf8')
  .replace('<?!= initialDataJson ?>', JSON.stringify(mockData))
  .replace(
    "'https://lh3.googleusercontent.com/d/' + id + '=w800'",
    "'https://picsum.photos/seed/' + id + '/800/800'"
  )
  .replace(
    "'https://lh3.googleusercontent.com/d/' + id + '=s2048'",
    "'https://picsum.photos/seed/' + id + '/1400/1000'"
  );

mkdirSync('.preview', { recursive: true });
writeFileSync('.preview/preview.html', html);
console.log('.preview/preview.html を生成しました');
