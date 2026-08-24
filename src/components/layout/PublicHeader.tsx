import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LogIn, ArrowRight } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo Ztefu-Immo" width={40} height={40} className="object-contain drop-shadow-sm" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Ztefu-Immo
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Tarifs
            </Link>
            <Link href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="hidden sm:flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Se connecter
            </Link>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
              >
                Essayer gratuitement
                <ArrowRight className="w-4 h-4 ml-2" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
