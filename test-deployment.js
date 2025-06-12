#!/usr/bin/env node

const https = require('https');
const http = require('http');

async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        const success = status >= 200 && status < 300;
        console.log(`${success ? '✅' : '❌'} ${description}: ${status} ${success ? 'OK' : 'FAILED'}`);
        resolve(success);
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description}: ERROR - ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log(`❌ ${description}: TIMEOUT`);
      req.destroy();
      resolve(false);
    });
  });
}

async function testDeployment(baseUrl) {
  console.log(`🧪 Testing deployment at: ${baseUrl}`);
  console.log('=' .repeat(50));
  
  const tests = [
    [`${baseUrl}/api/health`, 'Health Check API'],
    [`${baseUrl}/api/exams/stats`, 'Exam Statistics API'],
    [`${baseUrl}/api/exams`, 'Exams API'],
    [`${baseUrl}/simple.html`, 'Calculator Page'],
    [`${baseUrl}/exams.html`, 'Exams Page'],
    [`${baseUrl}/admin.html`, 'Admin Page']
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const [url, description] of tests) {
    const success = await testEndpoint(url, description);
    if (success) passed++;
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  console.log('=' .repeat(50));
  console.log(`📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your deployment is working perfectly!');
    console.log('');
    console.log('🔗 Your website is live at:');
    console.log(`   Calculator: ${baseUrl}/simple.html`);
    console.log(`   Exams: ${baseUrl}/exams.html`);
    console.log(`   Admin: ${baseUrl}/admin.html`);
  } else {
    console.log('⚠️  Some tests failed. Check the deployment logs.');
  }
}

// Get URL from command line argument
const url = process.argv[2];

if (!url) {
  console.log('Usage: node test-deployment.js <your-deployed-url>');
  console.log('Example: node test-deployment.js https://your-app.railway.app');
  process.exit(1);
}

testDeployment(url.replace(/\/$/, '')); // Remove trailing slash
