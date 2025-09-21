-- Add username field to users table
-- This script adds a unique username field to the users table

-- Add the username column
ALTER TABLE public.users
ADD COLUMN username TEXT;

-- Create a unique index on username
CREATE UNIQUE INDEX users_username_key ON public.users (username);

-- Add a check constraint to ensure username is not empty
ALTER TABLE public.users
ADD CONSTRAINT users_username_check CHECK (username IS NULL OR length(trim(username)) > 0);

-- Optional: Add a comment to the column
COMMENT ON COLUMN public.users.username IS 'Unique username for the user, used for recipe attribution and editing permissions';
