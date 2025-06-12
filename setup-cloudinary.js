#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupCloudinary() {
  console.log('🌤️  Cloudinary Setup for Bac Informatique Website');
  console.log('================================================');
  console.log('');
  console.log('First, sign up for a free Cloudinary account at:');
  console.log('👉 https://cloudinary.com/users/register/free');
  console.log('');
  console.log('Then find your credentials in the Cloudinary dashboard.');
  console.log('');

  const cloudName = await question('Enter your Cloudinary Cloud Name: ');
  const apiKey = await question('Enter your Cloudinary API Key: ');
  const apiSecret = await question('Enter your Cloudinary API Secret: ');

  if (!cloudName || !apiKey || !apiSecret) {
    console.log('❌ All fields are required!');
    process.exit(1);
  }

  // Read current .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('❌ .env file not found!');
    process.exit(1);
  }

  // Update Cloudinary settings
  envContent = envContent.replace(
    /CLOUDINARY_CLOUD_NAME=.*/,
    `CLOUDINARY_CLOUD_NAME=${cloudName}`
  );
  envContent = envContent.replace(
    /CLOUDINARY_API_KEY=.*/,
    `CLOUDINARY_API_KEY=${apiKey}`
  );
  envContent = envContent.replace(
    /CLOUDINARY_API_SECRET=.*/,
    `CLOUDINARY_API_SECRET=${apiSecret}`
  );

  // Write updated .env file
  fs.writeFileSync(envPath, envContent);

  console.log('');
  console.log('✅ Cloudinary configuration updated successfully!');
  console.log('');
  console.log('🔄 Please restart your server to apply the changes:');
  console.log('   npm run server');
  console.log('');
  console.log('🧪 Test file uploads in the admin panel:');
  console.log('   http://localhost:3001/admin.html');
  console.log('');

  rl.close();
}

setupCloudinary().catch(console.error);
