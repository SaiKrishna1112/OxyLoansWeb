import json

transcript_path = r'C:\Users\saivi\.gemini\antigravity-cli\brain\9a6b068a-9c57-465a-8370-84bdab6a4f37\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line_idx, line in enumerate(f):
        if 'Showing lines ' in line and ('of 3649' in line or 'of 3643' in line or 'of 36' in line):
            obj = json.loads(line)
            for cl in obj.get('content', '').splitlines():
                if cl.startswith('Showing lines'):
                    print(f'Line {line_idx+1}: {cl}')
