import re

with open('src/lib/supabase-api.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace `const adminClient = createAdminClient();` with `const supabase = createClient();` 
# and then replace `adminClient.from` with `supabase.from`
# EXCEPT for `addTenant` because it uses `adminClient.auth.admin.createUser`.

matches = re.finditer(r'export (async )?function (\w+)', content)
for m in matches:
    func_name = m.group(2)
    start_pos = m.end()
    # Find next function start
    next_m = re.search(r'export (async )?function', content[start_pos:])
    end_pos = start_pos + next_m.start() if next_m else len(content)
    
    func_body = content[start_pos:end_pos]
    if 'createAdminClient' in func_body:
        print(f"Uses adminClient: {func_name}")
