const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');

async function regeneratePasswords() {
  const sql = neon(process.env.DATABASE_URL);
  
  // Generate new hashes with bcryptjs
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);
  
  console.log('New admin hash:', adminHash);
  console.log('New user hash:', userHash);
  
  // Update database
  await sql`UPDATE users SET password_hash = ${adminHash} WHERE email = 'admin@parking.com'`;
  await sql`UPDATE users SET password_hash = ${userHash} WHERE email = 'john@example.com'`;
  
  console.log('✓ Passwords updated in database');
  
  // Verify
  const adminTest = await bcrypt.compare('admin123', adminHash);
  const userTest = await bcrypt.compare('user123', userHash);
  
  console.log('Admin password verifies:', adminTest);
  console.log('User password verifies:', userTest);
}

regeneratePasswords().catch(console.error);
