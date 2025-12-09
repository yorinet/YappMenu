
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ugvrdwvljioatjxqocic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVndnJkd3ZsamlvYXRqeHFvY2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NzUzOTAsImV4cCI6MjA4MDQ1MTM5MH0.xE5Al8NSBebNjX9I0cAJrGniRKPHtRAb60g0DiXOxbs';

export const supabase = createClient(supabaseUrl, supabaseKey);
