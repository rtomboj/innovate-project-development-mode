"""Embed the approved dialogue layout while retaining the live gateway and provider settings."""
from pathlib import Path
import re

root=Path(__file__).resolve().parents[1]
path=root/'apps-script/Coach.html'
html=path.read_text(encoding='utf-8')
html=re.sub(r'/\* APPROVED_DIALOGUE_START \*/[\s\S]*?/\* APPROVED_DIALOGUE_END \*/\n?', '', html)
html=re.sub(r'/\* APPROVED_STYLE_START \*/[\s\S]*?/\* APPROVED_STYLE_END \*/\n?', '', html)
html=re.sub(r'^      case \'setBoard\':i=find\(p.ideaId\);.*\n', '', html, flags=re.M)
html=re.sub(r'^  if\(!fromRetry&&S.topic&&text\)\{text=.*\n', '', html, flags=re.M)
html=re.sub(r'^      if\(S.reviewLater\)delete S.reviewLater\[ideaId\];S.topic=null;\n', '', html, flags=re.M)
html=html.replace('function renderChrome(){','function renderChromeLegacy(){',1)
html=html.replace("panel:window.innerWidth>1000,tab:'case'", "panel:false,view:'chat',phase:0,reviewLater:{},tab:'case'")
html=html.replace("var box=$('msg'),text=fromRetry?S.pending.message:box.value.trim();", "var box=$('msg'),text=fromRetry?S.pending.message:box.value.trim();\n  if(!fromRetry&&S.topic&&text){text='Focus: '+S.topic.label+'\\n'+text;box.value=text;S.topic=null;}")
html=html.replace("delete S.setAside[ideaId];", "delete S.setAside[ideaId];\n      if(S.reviewLater)delete S.reviewLater[ideaId];S.topic=null;")
html=html.replace("if(ok){S.replyDrafts[oldId]=unsent;", "if(ok){S.view='chat';S.panel=false;S.topic=null;S.replyDrafts[oldId]=unsent;")
html=html.replace("$('panelBtn').addEventListener('click',function(){S.panel=!S.panel;renderAll()});", "$('panelBtn').addEventListener('click',function(){if(!canLeaveEdits())return;S.panel=!S.panel;renderAll()});")
html=html.replace("$('railBtn').addEventListener('click',function(){S.railOpen=!S.railOpen;renderRail();if(S.railOpen){var f=document.querySelector('#rail .idea,#rail .btn');f&&f.focus()}});", "$('railBtn').addEventListener('click',function(){if(!canLeaveEdits())return;S.panel=false;S.view=S.view==='board'?'chat':'board';renderAll()});\n$('newIdeaBtn').addEventListener('click',openNewIdea);")
html=html.replace("version:'0.4.0'", "version:'0.5.0'")
# Demo board actions use the same view shape; credentials and live requests remain disabled.
html=html.replace("      case 'saveSettings':if(p.apiKey)", "      case 'setBoard':i=find(p.ideaId);rev(i,p.revision);var moved=patch(i,{},false);moved.board={lane:p.lane,outcome:p.lane==='decisions'?(p.outcome||'awaiting'):'',reviewer:p.reviewer||'',reference:p.reference||'',note:p.note||''};if(moved.board.outcome==='approved'&&(!moved.board.reviewer.trim()||!moved.board.reference.trim()))throw new Error('Recording Approved needs a reviewer and decision reference.');if(st.drafts[i.id])st.drafts[i.id].baseRevision=moved.revision;put(moved);return boot();\n      case 'saveSettings':if(p.apiKey)")
preview=(root/'web-preview/Coach.html').read_text(encoding='utf-8')
approved_css=re.search(r'<style>([\s\S]*?)</style>',preview)[1]
compat=(root/'scripts/coach-dialogue-ui.css').read_text(encoding='utf-8')
html=html.replace('</style>', '\n/* APPROVED_STYLE_START */\n'+approved_css+'\n'+compat+'\n/* APPROVED_STYLE_END */\n</style>',1)
body='''<body>
<div class="app">
 <header class="top">
  <div class="brand"><span class="wordmark">TOMBOJ</span><span class="series">Automation Thursday</span></div>
  <div class="focus" id="focus">Make the Case</div>
  <div class="tools"><button class="btn primary sm" id="newIdeaBtn">＋ New idea</button><button class="btn ghost sm" id="railBtn" aria-controls="rail">Ideas</button><button class="btn sm" id="panelBtn" aria-controls="panel">My case</button><button class="btn ghost sm" id="moreBtn">More</button><button id="ctxBtn">Context</button><button id="setBtn">Settings</button><button id="expBtn">Export</button></div>
 </header>
 <div class="progress"><nav class="stages" id="phaseNav" aria-label="Conversation topics"></nav><span id="saveChip" role="status"></span><div id="notice"></div></div>
 <div id="demoBanner" hidden></div>
 <main class="main view-chat" id="main">
  <section class="center" aria-label="Conversation"><div id="sendReview" class="send-review" hidden></div><div id="log" tabindex="-1" aria-live="polite"></div>
   <div class="composer"><div class="composer-in"><div class="box"><label for="msg" id="composerLabel" class="composer-label">Your reply</label><textarea id="msg" rows="1" maxlength="4200" placeholder="Tell me in your own words…"></textarea><div class="box-foot"><div class="quick"><button class="btn ghost sm" data-q="dontknow">I don’t know yet</button><button class="btn ghost sm" data-q="example">Help me frame it</button></div><span id="count" class="count"></span><button class="btn primary" id="sendBtn">Send ↑</button></div></div><div class="disclose"><span id="discloseTx">Enter sends · Shift+Enter adds a line</span><span id="usageTx" class="mono"></span><button id="whatSent" class="linkbtn">What gets sent?</button></div></div></div>
  </section>
  <aside id="progressPanel" class="case-progress" aria-label="Your case progress"></aside>
  <section id="rail" class="rail" aria-label="Your ideas"></section>
  <section id="panel" class="panel" aria-label="Your full case"></section>
 </main>
</div>
<div id="announce" class="sr" aria-live="polite"></div><dialog id="dlg" aria-labelledby="dlgTitle"></dialog>
'''
html=re.sub(r'<body>[\s\S]*?<script>',body+'\n<script>',html,count=1)
ui=(root/'scripts/coach-dialogue-ui.js').read_text(encoding='utf-8')
html=html.replace('\nrenderAll();\nboot();', '\n/* APPROVED_DIALOGUE_START */\n'+ui+'\n/* APPROVED_DIALOGUE_END */\nrenderAll();\nboot();')
path.write_text(html,encoding='utf-8')
print('Built live Coach.html with approved dialogue, progress panel, Kanban and top New idea.')
