-- Smart Parking Management System Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  credits DECIMAL(10, 2) DEFAULT 1000.00,
  role VARCHAR(50) DEFAULT 'user',
  vehicle_number VARCHAR(50),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parking slots table
CREATE TABLE IF NOT EXISTS slots (
  id SERIAL PRIMARY KEY,
  slot_number VARCHAR(10) NOT NULL UNIQUE,
  floor INTEGER DEFAULT 1,
  slot_type VARCHAR(50) DEFAULT 'standard',
  zone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'available',
  hourly_rate DECIMAL(10, 2) DEFAULT 5.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  slot_id INTEGER REFERENCES slots(id) ON DELETE CASCADE,
  vehicle_number VARCHAR(50) NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  total_cost DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table (credit history)
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit top-up requests table
CREATE TABLE IF NOT EXISTS topup_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(100),
  proof_url TEXT,
  admin_notes TEXT,
  processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'normal',
  admin_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default admin user (password: admin123)
INSERT INTO users (name, email, password_hash, credits, role) 
VALUES ('Admin', 'admin@parking.com', '$2b$10$CGrIHwvcmJGZGWqq83hAsONNviu67RJRQp9BtsPdgyv.f1E2LBow.', 10000.00, 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed default user (password: user123)
INSERT INTO users (name, email, password_hash, credits, role, vehicle_number) 
VALUES ('John Doe', 'john@example.com', '$2b$10$/5YTgovhWerE17dhPhazIuqy4O1tgzBzmlzsX3SxZR6lHlBhg4kmu', 1000.00, 'user', 'ABC-1234')
ON CONFLICT (email) DO NOTHING;

-- Seed parking slots (20 slots across 2 floors)
INSERT INTO slots (slot_number, floor, slot_type, zone, status, hourly_rate) VALUES
('A1', 1, 'standard', 'car', 'available', 5.00),
('A2', 1, 'standard', 'car', 'available', 5.00),
('A3', 1, 'standard', 'car', 'available', 5.00),
('A4', 1, 'vip', 'car', 'available', 10.00),
('A5', 1, 'standard', 'suv', 'available', 7.00),
('B1', 1, 'standard', 'bike', 'available', 2.00),
('B2', 1, 'standard', 'bike', 'available', 2.00),
('B3', 1, 'standard', 'bike', 'available', 2.00),
('B4', 1, 'standard', 'bike', 'available', 2.00),
('B5', 1, 'ev', 'car', 'available', 8.00),
('C1', 2, 'standard', 'car', 'available', 5.00),
('C2', 2, 'standard', 'car', 'available', 5.00),
('C3', 2, 'standard', 'suv', 'available', 7.00),
('C4', 2, 'handicapped', 'suv', 'available', 5.00),
('C5', 2, 'standard', 'car', 'available', 5.00),
('D1', 2, 'standard', 'bike', 'available', 2.00),
('D2', 2, 'standard', 'bike', 'available', 2.00),
('D3', 2, 'standard', 'car', 'available', 5.00),
('D4', 2, 'vip', 'car', 'available', 10.00),
('D5', 2, 'standard', 'suv', 'available', 7.00)
ON CONFLICT (slot_number) DO NOTHING;

-- Seed sample support ticket
INSERT INTO tickets (user_id, subject, message, status, priority) VALUES
(2, 'Cannot book parking', 'I am unable to select a parking slot for my vehicle.', 'open', 'high')
ON CONFLICT DO NOTHING;
