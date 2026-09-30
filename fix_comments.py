import re

with open("src/app/(app)/dashboard/page.tsx") as f:
    content = f.read()

# Replace <!-- with {/* and --> with */}
content = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', content, flags=re.DOTALL)

with open("src/app/(app)/dashboard/page.tsx", "w") as f:
    f.write(content)
