import json
import re

transcript_path = r'C:\Users\saivi\.gemini\antigravity-cli\brain\9a6b068a-9c57-465a-8370-84bdab6a4f37\.system_generated\logs\transcript_full.jsonl'

line_dict = {}

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line_idx, line in enumerate(f):
        if 'Showing lines ' in line and ('of 3649' in line or 'of 3643' in line or 'of 3660' in line):
            obj = json.loads(line)
            content = obj.get('content', '')
            for chunk_line in content.splitlines():
                m = re.match(r'^(\d+):\s?(.*)', chunk_line)
                if m:
                    num = int(m.group(1))
                    val = m.group(2)
                    # Prefer longer value if already present
                    if num not in line_dict or len(val) > len(line_dict[num]):
                        line_dict[num] = val

print(f'Total unique lines collected: {len(line_dict)}')
print('Line 2:', line_dict.get(2))
