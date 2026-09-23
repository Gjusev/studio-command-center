-- Studio Management Plattform - Datenbankschema
-- TODO vive en el schema studio_manager, sin tocar public
-- Better Auth compatible

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema erstellen
CREATE SCHEMA IF NOT EXISTS studio_manager;

-- Set search_path para TODO el script
SET search_path TO studio_manager, public;

-- Enums
CREATE TYPE studio_manager.user_role AS ENUM ('studioleiter', 'mitarbeiter');
CREATE TYPE studio_manager.movement_type AS ENUM ('IN', 'OUT', 'ADJUST', 'WASTE');
CREATE TYPE studio_manager.machine_status AS ENUM ('IN_SERVICE', 'OUT_OF_SERVICE', 'MAINTENANCE');
CREATE TYPE studio_manager.event_type AS ENUM ('MAINTENANCE', 'INCIDENT', 'INSPECTION');
CREATE TYPE studio_manager.event_status AS ENUM ('OPEN', 'CLOSED');

-- =============================================
-- Better Auth Tabellen (studio_manager schema)
-- Better Auth las creara automaticamente pero
-- las definimos aqui para setup inicial
-- =============================================

CREATE TABLE IF NOT EXISTS studio_manager."user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  role TEXT NOT NULL DEFAULT 'mitarbeiter',
  "studioId" TEXT,
  banned BOOLEAN NOT NULL DEFAULT FALSE,
  "banReason" TEXT,
  "banExpires" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS studio_manager."session" (
  id TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMP NOT NULL,
  token TEXT UNIQUE,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES studio_manager."user"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "impersonatedBy" TEXT
);

CREATE TABLE IF NOT EXISTS studio_manager."account" (
  id TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES studio_manager."user"(id) ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  scope TEXT,
  password TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_manager."verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);

-- Better Auth: organization plugin tables
CREATE TABLE IF NOT EXISTS studio_manager."organization" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata TEXT
);

CREATE TABLE IF NOT EXISTS studio_manager."member" (
  id TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES studio_manager."organization"(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES studio_manager."user"(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("organizationId", "userId")
);

CREATE TABLE IF NOT EXISTS studio_manager."invitation" (
  id TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES studio_manager."organization"(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'pending',
  "expiresAt" TIMESTAMP NOT NULL,
  "inviterId" TEXT NOT NULL REFERENCES studio_manager."user"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- Studio Manager Tabellen (studio_manager schema)
-- =============================================

CREATE TABLE studios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  address TEXT,
  phone VARCHAR(100),
  email VARCHAR(255),
  logo_url TEXT,
  owner_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE studio_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES "organization"(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(studio_id, organization_id)
);

CREATE TABLE users (
  id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'mitarbeiter',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_studio_id ON users(studio_id);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  actor_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id UUID,
  before_json JSONB,
  after_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_studio_id ON audit_logs(studio_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Modul 1: Verbrauchsmaterialien

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(studio_id, name)
);

CREATE INDEX idx_categories_studio_id ON categories(studio_id);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(studio_id, name)
);

CREATE INDEX idx_locations_studio_id ON locations(studio_id);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(100),
  address TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suppliers_studio_id ON suppliers(studio_id);

CREATE TABLE consumables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  unit VARCHAR(50) NOT NULL,
  stock_current DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_min DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(10,2),
  expires_on DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consumables_studio_id ON consumables(studio_id);
CREATE INDEX idx_consumables_category_id ON consumables(category_id);
CREATE INDEX idx_consumables_location_id ON consumables(location_id);
CREATE INDEX idx_consumables_low_stock ON consumables(studio_id) WHERE stock_current <= stock_min;

CREATE TABLE consumable_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  consumable_id UUID NOT NULL REFERENCES consumables(id) ON DELETE CASCADE,
  type movement_type NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  stock_before DECIMAL(10,2) NOT NULL,
  stock_after DECIMAL(10,2) NOT NULL,
  reason TEXT,
  created_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consumable_movements_studio_id ON consumable_movements(studio_id);
CREATE INDEX idx_consumable_movements_consumable_id ON consumable_movements(consumable_id);
CREATE INDEX idx_consumable_movements_created_at ON consumable_movements(created_at DESC);

-- Modul 2: Maschinen

CREATE TABLE machine_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(studio_id, name)
);

CREATE INDEX idx_machine_categories_studio_id ON machine_categories(studio_id);

CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES machine_categories(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  brand VARCHAR(255),
  model VARCHAR(255),
  serial_no VARCHAR(255),
  purchased_on DATE,
  purchase_cost DECIMAL(10,2),
  status machine_status NOT NULL DEFAULT 'IN_SERVICE',
  last_service_on DATE,
  next_service_on DATE,
  notes TEXT,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_machines_studio_id ON machines(studio_id);
CREATE INDEX idx_machines_category_id ON machines(category_id);
CREATE INDEX idx_machines_location_id ON machines(location_id);
CREATE INDEX idx_machines_status ON machines(studio_id, status);
CREATE INDEX idx_machines_next_service ON machines(studio_id, next_service_on) WHERE next_service_on IS NOT NULL;

CREATE TABLE machine_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  type event_type NOT NULL,
  status event_status NOT NULL DEFAULT 'OPEN',
  description TEXT NOT NULL,
  cost DECIMAL(10,2),
  downtime_minutes INTEGER,
  resolved_at TIMESTAMPTZ,
  created_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_machine_events_studio_id ON machine_events(studio_id);
CREATE INDEX idx_machine_events_machine_id ON machine_events(machine_id);
CREATE INDEX idx_machine_events_status ON machine_events(studio_id, status);
CREATE INDEX idx_machine_events_created_at ON machine_events(created_at DESC);

-- Modul 3: Mitarbeiter Performance

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'mitarbeiter',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_employees_studio_id ON employees(studio_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);

CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(50),
  points INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_templates_studio_id ON task_templates(studio_id);

CREATE TABLE task_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  task_template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
  assigned_to_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  due_date DATE,
  created_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_assignments_studio_id ON task_assignments(studio_id);
CREATE INDEX idx_task_assignments_assigned_to ON task_assignments(assigned_to_user_id);
CREATE INDEX idx_task_assignments_due_date ON task_assignments(studio_id, due_date) WHERE due_date IS NOT NULL;

CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES task_assignments(id) ON DELETE SET NULL,
  task_template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
  completed_by_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  points_awarded INTEGER DEFAULT 1
);

CREATE INDEX idx_task_completions_studio_id ON task_completions(studio_id);
CREATE INDEX idx_task_completions_completed_by ON task_completions(completed_by_user_id);
CREATE INDEX idx_task_completions_completed_at ON task_completions(completed_at DESC);

-- User Settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'dark',
  language VARCHAR(5) DEFAULT 'de',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  low_stock_alerts BOOLEAN DEFAULT true,
  maintenance_reminders BOOLEAN DEFAULT true,
  task_reminders BOOLEAN DEFAULT true,
  items_per_page INTEGER DEFAULT 25,
  default_currency VARCHAR(5) DEFAULT 'EUR',
  default_date_format VARCHAR(20) DEFAULT 'DD.MM.YYYY',
  default_time_format VARCHAR(5) DEFAULT '24h',
  timezone VARCHAR(50) DEFAULT 'Europe/Berlin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employee Permissions (granular access control for mitarbeiter)
CREATE TABLE employee_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(studio_id, user_id, permission)
);

CREATE INDEX idx_employee_permissions_user ON employee_permissions(user_id);
CREATE INDEX idx_employee_permissions_studio ON employee_permissions(studio_id);

-- Studio Invitations (invite employees to join a studio)
CREATE TABLE studio_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'mitarbeiter',
  token VARCHAR(255) NOT NULL UNIQUE,
  permissions TEXT[] DEFAULT '{}',
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_studio_invitations_token ON studio_invitations(token);
CREATE INDEX idx_studio_invitations_email ON studio_invitations(email);

-- Trigger für updated_at Timestamps

CREATE OR REPLACE FUNCTION studio_manager.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_studios_updated_at BEFORE UPDATE ON studios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consumables_updated_at BEFORE UPDATE ON consumables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_machine_categories_updated_at BEFORE UPDATE ON machine_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_machine_events_updated_at BEFORE UPDATE ON machine_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_templates_updated_at BEFORE UPDATE ON task_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
