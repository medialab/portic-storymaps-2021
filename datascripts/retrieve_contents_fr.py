import requests
import html2markdown
import re
from html_sanitizer import Sanitizer
sanitizer = Sanitizer()

GDOC_HTML_URL = 'https://docs.google.com/document/d/e/2PACX-1vSTWlb6zHzD-2HgjpF5hpr2dCgEFRLlaBYg3bTugs5nUXSOR8ViCmCHyYFSIbY2TVejtV39UEpPyn10/pub'

GDOC_INTRO_URL = 'https://docs.google.com/document/d/e/2PACX-1vRzL5gLjjaxhzNeYz3X6nU7S3hQ6X4jKEBjvxDc07hkZBBHwAukruujk5iB62DPC34MJk4IYdrQ-bpm/pub'

TARGET_BASE = '../src/contents/fr/'

def prepare_contents(str):
  decoded_content = sanitizer.sanitize(str)
  md = html2markdown.convert(decoded_content)
  lines = md.split('\n')[2:]
  parts = []
  current_part = []
  # split parts
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

  parts = parts[1:] if len(parts) > 1 else parts  
  for i, part in enumerate(parts):
    if (part[-1].startswith('Publié par <a href="//docs.google.com/" rel="noopener" target="_blank" title="Learn more about Google Drive">Google Drive</a>')):
      part = part[0:-2]
    part_with_caller = ["import Caller from '../../components/Caller'", "\n"] + part
    parts[i] = '\n'.join(part_with_caller)
  return parts

# get parts
with requests.Session() as s:
  download = s.get(GDOC_HTML_URL)
  decoded_content = download.content.decode('utf-8')
  for i, part in enumerate(prepare_contents(decoded_content)):
    md_path = TARGET_BASE + 'partie-' + str(i + 1) + '.mdx'
    f = open(md_path, "w")
    f.write(part)
    f.close()

# get intro
with requests.Session() as s:
  download = s.get(GDOC_INTRO_URL)
  decoded_content = download.content.decode('utf-8')
  intro = prepare_contents(decoded_content)[0]
  md_path = TARGET_BASE + 'introduction.mdx'
  f = open(md_path, "w")
  f.write(intro)
  f.close()