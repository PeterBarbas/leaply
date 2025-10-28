-- Create experiment_tracking table
CREATE TABLE IF NOT EXISTS experiment_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'page_visit', 'button_click', 'email_submit', 'session_end'
  session_id VARCHAR(100) NOT NULL,
  email VARCHAR(255), -- Only for email_submit events
  session_duration_ms INTEGER, -- Only for session_end events
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_experiment_tracking_session_id ON experiment_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_experiment_tracking_event_type ON experiment_tracking(event_type);
CREATE INDEX IF NOT EXISTS idx_experiment_tracking_created_at ON experiment_tracking(created_at);
