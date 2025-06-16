-- Drop the table if it exists to recreate with better schema
DROP TABLE IF EXISTS public.analytics_events;

-- Create analytics_events table with flexible user identification
CREATE TABLE public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Create index on properties for user_identifier (for non-UUID user IDs)
CREATE INDEX idx_analytics_events_user_identifier ON public.analytics_events USING GIN ((properties->>'user_identifier'));

-- Enable Row Level Security
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert/select
CREATE POLICY "Allow service role full access" ON public.analytics_events
  FOR ALL USING (true);

-- Insert some test data to verify the table works
INSERT INTO public.analytics_events (event_name, properties) VALUES 
  ('test_event', '{"test": true, "created_by": "setup_script"}'),
  ('table_created', '{"timestamp": "' || NOW() || '", "status": "success"}');

-- Show success message
SELECT 'Analytics table created successfully!' as message;
