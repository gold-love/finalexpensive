import re
try:
    with open(r'C:\Users\HP\.gemini\antigravity\brain\d487b07e-2b28-4b4b-9945-cdb9cdb250c1\.system_generated\steps\179\content.md', encoding='utf-8') as f:
        html = f.read()
    m = re.search(r'https://i\.pinimg\.com/[^\s\"]+', html)
    if m:
        print(m.group(0))
    else:
        print("Not found")
except Exception as e:
    print(e)
