import re

with open("src/app/(dashboard)/dashboard/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Link import
if "import Link from \"next/link\"" not in content and "import Link from 'next/link'" not in content:
    content = content.replace(
        'import { useState, useEffect } from "react";',
        'import { useState, useEffect } from "react";\nimport Link from "next/link";'
    )

# 2. Replace the buttons to add Link
old_buttons = """             <button 
                disabled={(((liveEncaisses || 0) + (liveAttente || 0)) > 0 ? Math.round(((liveEncaisses || 0) / ((liveEncaisses || 0) + (liveAttente || 0))) * 100) : 0) === 100}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
             >
                Saisir un paiement
             </button>
             <button 
                disabled={(((liveEncaisses || 0) + (liveAttente || 0)) > 0 ? Math.round(((liveEncaisses || 0) / ((liveEncaisses || 0) + (liveAttente || 0))) * 100) : 0) === 100}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-full font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                Relancer ({(liveAttente || 0).toLocaleString()} FCFA)
             </button>"""

new_buttons = """             <Link href="/rent" className="w-full sm:w-auto">
               <button 
                  disabled={(((liveEncaisses || 0) + (liveAttente || 0)) > 0 ? Math.round(((liveEncaisses || 0) / ((liveEncaisses || 0) + (liveAttente || 0))) * 100) : 0) === 100}
                  className="w-full px-5 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  Saisir un paiement
               </button>
             </Link>
             <Link href="/rent" className="w-full sm:w-auto">
               <button 
                  disabled={(((liveEncaisses || 0) + (liveAttente || 0)) > 0 ? Math.round(((liveEncaisses || 0) / ((liveEncaisses || 0) + (liveAttente || 0))) * 100) : 0) === 100}
                  className="w-full px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-full font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  Relancer ({(liveAttente || 0).toLocaleString()} FCFA)
               </button>
             </Link>"""

if old_buttons in content:
    content = content.replace(old_buttons, new_buttons)
else:
    print("Warning: Buttons not found for replacement.")

with open("src/app/(dashboard)/dashboard/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Patch applied successfully.")
