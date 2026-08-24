"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  PieChart
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/layout/PublicHeader";

const faqs = [
  {
    question: "Est-ce vraiment gratuit de relancer sur WhatsApp ?",
    answer: "Oui, à 100%. Contrairement à d'autres plateformes qui vous facturent les SMS, Ztefu-Immo utilise la technologie WhatsApp Web pour vous permettre d'envoyer vos relances et reçus sans aucun frais caché."
  },
  {
    question: "Puis-je commencer à utiliser Ztefu-Immo si je n'ai qu'un seul logement ?",
    answer: "Absolument. Notre plan Découverte gratuit est conçu spécialement pour les propriétaires qui débutent, avec toutes les fonctionnalités essentielles pour gérer jusqu'à 3 locataires."
  },
  {
    question: "Mes données financières sont-elles sécurisées ?",
    answer: "La sécurité est notre priorité absolue. Vos données sont hébergées sur des serveurs sécurisés (Supabase) et vos informations financières sont chiffrées de bout en bout."
  },
  {
    question: "Comment fonctionne la gestion déléguée ?",
    answer: "Si vous n'avez plus le temps de gérer vos biens, vous pouvez, depuis votre tableau de bord, transférer la gestion à l'une de nos agences partenaires en 1 clic. Vous gardez un accès lecture pour suivre vos encaissements."
  }
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tabs = [
    {
      title: "Gestion Simplifiée",
      description: "Ajoutez vos propriétés et locataires en quelques secondes. Suivez les baux et les dates d'échéance sans fichier Excel complexe.",
      icon: <Building className="h-5 w-5" />,
      image: "/images/hero_dashboard.jpg"
    },
    {
      title: "Relances 1-Clic",
      description: "Fini les retards impunis. Une notification WhatsApp pré-rédigée part vers votre locataire d'un simple clic sur votre tableau de bord.",
      icon: <MessageCircle className="h-5 w-5 text-[#25D366]" />,
      image: "/images/feature_whatsapp.jpg"
    },
    {
      title: "Portail Locataire",
      description: "Vos locataires accèdent à leur espace privé pour payer, télécharger leurs quittances et déclarer des tickets de maintenance.",
      icon: <Smartphone className="h-5 w-5 text-blue-500" />,
      image: "/images/feature_delegation.jpg" // Utilisons cette image abstraite pour illustrer l'espace
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-slate-900 selection:text-white">
      <PublicHeader />

      <main>
        {/* HERO SECTION */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 text-slate-600 text-sm font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                Ztefu-Immo V2 est maintenant en ligne
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                Le moyen le plus simple de gérer <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">
                  votre patrimoine.
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                La plateforme incontournable pour les propriétaires et agences. Fini les fichiers Excel : encaissez vos loyers, relancez gratuitement sur WhatsApp et laissez le système automatiser vos reçus.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-14 items-center justify-center bg-slate-900 text-white px-8 rounded-full text-base font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-slate-800 transition-all w-full sm:w-auto"
                  >
                    Démarrer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.button>
                </Link>
                <p className="text-sm text-slate-500 sm:ml-4">
                  Sans carte de crédit. Annulable à tout moment.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 relative w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-white/0 rounded-[32px] transform rotate-3 scale-105 -z-10 blur-xl opacity-50"></div>
              <div className="relative rounded-[32px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200 bg-white group">
                <Image 
                  src="/images/hero_dashboard.jpg" 
                  alt="Interface du Dashboard Ztefu-Immo" 
                  width={800} 
                  height={600}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* TRUST BADGES */}
        <section className="py-10 border-y border-slate-100 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
              Déjà adopté par les agences immobilières modernes
            </p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale">
              <div className="flex items-center gap-2 text-xl font-bold text-slate-800"><Building className="h-6 w-6"/> Horizon Immo</div>
              <div className="flex items-center gap-2 text-xl font-bold text-slate-800"><Briefcase className="h-6 w-6"/> Prestige Gestion</div>
              <div className="flex items-center gap-2 text-xl font-bold text-slate-800"><Key className="h-6 w-6"/> Clef d'Or</div>
              <div className="flex items-center gap-2 text-xl font-bold text-slate-800"><Landmark className="h-6 w-6"/> Patrimoine Plus</div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE HOW IT WORKS SECTION */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Moins de paperasse, <br/>plus de productivité.
              </h2>
              <p className="text-lg text-slate-500">
                Tout ce dont vous avez besoin pour professionnaliser votre gestion locative, réuni dans une interface fluide et intuitive.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 items-center">
              {/* TABS LEFT */}
              <div className="w-full lg:w-1/3 flex flex-col gap-4">
                {tabs.map((tab, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`text-left p-6 rounded-[24px] border transition-all duration-300 relative overflow-hidden ${
                      activeTab === idx 
                        ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)]' 
                        : 'bg-transparent border-transparent hover:bg-slate-100'
                    }`}
                  >
                    {activeTab === idx && (
                      <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />
                    )}
                    <h3 className={`text-lg font-bold flex items-center gap-3 mb-2 relative z-10 ${activeTab === idx ? 'text-slate-900' : 'text-slate-600'}`}>
                      {tab.icon}
                      {tab.title}
                    </h3>
                    <p className={`text-sm leading-relaxed relative z-10 ${activeTab === idx ? 'text-slate-600' : 'text-slate-500'}`}>
                      {tab.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* IMAGE RIGHT */}
              <div className="w-full lg:w-2/3">
                <div className="relative rounded-[32px] overflow-hidden bg-slate-200 shadow-2xl shadow-slate-900/10 border border-slate-200 aspect-[4/3] sm:aspect-video w-full flex items-center justify-center p-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0"
                    >
                      <Image 
                        src={tabs[activeTab].image} 
                        alt={tabs[activeTab].title} 
                        fill 
                        className="object-cover rounded-[30px]" 
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Des tarifs simples et transparents.
              </h2>
              <p className="text-lg text-slate-500">
                Commencez gratuitement, évoluez quand vous êtes prêt.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Gratuit */}
              <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Découverte</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">0 FCFA</span>
                    <span className="text-slate-500">/mois</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-4">Idéal pour les particuliers qui débutent.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Jusqu\'à 3 locataires', 'Relances WhatsApp', 'Quittances automatisées', 'Support par email'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-slate-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block w-full text-center py-3.5 rounded-full border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors">
                  Commencer
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] flex flex-col relative transform md:-translate-y-4">
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  Recommandé
                </div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">15 000 FCFA</span>
                    <span className="text-slate-400">/mois</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-4">Pour les agences et gros propriétaires.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Locataires illimités', 'Gestion déléguée', 'Portail Locataire dédié', 'Rapports financiers avancés', 'Support prioritaire 24/7'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-[#25D366] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block w-full text-center py-3.5 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 hover:scale-[1.02] active:scale-95 transition-all">
                  Passer à l'action
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-24 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Questions fréquentes
              </h2>
              <p className="text-lg text-slate-500">
                Tout ce que vous devez savoir avant de vous lancer.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200 rounded-[24px] overflow-hidden transition-all duration-300 hover:border-slate-300"
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-700/50 via-slate-900 to-slate-900 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Prêt à digitaliser votre gestion ?
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Rejoignez les propriétaires et agences qui ont déjà fait le choix de la tranquillité d'esprit avec Ztefu-Immo.
            </p>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex h-14 items-center justify-center bg-white text-slate-900 px-10 rounded-full text-lg font-bold shadow-[0_0_40px_rgb(255,255,255,0.2)] hover:shadow-[0_0_60px_rgb(255,255,255,0.3)] transition-all"
              >
                Créer mon compte gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <Image src="/logo.png" alt="Logo Ztefu-Immo" width={32} height={32} className="object-contain brightness-0 invert opacity-90" />
            <span className="font-bold text-lg tracking-tight">Ztefu-Immo</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Ztefu-Immo. Tous droits réservés.
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
