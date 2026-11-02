import json

transcript_path = r'C:\Users\saivi\.gemini\antigravity-cli\brain\9a6b068a-9c57-465a-8370-84bdab6a4f37\.system_generated\logs\transcript_full.jsonl'
with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'InstantLoanStepOfferSelection.jsx' in line and 'with open' in line:
            obj = json.loads(line)
            for tc in obj.get('tool_calls', []):
                cmd = tc.get('parameters', {}).get('CommandLine', '')
                if 'with open' in cmd and 'InstantLoanStepOfferSelection.jsx' in cmd:
                    print('Line:', i+1, cmd[:120])
