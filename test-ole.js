#!/usr/bin/env node
/**
 * 全方位学习日 自动化测试脚本
 */

const { chromium } = require('playwright');

const TEST_CONFIG = {
    baseUrl: 'https://math-lish.github.io/lsc-ole-s1-2026/',
    pages: [
        { name: 'index', path: 'index.html', width: 1280, height: 800 },
        { name: 'teacher', path: 'teacher.html', width: 1280, height: 800 },
        { name: 'leader', path: 'leader.html', width: 390, height: 844 },
        { name: 'index-mobile', path: 'index.html', width: 390, height: 844 }
    ]
};

const tests = {
    index: [
        { name: '1.1', test: '页面标题', check: 'title' },
        { name: '1.2', test: '活动Logo显示', check: 'logo' },
        { name: '1.3', test: '活动时间表', check: 'schedule' },
        { name: '1.4', test: '活动路线下载', check: 'map-download' },
        { name: '1.5', test: '注意事项', check: 'notice' },
        { name: '1.6', test: '下载专区', check: 'download' },
        { name: '1.7', test: '老师版连结', check: 'teacher-link' },
        { name: '1.8', test: '带队版连结', check: 'leader-link' }
    ],
    teacher: [
        { name: '2.1', test: '页面标题', check: 'title' },
        { name: '2.2', test: '活动前 section', check: 'pre' },
        { name: '2.3', test: '活动中 section', check: 'during' },
        { name: '2.4', test: '活动后 section', check: 'post' },
        { name: '2.5', test: '分工安排', check: 'tasks' },
        { name: '2.6', test: '紧急联络', check: 'emergency' },
        { name: '2.7', test: '下载专区', check: 'download' },
        { name: '2.8', test: '首页连结', check: 'home-link' }
    ],
    leader: [
        { name: '3.1', test: '页面标题', check: 'title' },
        { name: '3.2', test: '时钟显示', check: 'clock' },
        { name: '3.3', test: '上班打卡按钮', check: 'checkin' },
        { name: '3.4', test: '学生名单', check: 'students' },
        { name: '3.5', test: '活动时间线', check: 'timeline' },
        { name: '3.6', test: '紧急按钮', check: 'emergency' },
        { name: '3.7', test: '打卡记录', check: 'records' }
    ]
};

async function runTest(browser, pageConfig) {
    const url = TEST_CONFIG.baseUrl + pageConfig.path;
    const context = await browser.newContext({
        viewport: { width: pageConfig.width, height: pageConfig.height }
    });
    const page = await context.newPage();
    
    const results = [];
    const testList = tests[pageConfig.name] || [];
    const pageName = pageConfig.name;
    
    console.log(`\n🧪 Testing: ${pageName} (${pageConfig.width}x${pageConfig.height})`);
    console.log('─'.repeat(50));
    
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        
        for (const t of testList) {
            try {
                let passed = false;
                
                switch (t.check) {
                    case 'title':
                        const title = await page.title();
                        passed = title.includes('全方位学习日') || title.includes('S1');
                        break;
                        
                    case 'logo':
                        const logo = await page.$('img[src*="logo"]');
                        passed = !!logo;
                        break;
                        
                    case 'schedule':
                        const schedule = await page.$('table, .schedule-table');
                        passed = !!schedule;
                        break;
                        
                    case 'map-download':
                        const mapLink = await page.$('a[href*="map"]');
                        passed = !!mapLink;
                        break;
                        
                    case 'notice':
                        const notice = await page.textContent('body');
                        passed = notice.includes('注意事项') || notice.includes('注意');
                        break;
                        
                    case 'download':
                        const downloads = await page.$$('.download-item, a[download]');
                        passed = downloads.length >= 2;
                        break;
                        
                    case 'teacher-link':
                        const teacherLink = await page.$('a[href*="teacher.html"]');
                        passed = !!teacherLink;
                        break;
                        
                    case 'leader-link':
                        const leaderLink = await page.$('a[href*="leader.html"]');
                        passed = !!leaderLink;
                        break;
                        
                    case 'pre':
                        const pre = await page.$('#pre, [href*="pre"]');
                        passed = !!pre || (await page.textContent('body')).includes('活动前');
                        break;
                        
                    case 'during':
                        const during = await page.$('#during');
                        passed = !!during || (await page.textContent('body')).includes('活动中');
                        break;
                        
                    case 'post':
                        const post = await page.$('#post');
                        passed = !!post || (await page.textContent('body')).includes('活动后');
                        break;
                        
                    case 'tasks':
                        const tasks = await page.$('.task-list, li');
                        passed = !!tasks;
                        break;
                        
                    case 'emergency':
                        const emergency = await page.$('.emergency, .emergency-box, button:has-text("紧急")');
                        passed = !!emergency;
                        break;
                        
                    case 'home-link':
                        const homeLink = await page.$('a[href*="index.html"], a[href*="/"]');
                        passed = !!homeLink;
                        break;
                        
                    case 'clock':
                        const clock = await page.$('.clock-time, #currentTime');
                        passed = !!clock;
                        break;
                        
                    case 'checkin':
                        const checkin = await page.$('button:has-text("打卡"), button:has-text("check")');
                        passed = !!checkin;
                        break;
                        
                    case 'students':
                        const students = await page.$('.student-list, .student-item');
                        passed = !!students;
                        break;
                        
                    case 'timeline':
                        const timeline = await page.$('.timeline, .timeline-item');
                        passed = !!timeline;
                        break;
                        
                    case 'records':
                        const records = await page.$('.record-card, #checkInRecords');
                        passed = !!records;
                        break;
                }
                
                results.push({
                    name: t.name,
                    test: t.test,
                    passed: passed,
                    status: passed ? '✅' : '❌'
                });
                
                console.log(`  ${t.name}. ${t.test}: ${passed ? '✅' : '❌'}`);
                
            } catch (err) {
                results.push({
                    name: t.name,
                    test: t.test,
                    passed: false,
                    error: err.message,
                    status: '❌'
                });
                console.log(`  ${t.name}. ${t.test}: ❌ (${err.message})`);
            }
        }
        
    } catch (err) {
        console.error('Page load error:', err.message);
    } finally {
        await context.close();
    }
    
    return results;
}

async function main() {
    console.log('🎯 全方位学习日 自动化测试');
    console.log('='.repeat(50));
    console.log(`URL: ${TEST_CONFIG.baseUrl}`);
    
    const fs = require('fs');
    if (!fs.existsSync('test-results')) {
        fs.mkdirSync('test-results');
    }
    
    const browser = await chromium.launch({ headless: true });
    const allResults = [];
    
    for (const pageConfig of TEST_CONFIG.pages) {
        const pageResults = await runTest(browser, pageConfig);
        allResults.push(...pageResults);
    }
    
    await browser.close();
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 测试结果总结');
    console.log('='.repeat(50));
    
    const passed = allResults.filter(r => r.passed).length;
    const total = allResults.length;
    const failed = total - passed;
    
    console.log(`\n总测试: ${total}`);
    console.log(`通过: ${passed} ✅`);
    console.log(`失败: ${failed} ${failed > 0 ? '❌' : '✅'}`);
    console.log(`成功率: ${Math.round(passed/total*100)}%`);
    
    const report = {
        timestamp: new Date().toISOString(),
        url: TEST_CONFIG.baseUrl,
        summary: { total, passed, failed, rate: Math.round(passed/total*100) },
        results: allResults
    };
    
    fs.writeFileSync('test-results/lsc-ole-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 报告已保存');
    
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
