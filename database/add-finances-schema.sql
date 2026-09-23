-- Finanzmodul Schema
SET search_path TO studio_manager, public;

-- Enums
CREATE TYPE payment_method AS ENUM ('SEPA', 'PAYPAL', 'CASH', 'CARD', 'TRANSFER', 'OTHER');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');
CREATE TYPE expense_category AS ENUM ('RENT', 'EQUIPMENT', 'SUPPLIES', 'SALARY', 'MARKETING', 'INSURANCE', 'UTILITIES', 'SOFTWARE', 'OTHER');

-- Payments (income from members)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    method payment_method NOT NULL DEFAULT 'SEPA',
    status payment_status NOT NULL DEFAULT 'PENDING',
    due_date DATE,
    paid_at TIMESTAMPTZ,
    description TEXT,
    invoice_number VARCHAR(50),
    created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    category expense_category NOT NULL DEFAULT 'OTHER',
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    receipt_url TEXT,
    created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_studio ON payments(studio_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_due ON payments(due_date) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_expenses_studio ON expenses(studio_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(studio_id, category);
