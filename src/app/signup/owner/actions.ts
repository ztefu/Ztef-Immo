"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { signupRateLimiter } from "@/lib/rate-limit";

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function signupOwner(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  if (!(await signupRateLimiter.check(ip))) {
    return { error: "Trop de tentatives d'inscription. Veuillez réessayer plus tard." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  if (!email || !password || !fullName || !phone) {
    return { error: "Tous les champs obligatoires doivent être remplis." };
  }

  const supabaseAdmin = createAdminClient();

  // 1. Create the auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    }
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Erreur lors de la création du compte." };
  }

  const userId = authData.user.id;
  const slug = generateSlug(fullName);

  // 2. Create the owner entry (Autonome, no agency)
  const { data: owner, error: ownerError } = await supabaseAdmin
    .from("owners")
    .insert([{
      full_name: fullName,
      phone,
      email,
      address: address || "",
      management_type: "Autonome",
      commission_rate: 0,
      join_date: new Date().toISOString().split('T')[0],
      auth_id: userId,
      slug,
      agency_id: null, // No agency — fully autonomous
    }])
    .select()
    .single();

  if (ownerError || !owner) {
    // Rollback user creation
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { error: "Erreur lors de la création du profil propriétaire." };
  }

  // 3. Log the user in
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

  redirect("/dashboard");
}
