-- Smart Parking Management System Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  credits INTEGER DEFAULT 1000,
  role VARCHAR(50) DEFAULT 'user',
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parking slots table
CREATE TABLE IF NOT EXISTS slots (
  id SERIAL PRIMARY KEY,
  slot_number VARCHAR(10) NOT NULL UNIQUE,
  floor INTEGER DEFAULT 1,
  slot_type VARCHAR(50) DEFAULT 'car',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
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
);

-- Transactions table (credit history)
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit top-up requests table
CREATE TABLE IF NOT EXISTS topup_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

-- Alerts table (security alerts)
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  number_plate VARCHAR(20) NOT NULL,
  vehicle_image TEXT,
  alert_type VARCHAR(50) DEFAULT 'suspicious',
  status VARCHAR(50) DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support tickets table
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
);

-- Seed default admin user
INSERT INTO users (name, email, credits, role) 
VALUES ('Admin', 'admin@parking.com', 10000, 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed default user
INSERT INTO users (name, email, credits, role) 
VALUES ('John Doe', 'john@example.com', 1000, 'user')
ON CONFLICT (email) DO NOTHING;

-- Seed parking slots (20 slots across 2 floors)
INSERT INTO slots (slot_number, floor, slot_type, is_available) VALUES
('A1', 1, 'car', TRUE),
('A2', 1, 'car', TRUE),
('A3', 1, 'car', TRUE),
('A4', 1, 'car', TRUE),
('A5', 1, 'suv', TRUE),
('B1', 1, 'bike', TRUE),
('B2', 1, 'bike', TRUE),
('B3', 1, 'bike', TRUE),
('B4', 1, 'bike', TRUE),
('B5', 1, 'car', TRUE),
('C1', 2, 'car', TRUE),
('C2', 2, 'car', TRUE),
('C3', 2, 'suv', TRUE),
('C4', 2, 'suv', TRUE),
('C5', 2, 'car', TRUE),
('D1', 2, 'bike', TRUE),
('D2', 2, 'bike', TRUE),
('D3', 2, 'car', TRUE),
('D4', 2, 'car', TRUE),
('D5', 2, 'suv', TRUE)
ON CONFLICT (slot_number) DO NOTHING;

-- Seed some sample alerts
INSERT INTO alerts (number_plate, alert_type, status, description) VALUES
('ABC-1234', 'suspicious', 'pending', 'Vehicle entered without valid booking'),
('XYZ-9876', 'unauthorized', 'resolved', 'Attempted entry with expired pass')
ON CONFLICT DO NOTHING;

-- Seed sample support ticket
INSERT INTO tickets (user_id, subject, description, status, priority) VALUES
(2, 'Cannot book parking', 'I am unable to select a parking slot for my vehicle.', 'open', 'high')
ON CONFLICT DO NOTHING;
