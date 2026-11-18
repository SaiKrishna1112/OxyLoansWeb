import re

# 1. Inspect TeamManagement.jsx
try:
    with open('src/components/pages/Static/TeamManagement.jsx', 'r', encoding='utf-8') as f:
        team_content = f.read()
    print("Found TeamManagement.jsx, len:", len(team_content))
    # extract names and roles
    names = re.findall(r'<h[345][^>]*>(.*?)</h[345]>', team_content)
    print("Team names sample:", names[:10])
except Exception as e:
    print("Error reading TeamManagement:", e)

# 2. Inspect AdvisoryBoard.jsx
try:
    with open('src/components/pages/Static/AdvisoryBoard.jsx', 'r', encoding='utf-8') as f:
        adv_content = f.read()
    print("Found AdvisoryBoard.jsx, len:", len(adv_content))
    adv_names = re.findall(r'<h[345][^>]*>(.*?)</h[345]>', adv_content)
    print("Advisory names sample:", adv_names[:10])
except Exception as e:
    print("Error reading AdvisoryBoard:", e)

# 3. Inspect BlogPage.jsx
try:
    with open('src/components/pages/Static/BlogPage.jsx', 'r', encoding='utf-8') as f:
        blog_content = f.read()
    print("Found BlogPage.jsx, len:", len(blog_content))
    blog_titles = re.findall(r'<h[345][^>]*>(.*?)</h[345]>', blog_content)
    print("Blog titles sample:", blog_titles[:8])
except Exception as e:
    print("Error reading BlogPage:", e)

# 4. Inspect FAQPage.jsx
try:
    with open('src/components/pages/Static/FAQPage.jsx', 'r', encoding='utf-8') as f:
        faq_content = f.read()
    print("Found FAQPage.jsx, len:", len(faq_content))
except Exception as e:
    print("Error reading FAQPage:", e)

# 5. Inspect old Landing.jsx
try:
    with open('src/components/pages/Landing/Landing.jsx', 'r', encoding='utf-8') as f:
        landing_content = f.read()
    print("Found Landing.jsx, len:", len(landing_content))
    headings = re.findall(r'<h[1234][^>]*>(.*?)</h[1234]>', landing_content)
    print("Old Landing headings sample:", headings[:8])
except Exception as e:
    print("Error reading Landing.jsx:", e)
