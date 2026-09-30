import re

with open("super_admin_dashboard.html") as f:
    content = f.read()

# Extract from the first <section to </footer>
start = content.find('<section class="border-b border-outline-variant bg-surface-container-lowest">')
end = content.find('</footer>') + len('</footer>')
html_part = content[start:end]

# Convert HTML to JSX
jsx = html_part.replace('class="', 'className="')
jsx = jsx.replace('style="font-size: 16px;"', 'style={{ fontSize: "16px" }}')
jsx = jsx.replace('style="font-size: 14px;"', 'style={{ fontSize: "14px" }}')
jsx = jsx.replace('style="width: 92%"', 'style={{ width: "92%" }}')
jsx = jsx.replace('style="width: 78%"', 'style={{ width: "78%" }}')
jsx = jsx.replace('style="width: 88%"', 'style={{ width: "88%" }}')
jsx = jsx.replace('style="width: 96%"', 'style={{ width: "96%" }}')
jsx = jsx.replace('style="width: 94%"', 'style={{ width: "94%" }}')
# Close unclosed tags like <input>, <img...>, <br>
jsx = re.sub(r'(<input[^>]*)(?<!/)>', r'\1 />', jsx)
jsx = re.sub(r'(<img[^>]*)(?<!/)>', r'\1 />', jsx)
jsx = re.sub(r'(<br[^>]*)(?<!/)>', r'\1 />', jsx)

# Format the final page.tsx
page_tsx = f"""import {{ getCurrentUser }} from "@/lib/session"
import {{ redirect }} from "next/navigation"

export default async function DashboardPage() {{
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <>
      {jsx}
    </>
  )
}}
"""

with open("src/app/(app)/dashboard/page.tsx", "w") as f:
    f.write(page_tsx)
