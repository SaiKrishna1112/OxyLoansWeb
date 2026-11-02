import json

with open(r'C:/Users/saivi/.gemini/antigravity-cli/brain/9a6b068a-9c57-465a-8370-84bdab6a4f37/scratch/extracted_chunks.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chunks = data.get('chunks', [])
full_content = '\n'.join([c['content'] for c in chunks])

print('Total lines in assembled file:', len(full_content.splitlines()))

target = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'
with open(target, 'w', encoding='utf-8') as f:
    f.write(full_content)

print('Written assembled file to', target)
