import os
import re

def asyncify_create_client(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                if 'createClient(' in content and 'import ' in content and 'supabase' in content:
                    # We need to change `const supabase = createClient()` to `const supabase = await createClient()`
                    # but only for createClient() from @/utils/supabase/server or client
                    if 'createClient' in content:
                        new_content = re.sub(r'([^\w])createClient\(\)', r'\1await createClient()', content)
                        if new_content != content:
                            with open(filepath, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            print(f"Updated {filepath}")

asyncify_create_client('src')
