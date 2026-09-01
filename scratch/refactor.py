import re

def refactor_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all functions
    matches = list(re.finditer(r'export (async )?function (\w+)', content))
    
    new_content = ""
    last_end = 0
    
    for i, m in enumerate(matches):
        func_name = m.group(2)
        start_pos = m.start()
        end_pos = matches[i+1].start() if i + 1 < len(matches) else len(content)
        
        # Add everything before this function
        new_content += content[last_end:start_pos]
        last_end = end_pos
        
        func_body = content[start_pos:end_pos]
        
        if func_name in ['addTenant', 'deleteTenant']:
            new_content += func_body
            continue
            
        if 'createAdminClient' in func_body:
            # Check if supabase is already created
            if 'const supabase = createClient();' in func_body:
                # Remove createAdminClient
                func_body = re.sub(r'\s*const adminClient = createAdminClient\(\);', '', func_body)
                # Replace adminClient. with supabase.
                func_body = func_body.replace('adminClient.', 'supabase.')
                func_body = func_body.replace('adminClient', 'supabase')
            else:
                # Replace createAdminClient with createClient
                func_body = func_body.replace('createAdminClient()', 'createClient()')
                # Rename adminClient to supabase
                func_body = func_body.replace('adminClient', 'supabase')
        
        new_content += func_body

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
refactor_file('src/lib/supabase-api.ts')
print("Refactored supabase-api.ts")
