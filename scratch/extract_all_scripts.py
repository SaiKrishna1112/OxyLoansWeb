import json
import os

transcript_path = r'C:\Users\saivi\.gemini\antigravity-cli\brain\9a6b068a-9c57-465a-8370-84bdab6a4f37\.system_generated\logs\transcript_full.jsonl'

lines_to_extract = [4049, 4148, 4256, 4270, 4330, 4384]

scripts = {}
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line_idx, line in enumerate(f):
        if line_idx + 1 in lines_to_extract:
            obj = json.loads(line)
            for tc in obj.get('tool_calls', []):
                params = tc.get('parameters', {})
                name = os.path.basename(params.get('Path', ''))
                scripts[name] = params.get('Content', '')
                print(f'Extracted {name}: {len(scripts[name])} chars')

# Save them to scratch
for name, code in scripts.items():
    with open(os.path.join('scratch', name), 'w', encoding='utf-8') as f:
        f.write(code)
    print(f'Saved scratch/{name}')
