import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://khjbajqtgzihpyzatjsc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoamJhanF0Z3ppaHB5emF0anNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTAxNDEsImV4cCI6MjA4MjMyNjE0MX0.elXDgPI8Mb5JfM8tV5DIYpcil6krHHLbPzxomVMQu6Y'

// Create Supabase client for storage ONLY
export const supabaseStorage = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false } // We use Firebase for auth
})

// Optional: If you want Supabase database too
export const supabase = createClient(supabaseUrl, supabaseKey)