import os
import re

out_dir = 'src/components/pages/BabuzLanding'
os.makedirs(out_dir, exist_ok=True)

def sanitize_jsx(code):
    # Ensure all img and input are self closing
    code = re.sub(r'<img([^>]*?)(?<!/)>', r'<img\1 />', code)
    code = re.sub(r'<input([^>]*?)(?<!/)>', r'<input\1 />', code)
    code = re.sub(r'<br\s*>', '<br />', code)
    code = re.sub(r'<hr\s*>', '<hr />', code)
    code = re.sub(r'\btabindex=', 'tabIndex=', code)
    code = re.sub(r'\bviewbox=', 'viewBox=', code)
    code = re.sub(r'\bfill-rule=', 'fillRule=', code)
    code = re.sub(r'\bclip-rule=', 'clipRule=', code)
    code = re.sub(r'\bstroke-width=', 'strokeWidth=', code)
    code = re.sub(r'\bstroke-linecap=', 'strokeLinecap=', code)
    code = re.sub(r'\bstroke-linejoin=', 'strokeLinejoin=', code)
    return code

# 1. Navbar.jsx
with open('scratch/section_1.jsx', 'r', encoding='utf-8') as f:
    sec1 = f.read()

# We want interactive states in Navbar: isScrolled, isMobileMenuOpen, openDropdown
# Let's inspect section_1.jsx to build a fully interactive Navbar.jsx
print("Section 1 len:", len(sec1))
