import { neon } from '@neondatabase/serverless';
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

async function verify() {
  console.log('Verifying database setup...\n');

  // Check users table
  const users = await sql`SELECT id, name, email, role, credits FROM users`;
  console.log('✅ Users table:');
  console.table(users);

  // Check slots table
  const slots = await sql`SELECT COUNT(*) as count FROM slots`;
  console.log(`✅ Slots table: ${slots[0].count} slots created`);

  // Check if password_hash column exists
  const columns = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'password_hash'
  `;
  
  if (columns.length > 0) {
    console.log('✅ password_hash column exists');
  } else {
    console.log('❌ password_hash column missing!');
  }

  console.log('\n🎉 Database is ready!');
  console.log('\nYou can now login with:');
  console.log('  Admin: admin@parking.com / admin123');
  console.log('  User:  john@example.com / user123');
}

verify().catch(console.error);
