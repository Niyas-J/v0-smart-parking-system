import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'

const sql = neon(process.env.DATABASE_URL)

async function run() {
  try {
    console.log('Running 003-enquiries.sql...')
    const sql3 = fs.readFileSync(path.join(process.cwd(), 'scripts', '003-enquiries.sql'), 'utf-8')
    await sql.query(sql3)
    console.log('Success.')

    console.log('Running 004-setup-niyas.sql...')
    const sql4 = fs.readFileSync(path.join(process.cwd(), 'scripts', '004-setup-niyas.sql'), 'utf-8')
    await sql.query(sql4)
    console.log('Success.')
    
    console.log('All migrations applied.')
  } catch (err) {
    console.error('Migration failed:', err)
  }
}

run()
