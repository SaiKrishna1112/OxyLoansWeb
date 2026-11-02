import json

transcript_path = r'C:\Users\saivi\.gemini\antigravity-cli\brain\9a6b068a-9c57-465a-8370-84bdab6a4f37\.system_generated\logs\transcript_full.jsonl'

lines_to_check = [4049, 4148, 4256, 4270, 4320, 4330, 4384]

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line_idx, line in enumerate(f):
        if line_idx + 1 in lines_to_check:
            obj = json.loads(line)
            for tc in obj.get('tool_calls', []):
                params = tc.get('parameters', {}) or tc.get('args', {})
                print(f'=== Line {line_idx+1}: {params.get("Path")} ===')
                content = params.get('Content', '')
                print(content[:300])
                print('...\n')
