import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function generateSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function run() {
  console.log("Fetching agencies...");
  const { data: agencies, error } = await supabase.from('agencies').select('id, name');
  
  if (error) {
    console.error("Error fetching agencies:", error);
    return;
  }

  for (const agency of agencies) {
     const slug = generateSlug(agency.name);
     const { error: updateError } = await supabase.from('agencies').update({ slug }).eq('id', agency.id);
     if (updateError) {
         console.error(`Error updating agency ${agency.name}:`, updateError);
     } else {
         console.log(`Successfully updated agency "${agency.name}" with slug: ${slug}`);
     }
  }
}

run();
