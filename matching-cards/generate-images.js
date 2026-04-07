#!/usr/bin/env node
/**
 * matching-cards generate-images.js
 * 使用 MiniMax Image-01 生成配對卡牌圖像
 * 
 * 用法: node generate-images.js [--pair N] [--all]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = __dirname;

// MiniMax Image-01 API
const API_KEY = process.env.MINIMAX_API_KEY || '';
const API_URL = 'https://api.minimax.io/v1/image_generation';

// 圖像 prompt 列表
const prompts = [
  {
    id: 'pair1-Q1',
    prompt: '直角坐標系 grid from -5 to 5 on both axes, point P marked at (3,4) with label "P(3,4)", Q1 highlighted, axes labeled x and y, light gridlines, white background, clean vector style math diagram'
  },
  {
    id: 'pair2-Q2',
    prompt: '直角坐標系 grid from -5 to 5 on both axes, point Q marked at (-2,1) with label "Q(-2,1)", Q2 highlighted, axes labeled x and y, light gridlines, white background, clean vector style math diagram'
  },
  {
    id: 'pair3-Q3',
    prompt: '直角坐標系 grid from -5 to 5 on both axes, point R marked at (-1,-3) with label "R(-1,-3)", Q3 highlighted, axes labeled x and y, light gridlines, white background, clean vector style math diagram'
  },
  {
    id: 'pair4-Q4',
    prompt: '直角坐標系 grid from -5 to 5 on both axes, point S marked at (2,-3) with label "S(2,-3)", Q4 highlighted, axes labeled x and y, light gridlines, white background, clean vector style math diagram'
  },
  {
    id: 'pair5-yaxis',
    prompt: '直角坐標系 grid from -5 to 5 on both axes, point T marked at (0,4) on y-axis with label "T(0,4)", y-axis highlighted, axes labeled, light gridlines, white background, clean vector style math diagram'
  },
  {
    id: 'pair6-xaxis',
    prompt: '直角坐標系 grid from -5 to 5 on both axes, point U marked at (-3,0) on x-axis with label "U(-3,0)", x-axis highlighted, axes labeled, light gridlines, white background, clean vector style math diagram'
  },
  {
    id: 'pair7-eq',
    prompt: 'Simple horizontal number line from 0 to 8, arrow pointing right, point x=4 highlighted with large orange dot and label "x=4", equation "x+3=7" written above, showing x moves to 4, clean math diagram style, white background'
  },
  {
    id: 'pair8-eq',
    prompt: 'Simple horizontal number line from 0 to 10, arrow pointing right, point y=5 highlighted with large orange dot and label "y=5", equation "2y=10" written above, showing y moves to 5, clean math diagram style, white background'
  },
  {
    id: 'pair9-line',
    prompt: '直角坐標系 grid from -5 to 5 on both axes, line y=x drawn as straight line through origin at 45 degrees, points (1,1) and (-1,-1) marked, label "y=x", axes labeled x and y, light gridlines, white background, clean vector style math diagram'
  },
  {
    id: 'pair10-line',
    prompt: '直角坐標系 grid from -5 to 5 on both axes, line y=2x+1 drawn, y-intercept at (0,1) marked with dot and label "(0,1)", point (1,3) marked, label "y=2x+1", axes labeled, light gridlines, white background, clean vector style math diagram'
  },
];

async function generateImage(promptData) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'Image-01',
      prompt: promptData.prompt,
      num_images: 1,
      aspect_ratio: '1:1',
      response_format: 'url'
    });

    const options = {
      hostname: 'api.minimax.io',
      path: '/v1/image_generation',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.data && json.data[0] && json.data[0].url) {
            resolve({ id: promptData.id, url: json.data[0].url });
          } else {
            reject(new Error(`API error: ${JSON.stringify(json)}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const stream = fs.createWriteStream(filepath);
      res.pipe(stream);
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (!API_KEY) {
    console.error('❌ 請設定 MINIMAX_API_KEY 環境變量');
    console.error('   export MINIMAX_API_KEY="..."');
    process.exit(1);
  }

  let targets = prompts;
  if (args.includes('--pair')) {
    const idx = args.indexOf('--pair') + 1;
    const n = parseInt(args[idx]);
    targets = prompts.slice(n - 1, n);
  }

  console.log(`🎯 開始生成 ${targets.length} 張圖像...\n`);

  for (const p of targets) {
    try {
      console.log(`📤 生成: ${p.id}...`);
      const result = await generateImage(p);
      const filepath = path.join(OUTPUT_DIR, `${p.id}.png`);
      await downloadImage(result.url, filepath);
      console.log(`✅ 已儲存: ${filepath}`);
    } catch (e) {
      console.error(`❌ ${p.id} 失敗: ${e.message}`);
    }
  }

  console.log('\n🎉 完成！');
}

main().catch(console.error);
