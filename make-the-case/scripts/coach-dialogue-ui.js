/* Approved 0.5 dialogue layout. Embedded by build_coach_ui.py; not an Apps Script project file. */
function renderAll(){
  S.view=S.view||'chat';if(S.panel)S.view='case';else if(S.view==='case')S.view='chat';
  renderChrome();renderRail();renderLog();renderPanel();renderProgress();renderNotice();
}
function renderChrome(){
  renderChromeLegacy();var i=idea();clear($('focus'));$('focus').appendChild(h('strong',null,'Make the Case'));
  $('panelBtn').textContent=S.panel?'Back to conversation':'My case';
  $('railBtn').textContent=S.view==='board'?'Back to conversation':'Ideas';
  $('newIdeaBtn').disabled=S.busy||!S.ws;
  ['railBtn','panelBtn','moreBtn'].forEach(function(id){$(id).disabled=S.busy||!S.ws});
  $('main').classList.toggle('view-board',S.view==='board');$('main').classList.toggle('view-case',S.view==='case');
  $('main').classList.toggle('view-chat',S.view==='chat');
  var nav=$('phaseNav');clear(nav);
  ['Collect','Develop','Advance'].forEach(function(name,k){nav.appendChild(h('button',{class:'stage',disabled:S.busy||!S.ws,'aria-current':S.phase===k?'step':null,onClick:function(){choosePhase(k)}},h('span',{class:'stage-num'},'0'+(k+1)),name))});
  nav.appendChild(h('button',{class:'text-link jump-link',disabled:S.busy||!S.ws,onClick:openTopics},'Jump to topic'));
  $('composerLabel').textContent=i?'Your reply · '+i.title:'Your reply';
  $('msg').placeholder='Tell me in your own words…';
  $('sendBtn').textContent=S.busy?'Working…':'Send ↑';
}
function choosePhase(k){
  if(!canLeaveEdits())return;S.phase=k;S.panel=false;S.view='chat';
  var keys=[['problem','currentWork','outcome'],['proposedWork','businessOwner','baselineSource','testPlan','quality','stopRule'],['request','contribution']][k],i=idea();
  var key=keys.find(function(x){return !i||!i.fields[x].trim()})||keys[0];
  chooseTopic(key,k);
}
function chooseTopic(key,k){
  if(!canLeaveEdits())return;
  if(S.topic&&S.topic.key)S.replyDrafts['topic:'+S.topic.key]=$('msg').value;else S.replyDrafts[S.ws.selectedId||'new']=$('msg').value;
  S.topic={key:key,label:FL[key],phase:k};S.phase=k;S.panel=false;S.view='chat';
  $('msg').value=S.replyDrafts['topic:'+key]||'';S.scrollNext=true;renderAll();$('msg').focus();autosize();
}
function openTopics(){
  if(!canLeaveEdits())return;
  var body=h('div',{class:'form'}),groups=[['Collect',['problem','currentWork','outcome']],['Develop',['proposedWork','businessOwner','baselineSource','testPlan','quality','stopRule']],['Advance',['request','contribution']]];
  groups.forEach(function(g,k){body.appendChild(h('h3',null,g[0]));g[1].forEach(function(key){body.appendChild(h('button',{class:'btn ghost',onClick:function(){closeDialog();chooseTopic(key,k)}},FL[key]))})});
  openDialog('Choose what to work on',body);
}
function renderLog(){
  var log=$('log'),composer=document.querySelector('.composer');composer.remove();clear(log);
  var t=h('div',{class:'thread'});log.appendChild(t);
  if(S.bootError){t.appendChild(h('p',{class:'err'},S.bootError));t.appendChild(h('button',{class:'btn',onClick:boot},'Reopen workspace'))}
  else if(!S.ws)t.appendChild(h('p',null,'Opening your workspace…'));
  else {
    var i=idea(),messages=i?i.messages:[],lastAssistant=-1;
    for(var x=messages.length-1;x>=0;x--)if(messages[x].role==='assistant'){lastAssistant=x;break}
    var history=messages.slice();
    if(!S.pending&&!S.topic&&lastAssistant>=0)history=messages.slice(0,lastAssistant);
    if(history.length){var earlier=h('details',{class:'earlier'},h('summary',null,'Earlier conversation · '+history.length+' messages'));history.forEach(function(m){earlier.appendChild(message(m))});t.appendChild(earlier)}
    var active=h('section',{id:'currentDialogue',class:'active-dialogue'});t.appendChild(active);
    if(i)active.appendChild(h('div',{class:'working-idea'},'Working on: ',h('strong',null,i.title)));
    if(S.pending&&(!i||S.pending.ideaId===i.id))active.appendChild(pendingCard());
    else if(S.topic){active.appendChild(h('div',{class:'speaker'},['Collect','Develop','Advance'][S.topic.phase]+' · '+S.topic.label));active.appendChild(h('h1',{class:'question'},'What would you like to add or change about '+S.topic.label.toLowerCase()+'?'));active.appendChild(h('p',{class:'fine'},'Your next reply will ask the coach to focus on this topic. No request is sent until you choose Send.'));}
    else if(lastAssistant>=0){active.appendChild(h('div',{class:'speaker'},LIVE?'Make the Case coach':'Coach · scripted demonstration'));active.appendChild(h('div',{class:'coach-reply'},messages[lastAssistant].text));}
    else if(i&&Object.keys(i.fields).some(function(k){return !PROTECTED.includes(k)&&i.fields[k].trim()})){active.appendChild(h('div',{class:'speaker'},'Continue your idea'));active.appendChild(h('h1',{class:'question'},nextStep(i).question));}
    else active.appendChild(opener(i));
    var reviewing=i&&i.draft&&!S.topic&&!S.reviewLater?.[i.id]&&!(S.pending&&S.pending.ideaId===i.id);
    if(reviewing)active.appendChild(draftCard(i));
    composer.hidden=!!(reviewing||(S.pending&&S.pending.state==='sending'));
  }
  t.appendChild(composer);
  if(!$('sendReview').hidden)composer.hidden=true;
  if(S.scrollNext){S.scrollNext=false;requestAnimationFrame(function(){var a=$('currentDialogue');if(a)a.scrollIntoView({block:'start'});else $('main').scrollTop=0})}
}
function draftCard(i){
  var d=i.draft,rows=Object.keys(d.fields).map(function(k){return {group:'fields',key:k,value:d.fields[k]}}).concat(Object.keys(d.metrics).map(function(k){return {group:'metrics',key:k,value:d.metrics[k]}}));
  if(!rows.length)return h('span');
  var r=rows[0],numeric=r.group==='metrics',label=numeric?ML[r.key][0]+' ('+ML[r.key][1]+')':FL[r.key],value=r.value===null?'':String(r.value);
  if(!S.draftEdit||S.draftEdit.ideaId!==i.id||S.draftEdit.key!==r.key)S.draftEdit={ideaId:i.id,group:r.group,key:r.key,value:value,original:value};
  var E=S.draftEdit,id='suggestion-'+r.key,ctl=h(numeric?'input':'textarea',{class:'inp',id:id,type:numeric?'number':null,min:numeric?'0':null,step:numeric?'any':null,rows:numeric?null:'3',maxlength:numeric?null:'2400',value:E.value,onInput:function(e){E.value=e.target.value}});
  var card=h('section',{class:'review','aria-label':'Review the next suggested note'},h('p',{class:'fine'},rows.length+' proposed '+(rows.length===1?'note':'notes')+' to review. Save one at a time; other notes stay available.'),
    d.reason?h('p',{class:'fine'},d.reason):null,
    h('form',{class:'form',onSubmit:function(e){e.preventDefault();var v=numeric?(String(E.value).trim()===''?null:Number(E.value)):E.value;reviewOne(i,r.group,r.key,v,false)}},h('label',{for:id},label),ctl,
      r.key==='openQuestions'?h('p',{class:'fine'},'Unresolved questions stay open. Recording them does not answer or verify them.'):null,
      h('details',null,h('summary',null,'See the current saved value'),h('p',{class:'fine'},i[r.group][r.key]===null||i[r.group][r.key]===''?'Not added yet':String(i[r.group][r.key]))),
      h('div',{class:'actions'},h('button',{class:'btn primary',type:'submit',disabled:S.busy},LIVE?'Save & continue':'Save & continue (demo)'),
        h('button',{class:'btn ghost',type:'button',disabled:S.busy,onClick:function(){if(canLeaveEdits())reviewOne(i,r.group,r.key,null,true)}},'Skip this note'),
        h('button',{class:'btn ghost',type:'button',onClick:function(){if(!canLeaveEdits())return;S.reviewLater=S.reviewLater||{};S.reviewLater[i.id]=true;renderAll();$('msg').focus()}},'Keep talking'))),
    h('p',{class:'fine'},'These are working notes, not verified results or permission to implement. A new AI reply replaces the previous unaccepted draft.'));
  return card;
}
function renderProgress(){
  var panel=$('progressPanel');clear(panel);var i=idea();if(!i||S.view!=='chat')return;
  var groups=[['Collect',['problem','currentWork','outcome']],['Develop',['proposedWork','businessOwner','baselineSource','testPlan','quality','stopRule']],['Advance',['request','contribution']]],all=groups.flatMap(function(g){return g[1]}),saved=all.filter(function(k){return i.fields[k].trim()});
  panel.appendChild(h('h2',null,'Your case so far'));panel.appendChild(h('p',{class:'fine'},saved.length+' of '+all.length+' topics saved'));panel.appendChild(h('progress',{value:saved.length,max:all.length,'aria-label':'Topics with saved notes'}));
  groups.forEach(function(g){var n=g[1].filter(function(k){return i.fields[k].trim()}).length;panel.appendChild(h('div',{class:'stage-count'},h('span',null,g[0]),h('span',null,n+' / '+g[1].length)))});
  saved.slice(-2).forEach(function(k){panel.appendChild(h('section',{class:'saved-note'},h('h3',null,FL[k]),h('p',null,i.fields[k])))});
  panel.appendChild(h('button',{class:'text-link',onClick:function(){if(!canLeaveEdits())return;S.panel=true;S.tab='case';renderAll()}},'View full case →'));
  if(i.draft&&S.reviewLater?.[i.id])panel.appendChild(h('button',{class:'text-link',onClick:function(){if(!canLeaveEdits())return;delete S.reviewLater[i.id];S.topic=null;renderAll()}},'Review pending notes'));
}
var BOARD_LANES=[['collect','Collect'],['develop','Develop'],['advance','Advance'],['decisions','Decisions']];
var BOARD_OUTCOMES=[['awaiting','Awaiting decision'],['approved','Approved'],['backlogged','Backlogged'],['not-pursuing','Not pursuing']];
function boardOf(i){return i.board||{lane:{Exploring:'collect',Developing:'develop','Needs review':'advance',Testing:'advance',Parked:'decisions'}[i.fields.status]||'collect',outcome:i.fields.status==='Parked'?'backlogged':'',reviewer:'',reference:'',note:''}}
function renderRail(){
  var rail=$('rail');clear(rail);if(!S.ws)return;
  rail.appendChild(h('div',{class:'board-heading'},h('div',null,h('h1',null,'Your ideas'),h('p',{class:'fine'},'Collect, develop, and take your ideas forward.')),h('button',{class:'btn primary',onClick:openNewIdea,disabled:S.busy},'＋ New idea')));
  var board=h('div',{class:'kanban-board'});rail.appendChild(board);
  BOARD_LANES.forEach(function(pair){var items=S.ws.ideas.filter(function(i){return boardOf(i).lane===pair[0]}),lane=h('section',{class:'kanban-column','aria-label':pair[1]+' ideas',onDragover:function(e){e.preventDefault()},onDrop:function(e){e.preventDefault();var i=S.ws.ideas.find(function(i){return i.id===e.dataTransfer.getData('text/plain')});if(i)moveBoard(i,pair[0])}});
    lane.appendChild(h('h2',null,pair[1],h('span',{class:'column-count'},String(items.length))));
    items.forEach(function(i){var b=boardOf(i),select=h('select',{'aria-label':'Move '+i.title,disabled:S.busy,onChange:function(e){if(e.target.value.startsWith('outcome:'))recordOutcome(i,e.target.value.slice(8));else moveBoard(i,e.target.value)}},BOARD_LANES.map(function(p){return h('option',{value:p[0],selected:b.lane===p[0]},p[1])}),h('optgroup',{label:'Record outcome'},BOARD_OUTCOMES.slice(1).map(function(p){return h('option',{value:'outcome:'+p[0]},p[1])})));
      var card=h('article',{class:'kanban-card',draggable:!S.busy,onDragstart:function(e){e.dataTransfer.setData('text/plain',i.id)}},b.outcome?h('span',{class:'decision-tag'},(BOARD_OUTCOMES.find(function(p){return p[0]===b.outcome})||[])[1]):null,
        h('button',{class:'board-title',disabled:S.busy,onClick:function(){selectIdea(i.id)}},i.title),h('p',{class:'card-snippet'},i.fields.problem||'An idea to explore.'),h('p',{class:'fine'},Object.keys(i.fields).filter(function(k){return !PROTECTED.includes(k)&&i.fields[k].trim()}).length+' saved notes'),select);
      if(b.lane==='decisions')card.appendChild(h('button',{class:'text-link',disabled:S.busy,onClick:function(){recordOutcome(i,b.outcome||'awaiting')}},'Record outcome'));
      lane.appendChild(card);
    });
    if(!items.length)lane.appendChild(h('p',{class:'fine'},pair[0]==='decisions'?'Awaiting decision, approved, backlogged, or not pursuing.':'Move an idea here when you’re ready.'));
    board.appendChild(lane);
  });
  rail.appendChild(h('p',{class:'fine'},'Use Move to or drag a card. A recorded board outcome does not grant tool, data, or live-test permission.'));
}
function moveBoard(i,lane){
  if(boardOf(i).lane===lane||!canLeaveEdits()||S.busy)return;
  mutate('setBoard',{ideaId:i.id,revision:i.revision,lane:lane,outcome:lane==='decisions'?'awaiting':''},'Idea board saved');
}
function recordOutcome(i,outcome){
  if(!canLeaveEdits())return;
  var b=boardOf(i),selection=h('select',{class:'inp',id:'boardOutcome'},BOARD_OUTCOMES.map(function(o){return h('option',{value:o[0],selected:o[0]===outcome},o[1])})),reviewer=h('input',{class:'inp',id:'boardReviewer',value:b.reviewer}),ref=h('input',{class:'inp',id:'boardRef',value:b.reference}),note=h('textarea',{class:'inp',id:'boardNote',rows:'2',value:b.note}),error=h('p',{class:'err'});
  openDialog('Record an outcome',h('div',{class:'form'},h('p',null,i.title+' — record a decision already made. The tool does not approve implementation.'),h('label',{for:'boardOutcome'},'Outcome'),selection,h('label',{for:'boardReviewer'},'Who approved or reviewed it? Required for Approved.'),reviewer,h('label',{for:'boardRef'},'Decision reference. Required for Approved.'),ref,h('label',{for:'boardNote'},'Reason or next review date (optional)'),note,error),[h('button',{class:'btn ghost',onClick:closeDialog},'Cancel'),h('button',{class:'btn primary',onClick:function(){if(selection.value==='approved'&&(!reviewer.value.trim()||!ref.value.trim())){error.textContent='Add the reviewer and decision reference before recording Approved.';return}mutate('setBoard',{ideaId:i.id,revision:i.revision,lane:'decisions',outcome:selection.value,reviewer:reviewer.value,reference:ref.value,note:note.value},'Outcome recorded').then(function(ok){if(ok)closeDialog();else error.textContent=S.notice?.text||'Not saved.'})}},'Save outcome')]);
}
function selectIdea(id){
  if(!canLeaveEdits()||S.busy)return;
  S.replyDrafts[S.ws.selectedId||'new']=$('msg').value;$('msg').value=S.replyDrafts[id]||'';S.view='chat';S.panel=false;S.topic=null;S.scrollNext=true;
  if(id===S.ws.selectedId){renderAll();return}mutate('selectIdea',{ideaId:id},'Idea loaded');
}
function autosize(){var b=$('msg');b.style.height='auto';b.style.height=Math.min(140,Math.max(44,b.scrollHeight))+'px'}
