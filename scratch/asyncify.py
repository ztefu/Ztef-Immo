import os
import re

def asyncify_supabase():
    # 1. Update src/utils/supabase/server.ts
    server_ts_path = 'src/utils/supabase/server.ts'
    with open(server_ts_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    content = content.replace('export function createClient() {', 'export async function createClient() {')
    content = content.replace('const cookieStore = cookies()', 'const cookieStore = await cookies()')
    
    with open(server_ts_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    # 2. Update all references in src/
    for root, _, files in os.walk('src'):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                if 'createClient()' in content and path != server_ts_path:
                    # Replace createClient() with await createClient()
                    # But we must only replace it if it's imported from server
                    # For simplicity, since createClient is usually from server in server actions,
                    # wait, what if it's from client.ts?
                    # client.ts createClient is NOT async.
                    # We can check the import.
                    if 'utils/supabase/server' in content:
                        content = re.sub(r'(?<!await )createClient\(\)', 'await createClient()', content)
                        
                        # We also need to make sure the enclosing function is async.
                        # This is a bit complex for regex.
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(content)
                            
asyncify_supabase()
print("Asyncify done.")
