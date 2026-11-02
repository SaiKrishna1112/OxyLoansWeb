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
                    line_dict[num] = val

print(f'Total lines collected: {len(line_dict)}')

# Part 1: Lines 1 to 1624
part1_lines = []
for i in range(1, 1625):
    if i in line_dict:
        part1_lines.append(line_dict[i])
    else:
        print(f'Missing in part 1: line {i}')

# Part 2: Lines 2005 to 3648
part2_lines = []
for i in range(2005, 3649):
    if i in line_dict:
        part2_lines.append(line_dict[i])
    else:
        print(f'Missing in part 2: line {i}')

print(f'Part 1 lines: {len(part1_lines)}')
print(f'Part 2 lines: {len(part2_lines)}')

# Combine with return (
full_code = '\n'.join(part1_lines) + '\n\n  return (\n' + '\n'.join(part2_lines)

target = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'
with open(target, 'w', encoding='utf-8') as f:
    f.write(full_code)

print('Assembled file saved to', target)
