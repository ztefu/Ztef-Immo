"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, ArrowRight, Menu, X } from "lucide-react";

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: 15, ease: "easeInOut" }}
            >
              <Image src="/logo.png" alt="Logo Mazeno" width={40} height={40} className="object-contain drop-shadow-sm" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-slate-900 block">
              Mazeno
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8">
            <Link href="#personas" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Pour qui ?
            </Link>
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#cycle-complet" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Avantages
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Tarifs
            </Link>
            <Link href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* CTA Buttons & Mobile Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/login" 
              className="hidden md:flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Se connecter
            </Link>
            <Link href="/signup" className="hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
              >
                Essayer gratuitement
                <ArrowRight className="w-4 h-4 ml-2" />
              </motion.button>
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-100 bg-white"
          >
            <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
              <Link 
                href="#personas" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-base font-medium text-slate-900 hover:bg-slate-50 rounded-xl"
              >
                Pour qui ?
              </Link>
              <Link 
                href="#features" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-base font-medium text-slate-900 hover:bg-slate-50 rounded-xl"
              >
                Fonctionnalités
              </Link>
              <Link 
                href="#cycle-complet" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-base font-medium text-slate-900 hover:bg-slate-50 rounded-xl"
              >
                Avantages
              </Link>
              <Link 
                href="#pricing" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-base font-medium text-slate-900 hover:bg-slate-50 rounded-xl"
              >
                Tarifs
              </Link>
              <Link 
                href="#faq" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-base font-medium text-slate-900 hover:bg-slate-50 rounded-xl"
              >
                FAQ
              </Link>
              
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-slate-200 text-slate-900 rounded-xl font-bold"
                >
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </Link>
                <Link 
                  href="/signup" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20"
                >
                  Essayer gratuitement
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
