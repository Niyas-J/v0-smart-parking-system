// Generate bcrypt hashes for seed users
const bcrypt = require('bcryptjs');

async function generateHashes() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);
  
  console.log('Admin password hash (password: admin123):');
  console.log(adminHash);
  console.log('\nUser password hash (password: user123):');
  console.log(userHash);
  console.log('\nUpdate these in 001-create-tables.sql');
}

generateHashes();
