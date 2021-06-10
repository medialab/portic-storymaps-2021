import requests
import html2markdown
import re
from html_sanitizer import Sanitizer
sanitizer = Sanitizer()

GDOC_HTML_URL = 'https://docs.google.com/document/d/e/2PACX-1vRkE9EwQ1VBGOSLVzXAWJmJqTFBCIG1aFRTHISnxQavXC99JeC_AgaVusdBDm3GEekqSAi-iWUJXGR4/pub'

TARGET_BASE = '../src/contents/fr/'


with requests.Session() as s:
  download = s.get(GDOC_HTML_URL)
  decoded_content = download.content.decode('utf-8')
  decoded_content = sanitizer.sanitize(decoded_content)
  md = html2markdown.convert(decoded_content)
  lines = md.split('\n')[2:]
  parts = []
  current_part = []
  for line in lines:
    if line.startswith('# '):
      parts.append(current_part)
      current_part = []
    elif line.startswith('&lt;Caller') and line.endswith('/&gt;'):
      line = re.sub(r"^&lt;Caller (.*)/&gt;$", r"<Caller \1/>", line).replace('”', '"')
    elif line.startswith('import'):
      line = '| ' + line
    current_part.append(line)
  parts.append(current_part)
  parts = parts[1:]

  for i, part in enumerate(parts):
    part_with_caller = ["import Caller from '../../components/Caller'", "\n"] + part
    parts[i] = '\n'.join(part_with_caller)
    md_path = TARGET_BASE + 'partie-' + str(i + 1) + '.mdx'
    f = open(md_path, "w")
    f.write(parts[i])
    f.close()