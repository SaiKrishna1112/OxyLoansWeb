with open('scratch/update_refined_ui.py', 'r', encoding='utf-8') as f:
    text = f.read()

start_rep = text.find('replacement = """')
end_rep = text.rfind('"""')
rep_code = text[start_rep + len('replacement = """'):end_rep]
print('rep_code length:', len(rep_code))
print('first 300 chars:\n', rep_code[:300])
print('last 300 chars:\n', rep_code[-300:])
