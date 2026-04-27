import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dngjrrdlncxidruvxbjm.supabase.co'
const supabaseKey = 'sb_publishable_x9nhz9LCtl6IgcZA4niM1Q_oQVPZ2bk'

export const supabase = createClient(supabaseUrl, supabaseKey)