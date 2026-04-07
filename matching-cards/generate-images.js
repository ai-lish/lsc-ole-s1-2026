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
const os = require('os');

const OUTPUT_DIR = __dirname;

// MiniMax Image-01 API - try env first, then secrets.json
let API_KEY = process.env.MINIMAX_API_KEY || '';
if (!API_KEY) {
  try {
    const secretsPath = path.join(os.homedir(), '.openclaw', 'secrets.json');
    if (fs.existsSync(secretsPath)) {
      const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
      API_KEY = secrets['minimax-api-key'] || '';
    }
  } catch (e) { /* ignore */ }
}

// 圖像 prompt 列表（代數 + 幾何章節）
const prompts = [
  // === Ch10 坐標簡介 ===
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
  // === Ch5 面積與體積 ===
  {
    id: 'trapezoid-area',
    prompt: 'Trapezoid with top base a and bottom base b and height h clearly marked; label the top base as a and bottom base as b and show perpendicular height h with right angle marker; include formula "A = 1/2 (a + b) h" in Traditional Chinese nearby; clean vector diagram, white background, high contrast lines'
  },
  // === Ch12 全等三角形 ===
  {
    id: 'cong-sas',
    prompt: 'Two congruent triangles ABC and DEF side-by-side, SAS highlighted: mark AB=DE and BC=EF with tick marks, mark included angle ∠B = ∠E with red arc, labels A,B,C and D,E,F, clean vector math diagram, white background, Traditional Chinese labels, high contrast lines'
  },
  {
    id: 'cong-asa',
    prompt: 'Two congruent triangles ABC and DEF side-by-side, ASA highlighted: mark ∠A=∠D and ∠B=∠E with angle arcs, mark side AB=DE with tick, labels A,B,C and D,E,F, clean vector diagram on white background, Traditional Chinese'
  },
  {
    id: 'cong-aas',
    prompt: 'Two congruent triangles ABC and DEF, AAS highlighted: show ∠A=∠D, ∠B=∠E and non-included equal side BC=EF marked with tick, clear arcs and marks, Traditional Chinese labels, clean vector style, white background'
  },
  {
    id: 'cong-sss',
    prompt: 'Two congruent triangles ABC and DEF, SSS highlighted: three sides AB=DE, BC=EF, CA=FD marked with matching tick sets, clear labeling, vector diagram, white background, Traditional Chinese labels'
  },
  {
    id: 'cong-rhs',
    prompt: 'Two right triangles ABC and DEF side-by-side, RHS highlighted: right angles at C and F marked with small squares, hypotenuse AB=DE with double tick, another side BC=EF with single tick, labels A,B,C and D,E,F, clean vector math diagram, white background, Traditional Chinese label'
  },
  // === Ch11 平行線與角 ===
  {
    id: 'parallel-corresponding',
    prompt: 'Two parallel horizontal lines cut by a transversal, show corresponding angles labeled a and a on matching positions, arcs colored orange, labels in Traditional Chinese (同位角), clean vector diagram, white background'
  },
  {
    id: 'parallel-alternate',
    prompt: 'Two parallel horizontal lines and a transversal, show alternate interior angles labeled b and b, colored arcs, Traditional Chinese label (內錯角), vector diagram, white background'
  },
  {
    id: 'parallel-consecutive',
    prompt: 'Two parallel lines cut by a transversal, show same-side interior angles labeled c and d with note c + d = 180 degrees, annotate in Traditional Chinese (同旁內角互補), clean vector style, white background'
  },
  {
    id: 'vertical-opposite',
    prompt: 'Two intersecting straight lines, mark vertical opposite angles labelled e and e, show equality and arcs, Traditional Chinese label (對頂角), clean vector, white background'
  },
  {
    id: 'triangle-sum',
    prompt: 'Triangle ABC with three interior angles shaded and labelled alpha beta gamma, include text "alpha + beta + gamma = 180 degrees" in Traditional Chinese, clean vector diagram, white background'
  },
  // === Ch6 多項式面積模型 ===
  {
    id: 'area-model-x2',
    prompt: 'Area model for (x+2)(x+3): rectangle partitioned into cells representing x-squared 2x 3x and 6; label each part and show algebraic sum in Traditional Chinese, clean vector, white background'
  },
  {
    id: 'area-model-square',
    prompt: 'Area model for (x+1)-squared: square divided into x-squared 2x 1, labels and algebraic expression shown, Traditional Chinese, vector, white background'
  }
];

async function generateImage(promptData) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'image-01',
      prompt: promptData.prompt,
      n: 1,
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
          // Try several possible response shapes
          if (json.data && Array.isArray(json.data) && json.data[0] && json.data[0].url) {
            resolve({ id: promptData.id, url: json.data[0].url });
            return;
          }
          if (json.data && json.data.image_urls && Array.isArray(json.data.image_urls) && json.data.image_urls.length > 0) {
            resolve({ id: promptData.id, url: json.data.image_urls[0] });
            return;
          }
          if (json.data && Array.isArray(json.data) && json.data[0] && json.data[0].image_url) {
            resolve({ id: promptData.id, url: json.data[0].image_url });
            return;
          }
          if (json.data && json.data.image_url) {
            resolve({ id: promptData.id, url: json.data.image_url });
            return;
          }
          reject(new Error(`API error: ${JSON.stringify(json)}`));
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
    try {
      const { URL } = require('url');
      const parsed = new URL(url);
      const client = parsed.protocol === 'http:' ? require('http') : require('https');
      client.get(parsed, (res) => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          reject(new Error(`HTTP ${res.statusCode} when downloading ${url}`));
          return;
        }
        const stream = fs.createWriteStream(filepath);
        res.pipe(stream);
        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
      }).on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (!API_KEY) {
    console.error('❌ 請設定 MINIMAX_API_KEY 環境變量或確認 secrets.json 有 minimax-api-key');
    console.error('   export MINIMAX_API_KEY=\"...\"');
    process.exit(1);
  }

  let targets = prompts;
  if (args.includes('--pair')) {
    const idx = args.indexOf('--pair') + 1;
    const n = parseInt(args[idx]);
    targets = prompts.slice(n - 1, n);
  } else if (args.includes('--chapter')) {
    const idx = args.indexOf('--chapter') + 1;
    const ch = args[idx];
    targets = prompts.filter(p => p.id.startsWith(ch));
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
