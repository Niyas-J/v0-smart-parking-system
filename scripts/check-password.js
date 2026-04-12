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

async function checkPassword() {
  console.log('Checking admin password...\n');

  // Get admin user
  const users = await sql`SELECT id, email, password_hash FROM users WHERE email = 'admin@parking.com'`;
  
  if (users.length === 0) {
    console.log('❌ Admin user not found!');
    return;
  }

  const admin = users[0];
  console.log('✅ Admin user found:', admin.email);
  console.log('Password hash:', admin.password_hash.substring(0, 20) + '...');

  // Test the password
  const testPassword = 'admin123';
  const isValid = await bcrypt.compare(testPassword, admin.password_hash);

  console.log('\nTesting password: "admin123"');
  console.log('Result:', isValid ? '✅ CORRECT' : '❌ WRONG');

  if (!isValid) {
    console.log('\n⚠️  Password hash is incorrect! Fixing it...');
    const newHash = await bcrypt.hash('admin123', 10);
    await sql`UPDATE users SET password_hash = ${newHash} WHERE email = 'admin@parking.com'`;
    console.log('✅ Password updated! Now try: admin123');
  } else {
    console.log('\n✅ Password is correct! Use: admin123');
  }
}

checkPassword().catch(console.error);
