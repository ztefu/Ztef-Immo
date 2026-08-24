"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { login } from "./actions";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/config";

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setIsLoading(true);
    setErrorMsg("");
    
    await new Promise(resolve => setTimeout(resolve, 10)); // Force React to flush state
    
    const result = await login(formData);
    
    if (result?.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image with blur */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/bg-login.jpg" 
          alt="Login background" 
          fill 
          className="object-cover blur-[8px] scale-110 brightness-[0.8]" 
          priority 
        />
        <div className="absolute inset-0 bg-slate-900/10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[480px] bg-white/75 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] shadow-2xl border border-white/40 flex flex-col items-center"
      >
        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: 15, ease: "easeInOut" }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="flex items-center justify-center">
            <Link href="/">
              <Image src="/logo.png" alt="Logo" width={72} height={72} className="object-contain drop-shadow-lg cursor-pointer hover:scale-105 transition-transform" />
            </Link>
          </div>
        </motion.div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Se connecter</h1>
        <p className="text-slate-600 text-center text-sm mb-6 font-medium">
          Connectez-vous pour accéder à votre espace de gestion.
        </p>

        <div className="flex w-full mb-8">
          <div className="flex-1 text-center py-3 border-b-2 border-primary text-sm font-bold text-primary transition-colors">
            Connexion
          </div>
          <Link href="/signup" className="flex-1 text-center py-3 border-b-2 border-slate-200/50 text-sm font-bold text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors">
            Inscription
          </Link>
        </div>

        {errorMsg && (
          <div className="w-full bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl text-center mb-6 border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Adresse Email *</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="email"
                name="email"
                required
                placeholder="vous@entreprise.com"
                className="w-full pl-12 pr-5 py-3.5 bg-white/90 border border-slate-200/50 rounded-[16px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-800">Mot de passe *</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-white/90 border border-slate-200/50 rounded-[16px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-white border border-primary/40 text-primary px-5 py-3.5 rounded-[16px] hover:bg-primary hover:text-white hover:border-primary transition-colors text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Vérification..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-8 text-xs text-slate-600/80 font-semibold text-center">
          Propulsé par {APP_NAME}
        </p>
      </motion.div>
    </div>
  );
}
