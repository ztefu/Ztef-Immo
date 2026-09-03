"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { signupRateLimiter } from "@/lib/rate-limit";

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function signup(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  if (!(await signupRateLimiter.check(ip))) {
    return { error: "Trop de tentatives d'inscription. Veuillez réessayer plus tard." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const agencyName = formData.get("agencyName") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password || !agencyName || !fullName) {
    return { error: "Tous les champs sont requis." };
  }

  // Use the admin client to bypass RLS during the signup flow
  // because the user is not fully authenticated until their email is confirmed 
  // (if email confirmations are enabled).
  const supabaseAdmin = createAdminClient();
  
  // 1. Create the user using Admin API so they don't necessarily need email confirmation to exist in auth.users
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email so they can log in immediately
    user_metadata: {
      full_name: fullName,
    }
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Erreur lors de la création du compte." };
  }

  const userId = authData.user.id;
  const slug = generateSlug(agencyName);

  // 2. Create the agency
  const { data: agency, error: agencyError } = await supabaseAdmin
    .from("agencies")
    .insert([{ 
      name: agencyName,
      slug,
      contact_email: email,
      address: formData.get("address") as string || null 
    }])
    .select()
    .single();

  if (agencyError || !agency) {
    // Rollback user creation
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { error: "Erreur lors de la création de l'agence." };
  }

  // 3. Link user to agency
  const { error: linkError } = await supabaseAdmin
    .from("agency_users")
    .insert([{
      user_id: userId,
      agency_id: agency.id,
      role: "admin"
    }]);

  if (linkError) {
    // Rollback
    await supabaseAdmin.auth.admin.deleteUser(userId);
    await supabaseAdmin.from("agencies").delete().eq("id", agency.id);
    return { error: "Erreur lors de l'association à l'agence." };
  }

  // 4. Log the user in with the standard client
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

  redirect("/dashboard");
}
