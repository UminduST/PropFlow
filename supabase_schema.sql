-- ==========================================================
-- PropFlow Property Operations & Cleaning Management System
-- Supabase PostgreSQL Schema & Initial Migration
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. System Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'super_admin',
        'operations_manager',
        'property_manager',
        'cleaning_supervisor',
        'cleaner',
        'maintenance',
        'warehouse',
        'owner'
    )),
    phone VARCHAR(30),
    avatar VARCHAR(10),
    telegram_pin VARCHAR(10),
    telegram_chat_id VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Zones & Operational Areas Table
CREATE TABLE IF NOT EXISTS zones (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Property Owners Table
CREATE TABLE IF NOT EXISTS owners (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    commission_rate NUMERIC(5, 2) DEFAULT 15.00,
    monthly_earnings NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Apartments Portfolio Table
CREATE TABLE IF NOT EXISTS apartments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    area_id VARCHAR(50) REFERENCES zones(id) ON DELETE SET NULL,
    area_name VARCHAR(100),
    address TEXT NOT NULL,
    bedrooms INT DEFAULT 1,
    bathrooms INT DEFAULT 1,
    max_guests INT DEFAULT 2,
    key_lockbox_code VARCHAR(20) NOT NULL,
    smart_lock_pin VARCHAR(20),
    wifi_ssid VARCHAR(100),
    wifi_password VARCHAR(100),
    owner_id VARCHAR(50) REFERENCES owners(id) ON DELETE SET NULL,
    owner_name VARCHAR(100),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'turnover', 'inactive')),
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reservations / Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    apartment_id VARCHAR(50) REFERENCES apartments(id) ON DELETE CASCADE,
    apartment_name VARCHAR(100),
    area_name VARCHAR(100),
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(100),
    guest_phone VARCHAR(30),
    guest_count INT DEFAULT 2,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    source VARCHAR(50) DEFAULT 'Direct' CHECK (source IN ('Airbnb', 'Booking.com', 'Guesty', 'Direct', 'Lodgify', 'Other')),
    payout NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled')),
    notes TEXT,
    cleaning_job_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Cleaning Jobs & Turnovers Table
CREATE TABLE IF NOT EXISTS cleanings (
    id VARCHAR(50) PRIMARY KEY,
    apartment_id VARCHAR(50) REFERENCES apartments(id) ON DELETE CASCADE,
    apartment_name VARCHAR(100),
    area_name VARCHAR(100),
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    guest_name VARCHAR(100),
    scheduled_date DATE NOT NULL,
    time_window VARCHAR(50) DEFAULT '10:00 - 13:00',
    type VARCHAR(30) DEFAULT 'turnover' CHECK (type IN ('turnover', 'deep_clean', 'mid_stay', 'inspection')),
    priority VARCHAR(20) DEFAULT 'standard' CHECK (priority IN ('standard', 'high', 'urgent')),
    status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'inspected')),
    cleaner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cleaner_name VARCHAR(100),
    cleaner_phone VARCHAR(30),
    notes TEXT,
    checklist JSONB DEFAULT '[]'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    linen_used JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    inspected_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Maintenance Tasks & Work Orders Table
CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id VARCHAR(50) PRIMARY KEY,
    apartment_id VARCHAR(50) REFERENCES apartments(id) ON DELETE CASCADE,
    apartment_name VARCHAR(100),
    area_name VARCHAR(100),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'General' CHECK (category IN ('Plumbing', 'Electrical', 'HVAC', 'Appliances', 'Furniture', 'Key/Lock', 'General')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(30) DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'waiting_parts', 'resolved')),
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assignee_name VARCHAR(100),
    estimated_budget NUMERIC(10, 2) DEFAULT 0.00,
    actual_cost NUMERIC(10, 2) DEFAULT 0.00,
    reported_by VARCHAR(100) NOT NULL,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    photos JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Linen Inventory Table
CREATE TABLE IF NOT EXISTS linen_inventory (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    total INT DEFAULT 0,
    clean INT DEFAULT 0,
    dirty INT DEFAULT 0,
    in_transit INT DEFAULT 0,
    min_threshold INT DEFAULT 10,
    unit VARCHAR(20) DEFAULT 'pieces',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Warehouse Inventory Table
CREATE TABLE IF NOT EXISTS warehouse_inventory (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'Amenities' CHECK (category IN ('Amenities', 'Cleaning Supplies', 'Maintenance', 'Linens', 'Beverages')),
    quantity INT DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'pcs',
    min_threshold INT DEFAULT 10,
    location VARCHAR(50) DEFAULT 'Shelf A-1',
    cost_per_unit NUMERIC(10, 2) DEFAULT 1.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Lost & Found Items Table
CREATE TABLE IF NOT EXISTS lost_items (
    id VARCHAR(50) PRIMARY KEY,
    apartment_id VARCHAR(50) REFERENCES apartments(id) ON DELETE CASCADE,
    apartment_name VARCHAR(100),
    item_name VARCHAR(200) NOT NULL,
    category VARCHAR(50) DEFAULT 'Other' CHECK (category IN ('Electronics', 'Jewelry', 'Clothing', 'Documents', 'Accessories', 'Other')),
    description TEXT,
    found_date DATE NOT NULL,
    found_by VARCHAR(100) NOT NULL,
    guest_name VARCHAR(100),
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    storage_location VARCHAR(100) DEFAULT 'Operations Safe Box',
    photo_url TEXT,
    status VARCHAR(30) DEFAULT 'reported' CHECK (status IN ('reported', 'guest_contacted', 'claimed', 'disposed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Activity & Audit Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(50) PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50)
);

-- ==========================================================
-- Initial Seed Data with the 8 Official Roles
-- ==========================================================

-- Super Admin: admin / Admin@2026#01
-- Operations Manager: ops.manager / Ops@2026#02
-- Property Manager: property.manager / Property@2026#03
-- Cleaning Supervisor: cleaning.supervisor / Clean@2026#04
-- Cleaner: cleaner.kasun / Clean@2026#05
-- Maintenance Staff: maintenance.saman / Maint@2026#06
-- Warehouse Officer: warehouse.officer / Stock@2026#07
-- Property Owner: owner.john / Owner@2026#08

INSERT INTO users (username, email, password_hash, name, role, phone, avatar, telegram_pin, active)
VALUES
('admin', 'admin@propflow.com', '$2a$10$7Z2vU1ZgZ8Yv9Z8Yv9Z8Yu0w8H0d7J9f0g1h2j3k4l5m6n7o8p9q', 'Super Administrator', 'super_admin', '+1 (555) 001-1122', 'AD', '100001', true),
('ops.manager', 'ops@propflow.com', '$2a$10$7Z2vU1ZgZ8Yv9Z8Yv9Z8Yu0w8H0d7J9f0g1h2j3k4l5m6n7o8p9q', 'Sarah Connor', 'operations_manager', '+1 (555) 002-2233', 'SC', '200002', true),
('property.manager', 'property@propflow.com', '$2a$10$7Z2vU1ZgZ8Yv9Z8Yv9Z8Yu0w8H0d7J9f0g1h2j3k4l5m6n7o8p9q', 'Claire Redfield', 'property_manager', '+1 (555) 003-3344', 'CR', '300003', true),
('cleaning.supervisor', 'supervisor@propflow.com', '$2a$10$7Z2vU1ZgZ8Yv9Z8Yv9Z8Yu0w8H0d7J9f0g1h2j3k4l5m6n7o8p9q', 'Maria Rodriguez', 'cleaning_supervisor', '+1 (555) 004-4455', 'MR', '400004', true),
('cleaner.kasun', 'kasun@propflow.com', '$2a$10$7Z2vU1ZgZ8Yv9Z8Yv9Z8Yu0w8H0d7J9f0g1h2j3k4l5m6n7o8p9q', 'Kasun Perera', 'cleaner', '+1 (555) 444-1234', 'KP', '482910', true),
('maintenance.saman', 'saman@propflow.com', '$2a$10$7Z2vU1ZgZ8Yv9Z8Yv9Z8Yu0w8H0d7J9f0g1h2j3k4l5m6n7o8p9q', 'Saman Kumara', 'maintenance', '+1 (555) 888-9900', 'SK', '593821', true),
('warehouse.officer', 'warehouse@propflow.com', '$2a$10$7Z2vU1ZgZ8Yv9Z8Yv9Z8Yu0w8H0d7J9f0g1h2j3k4l5m6n7o8p9q', 'Marcus Vance', 'warehouse', '+1 (555) 007-7788', 'MV', '700007', true),
('owner.john', 'john.silva@propowner.com', '$2a$10$7Z2vU1ZgZ8Yv9Z8Yv9Z8Yu0w8H0d7J9f0g1h2j3k4l5m6n7o8p9q', 'John Silva', 'owner', '+1 (555) 234-8901', 'JS', '800008', true)
ON CONFLICT (username) DO NOTHING;

-- Initial Areas
INSERT INTO zones (id, name, description)
VALUES
('zone-1', 'test area 1', 'Central tourist and business district'),
('zone-2', 'test area 2', 'Coastal marina and residential avenue')
ON CONFLICT (id) DO NOTHING;

-- Initial Owner
INSERT INTO owners (id, name, email, phone, commission_rate, monthly_earnings, status)
VALUES
('owner-1', 'John Silva', 'john.silva@propowner.com', '+1 (555) 234-8901', 15.00, 4850.00, 'active')
ON CONFLICT (id) DO NOTHING;

-- Initial Apartments (A-101, A-102, A-103, A-104, test 1, test 2)
INSERT INTO apartments (id, name, area_id, area_name, address, bedrooms, bathrooms, max_guests, key_lockbox_code, smart_lock_pin, owner_id, owner_name, status)
VALUES
('apt-1', 'test 1', 'zone-2', 'test area 2', 'Seaside Boulevard 42, Apt 4B', 2, 2, 4, '4829', '9012#', 'owner-1', 'John Silva', 'active'),
('apt-2', 'test 2', 'zone-1', 'test area 1', 'Grand Avenue 108, Penthouse 12', 3, 2, 6, '7731', '5543#', 'owner-1', 'John Silva', 'active'),
('apt-101', 'A-101', 'zone-1', 'test area 1', 'Bayview Heights, Suite 101', 2, 1, 4, '1101', '1010#', 'owner-1', 'John Silva', 'active'),
('apt-102', 'A-102', 'zone-1', 'test area 1', 'Bayview Heights, Suite 102', 2, 2, 4, '1102', '1020#', 'owner-1', 'John Silva', 'active'),
('apt-103', 'A-103', 'zone-2', 'test area 2', 'Marina Towers, Unit 103', 1, 1, 2, '1103', '1030#', 'owner-1', 'John Silva', 'active'),
('apt-104', 'A-104', 'zone-2', 'test area 2', 'Marina Towers, Unit 104', 3, 2, 6, '1104', '1040#', 'owner-1', 'John Silva', 'active')
ON CONFLICT (id) DO NOTHING;

-- Initial Linen Inventory
INSERT INTO linen_inventory (id, name, total, clean, dirty, in_transit, min_threshold, unit)
VALUES
('lin-1', 'Bath towels', 60, 18, 32, 10, 25, 'pieces'),
('lin-2', 'White Bedsheet', 120, 84, 28, 8, 30, 'pieces'),
('lin-3', 'Pillow Cover', 80, 0, 65, 15, 20, 'pieces'),
('lin-4', 'Hand towels', 50, 12, 30, 8, 15, 'pieces'),
('lin-5', 'Duvet covers', 35, 14, 18, 3, 10, 'pieces')
ON CONFLICT (id) DO NOTHING;
