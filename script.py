import os

# 1. AppHeader
path = "src/components/layout/AppHeader.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '<span className="text-[15px] sm:text-sm font-bold text-slate-900">',
    '<span className="text-[15px] sm:text-sm font-bold text-slate-900 truncate max-w-[150px] sm:max-w-none whitespace-nowrap">'
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated AppHeader.tsx")

# 2. Dashboard 
path = "src/app/(dashboard)/dashboard/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '<p className="text-[32px] font-bold text-slate-900 leading-none">',
    '<p className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-none truncate">'
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated dashboard/page.tsx")

# 3. Rent
path = "src/app/(dashboard)/rent/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '<p className="text-[32px] font-bold text-slate-900 leading-none">',
    '<p className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-none truncate">'
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated rent/page.tsx")

