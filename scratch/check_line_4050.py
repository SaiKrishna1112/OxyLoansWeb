import json

transcript_path = r'C:\Users\saivi\.gemini\antigravity-cli\brain\9a6b068a-9c57-465a-8370-84bdab6a4f37\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line_idx, line in enumerate(f):
        if line_idx + 1 >= 4045 and line_idx + 1 <= 4055:
            obj = json.loads(line)
            t_calls = obj.get('tool_calls', [])
            print(f'Line {line_idx+1}: {len(t_calls)} tool calls')
            for tc in t_calls:
                print('  Tool:', tc.get('name'))
                params = tc.get('parameters', {}) or tc.get('args', {})
                for k, v in params.items():
                    print(f'    {k}: {str(v)[:100]}')
