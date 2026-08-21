import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // 1. Get all users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) throw usersError;

  // 2. Filter out tenants
  const admins = users.filter(u => !u.email.endsWith('@locataire.ztefu.com'));

  for (const admin of admins) {
    console.log(`Fixing admin: ${admin.email}`);
    const { error } = await supabase
      .from('agency_users')
      .insert([{
        user_id: admin.id,
        agency_id: '00000000-0000-0000-0000-000000000000',
        role: 'admin'
      }]);
      
    if (error && error.code !== '23505') { // Ignore unique constraint violation
      console.error(`Failed to link ${admin.email}:`, error);
    } else {
      console.log(`Linked ${admin.email} successfully.`);
    }
  }
}

main().catch(console.error);
