const $=s=>document.querySelector(s), ls=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}, sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const hm=t=>new Date(t).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
const esc=s=>(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TYPES={all:'Tutti',free:'In chiaro',pay:'A pagamento'}, LBL={free:'chiaro',pay:'pay',other:'altro'};
const LINKS=[['LBA TV','https://www.legabasket.it'],['Netflix','https://www.netflix.com/it/'],['Prime Video','https://www.primevideo.com'],['Sky Go','https://skygo.sky.it'],['NOW','https://www.nowtv.it'],['DAZN','https://www.dazn.com/it-IT'],['RaiPlay','https://www.raiplay.it'],['Mediaset Infinity','https://www.mediasetinfinity.mediaset.it'],['Disney+','https://www.disneyplus.com'],['Paramount+','https://www.paramountplus.com/it/']];
const VER='v15';
const PPM=2.4, NMW=84;
let S={tab:'now',type:'all',day:0,tday:0,slot:'all',ch:'all',gen:'all',tfav:false,sort:'time',tch:'all',tsort:'num',osort:'chan',legend:false,hl:ls('hl',[]),chs:[],byId:{},progs:[],updated:null,gopts:'',sel:ls('sel',null),favs:ls('favs',[]),rem:ls('rem',[])};
const ALIAS={'Calcio':'Sport/Calcio','Telegiornale':'Informazione/Notiziario','Talk Show':'Intrattenimento/Talk Show','Magazine':'Mondo e Tendenze/Magazine','Drammatico':'Film/Drammatico','Serie TV':'Intrattenimento/Fiction','Altro/Altro':'Altro','Altri Programmi/Altri Canali':'Altro','Altri Programmi':'Altro'};
function genreOf(p){if(p._g!==undefined)return p._g;let g=(p.g||'').trim();g=ALIAS[g]||g;
  if(!g){const c=S.byId[p.c]?.name||'';if(/sport|eurosport|dazn/i.test(c))g='Sport';else if(/^(tg|tgr|rai news|sky tg24|telegiornale)/i.test(p.t)||/tg24|news/i.test(c))g='Informazione'}
  return p._g=g||'Altro'}
const GC={'Sport/Basket':[24,95,52],'Sport/Tennis':[78,75,45],'Sport/Calcio':[140,65,40],'Sport/Motori':[350,75,50],'Sport/Golf':[165,60,38],'Sport/Rugby':[30,50,38],'Sport/Volley':[48,90,50],'Sport':[185,70,40],
'Film/Azione':[0,85,52],'Film/Guerra':[90,35,36],'Film/Thriller':[265,60,62],'Film/Horror':[300,65,40],'Film/Commedia':[52,95,52],'Film/Drammatico':[215,70,58],'Film/Fantascienza':[195,85,48],'Film/Romantico':[330,65,65],'Film/Animazione':[20,80,65],'Film/Avventura':[35,85,45],'Film/Fantastico':[250,60,66],'Film/Poliziesco':[235,40,50],'Film/Western':[18,55,42],'Film/Biografico':[205,35,50],'Film/Musicale':[280,55,60],'Film':[220,25,55],
'Informazione':[210,15,50],'Intrattenimento':[330,35,55],'Mondo e Tendenze':[160,30,42],'Ragazzi e Musica':[275,45,60]};
const LEG=[['Sport/Basket','Basket'],['Sport/Tennis','Tennis'],['Sport/Calcio','Calcio'],['Sport/Motori','Motori'],['Sport/Golf','Golf'],['Sport/Rugby','Rugby'],['Sport/Volley','Volley'],['Film/Azione','Azione'],['Film/Guerra','Guerra'],['Film/Thriller','Thriller'],['Film/Horror','Horror'],['Film/Commedia','Commedia'],['Film/Drammatico','Drammatico'],['Film/Fantascienza','Fantascienza'],['Film/Romantico','Romantico'],['Film/Animazione','Animazione'],['Film/Avventura','Avventura'],['Informazione','Informazione'],['Intrattenimento','Intratt.']];
const cn=c=>c&&c.n!=null?`<span class="cn">${c.n}</span>`:'';
const chCmp=(a,b)=>(a.n??9999)-(b.n??9999)||a.name.localeCompare(b.name);
const qm=(p,q)=>(p.t+' '+p.d).toLowerCase().includes(q)||String(S.byId[p.c]?.n)===q;
const gcOf=g=>GC[g]||GC[g.split('/')[0]]||null;
const gvars=g=>{const c=gcOf(g);return c?`--gc:hsl(${c[0]},${c[1]}%,${c[2]}%);--gt:hsla(${c[0]},${c[1]}%,${c[2]}%,.17)`:''};
const gst=g=>gcOf(g)?` style="${gvars(g)}"`:'';
const gbadge=g=>g==='Altro'?'':`<span class="gb">${esc(g.replace('/',' › '))}</span>`;
const legend=()=>S.legend?`<div class="chips" style="flex-wrap:wrap">${LEG.map(([g,l])=>`<span class="lg${S.gen===g?' on':''}" data-lg="${g}"${gst(g)}>${l}</span>`).join('')}<span class="mu" style="font-size:11px;align-self:center">tocca per filtrare</span></div>`:'';
const sorter=()=>{const m=S.sort;return m==='chan'?(a,b)=>chCmp(S.byId[a.c],S.byId[b.c])||a.s-b.s:m==='title'?(a,b)=>a.t.localeCompare(b.t,'it')||a.s-b.s:m==='genre'?(a,b)=>{const x=genreOf(a),y=genreOf(b);return (x==='Altro')-(y==='Altro')||x.localeCompare(y,'it')||a.s-b.s}:(a,b)=>a.s-b.s||chCmp(S.byId[a.c]||{name:''},S.byId[b.c]||{name:''})};
const sortSel=()=>`<div class="row" style="margin:0 0 8px"><select id="ssel" style="flex:1;min-width:0">${[['time','Ordina: data e ora'],['chan','Ordina: numero canale'],['title','Ordina: programma A→Z'],['genre','Ordina: genere']].map(([k,l])=>`<option value="${k}"${S.sort===k?' selected':''}>${l}</option>`).join('')}</select><button data-leg="1" class="${S.legend?'on':''}">🎨 Colori</button></div>${legend()}`;
const genOk=p=>{if(S.gen==='all')return true;const g=genreOf(p);return g===S.gen||g.startsWith(S.gen+'/')};
function buildGenres(){const m={};S.progs.forEach(p=>{const g=genreOf(p),[a,b]=g.split('/');(m[a]??={n:0,s:{}}).n++;if(b)m[a].s[b]=(m[a].s[b]||0)+1});
  const mains=Object.entries(m).filter(([a,v])=>v.n>=15).sort((x,y)=>(x[0]==='Altro')-(y[0]==='Altro')||y[1].n-x[1].n);
  S.gopts=mains.map(([a,v])=>`<option value="${esc(a)}">${esc(a)}</option>`+Object.entries(v.s).filter(x=>x[1]>=8).sort((x,y)=>y[1]-x[1]).map(([b])=>`<option value="${esc(a+'/'+b)}">&nbsp;&nbsp;› ${esc(b)}</option>`).join('')).join('')}
const genSel=()=>{let o=S.gopts;if(S.gen!=='all'){o=o.includes(`value="${esc(S.gen)}"`)?o.replace(`value="${esc(S.gen)}"`,`value="${esc(S.gen)}" selected`):o+`<option value="${esc(S.gen)}" selected>${esc(S.gen.replace('/',' › '))}</option>`}return `<select id="gsel" style="flex:1;min-width:0"><option value="all">Tutti i generi</option>${o}</select>`};
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function decrypt(e,pw){const k0=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']),k=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64(e.s),iterations:e.it,hash:'SHA-256'},k0,{name:'AES-GCM',length:256},false,['decrypt']);return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(e.iv)},k,b64(e.d))))}
const askPw=msg=>new Promise(res=>{const d=$('#dlg');d.innerHTML=`<h3 style="margin-top:0">Accesso</h3><p class="mu">${msg}</p><div class="row"><input id="pw" type="password" placeholder="Password" autocomplete="current-password"><button id="pwb">Entra</button></div>`;d.oncancel=e=>e.preventDefault();const go=()=>{const v=$('#pw').value;if(v){d.oncancel=null;d.close();res(v)}};$('#pwb').onclick=go;$('#pw').onkeydown=e=>{if(e.key==='Enter')go()};d.showModal()});
async function loadData(){let r=await fetch('data/epg.enc',{cache:'no-cache'});if(!r.ok){r=await fetch('data/epg.json',{cache:'no-cache'});return r.json()}
  const e=await r.json();let msg='Inserisci la password per vedere la guida.';
  for(;;){let pw=ls('pw',null);if(!pw)pw=await askPw(msg);try{const d=await decrypt(e,pw);sv('pw',pw);return d}catch{try{localStorage.removeItem('pw')}catch{}msg='Password errata, riprova.'}}}
async function init(){
  if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
  try{const d=await loadData();S.updated=d.updated;S.chs=d.channels;
    S.progs=d.programmes.map(p=>({c:p[0],s:p[1],e:p[2],t:p[3],d:p[4],g:p[5]}))}catch{}
  S.chs.forEach(c=>S.byId[c.id]=c);if(!S.sel)S.sel=[];{const seen=ls('seen',[]),ns=S.chs.map(c=>c.id).filter(i=>!seen.includes(i));if(ns.length){S.sel=[...S.sel,...ns.filter(i=>!S.sel.includes(i))];sv('sel',S.sel);sv('seen',S.chs.map(c=>c.id))}}
  buildGenres();nav();types();$('#q').oninput=render;$('#cfg').onclick=settings;schedule();render()}
function nav(){$('#nav').innerHTML=[['now','📺','Ora'],['guide','🗓️','Guida'],['tl','📊','Timeline'],['stream','🎬','Streaming'],['fav','⭐','Preferiti']].map(([k,i,l])=>`<button data-k="${k}" class="${S.tab===k?'on':''}">${i}<br><small>${l}</small></button>`).join('');
  $('#nav').onclick=e=>{const k=e.target.closest('button')?.dataset.k;if(k){S.tab=k;nav();render()}}}
function types(){$('#types').innerHTML=Object.entries(TYPES).map(([k,l])=>`<button data-t="${k}" class="${S.type===k?'on':''}">${l}</button>`).join('');
  $('#types').onclick=e=>{const k=e.target.dataset.t;if(k){S.type=k;types();render()}}}
const chOk=id=>{const c=S.byId[id];return c&&S.sel.includes(id)&&(S.type==='all'||c.type===S.type)};
const isFav=t=>S.favs.includes(t.toLowerCase()), hasRem=p=>S.rem.some(r=>r.c===p.c&&r.s===p.s), favP=p=>S.favs.some(f=>p.t.toLowerCase().includes(f));
const dl=t=>new Date(t).toLocaleDateString('it-IT',{weekday:'short',day:'numeric'});
const ban=()=>!S.progs.length?'<div class="ban">Nessun dato disponibile: il job notturno non ha ancora scaricato i palinsesti.</div>':(Date.now()-S.updated>36e5*30?'<div class="ban">⚠️ Dati non aggiornati dal '+new Date(S.updated).toLocaleString('it-IT')+': la fonte potrebbe non rispondere.</div>':'');
const dayChips=(cur,key,extra='')=>{const d0=new Date();d0.setHours(0,0,0,0);return `<div class="chips">${[...Array(7)].map((_,i)=>{const d=new Date(d0.getTime()+i*864e5);return `<button data-${key}="${i}" class="${cur===i?'on':''}">${i?d.toLocaleDateString('it-IT',{weekday:'short',day:'numeric'}):'Oggi'}</button>`}).join('')}${extra}</div>`};
const dayStart=i=>{const d=new Date();d.setHours(0,0,0,0);return d.getTime()+i*864e5};
function row(p,dd){const c=S.byId[p.c]||{name:p.c,type:'other'},g=genreOf(p);
  return `<div class="it${gcOf(g)?' gc':''}"${gst(g)}><div class="row"><span class="tm"${dd?' style="min-width:70px"':''}>${dd?dl(p.s)+'<br>':''}${hm(p.s)}</span><div style="flex:1;min-width:0"><h4>${esc(p.t)}</h4><div class="mu"><span class="b ${c.type}">${LBL[c.type]}</span>${cn(c)}${esc(c.name)} · ${gbadge(g)}${hm(p.s)}–${hm(p.e)}</div></div><button class="ico" data-fav="${esc(p.t)}">${isFav(p.t)?'⭐':'☆'}</button><button class="ico" data-rem="${p.c}|${p.s}">${hasRem(p)?'🔔':'🔕'}</button></div>${p.d?`<div class="mu" style="margin-top:4px">${esc(p.d)}</div>`:''}</div>`}
function timeline(q){const a=dayStart(S.tday),b=a+864e5,now=Date.now();
  let ps=S.progs.filter(p=>chOk(p.c)&&p.e>a&&p.s<b&&genOk(p));if(q)ps=ps.filter(p=>qm(p,q));if(S.tch!=='all')ps=ps.filter(p=>p.c===S.tch);if(S.tfav)ps=ps.filter(favP);
  const by={};ps.forEach(p=>(by[p.c]??=[]).push(p));const ids=Object.keys(by).sort((x,y)=>S.tsort==='name'?S.byId[x].name.localeCompare(S.byId[y].name):chCmp(S.byId[x],S.byId[y]));
  const topts=S.sel.map(i=>S.byId[i]).filter(c=>c).sort(chCmp);if(S.tch!=='all'&&!topts.some(c=>c.id===S.tch))S.tch='all';
  let h=dayChips(S.tday,'tday')+`<div class="chips"><button data-tfav="0" class="${S.tfav?'':'on'}">Tutti i programmi</button><button data-tfav="1" class="${S.tfav?'on':''}">⭐ Solo preferiti</button></div><div class="row" style="margin:6px 0 8px">${genSel()}<button data-leg="1" class="${S.legend?'on':''}">🎨 Colori</button></div><div class="row" style="margin:0 0 8px"><select id="tchsel" style="flex:1;min-width:0"><option value="all">Tutti i canali</option>${topts.map(c=>`<option value="${c.id}" ${S.tch===c.id?'selected':''}>${c.n!=null?c.n+' · ':''}${esc(c.name)}</option>`).join('')}</select><select id="tsortsel" style="flex:1;min-width:0"><option value="num" ${S.tsort==='num'?'selected':''}>Ordina: numero canale</option><option value="name" ${S.tsort==='name'?'selected':''}>Ordina: nome canale</option></select></div>${legend()}`;
  if(!ids.length)return h+`<p class="mu">${S.tfav?'Nessun preferito in programma in questo giorno. Tocca ☆ su un programma per aggiungerlo.':'Nessun programma.'}</p>`;
  const W=24*60*PPM;
  h+=`<div class="tl" id="tl"><div class="tli" style="width:${NMW+W}px"><div class="tlh"><div class="nm"></div>${[...Array(24)].map((_,i)=>`<span class="hr" style="width:${60*PPM}px">${String(i).padStart(2,'0')}:00</span>`).join('')}</div>`
  +ids.map(id=>`<div class="tlr${S.hl.includes(id)?' hl':''}" data-ch="${id}"><div class="nm" data-hl="${id}">${cn(S.byId[id])}${esc(S.byId[id].name)}</div><div class="tlt" style="width:${W}px">${by[id].map(p=>{const s=Math.max(p.s,a),e=Math.min(p.e,b),l=(s-a)/6e4*PPM,w=Math.max((e-s)/6e4*PPM-2,12);return `<div class="blk${favP(p)?' fv':''}${gcOf(genreOf(p))?' gc':''}" data-blk="${p.c}|${p.s}" style="left:${l}px;width:${w}px;${gvars(genreOf(p))}"><b>${esc(p.t)}</b><small>${hm(p.s)}–${hm(p.e)}</small></div>`}).join('')}</div></div>`).join('')
  +(now>=a&&now<b?`<div class="now" style="left:${NMW+(now-a)/6e4*PPM}px"></div>`:'')+'</div></div>';
  return h}
function render(){const q=$('#q').value.trim().toLowerCase(),now=Date.now();let h=ban();
  if(S.tab==='now'){const by={};S.progs.filter(p=>chOk(p.c)&&p.e>now&&p.s<now+9e6).forEach(p=>(by[p.c]??=[]).push(p));
    let L=[];for(const id of S.sel.filter(chOk)){const l=by[id]||[],cur=l.find(p=>p.s<=now),nx=l.find(p=>p.s>now);if(!cur&&!nx)continue;
      if(q&&![cur,nx].some(p=>p&&(p.t.toLowerCase().includes(q)||String(S.byId[id]?.n)===q)))continue;
      if(S.gen!=='all'&&!(cur?genOk(cur):genOk(nx)))continue;L.push({c:S.byId[id],cur,nx})}
    const key=x=>x.cur||x.nx,o=S.osort;
    if(o==='chan')L.sort((x,y)=>chCmp(x.c,y.c));
    else if(o==='start')L.sort((x,y)=>key(x).s-key(y).s||chCmp(x.c,y.c));
    else if(o==='title')L.sort((x,y)=>key(x).t.localeCompare(key(y).t,'it'));
    else if(o==='genre')L.sort((x,y)=>{const a=genreOf(key(x)),b=genreOf(key(y));return (a==='Altro')-(b==='Altro')||a.localeCompare(b,'it')||x.c.name.localeCompare(y.c.name)});
    else L.sort((x,y)=>chCmp(x.c,y.c));
    h+=`<div class="row" style="margin:0 0 8px">${genSel()}<button data-leg="1" class="${S.legend?'on':''}">🎨 Colori</button></div><div class="row" style="margin:0 0 8px"><select id="osel" style="flex:1;min-width:0">${[['chan','Ordina: numero canale'],['start','Ordina: ora di inizio'],['title','Ordina: programma A→Z'],['genre','Ordina: genere']].map(([k,l])=>`<option value="${k}"${S.osort===k?' selected':''}>${l}</option>`).join('')}</select></div>${legend()}`;
    h+=L.map(({c,cur,nx})=>{const g=genreOf(cur||nx);return `<div class="it${gcOf(g)?' gc':''}"${gst(g)}><span class="b ${c.type}">${LBL[c.type]}</span><b>${cn(c)}${esc(c.name)}</b>${cur?`<h4 style="margin-top:6px" data-blk="${cur.c}|${cur.s}">${esc(cur.t)}</h4><div class="mu">${gbadge(genreOf(cur))}${hm(cur.s)}–${hm(cur.e)}</div><div class="bar"><i style="width:${Math.round((now-cur.s)/(cur.e-cur.s)*100)}%"></i></div>`:''}${nx?`<div class="mu" style="margin-top:4px" data-blk="${nx.c}|${nx.s}">Poi ${hm(nx.s)}: ${esc(nx.t)} ${gbadge(genreOf(nx))}</div>`:''}</div>`}).join('')||'<p class="mu">Nessun programma con questi filtri.</p>'}
  else if(S.tab==='guide'){
    h+=dayChips(S.day,'day',`<button data-day="7" class="${S.day===7?'on':''}">Settimana</button>`)+`<div class="chips">${[['all','Tutto'],['m','Mattina'],['p','Pomeriggio'],['s','Sera'],['n','Notte']].map(([k,l])=>`<button data-slot="${k}" class="${S.slot===k?'on':''}">${l}</button>`).join('')}</div>`;
    const opts=S.sel.map(id=>S.byId[id]).filter(c=>c&&(S.type==='all'||c.type===S.type)).sort(chCmp);
    if(S.ch!=='all'&&!opts.some(c=>c.id===S.ch))S.ch='all';
    h+=`<div class="row" style="margin:6px 0 8px"><select id="chsel" style="flex:1;min-width:0"><option value="all">Tutti i canali</option>${opts.map(c=>`<option value="${c.id}" ${S.ch===c.id?'selected':''}>${c.n!=null?c.n+' · ':''}${esc(c.name)}</option>`).join('')}</select>${genSel()}</div>${sortSel()}`;
    const wk=S.day===7,a=wk?now:dayStart(S.day),b=wk?now+7*864e5:a+864e5;let ps=S.progs.filter(p=>chOk(p.c)&&(S.ch==='all'||p.c===S.ch)&&(wk?p.e>a:p.s>=a)&&p.s<b&&genOk(p));
    if(q)ps=ps.filter(p=>qm(p,q));
    if(S.slot!=='all'){const R={m:[6,12],p:[12,18],s:[18,24],n:[0,6]}[S.slot];ps=ps.filter(p=>{const H=new Date(p.s).getHours();return H>=R[0]&&H<R[1]})}
    ps.sort(sorter());h+=ps.slice(0,300).map(p=>row(p,wk||S.sort!=='time')).join('')||'<p class="mu">Nessun programma.</p>';if(ps.length>300)h+='<p class="mu">Mostrati i primi 300: restringi i filtri.</p>'}
  else if(S.tab==='tl'){h+=timeline(q)}
  else if(S.tab==='fav'){h+='<p class="mu">Titoli con ⭐ nei prossimi giorni. Per vederli in griglia: Timeline → Solo preferiti.</p>';
    h+=`<div class="row" style="margin:6px 0 8px">${genSel()}</div>`+sortSel()+S.progs.filter(p=>p.e>now&&chOk(p.c)&&favP(p)&&genOk(p)&&(!q||qm(p,q))).sort(sorter()).slice(0,200).map(p=>row(p,true)).join('')||'<p class="mu">Nessun preferito in programma. Tocca ☆ su un programma.</p>'}
  else{h+=`<p class="mu">Piattaforme e canali a pagamento: apri direttamente il servizio.</p><div class="chips" style="flex-wrap:wrap">${LINKS.map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener"><button>${n} ↗</button></a>`).join('')}</div>`}
  $('#m').innerHTML=(h||'<p class="mu">Nessun risultato.</p>')+`<p class="mu" style="text-align:center;margin-top:14px">Versione ${VER} · dati del ${S.updated?new Date(S.updated).toLocaleString('it-IT'):'—'}</p>`;
  if(S.tab==='tl'&&$('#tl')){const a=dayStart(S.tday),t=a<=now&&now<a+864e5?now-50*6e4:a+18*36e5;$('#tl').scrollLeft=Math.max((t-a)/6e4*PPM,0)}}
function detail(c,s){const p=S.progs.find(p=>p.c===c&&p.s==s);if(!p)return;const d=$('#dlg'),ch=S.byId[c];
  d.innerHTML=`<h3 style="margin-top:0">${esc(p.t)}</h3><div class="mu"><span class="b ${ch.type}">${LBL[ch.type]}</span>${cn(ch)}${esc(ch.name)} · ${dl(p.s)} ${hm(p.s)}–${hm(p.e)}</div><div class="mu" style="margin:4px 0">${esc(genreOf(p))}</div><p>${esc(p.d)||'<span class="mu">Nessuna descrizione.</span>'}</p><div class="row"><button id="df">${isFav(p.t)?'⭐ Preferito':'☆ Aggiungi ai preferiti'}</button><button id="dr">${hasRem(p)?'🔔 Promemoria on':'🔕 Promemoria'}</button><button id="dx">Chiudi</button></div>`;
  $('#df').onclick=()=>{const k=p.t.toLowerCase();S.favs=S.favs.includes(k)?S.favs.filter(x=>x!==k):[...S.favs,k];sv('favs',S.favs);d.close();render()};
  $('#dr').onclick=async()=>{await toggleRem(p.c,p.s);d.close();render()};$('#dx').onclick=()=>d.close();d.showModal()}
async function toggleRem(c,s){if('Notification'in window&&Notification.permission==='default')await Notification.requestPermission();
  const i=S.rem.findIndex(r=>r.c===c&&r.s==s);if(i>=0)S.rem.splice(i,1);else{const p=S.progs.find(p=>p.c===c&&p.s==s);if(p)S.rem.push({c,s:+s,t:p.t})}sv('rem',S.rem);schedule()}
document.addEventListener('click',async e=>{const t=e.target.closest('[data-fav],[data-rem],[data-day],[data-tday],[data-slot],[data-tfav],[data-blk],[data-hl],[data-leg],[data-lg]');if(!t)return;const d=t.dataset;
  if(d.leg){S.legend=!S.legend;render()}
  else if(d.lg){S.gen=S.gen===d.lg?'all':d.lg;render()}
  else if(d.hl){S.hl=S.hl.includes(d.hl)?S.hl.filter(x=>x!==d.hl):[...S.hl,d.hl];sv('hl',S.hl);t.parentElement.classList.toggle('hl',S.hl.includes(d.hl))}
  else if(d.blk){const[c,s]=d.blk.split('|');detail(c,s)}
  else if(d.fav){const k=d.fav.toLowerCase();S.favs=S.favs.includes(k)?S.favs.filter(x=>x!==k):[...S.favs,k];sv('favs',S.favs);t.textContent=isFav(d.fav)?'⭐':'☆';if(S.tab==='fav')render()}
  else if(d.rem){const[c,s]=d.rem.split('|');await toggleRem(c,s);render()}
  else if(d.day!==undefined){S.day=+d.day;render()}else if(d.tday!==undefined){S.tday=+d.tday;render()}else if(d.tfav!==undefined){S.tfav=d.tfav==='1';render()}else if(d.slot){S.slot=d.slot;render()}});
document.addEventListener('change',e=>{if(e.target.id==='chsel'){S.ch=e.target.value;render()}else if(e.target.id==='gsel'){S.gen=e.target.value;render()}else if(e.target.id==='tchsel'){S.tch=e.target.value;render()}else if(e.target.id==='tsortsel'){S.tsort=e.target.value;render()}else if(e.target.id==='ssel'){S.sort=e.target.value;render()}else if(e.target.id==='osel'){S.osort=e.target.value;render()}});
let timers=[];function schedule(){timers.forEach(clearTimeout);timers=[];const now=Date.now();S.rem=S.rem.filter(r=>r.s>now-6e4);sv('rem',S.rem);
  S.rem.forEach(r=>{const w=r.s-3e5-now;if(w<864e5)timers.push(setTimeout(async()=>{if('Notification'in window&&Notification.permission==='granted'){const reg=await navigator.serviceWorker.ready;reg.showNotification('Tra 5 minuti: '+r.t,{body:(S.byId[r.c]?.name||'')+' · '+hm(r.s),icon:'icon.svg'})}},Math.max(w,0)))})}
function settings(){const d=$('#dlg');
  d.innerHTML=`<h3>Canali visibili</h3><div class="row"><input id="cf" placeholder="Filtra…"><button id="a1">In chiaro</button><button id="a2">Tutti</button><button id="a0">Nessuno</button></div><div id="cl" style="max-height:50vh;overflow:auto;margin:8px 0"></div><p class="mu">Dati aggiornati: ${S.updated?new Date(S.updated).toLocaleString('it-IT'):'—'}</p><button id="x">Chiudi</button>`;
  const list=()=>{const f=$('#cf').value.toLowerCase();$('#cl').innerHTML=[...S.chs].sort(chCmp).filter(c=>((c.n??'')+' '+c.name).toLowerCase().includes(f)).map(c=>`<label class="ck"><input type="checkbox" style="flex:none" data-c="${c.id}" ${S.sel.includes(c.id)?'checked':''}><span class="b ${c.type}">${LBL[c.type]}</span>${cn(c)}${esc(c.name)}</label>`).join('')};
  list();$('#cf').oninput=list;$('#cl').onchange=e=>{const id=e.target.dataset.c;S.sel=e.target.checked?[...S.sel,id]:S.sel.filter(x=>x!==id);sv('sel',S.sel)};
  const set=f=>{S.sel=S.chs.filter(f).map(c=>c.id);sv('sel',S.sel);list()};$('#a1').onclick=()=>set(c=>c.type==='free');$('#a2').onclick=()=>set(()=>true);$('#a0').onclick=()=>set(()=>false);
  $('#x').onclick=()=>{d.close();render()};d.showModal()}
init();
