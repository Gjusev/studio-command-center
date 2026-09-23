-- Kursplanung (Class Scheduling) Schema
SET search_path TO studio_manager, public;

-- Enum types
CREATE TYPE class_recurrence AS ENUM ('NONE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- Class types (Yoga, HIIT, Spinning, etc.)
CREATE TABLE IF NOT EXISTS class_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 60,
    max_capacity INT NOT NULL DEFAULT 20,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Class schedule (individual class sessions)
CREATE TABLE IF NOT EXISTS class_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    class_type_id UUID NOT NULL REFERENCES class_types(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    title VARCHAR(200),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    recurrence class_recurrence NOT NULL DEFAULT 'NONE',
    recurrence_parent_id UUID REFERENCES class_schedule(id) ON DELETE CASCADE,
    max_capacity INT,
    current_bookings INT NOT NULL DEFAULT 0,
    is_cancelled BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Class bookings (member reservations)
CREATE TABLE IF NOT EXISTS class_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    class_schedule_id UUID NOT NULL REFERENCES class_schedule(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist', 'noshow')),
    booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_class_types_studio ON class_types(studio_id);
CREATE INDEX IF NOT EXISTS idx_class_schedule_studio ON class_schedule(studio_id, start_time);
CREATE INDEX IF NOT EXISTS idx_class_schedule_trainer ON class_schedule(trainer_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_class ON class_bookings(class_schedule_id, status);
CREATE INDEX IF NOT EXISTS idx_class_bookings_member ON class_bookings(member_id);
