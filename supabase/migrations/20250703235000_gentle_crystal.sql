/*
  # Add RLS policy for user_statistics view

  1. Security
    - Enable RLS on user_statistics view (if not already enabled)
    - Add policy for authenticated users to read their own statistics
    
  2. Changes
    - Create policy allowing users to view only their own statistics data
    - Ensure the policy uses auth.uid() to match user_id in the view
*/

-- Create policy for user_statistics view to allow users to read their own data
CREATE POLICY "Users can view their own statistics"
  ON user_statistics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable RLS on user_statistics view if not already enabled
ALTER VIEW user_statistics ENABLE ROW LEVEL SECURITY;