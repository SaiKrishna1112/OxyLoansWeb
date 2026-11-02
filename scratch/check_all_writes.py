import json

transcript_path = r'C:\Users\saivi\.gemini\antigravity-cli\brain\9a6b068a-9c57-465a-8370-84bdab6a4f37\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line_idx, line in enumerate(f):
        if 'write_file' in line:
            obj = json.loads(line)
            for tc in obj.get('tool_calls', []):
                if tc.get('name') == 'write_file':
                    args = tc.get('parameters', {}) or tc.get('args', {})
                    p = args.get('Path', '')
                    if 'OfferSelection' in p:
                        content = args.get('Content', '')
                        print(f'Line {line_idx+1}: {p} (length {len(content)}, lines {len(content.splitlines())})')
                        if len(content.splitlines()) > 3000:
                            target = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'
                            with open(target, 'w', encoding='utf-8') as out_f:
                                out_f.write(content)
                            print('RESTORED 3000+ line file!')
                            exit(0)
