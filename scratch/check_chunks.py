import json

transcript_path = r'C:\Users\saivi\.gemini\antigravity-cli\brain\9a6b068a-9c57-465a-8370-84bdab6a4f37\.system_generated\logs\transcript_full.jsonl'

chunks = {}
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line_idx, line in enumerate(f):
        if 'Showing lines' in line and 'of 3649' in line:
            obj = json.loads(line)
            content = obj.get('content', '')
            # parse line range
            # e.g. Showing lines 1-70 of 3649
            for cl in content.splitlines():
                if cl.startswith('Showing lines ') and 'of 3649' in cl:
                    parts = cl.split()[2].split('-')
                    start = int(parts[0])
                    end = int(parts[1])
                    print(f'Found lines {start}-{end}')
                    # extract the lines
                    lines_text = []
                    for c_line in content.splitlines():
                        if c_line.startswith(tuple(str(k) + ':' for k in range(start, end+1))):
                            colon_idx = c_line.find(': ')
                            if colon_idx != -1:
                                num = int(c_line[:colon_idx])
                                val = c_line[colon_idx+2:]
                                chunks[num] = val
                            elif c_line.endswith(':'):
                                num = int(c_line[:-1])
                                chunks[num] = ''

print(f'Total lines captured from read_file: {len(chunks)} of 3649')
