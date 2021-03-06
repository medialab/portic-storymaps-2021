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
  center_mode = False
  # split parts
  for line in lines:
    if line.strip() == '---':
      line = ''
    if line.startswith('# '):
      if center_mode == True:
        current_part.append('</div></div>')
        center_mode = False
      parts.append(current_part)
      current_part = []
    elif line.startswith('&lt;Caller') and line.endswith('/&gt;'):
      line = re.sub(r"^&lt;Caller (.*)/&gt;$", r"<Caller \1/>", line).replace('”', '"').replace('“', '"')
      if line == '<Caller />':
        current_part.append('<div className="centered-part"><div className="centered-part-contents">')
        current_part.append('')
        center_mode = True
      elif center_mode == True:
        current_part.append('</div></div>')
        center_mode = False
    elif line.startswith('import'):
      line = '| ' + line
    elif line.startswith('Publié par <a href="//docs.google.com/"'):
      line = ''
    elif line.startswith('Published by <a href="//docs.google.com/"'):
      line = ''
    # if not in caller
    else:
      line = re.sub(u"\"([^\"]+)\"", u"«\u00A0\\1\u00A0»", line)
      line = re.sub(u"\“([^\”]+)\”", u"«\u00A0\\1\u00A0»", line)
    # todo : this is a dirty fix
    line = re.sub(r"http://toflit18.medialab.sciences-po.fr/\\#/", r"http://toflit18.medialab.sciences-po.fr/#/", line)
    line = re.sub(r"\(https://www\.google\.com/url\?q=([^)]*)&amp;sa=([^)]*)\)", r"(\1)", line)
    line = re.sub(r"\(https://www\.google\.com/url\?q=([^)]*)\)", r"(\1)", line)
    # convert all links to target blank
    line = re.sub(r"\[([^]]+)\]\(([^)]+)\)", r'<a href="\2" target="blank" rel="noopener noreferrer">\1</a>', line)

    current_part.append(line)
  if center_mode == True:
    current_part.append('</div></div>')
    center_mode = False
  parts.append(current_part)

  parts = parts[1:] if len(parts) > 1 else parts  
  for i, part in enumerate(parts):
    
    part_with_caller = ["import Caller from '../../components/Caller'", "\n"] + part
    parts[i] = '\n'.join(part_with_caller)
  return parts

# get parts
with requests.Session() as s:
  download = s.get(GDOC_HTML_URL)
  decoded_content = download.content.decode('utf-8')
  for i, part in enumerate(prepare_contents(decoded_content)):
    md_path = ''
    if i == 0:
      md_path = TARGET_BASE + 'introduction.mdx'
    elif i < 4:
      md_path = TARGET_BASE + 'partie-' + str(i) + '.mdx'
    elif i == 5:
      md_path = TARGET_BASE + 'a-propos.mdx'
    else:
      md_path = TARGET_BASE + 'references.mdx'
    f = open(md_path, "w")
    f.write(part)
    f.close()