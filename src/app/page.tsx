"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  MessageCircle, 
  Link as LinkIcon, 
  ShieldCheck, 
  Building,
  Key,
  Landmark,
  Briefcase,
  ChevronDown,
  Smartphone,
  PieChart,
  User,
  Building2,
  Home,
  FileText,
  AlertTriangle,
  PenTool,
  Wallet
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/layout/PublicHeader";

const faqs = [
  {
    question: "Est-ce vraiment gratuit de relancer sur WhatsApp ?",
    answer: "Oui, à 100%. Contrairement à d'autres plateformes qui vous facturent les SMS, Mazeno utilise la technologie WhatsApp Web pour vous permettre d'envoyer vos relances et reçus sans aucun frais caché."
  },
  {
    question: "Puis-je commencer à utiliser Mazeno si je n'ai qu'un seul logement ?",
    answer: "Absolument. Notre plan Découverte gratuit est conçu spécialement pour les propriétaires qui débutent, avec toutes les fonctionnalités essentielles pour gérer jusqu'à 3 logements."
  },
  {
    question: "Mes données financières sont-elles sécurisées ?",
    answer: "La sécurité est notre priorité absolue. Vos données sont hébergées sur des serveurs sécurisés et vos informations financières sont chiffrées de bout en bout."
  },
  {
    question: "Comment fonctionne la gestion déléguée ?",
    answer: "Si vous n'avez plus le temps de gérer vos biens, vous pouvez, depuis votre tableau de bord, transférer la gestion à l'une de nos agences partenaires en 1 clic. Vous gardez un accès en lecture pour suivre vos encaissements."
  }
];

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const scaleUpVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen selection:bg-slate-900 selection:text-white relative z-0">
      {/* GLOBAL FIXED BACKGROUND FOR TRUE PARALLAX */}
      <div className="fixed inset-0 -z-20">
        <Image 
          src="/images/hero_dashboard.jpg" 
          alt="Interface du Dashboard Mazeno" 
          fill
          className="object-cover object-left md:object-center"
          priority
        />
        <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]"></div>
      </div>

      <PublicHeader />

      <main>
        <section className="relative pt-32 pb-32 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[80vh]">
          <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center mt-12 mb-12">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="text-center w-full"
            >
              <motion.h1 variants={fadeUpVariant} className="text-[28px] sm:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.2] lg:leading-[1.1] mb-6">
                Gérez vos biens, vos locataires et vos loyers depuis <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">un seul endroit.</span>
              </motion.h1>
              <motion.p variants={fadeUpVariant} className="text-base sm:text-lg text-slate-700 mb-8 max-w-2xl mx-auto font-medium">
                Fini les cahiers, les fichiers Excel et les relances oubliées. Centralisez votre gestion locative et gardez le contrôle de vos revenus.
              </motion.p>
              
              <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <Link href="/signup" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-14 items-center justify-center bg-slate-900 text-white px-8 rounded-full text-base font-semibold shadow-xl hover:bg-slate-800 transition-all w-full"
                  >
                    Démarrer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.button>
                </Link>
                <p className="text-sm font-semibold text-slate-700 bg-white/50 py-2 px-4 rounded-full backdrop-blur-sm sm:ml-4">
                  Sans carte de crédit. Annulable à tout moment.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* TRUST BADGES */}
        <section className="pt-2 pb-10 bg-white relative">
          {/* Top Wave Divider */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10 -translate-y-[99%]">
            <svg className="relative block w-full h-[60px] md:h-[120px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
            </svg>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6"
            >
              Déjà adopté par les agences immobilières modernes
            </motion.p>
            <div className="overflow-hidden w-full relative">
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none hidden sm:block"></div>
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none hidden sm:block"></div>
              <motion.div 
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="flex whitespace-nowrap min-w-max"
              >
                <div className="flex items-center gap-12 md:gap-24 pr-12 md:pr-24 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                  <div className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-slate-900 hover:scale-105 transition-all"><Building className="h-6 w-6 text-indigo-500"/> Horizon Immo</div>
                  <div className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-slate-900 hover:scale-105 transition-all"><Briefcase className="h-6 w-6 text-blue-500"/> Prestige Gestion</div>
                  <div className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-slate-900 hover:scale-105 transition-all"><Key className="h-6 w-6 text-amber-500"/> Clef d'Or</div>
                  <div className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-slate-900 hover:scale-105 transition-all"><Landmark className="h-6 w-6 text-emerald-500"/> Patrimoine Plus</div>
                </div>
                
                {/* Exact duplicate for seamless loop */}
                <div className="flex items-center gap-12 md:gap-24 pr-12 md:pr-24 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                  <div className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-slate-900 hover:scale-105 transition-all"><Building className="h-6 w-6 text-indigo-500"/> Horizon Immo</div>
                  <div className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-slate-900 hover:scale-105 transition-all"><Briefcase className="h-6 w-6 text-blue-500"/> Prestige Gestion</div>
                  <div className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-slate-900 hover:scale-105 transition-all"><Key className="h-6 w-6 text-amber-500"/> Clef d'Or</div>
                  <div className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-slate-900 hover:scale-105 transition-all"><Landmark className="h-6 w-6 text-emerald-500"/> Patrimoine Plus</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* MULTI-PERSONA SECTION */}
        <section id="personas" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Une solution adaptée à votre taille.
              </h2>
            </motion.div>
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-100px" }}
              className="grid md:grid-cols-3 gap-8"
            >
              <motion.div variants={scaleUpVariant} className="bg-slate-50 rounded-[24px] p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <User className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Pour les propriétaires</h3>
                <p className="text-slate-600 leading-relaxed">
                  Gérez facilement vos logements et suivez vos loyers en toute sérénité.
                </p>
              </motion.div>
              <motion.div variants={scaleUpVariant} className="bg-slate-50 rounded-[24px] p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Pour les gestionnaires</h3>
                <p className="text-slate-600 leading-relaxed">
                  Gérez plusieurs immeubles et plusieurs propriétaires depuis un seul espace centralisé.
                </p>
              </motion.div>
              <motion.div variants={scaleUpVariant} className="bg-slate-900 rounded-[24px] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Pour les agences</h3>
                <p className="text-slate-300 leading-relaxed">
                  Centralisez votre portefeuille immobilier et professionnalisez votre gestion locative.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* INTERACTIVE HOW IT WORKS SECTION */}
        <section id="features" className="py-32 bg-slate-50 relative mt-16">
          {/* Top Wave Divider */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10 -translate-y-[99%] drop-shadow-sm">
            <svg className="relative block w-full h-[60px] md:h-[120px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
            </svg>
          </div>
          <div className="absolute inset-0 bg-grid-slate-200/[0.04] bg-[bottom_1px_center] z-0"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Moins de paperasse, <br/>plus de productivité.
              </h2>
              <p className="text-lg text-slate-500">
                Tout ce dont vous avez besoin pour professionnaliser votre gestion locative, réuni dans une interface fluide et intuitive.
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-100px" }}
              className="grid md:grid-cols-3 gap-8"
            >
              <motion.div variants={fadeUpVariant} className="bg-white rounded-[24px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-300 group">
                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-slate-900 transition-all duration-300">
                  <Building className="h-6 w-6 text-slate-700 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Gestion Centralisée</h3>
                <p className="text-slate-500 group-hover:text-slate-600 transition-colors">
                  Visualisez tout votre parc sur un seul tableau de bord élégant. Finis les classeurs et les fichiers Excel éparpillés.
                </p>
              </motion.div>

              <motion.div variants={fadeUpVariant} className="bg-white rounded-[24px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-300 group">
                <div className="h-12 w-12 bg-[#dcfce7] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                  <MessageCircle className="h-6 w-6 text-[#22c55e]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Relancez sur WhatsApp en un clic</h3>
                <p className="text-slate-500 group-hover:text-slate-600 transition-colors">
                  Messages préremplis, sans SMS payant. Relancez vos locataires en un clic via WhatsApp Web.
                </p>
              </motion.div>

              <motion.div variants={fadeUpVariant} className="bg-white rounded-[24px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-300 group">
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                  <ShieldCheck className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Délégation aux Agences</h3>
                <p className="text-slate-500 group-hover:text-slate-600 transition-colors">
                  Besoin d'aide ? Transférez la gestion de vos biens à une agence partenaire tout en gardant un oeil sur les encaissements.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CONÇU POUR L'AFRIQUE */}
        <section className="py-32 bg-slate-900 text-white relative mt-16">
          {/* Top Wave Divider */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10 -translate-y-[99%]">
            <svg className="relative block w-full h-[60px] md:h-[120px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-900"></path>
            </svg>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Conçu pour la gestion locative en Afrique.
              </h2>
              <p className="text-lg text-slate-400">
                Notre plateforme est pensée pour les réalités du terrain, pas pour un marché théorique.
              </p>
            </div>
            
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-100px" }}
              className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto"
            >
              <motion.div variants={scaleUpVariant} className="flex flex-col items-center p-6 bg-slate-800/50 rounded-[24px] border border-slate-700/50 hover:bg-slate-700/50 transition-colors group hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-900/20">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="font-bold">FCFA</span>
                </div>
                <h3 className="font-bold text-center group-hover:text-emerald-400 transition-colors">Devise Native</h3>
              </motion.div>
              <motion.div variants={scaleUpVariant} className="flex flex-col items-center p-6 bg-slate-800/50 rounded-[24px] border border-slate-700/50 hover:bg-slate-700/50 transition-colors group hover:-translate-y-2 hover:shadow-xl hover:shadow-[#25D366]/20">
                <div className="w-12 h-12 bg-[#25D366]/20 text-[#25D366] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-center group-hover:text-[#25D366] transition-colors">Relances WhatsApp</h3>
              </motion.div>
              <motion.div variants={scaleUpVariant} className="flex flex-col items-center p-6 bg-slate-800/50 rounded-[24px] border border-slate-700/50 hover:bg-slate-700/50 transition-colors group hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-900/20">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-center group-hover:text-blue-400 transition-colors">Focus Mobile & Téléphone</h3>
              </motion.div>
              <motion.div variants={scaleUpVariant} className="flex flex-col items-center p-6 bg-slate-800/50 rounded-[24px] border border-slate-700/50 hover:bg-slate-700/50 transition-colors group hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-900/20">
                <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-center group-hover:text-amber-400 transition-colors">Quittances Automatiques</h3>
              </motion.div>
              <motion.div variants={scaleUpVariant} className="flex flex-col items-center p-6 bg-slate-800/50 rounded-[24px] border border-slate-700/50 hover:bg-slate-700/50 transition-colors group hover:-translate-y-2 hover:shadow-xl hover:shadow-red-900/20">
                <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-center group-hover:text-red-400 transition-colors">Gestion des Impayés</h3>
              </motion.div>
              <motion.div variants={scaleUpVariant} className="flex flex-col items-center p-6 bg-slate-800/50 rounded-[24px] border border-slate-700/50 hover:bg-slate-700/50 transition-colors group hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-900/20">
                <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-center group-hover:text-purple-400 transition-colors">Multi-Immeubles</h3>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CYCLE COMPLET SECTION */}
        <section id="cycle-complet" className="py-32 bg-slate-50 relative mt-16">
          {/* Top Wave Divider */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10 -translate-y-[99%]">
            <svg className="relative block w-full h-[60px] md:h-[120px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
            </svg>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Pas juste un logiciel d'encaissement.
              </h2>
              <p className="text-lg text-slate-500">
                Gérez l'intégralité du cycle de vie de votre parc immobilier.
              </p>
            </div>
            
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-100px" }}
              className="relative max-w-[1200px] mx-auto"
            >
              {/* Ligne connectrice (masquée sur mobile) */}
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: false }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="hidden lg:block absolute top-1/2 left-0 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full"
              ></motion.div>
              
              {/* Desktop View (Static Grid/Row) */}
              <div className="hidden lg:flex items-center justify-between gap-6 relative z-10 py-0">
                {[
                  { icon: Building2, label: "Bien", color: "text-slate-700", bg: "bg-slate-100" },
                  { icon: Home, label: "Logement", color: "text-slate-700", bg: "bg-slate-100" },
                  { icon: User, label: "Locataire", color: "text-blue-600", bg: "bg-blue-100" },
                  { icon: FileText, label: "Contrat", color: "text-amber-600", bg: "bg-amber-100" },
                  { icon: Wallet, label: "Loyer", color: "text-emerald-600", bg: "bg-emerald-100" },
                  { icon: CheckCircle2, label: "Paiement", color: "text-emerald-600", bg: "bg-emerald-100" },
                  { icon: FileText, label: "Quittance", color: "text-purple-600", bg: "bg-purple-100" },
                  { icon: PenTool, label: "Maintenance", color: "text-rose-600", bg: "bg-rose-100" },
                  { icon: PieChart, label: "Rapport", color: "text-slate-900", bg: "bg-slate-200" }
                ].map((step, i) => (
                  <motion.div 
                    key={i}
                    variants={scaleUpVariant}
                    className="flex flex-col items-center gap-3 w-auto bg-transparent p-0 border-none shadow-none hover:-translate-y-2 hover:scale-110 transition-transform duration-300 cursor-default"
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${step.bg}`}>
                      <step.icon className={`h-7 w-7 ${step.color}`} />
                    </div>
                    <span className="font-bold text-sm text-slate-900 text-center w-full">{step.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Mobile View (Infinite Auto-scroll Marquee) */}
              <div className="lg:hidden overflow-hidden w-full relative pb-4">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-20 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-20 pointer-events-none"></div>
                <motion.div 
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="flex whitespace-nowrap min-w-max relative z-10"
                >
                  <div className="flex gap-4 pr-4">
                    {[
                      { icon: Building2, label: "Bien", color: "text-slate-700", bg: "bg-slate-100" },
                      { icon: Home, label: "Logement", color: "text-slate-700", bg: "bg-slate-100" },
                      { icon: User, label: "Locataire", color: "text-blue-600", bg: "bg-blue-100" },
                      { icon: FileText, label: "Contrat", color: "text-amber-600", bg: "bg-amber-100" },
                      { icon: Wallet, label: "Loyer", color: "text-emerald-600", bg: "bg-emerald-100" },
                      { icon: CheckCircle2, label: "Paiement", color: "text-emerald-600", bg: "bg-emerald-100" },
                      { icon: FileText, label: "Quittance", color: "text-purple-600", bg: "bg-purple-100" },
                      { icon: PenTool, label: "Maintenance", color: "text-rose-600", bg: "bg-rose-100" },
                      { icon: PieChart, label: "Rapport", color: "text-slate-900", bg: "bg-slate-200" }
                    ].map((step, i) => (
                      <div 
                        key={i}
                        className="shrink-0 flex flex-col items-center gap-3 w-32 bg-white p-4 rounded-[24px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] cursor-default"
                      >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${step.bg}`}>
                          <step.icon className={`h-6 w-6 ${step.color}`} />
                        </div>
                        <span className="font-bold text-sm text-slate-900 text-center w-full">{step.label}</span>
                      </div>
                    ))}
                  </div>
                  {/* Exact duplicate for seamless loop */}
                  <div className="flex gap-4 pr-4">
                    {[
                      { icon: Building2, label: "Bien", color: "text-slate-700", bg: "bg-slate-100" },
                      { icon: Home, label: "Logement", color: "text-slate-700", bg: "bg-slate-100" },
                      { icon: User, label: "Locataire", color: "text-blue-600", bg: "bg-blue-100" },
                      { icon: FileText, label: "Contrat", color: "text-amber-600", bg: "bg-amber-100" },
                      { icon: Wallet, label: "Loyer", color: "text-emerald-600", bg: "bg-emerald-100" },
                      { icon: CheckCircle2, label: "Paiement", color: "text-emerald-600", bg: "bg-emerald-100" },
                      { icon: FileText, label: "Quittance", color: "text-purple-600", bg: "bg-purple-100" },
                      { icon: PenTool, label: "Maintenance", color: "text-rose-600", bg: "bg-rose-100" },
                      { icon: PieChart, label: "Rapport", color: "text-slate-900", bg: "bg-slate-200" }
                    ].map((step, i) => (
                      <div 
                        key={i}
                        className="shrink-0 flex flex-col items-center gap-3 w-32 bg-white p-4 rounded-[24px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] cursor-default"
                      >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${step.bg}`}>
                          <step.icon className={`h-6 w-6 ${step.color}`} />
                        </div>
                        <span className="font-bold text-sm text-slate-900 text-center w-full">{step.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-32 bg-white relative mt-16">
          {/* Top Wave Divider */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10 -translate-y-[99%]">
            <svg className="relative block w-full h-[60px] md:h-[120px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
            </svg>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Des tarifs simples et transparents.
              </h2>
              <p className="text-lg text-slate-500">
                Commencez gratuitement, évoluez quand vous êtes prêt.
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-100px" }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
            >
              {/* Gratuit */}
              <motion.div variants={fadeUpVariant} className="bg-slate-50 rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">Découverte</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">0 FCFA</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Particuliers</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Jusqu\'à 3 logements', 'Relances WhatsApp', 'Support par email'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-slate-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block w-full text-center py-3.5 rounded-full border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors">
                  Commencer
                </Link>
              </motion.div>

              {/* Essentiel */}
              <motion.div variants={fadeUpVariant} className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">Essentiel</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">7 500 FCFA</span>
                    <span className="text-slate-500 text-sm">/mois</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Petits propriétaires</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Jusqu\'à 20 logements', 'Quittances automatiques', 'Rapports basiques'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-[#25D366] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block w-full text-center py-3.5 rounded-full border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors">
                  Démarrer
                </Link>
              </motion.div>

              {/* Professionnel */}
              <motion.div variants={fadeUpVariant} className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] flex flex-col relative transform lg:-translate-y-4 hover:-translate-y-6 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 group">
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                  Recommandé
                </div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Pro</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">15 000 FCFA</span>
                    <span className="text-slate-400 text-sm">/mois</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">Gestionnaires</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Jusqu\'à 100 logements', 'Gestion déléguée', 'Portail Locataire', 'Rapports financiers'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-[#25D366] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block w-full text-center py-3.5 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 hover:scale-105 transition-all">
                  Passer Pro
                </Link>
              </motion.div>
              
              {/* Agence */}
              <motion.div variants={fadeUpVariant} className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Agence</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">Sur devis</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Agences immobilières</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Logements illimités', 'Multi-utilisateurs', 'Marque blanche', 'Support prioritaire'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-purple-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block w-full text-center py-3.5 rounded-full border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors">
                  Nous contacter
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-32 bg-slate-50 relative mt-16">
          {/* Top Wave Divider */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10 -translate-y-[99%]">
            <svg className="relative block w-full h-[60px] md:h-[120px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
            </svg>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl z-0 translate-x-1/2 -translate-y-1/2"></div>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Questions fréquentes
              </h2>
              <p className="text-lg text-slate-500">
                Tout ce que vous devez savoir avant de vous lancer.
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-100px" }}
              className="space-y-4"
            >
              {faqs.map((faq, idx) => (
                <motion.div 
                  variants={fadeUpVariant}
                  key={idx} 
                  className="bg-white border border-slate-200 rounded-[24px] overflow-hidden transition-all duration-300 hover:border-slate-300 hover:shadow-md"
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between font-bold text-slate-900 text-left"
                  >
                    {faq.question}
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-700/50 via-slate-900 to-slate-900 pointer-events-none"></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
          >
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Prêt à digitaliser votre gestion ?
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Rejoignez les propriétaires et agences qui ont déjà fait le choix de la tranquillité d'esprit avec Mazeno.
            </p>
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex h-14 items-center justify-center bg-white text-slate-900 px-10 rounded-full text-lg font-bold shadow-[0_0_40px_rgb(255,255,255,0.2)] hover:shadow-[0_0_60px_rgb(255,255,255,0.3)] transition-all"
              >
                Créer mon compte gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
            </Link>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <Image src="/logo.png" alt="Logo Mazeno" width={32} height={32} className="object-contain brightness-0 invert opacity-90" />
            <span className="font-bold text-lg tracking-tight">Mazeno</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Mazeno. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm hover:text-white transition-colors">Mentions légales</Link>
            <Link href="#" className="text-sm hover:text-white transition-colors">Politique de confidentialité</Link>
            <Link href="#" className="text-sm hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
