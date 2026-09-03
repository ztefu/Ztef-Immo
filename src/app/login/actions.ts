"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { loginRateLimiter } from "@/lib/rate-limit";

export async function login(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  if (!(await loginRateLimiter.check(ip))) {
    return { error: "Trop de tentatives de connexion. Veuillez réessayer plus tard." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }
  
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error("Login error:", error.message);
    return { error: "Identifiants incorrects." };
  }
  
  // Successful login redirects to dashboard
  redirect("/dashboard");
}
