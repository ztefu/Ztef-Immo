import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Veuillez configurer NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createSuperAdmin() {
  const email = 'admin@ztefu-immo.com'
  const password = 'Admin@123456!'

  console.log(`Création du compte Super Admin : ${email}`)

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: "Super",
      last_name: "Admin",
      is_superadmin: true
    }
  })

  if (error) {
    console.error("Erreur lors de la création du Super Admin :", error.message)
    
    if (error.message.includes('User already registered')) {
        console.log("\nLe compte existe déjà ! Vous pouvez vous connecter avec :")
        console.log("Email :", email)
        console.log("Mot de passe :", password)
    }
  } else {
    console.log("\n✅ Compte Super Admin créé avec succès !")
    console.log("Email :", email)
    console.log("Mot de passe :", password)
    console.log("\nVous pouvez maintenant vous connecter sur /login avec ces identifiants.")
  }
}

createSuperAdmin()
