-- Migration: Add user_settings table
-- This file adds user preferences functionality

CREATE TABLE IF NOT EXISTS studio_manager.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES studio_manager.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) NOT NULL DEFAULT 'dark',
  language VARCHAR(10) NOT NULL DEFAULT 'de',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  low_stock_alerts BOOLEAN NOT NULL DEFAULT true,
  maintenance_reminders BOOLEAN NOT NULL DEFAULT true,
  task_reminders BOOLEAN NOT NULL DEFAULT true,
  items_per_page INTEGER NOT NULL DEFAULT 25,
  default_currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  default_date_format VARCHAR(20) NOT NULL DEFAULT 'DD.MM.YYYY',
  default_time_format VARCHAR(20) NOT NULL DEFAULT '24h',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/Berlin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON studio_manager.user_settings(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON studio_manager.user_settings
FOR EACH ROW EXECUTE FUNCTION studio_manager.update_updated_at_column();

-- Function to get or create user settings
CREATE OR REPLACE FUNCTION studio_manager.get_or_create_user_settings(p_user_id UUID)
RETURNS studio_manager.user_settings AS $$
DECLARE
  v_settings studio_manager.user_settings;
BEGIN
  -- Try to get existing settings
  SELECT * INTO v_settings
  FROM studio_manager.user_settings
  WHERE user_id = p_user_id;

  -- If not found, create default settings
  IF NOT FOUND THEN
    INSERT INTO studio_manager.user_settings (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_settings;
  END IF;

  RETURN v_settings;
END;
$$ LANGUAGE plpgsql;
