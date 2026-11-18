import re

def clean_jsx_content(jsx_str):
    # Ensure all SVGs and HTML elements conform to React JSX standards
    s = jsx_str
    # Replace tabindex
    s = re.sub(r'\btabindex=', 'tabIndex=', s)
    # Replace onclick
    s = re.sub(r'\bonclick=', 'onClick=', s)
    # Replace onchange
    s = re.sub(r'\bonchange=', 'onChange=', s)
    # Replace autocomplete
    s = re.sub(r'\bautocomplete=', 'autoComplete=', s)
    # Replace data-* is valid in JSX
    # Check self-closing br, hr, img, input
    s = re.sub(r'<br\s*>', '<br />', s)
    s = re.sub(r'<hr\s*>', '<hr />', s)
    s = re.sub(r'<img([^>]*?)(?<!/)>', r'<img\1 />', s)
    s = re.sub(r'<input([^>]*?)(?<!/)>', r'<input\1 />', s)
    return s

print("cleaner ready")
