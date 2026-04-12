import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env.local
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

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function runMigrations() {
  console.log('Starting database migrations...');
  console.log('Reading SQL file...');

  const sqlFilePath = join(__dirname, '001-create-tables.sql');
  const sqlContent = readFileSync(sqlFilePath, 'utf-8');

  console.log('Executing SQL migration...');
  
  // Split by semicolons and execute each statement
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      await sql([statement]);
    } catch (error) {
      // Ignore "already exists" errors
      if (!error.message.includes('already exists')) {
        console.error('Error executing statement:', error.message);
      }
    }
  }

  console.log('✅ All migrations completed successfully!');
  console.log('\nDefault credentials:');
  console.log('  Admin: admin@parking.com / admin123');
  console.log('  User:  john@example.com / user123');
}

runMigrations().catch(console.error);
