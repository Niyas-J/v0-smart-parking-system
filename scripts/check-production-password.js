import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
} catch (err) {
  console.error('Warning: Could not load .env.local file');
}

const sql = neon(process.env.DATABASE_URL);

async function checkProductionPassword() {
  console.log('Checking production database...\n');

  // Get admin user
  const users = await sql`SELECT id, email, password_hash FROM users WHERE email = 'admin@parking.com'`;
  
  if (users.length === 0) {
    console.log('❌ Admin user not found in production!');
    console.log('Run the migration: scripts/001-create-tables.sql');
    return;
  }

  const admin = users[0];
  console.log('✅ Admin user found');
  console.log('Email:', admin.email);
  console.log('Password hash:', admin.password_hash.substring(0, 30) + '...');

  // Test password
  const testPassword = 'admin123';
  const isValid = await bcrypt.compare(testPassword, admin.password_hash);

  console.log('\nTesting password: "admin123"');
  console.log('Result:', isValid ? '✅ CORRECT' : '❌ WRONG');

  if (!isValid) {
    console.log('\n⚠️  Password hash is incorrect!');
    console.log('Generating new hash...');
    const newHash = await bcrypt.hash('admin123', 10);
    console.log('\nRun this SQL in Neon console:');
    console.log(`UPDATE users SET password_hash = '${newHash}' WHERE email = 'admin@parking.com';`);
  }
}

checkProductionPassword().catch(console.error);
