/* ARK Command V8 — single-role alliance plan, buddy / reserve protocol */
(function(){
'use strict';
var specs=[
['Lefty','N','rally','A','MightyAce'],
['Crusheer','N','g1','A','Kitrina'],
['Lord Crusheer','N','g2','B','HoDag the Noob'],
['Swikat','N','recovery','B','Lord Crusheer'],
['Kitrina','N','filler','A','Crusheer'],
['HoDag the Noob','N','filler','B','Swikat'],
['MightyAce','N','filler','A','Lefty'],
['HooniDog','S','rally','A','Vince'],
['037LEO','S','g1','A','Carstefan I'],
['Uranium','S','g2','B','Beowulf13'],
['HS518','S','recovery','B','Uranium'],
['Vince','S','filler','A','HooniDog'],
['Carstefan I','S','filler','A','037LEO'],
['Beowulf13','S','filler','B','HS518']
];
var starter=specs.map(function(a,id){return {id:id,name:a[0],lane:a[1],role:a[2],ball:a[3],partner:specs.findIndex(function(b){return b[0]===a[4]}),jobs:a[2]==='filler'?['standby','standby','standby','field','field']:a[2]==='recovery'?['backup','standby','standby','field','field']:[a[2],'standby','standby','field','field']};});
ROLES.rally='Rally Lead';ROLES.g1='Inner Garrison';ROLES.g2='Outer Garrison';ROLES.recovery='Obelisk Backup';ROLES.filler='Filler / Field';
var phaseNotes={
opening:'Swikat takes NORTH opening obelisk support; HS518 SOUTH. Rally leads Lefty/HooniDog prepare their dedicated rally duties. Capture our obelisks before teleport.',
assemble:'Two field balls per lane. ONE primary role per account. Three dedicated filler accounts per side each hold three standby marches and two field marches. WAIT for buddy and commander call.',
capture:'Secure inner structures first and then outer positions. One rally lead, two structure garrisons, one obelisk backup on each lane. Seven accounts cannot fully fill all three structures simultaneously.',
hold:'Swikat and HS518 keep backup garrisons available at home obelisks, not permanently full. On an incoming rally, request four distinct reinforcement accounts; only three dedicated fillers exist on each side, so fourth requires release.',
advance:'No solo attack. Wait for assigned buddy and field ball; defend the inner structure before moving on an outer target.',
mid:'ARK minus five minutes: all available field marches regroup behind frontline at MID. HOLD until partner/group ready. NO MID ATTACK until countdown reaches 0:59 unless commander overrides.',
ready:'ARK minus two minutes: approach Temple safely in a complete coordinated ball. Wait for 0:59 command to engage.',
escort:'At 0:59 MID command, clear together. A suitable available cavalry march collects Ark. Others screen or defend; no permanent escort role.',
deliver:'Available South field marches protect Ark route to South Obelisk; North guards and screens enemies.',
return:'Recover at your lane obelisk city. Restore primary rally/garrison duties, check buddies again before movement.'
};
PHASES.forEach(function(p){if(phaseNotes[p.id])p.desc=phaseNotes[p.id]});
var primary=function(p){return p.role==='filler'?'standby':p.role==='recovery'?'backup':p.role};
autoAssign=function(){players.forEach(function(p){var j=primary(p);p.jobs=j==='standby'?['standby','standby','standby','field','field']:[j,'standby','standby','field','field'];});};
makeDefaults=function(){players=JSON.parse(JSON.stringify(starter));};
var oldCoords=getCoords;
getCoords=function(p,j,k){if(j==='standby'||j==='backup'){var h=home(p),ob=pos('ob'+p.lane),sp=pos('spawn');if(k==='spawn')return [sp,sp];if(k==='opening')return [sp,ob];if(k==='teleport')return [sp,h];return j==='backup'?[h,ob]:[h,h];}return oldCoords(p,j,k);};
var oldLabel=labelJob;
labelJob=function(j,p){return j==='standby'?'STANDBY: HOME / command only':j==='backup'?'OBELISK BACKUP: no permanent full fill':j==='g1'?'INNER GARRISON '+p.lane:j==='g2'?'OUTER GARRISON '+p.lane:oldLabel(j,p);};
var pal=function(p){return players.find(function(q){return q.id===p.partner})||null;};
if(typeof matchInfo==='function')matchInfo=function(p){var b=pal(p);return b?'Buddy '+b.name+' — HOLD until buddy and commander ready':'Buddy missing — HOLD';};
var oldData=data;
data=function(){var d=oldData();d.version=8;return d;};
valid=function(raw){if(!raw||!Array.isArray(raw.players)||raw.players.length<12||raw.players.length>18)throw Error('Needs 12-18 accounts');return {side:raw.side==='blue'?'blue':'red',players:raw.players.map(function(p,i){return {id:i,name:String(p.name||'Player '+(i+1)).slice(0,40),lane:p.lane==='S'?'S':'N',role:ROLES[p.role]?p.role:'filler',ball:p.ball==='B'?'B':'A',partner:Number.isInteger(p.partner)?p.partner:-1,jobs:Array.from({length:5},function(_,k){var j=p.jobs&&p.jobs[k];return ['rally','g1','g2','backup','standby','field'].includes(j)?j:'field';})};})};};
saveLocal=function(){if(window.ARK_READONLY)return;try{localStorage.setItem('ark_v8',JSON.stringify(data()))}catch(e){}};
var oldDetail=renderDetail;
renderDetail=function(){oldDetail();var p=players[selected],b=pal(p),el=document.getElementById('detail'),done=!!(b&&ready[p.id]&&ready[b.id]);
var st=el.querySelector('.stat'),fixed=p.jobs.filter(function(j){return ['rally','g1','g2','backup'].includes(j)}).length,wait=p.jobs.filter(function(j){return j==='standby'}).length;
if(st)st.innerHTML='<span class="good">'+fixed+' primary / backup</span> · <span class="field">2 field</span> · '+wait+' standby';
el.insertAdjacentHTML('beforeend','<div class="v8safety" style="border:1px solid '+(done?'#42a787':'#ac665e')+';border-radius:8px;padding:10px;background:'+(done?'#123c37':'#472833')+'"><b>'+(done?'READY CHECK PASSED':'DO NOT ENGAGE YET')+'</b><p>Buddy: <b>'+(b?esc(b.name):'UNASSIGNED')+'</b>. Meet at '+(p.lane==='N'?'NORTH':'SOUTH')+' Ball '+p.ball+'. Hold until buddy, entire field group, and commander call. Manual readiness only.</p></div>');
var box=document.getElementById('marchEditor'),opts=['field','standby','rally','g1','g2','backup'];
box.innerHTML=p.jobs.map(function(j,i){return '<div class="marchRow"><span class="num">'+(i+1)+'</span><select data-v8-job="'+i+'">'+opts.map(function(t){return '<option value="'+t+'" '+(t===j?'selected':'')+'>'+esc(labelJob(t,p))+'</option>'}).join('')+'</select></div>'}).join('');
box.querySelectorAll('[data-v8-job]').forEach(function(e){e.onchange=function(){var j=e.value,i=+e.dataset.v8Job;if(['rally','g1','g2','backup'].includes(j)&&j!==primary(p)){toast('One primary role per player.');renderDetail();return;}p.jobs[i]=j;saveLocal();refresh();};});
document.getElementById('orders').innerHTML='<div class="stat"><b>ONE PRIMARY ROLE</b><p>'+esc(ROLES[p.role])+' · Buddy '+(b?esc(b.name):'unassigned')+' · NO solo engagement. MID waits for 0:59 call.</p></div>'+p.jobs.map(function(j,i){return '<div class="stat"><b>March '+(i+1)+'</b>: '+esc(labelJob(j,p))+'<br><span class="mini">'+(j==='standby'?'Stay home until commander releases this march.':j==='backup'?'Cover obelisk as emergency backup; four distinct filler accounts are a target, not guaranteed.':j==='field'?'Two field marches join buddy ball and respond to MID call.':'Stay on this primary role, return home and refill when defeated.')+'</span></div>';}).join('');
};
renderCoverage=function(){var out='',warnings=[];['N','S'].forEach(function(l){var g=group(l);out+='<div class="stat"><b>'+(l==='N'?'NORTH':'SOUTH')+': '+g.length+'/7</b></div>';[['rally','Rally'],['g1','Inner'],['g2','Outer'],['recovery','Obelisk backup']].forEach(function(r){var q=g.filter(function(p){return p.role===r[0]});out+='<div class="stat">'+r[1]+': <b>'+q.map(function(x){return esc(x.name)}).join(', ')+'</b></div>';if(q.length!==1)warnings.push(l+' needs one '+r[1]);});out+='<div class="stat">'+g.filter(function(p){return p.role==='filler'}).length+' support accounts · 3 standby + 2 field marches each</div>';});document.getElementById('coverage').innerHTML=out;document.getElementById('warnings').innerHTML=(warnings.length?'<div class="error">'+warnings.join('<br>')+'</div>':'<div class="good">All eight main duty slots assigned.</div>')+'<div class="stat">Reserve note: four separate obelisk refills are CONDITIONAL. Three dedicated support players per side; free a fourth before it can fill.</div>';};
var oldRefresh=refresh;
refresh=function(){oldRefresh();var h=document.querySelector('header strong');if(h)h.textContent=viewer?'⚔ ARK COMMAND · V8 PLAYER':'⚔ ARK COMMAND · V8 EDITOR';var leg=document.querySelector('.leg');if(leg)leg.textContent='▲ Rally   ■ Inner/outer garrison   ● Two field marches / buddy   ⌂ City standby & obelisk backup';};
var v8local=null;try{if(!window.ARK_READONLY&&localStorage.getItem('ark_v8'))v8local=JSON.parse(localStorage.getItem('ark_v8'))}catch(e){}
try{apply(valid(window.ARK_V8_SHARED||v8local||{version:8,side:'red',players:starter}))}catch(e){apply(valid({side:'red',players:starter}))}
viewer=!!window.ARK_READONLY;mode='all';refresh();
var priorBulk=bulkHTML;bulkHTML=function(){priorBulk();document.querySelectorAll('[data-duty]').forEach(function(el){['standby','backup'].forEach(function(v){var op=document.createElement('option');op.value=v;op.textContent=v;el.append(op)});el.value=players[+el.dataset.i].jobs[+el.dataset.duty];});};
var savePNG=document.createElement('button');savePNG.textContent='↓ Player Map PNG';document.querySelector('header').appendChild(savePNG);
savePNG.onclick=function(){var p=players[selected],b=pal(p),map=document.getElementById('mapImage'),cv=document.createElement('canvas');cv.width=1400;cv.height=1350;var c=cv.getContext('2d');c.fillStyle='#0a1a2a';c.fillRect(0,0,1400,1350);function txt(s,x,y,size,col){c.font='bold '+size+'px sans-serif';c.fillStyle=col;c.fillText(s,x,y)}
txt('ARK COMMAND V8  ·  PERSONAL ORDERS',45,65,29,'#efc87d');txt(p.name,45,142,49,'#ffffff');txt((p.lane==='N'?'NORTH':'SOUTH')+'  ·  '+ROLES[p.role]+'  ·  BALL '+p.ball,45,190,27,'#88d8f0');
txt('BUDDY: '+(b?b.name:'UNASSIGNED')+' — WAIT FOR BUDDY + COMMANDER',45,248,26,'#ffe097');if(map.complete&&map.naturalWidth){c.save();c.translate(45,280);if(side==='blue'){c.translate(1300,0);c.rotate(Math.PI)}c.drawImage(map,0,0,1300,800);c.restore();}
p.jobs.forEach(function(j,i){var cr=getCoords(p,j,'capture')[1],shift=[[0,-30],[30,0],[0,30],[-30,0],[21,-21]][i],x=45+cr[0]*(1300/1080)+shift[0],y=280+cr[1]*(800/824)+shift[1];c.beginPath();c.arc(x,y,16,0,Math.PI*2);c.fillStyle=j==='field'?'#82ebad':j==='standby'?'#d0ab82':'#f7ca7d';c.fill();txt(String(i+1),x-8,y+7,22,'#0b1829');});
p.jobs.forEach(function(j,i){txt('M'+(i+1)+'  '+labelJob(j,p),45+(i%2)*680,1140+Math.floor(i/2)*47,21,'#eef6ff')});txt('MID −5:00  ·  REGROUP  ·  NO MID ENGAGEMENT BEFORE 0:59',45,1325,19,'#ffce82');
var a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download='ARK_V8_'+p.name.replace(/[^a-z0-9]+/gi,'_')+'_Map.png';a.click();};
var ex=document.getElementById('backup');if(ex)ex.textContent='↓ V8 JSON';
})();
