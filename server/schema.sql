-- Gadimat Chèques — PostgreSQL schema
-- Run: psql -U gadimat -d gadimat_db -f schema.sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Agent de saisie',
  status VARCHAR(20) NOT NULL DEFAULT 'Actif',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id VARCHAR(50) PRIMARY KEY,
  bank_name VARCHAR(100) NOT NULL,
  rib VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checkbooks (
  id VARCHAR(50) PRIMARY KEY,
  bank_account_id VARCHAR(50) REFERENCES bank_accounts(id) ON DELETE CASCADE,
  bank_name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Chèque', 'Effet')),
  creation_date DATE NOT NULL,
  start_number VARCHAR(20) NOT NULL,
  end_number VARCHAR(20) NOT NULL,
  remaining INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checks (
  id VARCHAR(50) PRIMARY KEY,
  bank_account_id VARCHAR(50) REFERENCES bank_accounts(id) ON DELETE CASCADE,
  checkbook_id VARCHAR(50) REFERENCES checkbooks(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Chèque', 'Effet')),
  number VARCHAR(50) NOT NULL,
  partner_id VARCHAR(50),
  partner_name VARCHAR(200) NOT NULL,
  emission_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'En Circulation',
  note TEXT,
  facture VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Client', 'Fournisseur')),
  name VARCHAR(200) NOT NULL,
  contact VARCHAR(100),
  phone VARCHAR(50),
  balance NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
