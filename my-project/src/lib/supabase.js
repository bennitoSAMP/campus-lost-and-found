import { createClient } from '@supabase/supabase-js'

// Replace with your actual credentials from Supabase API Settings
const supabaseUrl = 'https://neelvcerjybxmgzwojda.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZWx2Y2VyanlieG1nendvamRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MDgxMjQsImV4cCI6MjEwNzQ4NDEyNH0.5g5wDbnO2xi6UE3rH-pqUfylOKr4Q7iOFIwiXqePTmY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)