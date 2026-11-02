import json
import re

transcript_path = r'C:\Users\saivi\.gemini\antigravity-cli\brain\9a6b068a-9c57-465a-8370-84bdab6a4f37\.system_generated\logs\transcript_full.jsonl'

line_dict = {}

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'Showing lines ' in line and ('of 3649' in line or 'of 3643' in line or 'of 3660' in line):
            obj = json.loads(line)
            content = obj.get('content', '')
            if 'Found step:' in content or 'Command output:' in content or 'truncated' in content:
                continue
            for cl in content.splitlines():
                m = re.match(r'^(\d+):\s?(.*)', cl)
                if m:
                    num = int(m.group(1))
                    val = m.group(2)
                    line_dict[num] = val

print(f'Total clean lines from read_file: {len(line_dict)}')
all_keys = sorted(line_dict.keys())
print('Range:', all_keys[0], 'to', all_keys[-1])

missing = [i for i in range(1, all_keys[-1] + 1) if i not in line_dict]
print('Missing count:', len(missing))
# Print missing contiguous intervals
if missing:
    intervals = []
    start = missing[0]
    prev = missing[0]
    for m in missing[1:]:
        if m == prev + 1:
            prev = m
        else:
            intervals.append((start, prev))
            start = m
            prev = m
    intervals.append((start, prev))
    print('Missing intervals:', intervals)
