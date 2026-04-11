import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function runMigrations() {
  console.log('Starting database migrations...');

  // Users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      credits INTEGER DEFAULT 1000,
      role VARCHAR(50) DEFAULT 'user',
      is_blocked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('Created users table');

  // Parking slots table
  await sql`
    CREATE TABLE IF NOT EXISTS slots (
      id SERIAL PRIMARY KEY,
      slot_number VARCHAR(10) NOT NULL UNIQUE,
      floor INTEGER DEFAULT 1,
      slot_type VARCHAR(50) DEFAULT 'car',
      is_available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('Created slots table');

  // Bookings table
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      slot_id INTEGER REFERENCES slots(id) ON DELETE CASCADE,
      vehicle_type VARCHAR(50) NOT NULL,
      number_plate VARCHAR(20) NOT NULL,
      duration_hours INTEGER NOT NULL,
      total_cost INTEGER NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_time TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('Created bookings table');

  // Transactions table
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      transaction_type VARCHAR(50) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('Created transactions table');

  // Top-up requests table
  await sql`
    CREATE TABLE IF NOT EXISTS topup_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      processed_at TIMESTAMP
    )
  `;
  console.log('Created topup_requests table');

  // Alerts table
  await sql`
    CREATE TABLE IF NOT EXISTS alerts (
      id SERIAL PRIMARY KEY,
      number_plate VARCHAR(20) NOT NULL,
      vehicle_image TEXT,
      alert_type VARCHAR(50) DEFAULT 'suspicious',
      status VARCHAR(50) DEFAULT 'pending',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('Created alerts table');

  // Support tickets table
  await sql`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      subject VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'open',
      priority VARCHAR(50) DEFAULT 'medium',
      admin_response TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('Created tickets table');

  // Seed admin user
  await sql`
    INSERT INTO users (name, email, credits, role) 
    VALUES ('Admin', 'admin@parking.com', 10000, 'admin')
    ON CONFLICT (email) DO NOTHING
  `;
  console.log('Seeded admin user');

  // Seed default user
  await sql`
    INSERT INTO users (name, email, credits, role) 
    VALUES ('John Doe', 'john@example.com', 1000, 'user')
    ON CONFLICT (email) DO NOTHING
  `;
  console.log('Seeded default user');

  // Seed parking slots
  const slots = [
    { slot_number: 'A1', floor: 1, slot_type: 'car' },
    { slot_number: 'A2', floor: 1, slot_type: 'car' },
    { slot_number: 'A3', floor: 1, slot_type: 'car' },
    { slot_number: 'A4', floor: 1, slot_type: 'car' },
    { slot_number: 'A5', floor: 1, slot_type: 'suv' },
    { slot_number: 'B1', floor: 1, slot_type: 'bike' },
    { slot_number: 'B2', floor: 1, slot_type: 'bike' },
    { slot_number: 'B3', floor: 1, slot_type: 'bike' },
    { slot_number: 'B4', floor: 1, slot_type: 'bike' },
    { slot_number: 'B5', floor: 1, slot_type: 'car' },
    { slot_number: 'C1', floor: 2, slot_type: 'car' },
    { slot_number: 'C2', floor: 2, slot_type: 'car' },
    { slot_number: 'C3', floor: 2, slot_type: 'suv' },
    { slot_number: 'C4', floor: 2, slot_type: 'suv' },
    { slot_number: 'C5', floor: 2, slot_type: 'car' },
    { slot_number: 'D1', floor: 2, slot_type: 'bike' },
    { slot_number: 'D2', floor: 2, slot_type: 'bike' },
    { slot_number: 'D3', floor: 2, slot_type: 'car' },
    { slot_number: 'D4', floor: 2, slot_type: 'car' },
    { slot_number: 'D5', floor: 2, slot_type: 'suv' },
  ];

  for (const slot of slots) {
    await sql`
      INSERT INTO slots (slot_number, floor, slot_type, is_available)
      VALUES (${slot.slot_number}, ${slot.floor}, ${slot.slot_type}, TRUE)
      ON CONFLICT (slot_number) DO NOTHING
    `;
  }
  console.log('Seeded parking slots');

  // Seed sample alerts
  await sql`
    INSERT INTO alerts (number_plate, alert_type, status, description)
    VALUES ('ABC-1234', 'suspicious', 'pending', 'Vehicle entered without valid booking')
    ON CONFLICT DO NOTHING
  `;
  await sql`
    INSERT INTO alerts (number_plate, alert_type, status, description)
    VALUES ('XYZ-9876', 'unauthorized', 'resolved', 'Attempted entry with expired pass')
    ON CONFLICT DO NOTHING
  `;
  console.log('Seeded sample alerts');

  console.log('All migrations completed successfully!');
}

runMigrations().catch(console.error);
