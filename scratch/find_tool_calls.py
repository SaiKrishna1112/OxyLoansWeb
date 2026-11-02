import json

transcript_path = r'C:\Users\saivi\.gemini\antigravity-cli\brain\9a6b068a-9c57-465a-8370-84bdab6a4f37\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line_idx, line in enumerate(f):
        if 'InstantLoanStepOfferSelection.jsx' in line:
            obj = json.loads(line)
            # check what happened
            t_calls = obj.get('tool_calls', [])
            for tc in t_calls:
                name = tc.get('name')
                params = tc.get('parameters', {}) or tc.get('args', {})
                if 'InstantLoanStepOfferSelection.jsx' in str(params):
                    print(f'Line {line_idx+1}: {name}')
