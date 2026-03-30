import re
with open('index.html', 'r') as f:
    html = f.read()
if "beforeinstallprompt" in html:
    print("YES")
else:
    print("NO")
