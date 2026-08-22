import os
import re

with open('src/app/(dashboard)/tenants/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure it has hidden sm:flex for the avatar circles
content = content.replace(
    'rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold mr-3"',
    'rounded-full bg-slate-100 hidden sm:flex items-center justify-center text-slate-600 font-bold mr-3 shrink-0"'
)

# Replace any other variants just in case
content = content.replace(
    '<div className="h-10 w-10 rounded-full bg-slate-100 flex items-center',
    '<div className="h-10 w-10 rounded-full bg-slate-100 hidden sm:flex items-center'
)

# ensure wrapping of text
content = content.replace(
    '<div className="font-bold text-slate-900">{item.fullName}</div>',
    '<div className="font-bold text-slate-900 whitespace-normal break-words leading-tight">{item.fullName}</div>'
)
content = content.replace(
    '<div className="text-sm text-slate-500">{item.email}</div>',
    '<div className="text-sm text-slate-500 truncate mt-0.5">{item.email}</div>'
)

with open('src/app/(dashboard)/tenants/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated tenants/page.tsx")
