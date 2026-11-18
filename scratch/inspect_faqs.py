with open('src/components/pages/Static/FAQPage.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'question:\s*["\'](.*?)["\']', text)
print(f"Total FAQs in FAQPage: {len(matches)}")
for i, q in enumerate(matches[:10]):
    print(f" {i+1}. {q}")
