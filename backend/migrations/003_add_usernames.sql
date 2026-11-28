-- Add username support while preserving existing user accounts.
-- Existing users receive deterministic temporary usernames based on their IDs.

BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS username VARCHAR(20);

UPDATE public.users
SET username = 'user_' || id::TEXT
WHERE username IS NULL;

ALTER TABLE public.users
  ALTER COLUMN username SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_username_format_check'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_username_format_check
      CHECK (username ~ '^[A-Za-z][A-Za-z0-9_]{2,19}$');
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_uidx
  ON public.users (LOWER(username));

COMMIT;
