-- =============================================
-- Gym Contracts Module
-- =============================================

-- Contract types
CREATE TYPE studio_manager.contract_type AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'DAY_PASS', 'TRIAL');
CREATE TYPE studio_manager.contract_status AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PAUSED');

-- Members (gym members, separate from employees/users)
CREATE TABLE IF NOT EXISTS studio_manager.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studio_manager.studios(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(100),
    date_of_birth DATE,
    address TEXT,
    notes TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_members_studio_id ON studio_manager.members(studio_id);
CREATE INDEX idx_members_email ON studio_manager.members(email);
CREATE INDEX idx_members_active ON studio_manager.members(studio_id, is_active);

-- Contracts
CREATE TABLE IF NOT EXISTS studio_manager.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studio_manager.studios(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES studio_manager.members(id) ON DELETE CASCADE,
    type contract_type NOT NULL DEFAULT 'MONTHLY',
    status contract_status NOT NULL DEFAULT 'ACTIVE',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    deposit DECIMAL(10,2) DEFAULT 0,
    cancellation_date DATE,
    cancellation_reason TEXT,
    notes TEXT,
    created_by TEXT NOT NULL REFERENCES studio_manager."user"(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contracts_studio_id ON studio_manager.contracts(studio_id);
CREATE INDEX idx_contracts_member_id ON studio_manager.contracts(member_id);
CREATE INDEX idx_contracts_status ON studio_manager.contracts(studio_id, status);
CREATE INDEX idx_contracts_end_date ON studio_manager.contracts(studio_id, end_date) WHERE end_date IS NOT NULL;

-- Check-ins (member attendance tracking)
CREATE TABLE IF NOT EXISTS studio_manager.check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studio_manager.studios(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES studio_manager.members(id) ON DELETE CASCADE,
    check_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_check_ins_studio_id ON studio_manager.check_ins(studio_id);
CREATE INDEX idx_check_ins_member_id ON studio_manager.check_ins(member_id);
CREATE INDEX idx_check_ins_date ON studio_manager.check_ins(studio_id, check_in_at DESC);

-- Triggers
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON studio_manager.members FOR EACH ROW EXECUTE FUNCTION studio_manager.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON studio_manager.contracts FOR EACH ROW EXECUTE FUNCTION studio_manager.update_updated_at_column();
