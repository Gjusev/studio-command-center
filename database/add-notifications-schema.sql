-- Notifications table migration
-- Run this to enable the notification system

CREATE SCHEMA IF NOT EXISTS studio_manager;

CREATE TABLE IF NOT EXISTS studio_manager.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    action_url VARCHAR(500),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES studio_manager.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_studio FOREIGN KEY (studio_id) REFERENCES studio_manager.studios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON studio_manager.notifications (user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON studio_manager.notifications (user_id, created_at DESC);
