-- Create admin_reset_tokens table for password reset functionality
CREATE TABLE IF NOT EXISTS admin_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_admin_reset_tokens_token ON admin_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_admin_reset_tokens_email ON admin_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_admin_reset_tokens_expires_at ON admin_reset_tokens(expires_at);

-- Add RLS policies for admin reset tokens
ALTER TABLE admin_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to manage reset tokens
CREATE POLICY "Service role can manage admin reset tokens" ON admin_reset_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- Clean up expired tokens function
CREATE OR REPLACE FUNCTION cleanup_expired_admin_reset_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_reset_tokens 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically clean up expired tokens
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_tokens()
RETURNS trigger AS $$
BEGIN
  PERFORM cleanup_expired_admin_reset_tokens();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs the cleanup function
DROP TRIGGER IF EXISTS cleanup_tokens_trigger ON admin_reset_tokens;
CREATE TRIGGER cleanup_tokens_trigger
  AFTER INSERT ON admin_reset_tokens
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_expired_tokens();
