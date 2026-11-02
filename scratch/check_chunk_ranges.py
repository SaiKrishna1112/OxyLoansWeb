import json

transcript_path = r'C:\Users\saivi\.gemini\antigravity-cli\brain\9a6b068a-9c57-465a-8370-84bdab6a4f37\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line_idx, line in enumerate(f):
        if line_idx + 1 >= 1904 and line_idx + 1 <= 1932:
            if 'Showing lines' in line:
                obj = json.loads(line)
                for l in obj.get('content', '').splitlines():
                    if l.startswith('Showing lines'):
                        print(f'Line {line_idx+1}: {l}')
