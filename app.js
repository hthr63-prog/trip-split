(function(){
const $=id=>document.getElementById(id);
const PAGE_URL=location.origin+location.pathname;
let QUICK=(()=>{ try{ const a=new URLSearchParams(location.search).get("add"); return a==="1"||a==="me" ? a : ""; }catch(e){ return ""; } })();
window.APP_V=(document.querySelector('meta[name="app-v"]')||{}).content||"";
/* ---- motion & feedback ---- */
const calm=()=>{ try{ return matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){ return false; } };
let hapticEl=null;
const buzz=ms=>{ try{
  if(navigator.vibrate){ navigator.vibrate(ms||8); return; }
  if(!hapticEl){ const l=document.createElement("label"); l.setAttribute("aria-hidden","true"); l.style.cssText="position:fixed;left:-200px;top:0;opacity:0;pointer-events:none"; const i=document.createElement("input"); i.type="checkbox"; i.setAttribute("switch",""); i.tabIndex=-1; l.appendChild(i); document.body.appendChild(l); hapticEl=l; }
  hapticEl.click();
}catch(e){} };
const MONEY=new Map();   /* last shown value per number, to count from it */
function money(el,v,cur,key){
  if(!el) return; key=key||el.id||""; const prev=MONEY.get(key); MONEY.set(key,{v,cur});
  if(calm()||!prev||prev.cur!==cur||!isFinite(prev.v)||Math.abs(prev.v-v)<0.005){ el.textContent=fmt(v,cur); return; }
  const from=prev.v, t0=performance.now(), dur=520; el.classList.add("ticking");
  const step=now=>{ const k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,3); el.textContent=fmt(from+(v-from)*e,cur);
    if(k<1) requestAnimationFrame(step); else { el.textContent=fmt(v,cur); el.classList.remove("ticking"); } };
  requestAnimationFrame(step);
}
function flash(el,cls,ms){ if(!el||calm()) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(()=>el.classList.remove(cls),ms||600); }
function viewSwap(fn){ if(document.startViewTransition&&!calm()){ try{ document.startViewTransition(fn); return; }catch(e){} } fn(); }
let popKey=null;
function confetti(){
  if(calm()) return;
  const colors=["#6C4BFF","#FF4D8D","#FFC93C","#14C9A5","#B84DFF"]; const box=document.createElement("div"); box.className="confetti"; document.body.appendChild(box);
  for(let i=0;i<46;i++){ const s=document.createElement("i"); s.style.background=colors[i%colors.length]; s.style.left=(40+Math.random()*20)+"%"; box.appendChild(s);
    const dx=(Math.random()-.5)*520, dy=-(260+Math.random()*320), rot=(Math.random()-.5)*720;
    s.animate([{transform:"translate(0,0) rotate(0)",opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${rot}deg)`,opacity:1,offset:.55},{transform:`translate(${dx*1.2}px,${dy+520}px) rotate(${rot*1.6}deg)`,opacity:0}],{duration:1500+Math.random()*700,easing:"cubic-bezier(.2,.7,.3,1)",fill:"forwards"}); }
  setTimeout(()=>box.remove(),2400);
}

const ASIA=[["THB","באט תאילנדי","฿"],["VND","דונג וייטנאמי","₫"],["LAK","קיפ לאוסי","₭"],["KHR","ריאל קמבודי","៛"],["MMK","קיאט מיאנמרי"],["MYR","רינגיט מלזי","RM"],["SGD","דולר סינגפורי","S$"],["IDR","רופיה אינדונזית","Rp"],["PHP","פסו פיליפיני","₱"],["BND","דולר ברוניי"],["JPY","ין יפני","¥"],["KRW","וון קוריאני","₩"],["CNY","יואן סיני","CN¥"],["HKD","דולר הונג קונגי","HK$"],["MOP","פטקה מקאו"],["TWD","דולר טייוואני","NT$"],["MNT","טוגריק מונגולי","₮"],["INR","רופי הודי","₹"],["NPR","רופי נפאלי"],["LKR","רופי סרי לנקי"],["BTN","נגולטרום בהוטני"],["MVR","רופיה מלדיבית"],["BDT","טאקה בנגלדשי","৳"],["PKR","רופי פקיסטני"],["KZT","טנגה קזחי","₸"],["UZS","סום אוזבקי"],["KGS","סום קירגיזי"],["AED","דירהם אמירותי"]];
const MAIN=[["ILS","שקל","₪"],["USD","דולר אמריקאי","$"],["EUR","אירו","€"]];
const OTHER=[["GBP","לירה שטרלינג","£"],["CHF","פרנק שווייצרי"],["AUD","דולר אוסטרלי","A$"],["NZD","דולר ניו זילנדי","NZ$"],["CAD","דולר קנדי","C$"],["TRY","לירה טורקית","₺"],["GEL","לארי גאורגי"],["AMD","דראם ארמני"],["AZN","מנאט אזרבייג׳ני"],["JOD","דינר ירדני"],["EGP","לירה מצרית"],["QAR","ריאל קטארי"],["OMR","ריאל עומאני"],["MAD","דירהם מרוקאי"],["ZAR","ראנד דרום אפריקאי"],["KES","שילינג קנייתי"],["TZS","שילינג טנזני"],["FJD","דולר פיג׳י"],["MXN","פסו מקסיקני"],["BRL","ריאל ברזילאי"],["ARS","פסו ארגנטינאי"],["CLP","פסו צ׳יליאני"],["PEN","סול פרואני"],["COP","פסו קולומביאני"],["CZK","קורונה צ׳כית"],["HUF","פורינט הונגרי"],["PLN","זלוטי פולני"],["RON","לאו רומני"],["BGN","לב בולגרי"],["RSD","דינר סרבי"],["SEK","קרונה שוודית"],["NOK","קרונה נורווגית"],["DKK","קרונה דנית"],["ISK","קרונה איסלנדית"]];
const CUR={}; for(const [c,n,s] of [...MAIN,...ASIA,...OTHER]) CUR[c]={name:n,sym:s||""};
const CATS=[["food","🍜 אוכל"],["stay","🛏️ לינה"],["transport","🛺 תחבורה"],["fun","🎢 אטרקציות"],["party","🎉 מסיבות"],["laundry","🧺 כביסה"],["shop","🛍️ קניות"],["other","✨ אחר"]];
/* names for categories that were offered briefly, so older entries still read well */
const OLD_CATS={scooter:"🛵 קטנוע ודלק",flights:"✈️ טיסות",tours:"🥾 טרקים וסיורים",massage:"💆 עיסויים",sim:"📶 סים ואינטרנט",visa:"🛂 ויזה",health:"💊 בריאות"};
const CATNAME=Object.fromEntries(CATS);

/* rates snapshot (units per 1 USD), used only until live rates load */
const SNAPSHOT={"ILS":3.171842,"USD":1,"EUR":0.890365,"THB":33.719076,"VND":25729.735232,"LAK":22505.1838,"KHR":4065.593788,"MMK":2098.794175,"MYR":4.072794,"SGD":1.279887,"IDR":18143.678069,"PHP":63.478823,"BND":1.279887,"JPY":157.949155,"KRW":1340.784427,"CNY":6.684037,"HKD":7.845861,"MOP":8.081237,"TWD":32.830657,"MNT":3601.958391,"INR":94.779591,"NPR":151.71843,"LKR":331.826006,"BTN":94.779591,"MVR":15.459298,"BDT":124.174282,"PKR":275.809125,"KZT":452.607877,"UZS":11885.050986,"KGS":87.457295,"AED":3.6725,"GBP":0.743257,"CHF":0.817104,"AUD":1.432863,"NZD":1.785676,"CAD":1.397182,"TRY":50.017333,"GEL":2.593158,"JOD":0.709,"EGP":55.339922,"QAR":3.64,"OMR":0.384886,"ZAR":16.566684,"MXN":18.801918,"BRL":5.488807,"ARS":1550.805724,"CLP":981.86821,"PEN":3.452304,"COP":3245.471352,"CZK":21.682276,"HUF":324.682409,"PLN":3.930636,"RON":4.756031,"BGN":1.741402,"SEK":9.759447,"NOK":9.26785,"DKK":6.654908,"ISK":121.298704,"MAD":9.795078,"KES":129.924573,"TZS":2643.325335,"FJD":2.248705,"RSD":104.76815,"AMD":359.039516,"AZN":1.7};

/* written once, the first time the database is empty */
const SEED_META={trip:"גלי ויאירוש במזרח🕺🏼🥳",localCur:"THB",people:[{id:"yair",name:"יאיר",g:"m"},{id:"gali",name:"גלי",g:"f"}]};
const SEED_ITEMS=[
  {id:"sw-hotel-chiangmai",kind:"expense",desc:"מלון צאנג מאי",amount:50.57,cur:"USD",payer:"yair",among:["yair","gali"],pcts:null,cat:"stay",date:"2026-10-29",createdAt:1793260800000,source:"splitwise"},
  {id:"sw-sleeper-chiangmai",kind:"expense",desc:"סליפר צאנג מאי",amount:68.39,cur:"USD",payer:"yair",among:["yair","gali"],pcts:null,cat:"transport",date:"2026-10-29",createdAt:1793260801000,source:"splitwise"}];

let S={trip:"",localCur:"THB",people:[],items:[],fx:{rates:{...SNAPSHOT},at:null,live:false}};
let db=null, canWrite=false, busy=false, editingId=null, filter="all", loaded=false;
let form={payer:null,among:null,mode:"equal",pcts:{},cat:"food"};
let me=null, showCur=load("trip-show")||"ILS"; if(!CUR[showCur]) showCur="ILS";
let nuG="m";

function load(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function store(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function person(id){ return S.people.find(p=>p.id===id); }
function active(){ return S.people.filter(p=>!p.archived); }
function nm(id){ return person(id)?.name||"מישהו"; }
function pidx(id){ const i=S.people.findIndex(p=>p.id===id); return i<0?0:i%6; }
function fem(id){ return person(id)?.g==="f"; }
const g={
  paid:w=>fem(w)?"שילמה":"שילם",
  owes:w=>fem(w)?"חייבת":"חייב",
  you:w=>fem(w)?"את":"אתה",
  transferred:w=>fem(w)?"העבירה":"העביר",
};
function todayStr(){ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function uid(p){ return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

/* ---- live exchange rates: refreshed on open and every hour ---- */
async function fetchJson(url){ const r=await fetch(url,{cache:"no-store"}); if(!r.ok) throw new Error(r.status); return r.json(); }
async function refreshRates(){
  const next={...S.fx.rates}; let got=false, stamp=null;
  try{ const d=await fetchJson("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json");
    for(const c in CUR){ const v=d.usd&&d.usd[c.toLowerCase()]; if(v>0) next[c]=v; } got=true; stamp=d.date?new Date(d.date+"T00:00:00Z"):new Date(); }catch(e){}
  try{ const d=await fetchJson("https://api.coinbase.com/v2/exchange-rates?currency=USD");
    const r=d.data&&d.data.rates; if(r){ for(const c in CUR){ const v=parseFloat(r[c]); if(v>0) next[c]=v; } got=true; stamp=new Date(); } }catch(e){}
  if(got){ S.fx={rates:next,at:stamp,live:true}; store("trip-fx",JSON.stringify({rates:next,at:stamp.toISOString()})); renderAll(); }
}
try{ const c=JSON.parse(load("trip-fx")||"null"); if(c&&c.rates){ S.fx={rates:{...SNAPSHOT,...c.rates},at:new Date(c.at),live:false}; } }catch(e){}

/* ---- money ---- */
function perUsd(c){ return +S.fx.rates[c]||NaN; }
function conv(v,from,to){ if(from===to) return v; return v/perUsd(from)*perUsd(to); }
function fmt(v,cur){
  const info=CUR[cur]||{sym:""}; const a=Math.abs(v);
  if(!isFinite(a)) return "—";
  const dig=a>=1000?0:a>=100?1:2;
  let t=a.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:dig});
  if(a>0&&a<0.01) t=a.toPrecision(2);
  const sign=v<0?"-":"";
  return info.sym? sign+info.sym+t : sign+t+" "+cur;
}
function curLabel(c){ const i=CUR[c]; return i? c+" · "+i.name : c; }
function sharesOf(it){
  const out={};
  if(it.kind==="transfer"){ out[it.to]=1; return out; }
  if(it.pcts){ let sum=0; for(const k in it.pcts) sum+=+it.pcts[k]||0; if(sum>0){ for(const k in it.pcts) out[k]=(+it.pcts[k]||0)/sum; return out; } }
  const among=(it.among&&it.among.length)?it.among:S.people.map(p=>p.id);
  for(const k of among) out[k]=1/among.length; return out;
}
function compute(){
  const net={}; let total=0; const paid={}, share={}, cats={};
  for(const p of S.people){ net[p.id]={}; paid[p.id]=0; share[p.id]=0; }
  for(const it of S.items){
    const c=it.cur||"ILS", v=+it.amount||0, sh=sharesOf(it);
    if(!net[it.payer]) net[it.payer]={};
    net[it.payer][c]=(net[it.payer][c]||0)+v;
    for(const k in sh){ if(!net[k]) net[k]={}; net[k][c]=(net[k][c]||0)-v*sh[k]; }
    if(it.kind==="transfer") continue;
    const sv=conv(v,c,showCur); total+=sv;
    paid[it.payer]=(paid[it.payer]||0)+sv;
    for(const k in sh) share[k]=(share[k]||0)+sv*sh[k];
    const ck=it.cat||"other"; cats[ck]=(cats[ck]||0)+sv;
  }
  const bal={}; for(const id in net){ let b=0; for(const c in net[id]) b+=conv(net[id][c],c,showCur); bal[id]=b; }
  const eps=conv(0.5,"ILS",showCur);
  const cr=Object.entries(bal).filter(([,b])=>b>eps).map(([id,b])=>({id,b})).sort((x,y)=>y.b-x.b);
  const dr=Object.entries(bal).filter(([,b])=>b<-eps).map(([id,b])=>({id,b:-b})).sort((x,y)=>y.b-x.b);
  const debts=[]; let i=0,j=0;
  while(i<dr.length&&j<cr.length){ const x=Math.min(dr[i].b,cr[j].b); if(x>eps) debts.push({from:dr[i].id,to:cr[j].id,amt:x}); dr[i].b-=x; cr[j].b-=x; if(dr[i].b<=eps) i++; if(cr[j].b<=eps) j++; }
  return {net,bal,total,paid,share,cats,debts};
}

/* ---- extra state ---- */
let view="shared";
let PENDING=new Set(), FRESH=new Set(), BIN=[], BINRAW=[], purged=false, CASH=[], dayCur="ILS", cashForm=null;                 // "shared" | "personal"
let P=[], pLoaded=false, pEditingId=null, pform={cat:"food"};
let cur={fCur:null,pCur:null,cFrom:null,cTo:"ILS"};
let cLast="A";                     // which converter field the person typed in

/* ---- theme ---- */
function themePref(){ return load("trip-theme")||"auto"; }
function isDark(){ const t=themePref(); return t==="dark"||(t==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches); }
function applyTheme(t){
  if(t==="auto"){ delete document.documentElement.dataset.theme; store("trip-theme",""); }
  else { document.documentElement.dataset.theme=t; store("trip-theme",t); }
  $("themeBtn").setAttribute("aria-checked",String(isDark()));
  if($("themeSeg")) seg($("themeSeg"),[["light","☀️ בהיר"],["dark","🌙 כהה"],["auto","📱 לפי המכשיר"]],v=>v===themePref(),v=>applyTheme(v));
}
$("themeBtn").onclick=()=>{ const r=document.documentElement; if(!calm()){ r.classList.add("theming"); setTimeout(()=>r.classList.remove("theming"),500); } buzz(6); applyTheme(isDark()?"light":"dark"); };
try{ matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>applyTheme(themePref())); }catch(e){}

/* ---- search keywords per currency ---- */
const KW={THB:"תאילנד thailand bangkok בנגקוק",VND:"וייטנאם vietnam",LAK:"לאוס laos",KHR:"קמבודיה cambodia",MMK:"מיאנמר בורמה myanmar burma",MYR:"מלזיה malaysia",SGD:"סינגפור singapore",IDR:"אינדונזיה באלי indonesia bali",PHP:"פיליפינים philippines",BND:"ברוניי brunei",JPY:"יפן japan",KRW:"קוריאה korea",CNY:"סין china",HKD:"הונג קונג hong kong",MOP:"מקאו macau",TWD:"טייוואן taiwan",MNT:"מונגוליה mongolia",INR:"הודו india",NPR:"נפאל nepal",LKR:"סרי לנקה sri lanka",BTN:"בהוטן bhutan",MVR:"מלדיביים maldives",BDT:"בנגלדש bangladesh",PKR:"פקיסטן pakistan",KZT:"קזחסטן kazakhstan",UZS:"אוזבקיסטן uzbekistan",KGS:"קירגיזסטן kyrgyzstan",AED:"אמירויות דובאי uae dubai emirates",ILS:"ישראל israel שקל nis shekel",USD:"ארצות הברית אמריקה usa us dollar",EUR:"אירופה europe euro",GBP:"בריטניה אנגליה לונדון uk england pound",CHF:"שווייץ switzerland",AUD:"אוסטרליה australia",NZD:"ניו זילנד new zealand",CAD:"קנדה canada",TRY:"טורקיה turkey",GEL:"גאורגיה גרוזיה georgia",AMD:"ארמניה armenia",AZN:"אזרבייגן azerbaijan",JOD:"ירדן jordan",EGP:"מצרים egypt",QAR:"קטאר qatar",OMR:"עומאן oman",MAD:"מרוקו morocco",ZAR:"דרום אפריקה south africa",KES:"קניה kenya",TZS:"טנזניה tanzania",FJD:"פיגי fiji",MXN:"מקסיקו mexico",BRL:"ברזיל brazil",ARS:"ארגנטינה argentina",CLP:"צילה chile",PEN:"פרו peru",COP:"קולומביה colombia",CZK:"צכיה פראג czech prague",HUF:"הונגריה hungary",PLN:"פולין poland",RON:"רומניה romania",BGN:"בולגריה bulgaria",RSD:"סרביה serbia",SEK:"שוודיה sweden",NOK:"נורווגיה norway",DKK:"דנמרק denmark",ISK:"איסלנד iceland"};
const norm=s=>String(s||"").toLowerCase().replace(/[׳'"`]/g,"").replace(/\s+/g," ").trim();

/* ---- sheets ---- */
function openSheet(id){ const s=$(id); s.classList.remove("closing"); s.hidden=false; document.body.style.overflow="hidden"; }
function closeSheet(id){
  const s=$(id); if(s.hidden) return;
  const finish=()=>{ s.hidden=true; s.classList.remove("closing"); if(id==="addSheet") restoreAdd(); if($("curSheet").hidden&&$("setSheet").hidden&&$("addSheet").hidden&&$("acctSheet").hidden) document.body.style.overflow=""; };
  if(calm()) return finish();
  s.classList.add("closing"); setTimeout(finish,190);
}
for(const id of ["curSheet","setSheet","addSheet","acctSheet"]) $(id).addEventListener("click",e=>{ if(e.target.id===id) closeSheet(id); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ if(!$("curSheet").hidden) closeSheet("curSheet"); else { closeSheet("setSheet"); closeSheet("addSheet"); } } });

/* ---- currency picker ---- */
let sheetCb=null, sheetCur=null, sheetMode="cur";
function curText(c){ const i=CUR[c]; return i? (i.sym?i.sym+" ":"")+c : c; }
function setCurBtn(id,c){ const b=$(id); if(b) b.textContent=curText(c); }
function recentCurs(){ const seen=[]; [...S.items,...P].sort((x,y)=>(y.createdAt||0)-(x.createdAt||0)).forEach(it=>{ if(it.cur&&!seen.includes(it.cur)) seen.push(it.cur); }); return seen.slice(0,5); }
function openCurPicker(title,current,cb){
  sheetMode="cur"; sheetCb=cb; sheetCur=current; $("curSheetTitle").textContent=title; $("curSearch").value=""; $("curSearch").placeholder="🔎 חיפוש: מטבע, מדינה או קוד (פסו, באלי, PHP)";
  openSheet("curSheet"); renderCurList();
  setTimeout(()=>{ try{ $("curSearch").focus({preventScroll:true}); }catch(e){} },60);
}
function openLocPicker(current,cb){
  sheetMode="loc"; sheetCb=cb; sheetCur=current; $("curSheetTitle").textContent="איפה זה היה? 🌏"; $("curSearch").value="";
  $("curSearch").placeholder="🔎 חיפוש מדינה"; openSheet("curSheet"); renderCurList();
}
function renderLocList(q,L){
  const item=k=>{ const b=document.createElement("button"); b.type="button"; b.className="curitem"; b.setAttribute("aria-selected",String(k===sheetCur)); b.style.gridTemplateColumns="1fr";
    const n=document.createElement("span"); n.textContent=locName(k); b.appendChild(n);
    b.onclick=()=>{ const cb=sheetCb; closeSheet("curSheet"); sheetCb=null; if(cb) cb(k); }; return b; };
  const group=(label,keys)=>{ if(!keys.length) return; const h=document.createElement("h3"); h.textContent=label; L.appendChild(h); keys.forEach(k=>L.appendChild(item(k))); };
  const countries=[...ASIA.map(x=>x[0]),...OTHER.map(x=>x[0]),"USD","EUR","ILS"].filter((c,i,arr)=>CTRY[c]&&arr.indexOf(c)===i);
  if(q){ const hits=["prep","?",...countries].filter(k=>norm(locName(k)+" "+(KW[k]||"")+(k==="prep"?" הכנות קדם נלווים ציוד ביטוח":"")).includes(q));
    if(!hits.length){ const e=document.createElement("div"); e.className="empty"; e.textContent="לא נמצאה מדינה כזו."; L.appendChild(e); return; }
    group("תוצאות",hits); return; }
  const used=[...new Set([...S.items,...P].map(locOf))].filter(k=>CTRY[k]);
  group("כללי",["prep","?"]);
  group("איפה שהייתם",[S.localCur,...used].filter((c,i,arr)=>CTRY[c]&&arr.indexOf(c)===i));
  group("כל המדינות",countries);
}
function renderCurList(){
  const q=norm($("curSearch").value); const L=$("curList"); L.innerHTML="";
  if(sheetMode==="loc") return renderLocList(q,L);
  const item=c=>{ const i=CUR[c]; const b=document.createElement("button"); b.type="button"; b.className="curitem"; b.setAttribute("aria-selected",String(c===sheetCur));
    const s=document.createElement("span"); s.className="sym"; s.textContent=i.sym||"·";
    const n=document.createElement("span"); n.textContent=i.name;
    const k=document.createElement("span"); k.className="code"; k.textContent=c;
    b.append(s,n,k); b.onclick=()=>{ const cb=sheetCb; closeSheet("curSheet"); sheetCb=null; if(cb) cb(c); }; return b; };
  const group=(label,codes)=>{ if(!codes.length) return; const h=document.createElement("h3"); h.textContent=label; L.appendChild(h); codes.forEach(c=>L.appendChild(item(c))); };
  if(q){
    const all=[...MAIN,...ASIA,...OTHER].map(([c])=>c);
    const hits=all.filter(c=>norm(c+" "+CUR[c].name+" "+(KW[c]||"")+" "+CUR[c].sym).includes(q));
    if(!hits.length){ const e=document.createElement("div"); e.className="empty"; e.textContent="לא נמצא מטבע כזה. נסו שם מדינה או קוד של 3 אותיות."; L.appendChild(e); return; }
    group("תוצאות",hits); return;
  }
  const top=[S.localCur,"ILS","USD",...recentCurs()].filter((c,i,a)=>CUR[c]&&a.indexOf(c)===i);
  group("נפוצים אצלכם",top); group("אסיה",ASIA.map(x=>x[0])); group("מטבעות עיקריים",MAIN.map(x=>x[0])); group("עוד מטבעות",OTHER.map(x=>x[0]));
}
$("curSearch").addEventListener("input",renderCurList);
$("curSearch").addEventListener("keydown",e=>{ if(e.key==="Enter"){ const f=$("curList").querySelector(".curitem"); if(f) f.click(); } });
$("curClose").onclick=()=>closeSheet("curSheet");

function seg(el,opts,isOn,onPick){
  el.innerHTML="";
  for(const [val,label] of opts){
    const b=document.createElement("button"); b.type="button"; b.textContent=label;
    const pk=(el.id||"")+"|"+val; b.setAttribute("aria-pressed",String(isOn(val)));
    if(popKey===pk){ b.classList.add("pop"); popKey=null; }
    b.onclick=()=>{ popKey=pk; buzz(6); onPick(val); }; el.appendChild(b);
  }
}
function showinRow(el){
  el.innerHTML="";
  const lbl=document.createElement("span"); lbl.textContent="להציג ב:"; el.appendChild(lbl);
  const quick=["ILS",S.localCur,"USD"].filter((x,i,a)=>a.indexOf(x)===i);
  for(const q of quick){ const b=document.createElement("button"); b.type="button"; b.className="chip"; b.textContent=(CUR[q].sym?CUR[q].sym+" ":"")+CUR[q].name; b.setAttribute("aria-pressed",String(showCur===q)); b.onclick=()=>setShow(q); el.appendChild(b); }
  const o=document.createElement("button"); o.type="button"; o.className="curbtn"; o.textContent=quick.includes(showCur)?"🔎 מטבע אחר":curText(showCur);
  o.onclick=()=>openCurPicker("להציג את הסכומים ב…",showCur,setShow); el.appendChild(o);
}

/* ---- render: header ---- */
function renderHeader(){
  { const T=$("title"), name=S.trip||"החשבון של הטיול"; T.innerHTML="";
    const m=/^(.*?)([\p{Extended_Pictographic}\u200d\ufe0f\u{1F3FB}-\u{1F3FF}\s]*)$/u.exec(name)||[name,name,""];
    const a=document.createElement("span"); a.className="tt"; a.textContent=m[1].trim()||name; T.appendChild(a);
    if(m[2]&&m[2].trim()){ const e=document.createElement("span"); e.className="te"; e.textContent=m[2].trim(); T.appendChild(e); } }
  document.title=(S.trip||"החשבון של הטיול");
  const names=active().map(p=>p.name);
  $("sub").textContent= me? (view==="personal"?"ההוצאות האישיות של "+nm(me):"היי "+nm(me)+" 👋 · "+names.length+" משתתפים") : (names.length? "החשבון המשותף של "+(names.length>1?names.slice(0,-1).join(", ")+" ו"+names[names.length-1]:names[0]) : "");
  $("settingsBtn").hidden=!canWrite;
  const showMine=!!me&&canWrite;
  $("viewBtn").hidden=!showMine; $("toprow").classList.toggle("one",!showMine);
  $("viewBtn").setAttribute("aria-pressed",String(view==="personal"));
  $("meBadge").textContent= me? ini(nm(me)) : "";
  renderAcct();
  $("viewTxt").textContent= view==="personal" ? "← לחשבון המשותף" : "האישי שלי";
  $("viewSmall").textContent= view==="personal" ? "חזרה" : (me&&fem(me)?"רק את רואה":"רק אתה רואה");
  const lc=CUR[S.localCur]; $("localSym").textContent=lc.sym||S.localCur.slice(0,1); $("localName").textContent=lc.name;
  $("localSmall").textContent= S.home ? "עד הטיסה · ואז "+(CUR[S.dest]?.name||"") : "המטבע עכשיו · להחלפה";
  $("localBtn").disabled=!canWrite;
  const W=$("whoBtns"); W.innerHTML="";
  active().forEach((p,i)=>{ const b=document.createElement("button"); b.type="button"; b.className="btn big "+(i===0?"primary":i===1?"sun":""); b.textContent="אני "+p.name; b.onclick=()=>setMe(p.id,true); W.appendChild(b); });
  const nb=document.createElement("button"); nb.type="button"; nb.className="btn big"; nb.textContent="➕ משתמש חדש"; nb.onclick=()=>{ $("newUser").hidden=false; $("nuName").focus(); }; W.appendChild(nb);
  seg($("nuG"),[["m","זכר"],["f","נקבה"]],v=>v===nuG,v=>{nuG=v;renderHeader();});
  $("picker").hidden=!!me || !loaded;
  $("foot").hidden=!me;
  $("footWho").textContent= me? "מחובר/ת בתור "+nm(me)+"." : "";
  $("viewShared").hidden= view==="stats" || (view==="personal" && !!me);
  $("viewPersonal").hidden= !(view==="personal" && me);
  $("viewStats").hidden= view!=="stats";
  $("toprow").hidden= view==="stats";
  $("statsBtn").setAttribute("aria-pressed",String(view==="stats"));
  $("fabAdd").hidden= !canWrite || !loaded || document.body.classList.contains("has-tabs");
  renderTabs(); $("fabAdd").hidden= !canWrite || !loaded || !$("tabbar").hidden;
}

/* ---- render: shared ---- */
function renderTicket(){
  const c=compute();
  const V=$("verdict"), D=$("debts"), B=$("breakdown"); V.innerHTML=""; D.innerHTML=""; B.innerHTML="";
  const amt=v=>{ const s=document.createElement("span"); s.className="amt num"; money(s,v,showCur,"verdict:"+(me||"")); return s; };
  if(me){
    $("ticketLbl").textContent="המאזן של "+nm(me);
    money($("stPaid"),c.paid[me]||0,showCur); $("stPaidLbl").textContent="שילמת";
    money($("stShare"),c.share[me]||0,showCur); $("stShareLbl").textContent="החלק שלך";
  }else{
    $("ticketLbl").textContent="מי חייב למי";
    const a=active()[0]?.id, b=active()[1]?.id;
    $("stPaid").textContent=fmt(c.paid[a]||0,showCur); $("stPaidLbl").textContent=a?nm(a)+" "+g.paid(a):"";
    $("stShare").textContent=fmt(c.paid[b]||0,showCur); $("stShareLbl").textContent=b?nm(b)+" "+g.paid(b):"";
  }
  money($("stTotal"),c.total,showCur);
  const mine=me? c.debts.filter(d=>d.from===me||d.to===me) : c.debts;
  const br=()=>V.appendChild(document.createElement("br"));
  if(!loaded){ V.innerHTML='<span class="skel" style="width:70%"></span><br><span class="skel" style="width:40%;height:1.4em"></span>'; }
  else if(!S.items.length){ V.textContent="עוד אין הוצאות. מתחילים למטה 👇"; }
  else if(!c.debts.length){ V.textContent="אתם מאוזנים 🎉 אף אחד לא חייב כלום"; }
  else if(me&&!mine.length){ V.textContent=(fem(me)?"את מאוזנת":"אתה מאוזן")+" 🎉"; }
  else if(mine.length===1){
    const d=mine[0];
    if(me&&d.to===me){ V.append(nm(d.from)+" "+g.owes(d.from)+" לך"); br(); V.appendChild(amt(d.amt)); }
    else if(me){ V.append(g.you(me)+" "+g.owes(me)+" ל"+nm(d.to)); br(); V.appendChild(amt(d.amt)); }
    else { V.append(nm(d.from)+" "+g.owes(d.from)+" ל"+nm(d.to)); br(); V.appendChild(amt(d.amt)); }
  }else{
    if(me){ const b=c.bal[me]||0; if(b>0){ V.append("בסך הכול מגיע לך"); br(); V.appendChild(amt(b)); } else { V.append("בסך הכול "+g.you(me)+" "+g.owes(me)); br(); V.appendChild(amt(-b)); } }
    else V.textContent="כדי לסגור את החשבון:";
    if(!canWrite) for(const d of mine){
      const row=document.createElement("div"); row.className="debt";
      const t=document.createElement("span"); t.textContent=nm(d.from)+" ← "+nm(d.to)+": "; const a=document.createElement("b"); a.className="num"; a.textContent=fmt(d.amt,showCur); t.appendChild(a);
      row.appendChild(t); D.appendChild(row);
    }
  }
  if(canWrite){
    for(const d of mine){
      const row=document.createElement("div"); row.className="debt";
      const b=document.createElement("button"); b.type="button"; b.className="btn"; b.textContent="✓ סמנו ש"+nm(d.from)+" "+g.transferred(d.from)+" ל"+nm(d.to)+" "+fmt(d.amt,showCur);
      b.onclick=()=>addTransfer(d.from,d.to,Math.round(d.amt*100)/100); row.appendChild(b); D.appendChild(row);
      b.dataset.share="• "+nm(d.from)+" "+(fem(d.from)?"צריכה":"צריך")+" להעביר ל"+nm(d.to)+" "+fmt(d.amt,showCur);
    }
  }
  if(me&&S.items.length){
    const parts=Object.entries(c.net[me]||{}).filter(([k,x])=>Math.abs(conv(x,k,"ILS"))>=0.5);
    if(parts.length>1||(parts.length===1&&parts[0][0]!==showCur)){
      const lead=document.createElement("button"); lead.type="button"; lead.className="bd-toggle"; lead.setAttribute("aria-expanded",String(!!window.__bdOpen)); lead.textContent=(window.__bdOpen?"▴ ":"▾ ")+"פירוט לפי מטבע";
      lead.onclick=()=>{ window.__bdOpen=!window.__bdOpen; renderAll(); }; B.appendChild(lead); B.classList.toggle("open",!!window.__bdOpen);
      for(const [k,x] of parts){ const s=document.createElement("span"); s.className="num"; s.textContent=(x>0?"+":"")+fmt(x,k)+(k!==showCur?" ≈ "+fmt(conv(x,k,showCur),showCur):""); B.appendChild(s); }
    }
  }
  if(D.children.length&&me){ const sh=document.createElement("button"); sh.type="button"; sh.className="btn small ghost share-bal"; sh.textContent="📤 לשלוח את המאזן";
    sh.onclick=()=>{ const lines=[...D.querySelectorAll(".debt .btn")].map(x=>x.dataset.share||""); const txt=(S.trip||"הטיול")+" 💸\n"+V.textContent.trim()+"\n"+lines.join("\n");
      if(navigator.share) navigator.share({text:txt}).catch(()=>{}); else location.href="https://wa.me/?text="+encodeURIComponent(txt); };
    D.appendChild(sh); }
  showinRow($("showin"));
}
function setShow(c){ showCur=c; store("trip-show",c); renderAll(); }

function fmtRate(r){ return r>=100?r.toFixed(1):r>=1?r.toFixed(4):r.toPrecision(4); }
function plain(v){ if(!isFinite(v)) return ""; const a=Math.abs(v); return String(Math.round(v*(a>=1000?1:100))/(a>=1000?1:100)); }
function renderConv(){
  if(!cur.cFrom) cur.cFrom=S.localCur;
  const f=cur.cFrom, t=cur.cTo; setCurBtn("cFrom",f); setCurBtn("cTo",t);
  const pa=v=>parseFloat(String(v).replace(/,/g,""));
  if(cLast==="A"){ const a=pa($("cA").value); if(document.activeElement!==$("cB")) $("cB").value= a>=0? group(plain(conv(a,f,t))) : ""; }
  else { const b=pa($("cB").value); if(document.activeElement!==$("cA")) $("cA").value= b>=0? group(plain(conv(b,t,f))) : ""; }
  const r=conv(1,f,t);
  $("cRate").innerHTML=""; const s1=document.createElement("span"); s1.textContent="1 "+f+" = "+fmtRate(r)+" "+t; const s2=document.createElement("span"); s2.textContent="1 "+t+" = "+fmtRate(1/r)+" "+f; $("cRate").append(s1,s2);
  const Q=$("cQuick"); Q.innerHTML="";
  const mult=Math.max(1,Math.pow(10,Math.floor(Math.log10(perUsd(f)||1))));
  for(const x of [100,500,1000].map(v=>v*mult)){ const b=document.createElement("button"); b.type="button"; b.className="chip"; b.textContent=fmt(x,f)+" = "+fmt(conv(x,f,t),t); b.onclick=()=>{ cLast="A"; $("cA").value=group(String(x)); renderConv(); }; Q.appendChild(b); }
  const at=S.fx.at;
  $("fxDate").textContent= S.fx.live&&at ? "שער עדכני · "+at.toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"}) : at ? "שער מ-"+at.toLocaleDateString("he-IL",{day:"numeric",month:"long"}) : "טוען שער…";
}

function renderForm(){
  const ids=active().map(p=>p.id);
  if(!form.payer||!person(form.payer)) form.payer=me||ids[0];
  if(!form.among) form.among=[...ids];
  form.among=form.among.filter(person);
  if(!cur.fCur) cur.fCur=S.localCur; setCurBtn("fCur",cur.fCur);
  const payers=active(); if(form.payer&&!payers.find(p=>p.id===form.payer)&&person(form.payer)) payers.push(person(form.payer));
  seg($("fPm"),[["cash","💵 מזומן"],["card","💳 כרטיס"]],v=>v===(form.pm||"cash"),v=>{form.pm=v;renderForm();});
  seg($("fPayer"),payers.map(p=>[p.id,p.name+" "+g.paid(p.id)]),v=>v===form.payer,v=>{form.payer=v;renderForm();});
  seg($("fAmong"),active().map(p=>[p.id,p.name]),v=>form.among.includes(v),v=>{ form.among=form.among.includes(v)?form.among.filter(x=>x!==v):[...form.among,v]; renderForm(); });
  seg($("fMode"),[["equal","בחלקים שווים"],["pct","באחוזים"]],v=>v===form.mode,v=>{form.mode=v;renderForm();});
  const Pc=$("fPcts"); Pc.hidden=form.mode!=="pct"; Pc.innerHTML="";
  if(form.mode==="pct"){
    for(const id of form.among){
      if(form.pcts[id]==null) form.pcts[id]=Math.round(100/form.among.length);
      const l=document.createElement("label"); l.textContent=nm(id)+" (%)";
      const i=document.createElement("input"); i.className="num"; i.setAttribute("inputmode","numeric"); i.id="pct-"+id; i.value=form.pcts[id];
      i.oninput=()=>{ form.pcts[id]=i.value; }; l.appendChild(i); Pc.appendChild(l);
    }
  }
  $("fLoc").textContent=locName(form.loc||defLoc());
  seg($("fCat"),CATS,v=>v===form.cat,v=>{form.cat=v;renderForm(); if(v==="other") $("fCatLabel").focus();});
  $("fCatLabel").hidden=form.cat!=="other";
  convHint("fAmt",cur.fCur,"fConv");
}
function convHint(amtId,c,outId){
  const a=parseFloat(String($(amtId).value).replace(/,/g,""));
  $(outId).textContent= a>0&&c!=="ILS" ? "≈ "+fmt(conv(a,c,"ILS"),"ILS")+(S.localCur!==c&&S.localCur!=="ILS"?"  ·  ≈ "+fmt(conv(a,c,S.localCur),S.localCur):"") : "";
}
function catBars(el,panel,cats){
  const ent=Object.entries(cats).sort((x,y)=>y[1]-x[1]); const total=ent.reduce((s,[,v])=>s+v,0);
  $(panel).hidden=!ent.length; if(!ent.length) return;
  const max=ent[0][1]||1; $(el).innerHTML="";
  for(const [k,v] of ent){
    const r=document.createElement("div"); r.className="cat";
    r.innerHTML=`<span></span><div class="bar"><i style="width:${(v/max*100).toFixed(1)}%"></i></div><b class="num"></b>`;
    r.children[0].textContent=catName(k); r.children[2].textContent=fmt(v,showCur)+" · "+Math.round(v/total*100)+"%";
    $(el).appendChild(r);
  }
}
function renderCats(){
  const ym=thisMonth(), cats={};
  for(const it of S.items){ if(it.kind==="transfer"||monthOf(it)!==ym) continue; const k=catKey(it); cats[k]=(cats[k]||0)+conv(+it.amount||0,it.cur,showCur); }
  $("catTitle").textContent="📊 לאן הלך הכסף ב"+monthName(ym,true).split(" ")[0];
  catBars("cats","catPanel",cats);
  if(!Object.keys(cats).length&&S.items.length){ $("catPanel").hidden=false; $("cats").innerHTML='<div class="hint">עוד אין הוצאות החודש.</div>'; }
}
/* the time an expense was logged, shown in the time zone of the place it was logged */
function hereTz(){ try{ return Intl.DateTimeFormat().resolvedOptions().timeZone||null; }catch(e){ return null; } }
function timeOf(it){
  if(!it.createdAt||it.source==="splitwise") return "";
  const o={hour:"2-digit",minute:"2-digit",hourCycle:"h23"};
  try{ return new Date(it.createdAt).toLocaleTimeString("he-IL",it.tz?{...o,timeZone:it.tz}:o); }catch(e){ return new Date(it.createdAt).toLocaleTimeString("he-IL",o); }
}
function withTime(it,txt){ const t=timeOf(it); return t? "🕒 "+t+" · "+txt : txt; }
function matches(it,q){
  if(!q) return true;
  const hay=norm([it.desc,catName(catKey(it)),nm(it.payer),it.to?nm(it.to):"",it.cur,CUR[it.cur]?.name,String(it.amount),dayLabel(it.date)].join(" "));
  return q.split(" ").every(w=>hay.includes(w));
}
const CTRY={THB:"🇹🇭 תאילנד",VND:"🇻🇳 וייטנאם",LAK:"🇱🇦 לאוס",KHR:"🇰🇭 קמבודיה",MMK:"🇲🇲 מיאנמר",MYR:"🇲🇾 מלזיה",SGD:"🇸🇬 סינגפור",IDR:"🇮🇩 אינדונזיה",PHP:"🇵🇭 פיליפינים",BND:"🇧🇳 ברוניי",JPY:"🇯🇵 יפן",KRW:"🇰🇷 קוריאה",CNY:"🇨🇳 סין",HKD:"🇭🇰 הונג קונג",MOP:"🇲🇴 מקאו",TWD:"🇹🇼 טייוואן",MNT:"🇲🇳 מונגוליה",INR:"🇮🇳 הודו",NPR:"🇳🇵 נפאל",LKR:"🇱🇰 סרי לנקה",BTN:"🇧🇹 בהוטן",MVR:"🇲🇻 מלדיביים",BDT:"🇧🇩 בנגלדש",PKR:"🇵🇰 פקיסטן",KZT:"🇰🇿 קזחסטן",UZS:"🇺🇿 אוזבקיסטן",KGS:"🇰🇬 קירגיזסטן",AED:"🇦🇪 אמירויות",ILS:"🇮🇱 ישראל",USD:"🇺🇸 ארה״ב",EUR:"🇪🇺 אירופה",GBP:"🇬🇧 בריטניה",CHF:"🇨🇭 שווייץ",AUD:"🇦🇺 אוסטרליה",NZD:"🇳🇿 ניו זילנד",CAD:"🇨🇦 קנדה",TRY:"🇹🇷 טורקיה",GEL:"🇬🇪 גאורגיה",AMD:"🇦🇲 ארמניה",AZN:"🇦🇿 אזרבייג׳ן",JOD:"🇯🇴 ירדן",EGP:"🇪🇬 מצרים",QAR:"🇶🇦 קטאר",OMR:"🇴🇲 עומאן",MAD:"🇲🇦 מרוקו",ZAR:"🇿🇦 דרום אפריקה",KES:"🇰🇪 קניה",TZS:"🇹🇿 טנזניה",FJD:"🇫🇯 פיג׳י",MXN:"🇲🇽 מקסיקו",BRL:"🇧🇷 ברזיל",ARS:"🇦🇷 ארגנטינה",CLP:"🇨🇱 צ׳ילה",PEN:"🇵🇪 פרו",COP:"🇨🇴 קולומביה",CZK:"🇨🇿 צ׳כיה",HUF:"🇭🇺 הונגריה",PLN:"🇵🇱 פולין",RON:"🇷🇴 רומניה",BGN:"🇧🇬 בולגריה",RSD:"🇷🇸 סרביה",SEK:"🇸🇪 שוודיה",NOK:"🇳🇴 נורווגיה",DKK:"🇩🇰 דנמרק",ISK:"🇮🇸 איסלנד"};
/* where an expense happened: saved with new expenses; older ones are inferred from their currency */
function locOf(it){
  if(it.loc) return it.loc;
  if(it.source==="splitwise") return "THB";
  if(["USD","EUR","GBP","ILS"].includes(it.cur)) return "?";
  return it.cur||"?";
}
function locName(k){ return k==="?" ? "🌐 לא ידוע" : k==="prep" ? "🧳 לפני הטיול והכנות" : (CTRY[k]||CUR[k]?.name||k); }
function catKey(it){ const l=(it.catLabel||"").trim(); return (it.cat||"other")==="other"&&l ? "other:"+l : (it.cat||"other"); }
function catName(k){ return k.startsWith("other:") ? "✨ "+k.slice(6) : (CATNAME[k]||OLD_CATS[k]||"✨ אחר"); }
function monthOf(it){ return (it.date||"").slice(0,7); }
function thisMonth(){ return todayStr().slice(0,7); }
function monthName(ym,long){ const [y,m]=ym.split("-").map(Number); return new Date(y,m-1,1).toLocaleDateString("he-IL",long?{month:"long",year:"numeric"}:{month:"short"}); }
/* totals shown beside each day heading */
function sharedDay(d){ const v=S.items.filter(it=>it.date===d&&it.kind!=="transfer").reduce((s,it)=>s+conv(+it.amount||0,it.cur,showCur),0); return v>0?"סה״כ "+fmt(v,showCur):""; }
function mineDay(d){
  const alone=P.filter(it=>it.date===d).reduce((s,it)=>s+conv(+it.amount||0,it.cur,showCur),0);
  const tog=myShareItems().filter(it=>it.date===d).reduce((s,it)=>s+conv(it.amount,it.cur,showCur),0);
  return "לבד "+fmt(alone,showCur)+" · ביחד "+fmt(tog,showCur)+" · משולב "+fmt(alone+tog,showCur);
}
function dayHead(h,d,extra){ h.className="dayhead"; const a=document.createElement("span"); a.textContent=dayLabel(d); h.appendChild(a); if(extra){ const b=document.createElement("span"); b.className="daysum num"; b.textContent=extra; h.appendChild(b); } }
function dayLabel(s){
  if(!s) return "ללא תאריך"; if(s===todayStr()) return "היום";
  const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString("he-IL",{weekday:"long",day:"numeric",month:"long"});
}
function splitText(it){
  if(it.pcts) return Object.entries(it.pcts).map(([k,v])=>nm(k)+" "+v+"%").join(" · ");
  const among=(it.among&&it.among.length)?it.among:S.people.map(p=>p.id);
  if(among.length===1) return "רק של "+nm(among[0]);
  if(among.length===2) return "חצי-חצי, "+among.map(nm).join(" ו");
  return "שווה בין "+among.map(nm).join(", ");
}
/* rows that appear after the first load slide in */
const SEEN=new Set(); let seenReady=false;
function isNew(id){ if(!seenReady) { SEEN.add(id); return false; } if(SEEN.has(id)) return false; SEEN.add(id); return true; }
function delBtn(onConfirm){
  const d=document.createElement("button"); d.className="link danger"; d.type="button"; d.textContent="מחיקה";
  d.onclick=()=>{ if(d.dataset.sure){ onConfirm(); } else { d.dataset.sure="1"; d.textContent="בטוח?"; setTimeout(()=>{ if(d.isConnected){ delete d.dataset.sure; d.textContent=d.dataset.label||"מחיקה"; } },3000); } };
  return d;
}
function renderLedger(){
  seg($("filter"),[["all","הכול"],...active().map(p=>[p.id,p.name]),["transfers","💸 העברות"]],v=>v===filter,v=>{filter=v;renderLedger();});
  const L=$("ledger"); L.innerHTML="";
  const q=norm($("lSearch").value);
  const list=S.items.filter(it=>(filter==="all"||(filter==="transfers"?it.kind==="transfer":it.payer===filter))&&matches(it,q)).sort((x,y)=>(y.date||"").localeCompare(x.date||"")||(y.createdAt||0)-(x.createdAt||0));
  if(!loaded){ for(let i=0;i<3;i++){ const s=document.createElement("div"); s.className="row skelrow"; s.innerHTML='<span class="skel dotsk"></span><span><span class="skel" style="width:60%"></span><br><span class="skel" style="width:40%;height:.7em"></span></span><span class="skel" style="width:3.5em"></span>'; L.appendChild(s); } return; }
  if(!list.length){ const e=document.createElement("div");
    if(loaded&&!q&&!S.items.length){ richEmpty(e,"🧳","עוד אין הוצאות בטיול","הקפה הראשון, המונית מהשדה, הכול מתחיל כאן.","➕ הוצאה ראשונה",openAdd); }
    else { e.className="empty"; e.textContent=!loaded?"":q?"לא נמצאה הוצאה שמתאימה לחיפוש":"אין הוצאות בסינון הזה"; }
    L.appendChild(e); return; }
  let curDay=null, box=null;
  for(const it of list){
    if(it.date!==curDay){ curDay=it.date; box=document.createElement("div"); box.className="day"; const h=document.createElement("h3"); dayHead(h,it.date,sharedDay(it.date)); box.appendChild(h); L.appendChild(box); }
    const r=document.createElement("div"); r.className="row"+(it.kind==="transfer"?" transfer":"")+(FRESH.has(it.id)?" fresh":"")+(PENDING.has(it.id)?" pending":"")+(isNew(it.id)?" enter":""); r.dataset.id=it.id;
    const dot=catTile(it, it.kind==="transfer"?null:it.payer);
    const main=document.createElement("div"); main.className="main";
    const t=document.createElement("div"); t.className="t"; const m=document.createElement("div"); m.className="m";
    if(it.kind==="transfer"){ t.textContent="💸 "+nm(it.payer)+" "+g.transferred(it.payer)+" ל"+nm(it.to); m.textContent=withTime(it,"סגירת חשבון"); }
    else{ t.textContent=(PENDING.has(it.id)?"⏳ ":"")+(it.desc||"הוצאה"); m.textContent=withTime(it,nm(it.payer)+" "+g.paid(it.payer)+" · "+splitText(it)+" · "+catName(catKey(it)).replace(/^\S+\s/,"")); }
    main.append(t,m);
    const right=document.createElement("div"); right.className="r";
    const b=document.createElement("b"); b.className="num"; b.textContent=fmt(+it.amount,it.cur); right.appendChild(b);
    if(it.cur!=="ILS"){ const s=document.createElement("span"); s.className="m num"; s.textContent="≈ "+fmt(conv(+it.amount,it.cur,"ILS"),"ILS"); right.appendChild(s); }
    if(me&&it.kind!=="transfer"){ const sh=sharesOf(it); const d=(it.payer===me?+it.amount:0)-(+it.amount)*(sh[me]||0); if(Math.abs(d)>0.0001){ const s=document.createElement("span"); s.className="mine num "+(d>0?"plus":"minus"); s.textContent=(d>0?"מגיע לך ":"עליך ")+fmt(Math.abs(d),it.cur); right.appendChild(s); } }
    if(canWrite){
      const acts=document.createElement("div"); acts.className="acts";
      if(it.kind!=="transfer"){ const e=document.createElement("button"); e.className="link"; e.type="button"; e.textContent="עריכה"; e.onclick=()=>startEdit(it); acts.appendChild(e); }
      if(it.kind!=="transfer"){ const ag=document.createElement("button"); ag.className="link"; ag.type="button"; ag.textContent="🔁 שוב"; ag.title="להוסיף את אותה הוצאה להיום"; ag.onclick=()=>again(it,false); acts.prepend(ag); }
      const d=delBtn(()=>delItem(it,false)); if(it.kind==="transfer"){ d.textContent="ביטול ההעברה"; d.dataset.label="ביטול ההעברה"; }
      acts.appendChild(d);
      right.appendChild(acts);
    }
    r.append(dot,main,right); tapRow(r); box.appendChild(swipeWrap(r,it,false));
  }
}

/* ---- personal account: password-protected, works on any device ----
   A key is derived from the person's password (PBKDF2). Personal items are stored in the shared
   "expenses" collection, encrypted with that key; only the matching tag is decrypted. */
const enc=new TextEncoder(), dec=new TextDecoder();
const b64=buf=>btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const hex=buf=>Array.from(new Uint8Array(buf),x=>x.toString(16).padStart(2,"0")).join("");
const unhex=h=>Uint8Array.from(h.match(/../g).map(x=>parseInt(x,16)));
async function sha(s){ return new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s))); }
let RAW=[], acct=null, acctFor=null, pSeq=0;
async function deriveRaw(pid,pw){
  const base=await crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:enc.encode("trip-split:"+pid),iterations:150000,hash:"SHA-256"},base,256);
  return hex(bits);
}
async function ctxFromRaw(rawHex){
  const key=await crypto.subtle.importKey("raw",unhex(rawHex),{name:"AES-GCM"},false,["encrypt","decrypt"]);
  return {key,tag:hex(await sha("tag:"+rawHex)).slice(0,32),vk:hex(await sha("vk:"+rawHex)).slice(0,32)};
}
async function legacyCtx(k){ /* device keys from the previous version */
  const key=await crypto.subtle.importKey("raw",await sha("key:"+k),{name:"AES-GCM"},false,["encrypt","decrypt"]);
  return {key,tag:hex(await sha("tag:"+k)).slice(0,32)};
}
async function loadAcct(){
  if(!me){ acct=null; acctFor=null; return null; }
  if(acct&&acctFor===me) return acct;
  const raw=load("trip-ak-"+me); const p=person(me);
  if(!raw||!p||!p.vk){ acct=null; acctFor=null; return null; }
  const c=await ctxFromRaw(raw);
  if(c.vk!==p.vk){ store("trip-ak-"+me,""); acct=null; acctFor=null; return null; }   /* password changed elsewhere */
  acct=c; acctFor=me; return acct;
}
async function decryptMine(c){
  const out=[];
  for(const r of RAW){ if(r.tag!==c.tag) continue;
    try{ const plainBuf=await crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(r.iv)},c.key,unb64(r.data)); out.push({...JSON.parse(dec.decode(plainBuf)),id:r.id}); }catch(e){} }
  return out;
}
async function encFor(c,obj){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const data=await crypto.subtle.encrypt({name:"AES-GCM",iv},c.key,enc.encode(JSON.stringify(obj)));
  return {kind:"private",amount:1,tag:c.tag,iv:b64(iv),data:b64(data)};
}
async function refreshPersonal(){
  const seq=++pSeq;
  if(!me||!window.crypto||!crypto.subtle){ P=[]; pLoaded=true; return; }
  try{
    const c=await loadAcct();
    const out= c? await decryptMine(c) : [];
    if(seq!==pSeq) return;
    const mine=out.filter(x=>tripOf(x)===curTrip);
    CASH=mine.filter(x=>x.type==="cash");
    const fees=CASH.filter(x=>x.sub==="withdraw"&&+x.fee>0).map(x=>({id:"fee-"+x.id,_wid:x.id,_fee:true,desc:"עמלת משיכה",amount:+x.fee,cur:x.feeCur||x.cur,cat:"other",catLabel:"עמלות משיכה",pm:"fee",date:x.date,createdAt:x.createdAt,tz:x.tz,loc:x.loc}));
    P=[...mine.filter(x=>x.type!=="cash"),...fees]; pLoaded=true; if(view==="personal") renderAll();
  }catch(e){ console.error(e); pLoaded=true; }
}
async function setPassword(pw){
  /* create or replace the account password; moves existing personal items to the new key */
  const raw=await deriveRaw(me,pw); const nc=await ctxFromRaw(raw);
  const moving=[];
  const old=await loadAcct(); if(old) moving.push(...(await decryptMine(old)));
  const legacy=load("trip-pk-"+me); if(legacy){ moving.push(...(await decryptMine(await legacyCtx(legacy)))); }
  const batch=db.batch();
  for(const it of moving){ const {id,...rest}=it; batch.set(EXP().doc(id),await encFor(nc,rest)); }
  await batch.commit();
  await db.runTransaction(async tx=>{ const s=await tx.get(metaRef()); const people=((s.data()?.people)||[]).map(p=>p.id===me?{...p,vk:nc.vk}:p); tx.update(metaRef(),{people}); });
  const p=person(me); if(p) p.vk=nc.vk;
  store("trip-ak-"+me,raw); store("trip-pk-"+me,""); acct=nc; acctFor=me;
}
async function unlock(pw){
  const raw=await deriveRaw(me,pw); const c=await ctxFromRaw(raw);
  if(c.vk!==person(me)?.vk) return false;
  store("trip-ak-"+me,raw); acct=c; acctFor=me; return true;
}
function renderLock(){
  const p=person(me); const has=!!p?.vk;
  $("lockTitle").textContent= has? "שלום "+nm(me)+" 🔐" : "בוא/י ניצור לך חשבון אישי";
  $("lockText").textContent= has? "מכניסים את הסיסמה של החשבון האישי. צריך לעשות את זה פעם אחת בכל מכשיר." :
    "בוחרים סיסמה (לפחות 4 תווים). איתה ההוצאות האישיות שלך יופיעו בכל טלפון ובכל דפדפן, ואף אחד אחר לא יוכל לקרוא אותן. חשוב לזכור אותה: אי אפשר לשחזר סיסמה שנשכחה.";
  $("lockPw2Wrap").hidden=has; $("lockBtn").textContent= has? "כניסה" : "יצירת חשבון";
  $("lockPw").setAttribute("autocomplete",has?"current-password":"new-password");
}
$("lockBtn").onclick=async()=>{
  showErr("lockErr"); const pw=$("lockPw").value; const p=person(me);
  if(pw.length<4) return showErr("lockErr","הסיסמה צריכה להיות לפחות 4 תווים");
  $("lockBtn").disabled=true; $("lockBtn").textContent="רגע…";
  try{
    if(p?.vk){ const ok=await unlock(pw); if(!ok){ showErr("lockErr","הסיסמה לא נכונה. נסו שוב."); return; } }
    else { if(pw!==$("lockPw2").value) return showErr("lockErr","שתי הסיסמאות לא זהות"); await setPassword(pw); }
    $("lockPw").value=""; $("lockPw2").value=""; await refreshPersonal(); renderAll();
    if(QUICK==="me"&&view==="personal"&&!window.__qOpened){ window.__qOpened=true; setTimeout(openAdd,250); }
  }catch(e){ console.error(e); showErr("lockErr","משהו השתבש. בדקו את החיבור ונסו שוב."); }
  finally{ $("lockBtn").disabled=false; renderLock(); }
};
$("lockPw").addEventListener("keydown",e=>{ if(e.key==="Enter"){ if(!$("lockPw2Wrap").hidden) $("lockPw2").focus(); else $("lockBtn").click(); } });
$("lockPw2").addEventListener("keydown",e=>{ if(e.key==="Enter") $("lockBtn").click(); });

/* ---- render: personal ---- */
function myShareItems(){
  const out=[];
  for(const it of S.items){ if(it.kind==="transfer") continue; const sh=sharesOf(it)[me]||0; if(sh>0) out.push({...it,amount:(+it.amount||0)*sh}); }
  return out;
}
function renderPersonal(){
  if(view!=="personal"||!me) return;
  const locked=!(acct&&acctFor===me);
  $("lockCard").hidden=!locked; $("pBody").hidden=locked;
  if(locked){ renderLock(); return; }
  const shared=myShareItems();
  let own=0, share=0, today=0; const cats={}; const td=todayStr();
  const ym=thisMonth();
  for(const it of P){ const v=conv(+it.amount||0,it.cur,showCur); own+=v; if(monthOf(it)===ym){ const k=catKey(it); cats[k]=(cats[k]||0)+v; } if(it.date===td) today+=v; }
  for(const it of shared){ const v=conv(it.amount,it.cur,showCur); share+=v; if(monthOf(it)===ym){ const k=catKey(it); cats[k]=(cats[k]||0)+v; } if(it.date===td) today+=v; }
  $("pCatTitle").textContent="📊 לאן הלך הכסף שלך ב"+monthName(ym,true).split(" ")[0];
  $("pLbl").textContent="ההוצאות של "+nm(me)+" בטיול · רק "+(fem(me)?"את רואה":"אתה רואה")+" את המסך הזה";
  $("pOnly").textContent= fem(me)?"רק את רואה":"רק אתה רואה";
  money($("pAll"),own+share,showCur); money($("pOwn"),own,showCur); money($("pShare"),share,showCur); money($("pToday"),today,showCur);
  showinRow($("pShowin"));
  renderDaily(); renderCash();
  catBars("pCats","pCatPanel",cats);
  if(!cur.pCur) cur.pCur=S.localCur; setCurBtn("pCur",cur.pCur);
  $("pLoc").textContent=locName(pform.loc||defLoc());
  seg($("pPm"),[["cash","💵 מזומן"],["card","💳 כרטיס"]],v=>v===(pform.pm||"cash"),v=>{pform.pm=v;renderPersonal();});
  seg($("pCat"),CATS,v=>v===pform.cat,v=>{pform.cat=v;renderPersonal(); if(v==="other") $("pCatLabel").focus();});
  $("pCatLabel").hidden=pform.cat!=="other";
  convHint("pAmt",cur.pCur,"pConv");
  const L=$("pLedger"); L.innerHTML="";
  const pq=norm($("pSearch").value);
  const list=P.filter(it=>matches(it,pq)).sort((x,y)=>(y.date||"").localeCompare(x.date||"")||(y.createdAt||0)-(x.createdAt||0));
  if(!list.length){ const e=document.createElement("div");
    if(pLoaded&&!pq) richEmpty(e,"🔐","עוד אין הוצאות אישיות","מזכרות, קפה, עיסוי. רק את/ה רואה אותן.","➕ הוצאה אישית",openAdd);
    else { e.className="empty"; e.textContent=!pLoaded?"טוען…":"לא נמצאה הוצאה שמתאימה לחיפוש"; }
    L.appendChild(e); }
  let curDay=null, box=null;
  for(const it of list){
    if(it.date!==curDay){ curDay=it.date; box=document.createElement("div"); box.className="day"; const h=document.createElement("h3"); dayHead(h,it.date,""); box.appendChild(h); L.appendChild(box); }
    const r=document.createElement("div"); r.className="row"+(isNew(it.id)?" enter":""); r.dataset.id=it.id;
    const dot=catTile(it,null);
    const main=document.createElement("div"); main.className="main";
    const t=document.createElement("div"); t.className="t"; t.textContent=it.desc||"הוצאה";
    const m=document.createElement("div"); m.className="m"; m.textContent=withTime(it,"אישי · "+catName(catKey(it)).replace(/^\S+\s/,""));
    main.append(t,m);
    const right=document.createElement("div"); right.className="r";
    const b=document.createElement("b"); b.className="num"; b.textContent=fmt(+it.amount,it.cur); right.appendChild(b);
    if(it.cur!=="ILS"){ const s=document.createElement("span"); s.className="m num"; s.textContent="≈ "+fmt(conv(+it.amount,it.cur,"ILS"),"ILS"); right.appendChild(s); }
    const acts=document.createElement("div"); acts.className="acts";
    if(it._fee){ const n=document.createElement("span"); n.className="m fee-note"; n.textContent="🏧 מתוך משיכה בארנק"; right.appendChild(n);
      const w=CASH.find(x=>x.id===it._wid);
      r.append(dot,main,right); r.dataset.id=it.id;
      box.appendChild(w ? swipeWrap(r,it,true,{again:()=>againCash(w),againLabel:"🔁 עוד משיכה כזו",del:()=>delItem({id:w.id,desc:"משיכה מכספומט"},true),delLabel:"🗑 מחיקת המשיכה"}) : r); continue; }
    const e=document.createElement("button"); e.className="link"; e.type="button"; e.textContent="עריכה"; e.onclick=()=>pStartEdit(it); acts.appendChild(e);
    const ag=document.createElement("button"); ag.className="link"; ag.type="button"; ag.textContent="🔁 שוב"; ag.onclick=()=>again(it,true); acts.prepend(ag);
    acts.appendChild(delBtn(()=>delItem(it,true)));
    right.appendChild(acts);
    r.append(dot,main,right); tapRow(r); box.appendChild(swipeWrap(r,it,true));
  }
}

/* ================= playful layer ================= */
/* swipe a row: right = repeat for today, left = delete (with undo) */
function richEmpty(e,ill,title,text,cta,fn){
  e.className="empty rich"; const i=document.createElement("span"); i.className="ill"; i.textContent=ill;
  const b=document.createElement("b"); b.textContent=title; const t=document.createElement("span"); t.textContent=text; e.append(i,b,t);
  if(canWrite&&cta){ const k=document.createElement("button"); k.type="button"; k.className="btn primary"; k.textContent=cta; k.onclick=fn; e.appendChild(k); }
}
/* tap a row to show its actions (edit, again, delete); tap again or another row to hide */
function tapRow(r){
  if(!r.querySelector(".acts button")) return;
  r.classList.add("tappable"); r.tabIndex=0; r.setAttribute("aria-expanded","false");
  const toggle=e=>{ if(e.target.closest(".acts")) return; const open=!r.classList.contains("open");
    document.querySelectorAll(".row.open").forEach(x=>{ x.classList.remove("open"); x.setAttribute("aria-expanded","false"); });
    if(open){ r.classList.add("open"); r.setAttribute("aria-expanded","true"); buzz(5); } };
  r.addEventListener("click",toggle);
  r.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggle(e); } });
}
function swipeWrap(r,it,personal,o){
  o=o||{};
  const w=document.createElement("div"); w.className="swipe";
  if(!canWrite||(it._fee&&!o.del)) { w.appendChild(r); return w; }
  const doAgain= "again" in o ? o.again : (it.kind!=="transfer" ? ()=>again(it,personal) : null);
  const doDel= o.del || (()=>delItem(it,personal));
  const canAgain=!!doAgain;
  w.innerHTML='<div class="sw-bg"><span class="sw-again"></span><span class="sw-del"></span></div>';
  w.querySelector(".sw-again").textContent= canAgain ? (o.againLabel||"🔁 שוב להיום") : "";
  w.querySelector(".sw-del").textContent= o.delLabel || (it.kind==="transfer"?"↩️ ביטול":"🗑 מחיקה");
  w.appendChild(r);
  let x0=0,y0=0,dx=0,drag=false,locked=false,id=null,armed=0;
  const TH=88;
  r.addEventListener("pointerdown",e=>{ if(e.target.closest("button")) return; x0=e.clientX; y0=e.clientY; dx=0; drag=true; locked=false; id=e.pointerId; armed=0; });
  r.addEventListener("pointermove",e=>{
    if(!drag||e.pointerId!==id) return; const mx=e.clientX-x0, my=e.clientY-y0;
    if(!locked){ if(Math.abs(mx)<8&&Math.abs(my)<8) return; if(Math.abs(my)>Math.abs(mx)){ drag=false; return; } locked=true; try{ r.setPointerCapture(id); }catch(_){} w.classList.add("dragging"); }
    dx= mx>0&&!canAgain ? mx*.2 : mx; const ease=Math.sign(dx)*Math.min(Math.abs(dx),140+Math.max(0,Math.abs(dx)-140)*.25);
    r.style.transform="translateX("+ease+"px)"; w.classList.toggle("to-again",dx>0); w.classList.toggle("to-del",dx<0);
    const now= Math.abs(dx)>TH ? Math.sign(dx) : 0; if(now!==armed){ armed=now; w.classList.toggle("armed",!!now); if(now) buzz(10); }
  });
  const end=()=>{ if(!drag) return; drag=false; w.classList.remove("dragging");
    const act=armed; r.style.transform=""; w.classList.remove("armed","to-again","to-del");
    if(act>0&&canAgain) doAgain(); else if(act<0) doDel(); };
  r.addEventListener("pointerup",end); r.addEventListener("pointercancel",end);
  return w;
}

/* ripple from the touch point */
document.addEventListener("pointerdown",e=>{
  if(calm()) return; const t=e.target.closest(".btn,.chip,.seg button,.pill,.curbtn,.fab,.curitem,.hero-place"); if(!t||t.disabled) return;
  const r=t.getBoundingClientRect(), s=Math.max(r.width,r.height)*2.2, d=document.createElement("span"); d.className="ripple";
  d.style.width=d.style.height=s+"px"; d.style.left=(e.clientX-r.left-s/2)+"px"; d.style.top=(e.clientY-r.top-s/2)+"px";
  t.appendChild(d); setTimeout(()=>d.remove(),600);
},{passive:true});

/* category emoji burst when an expense is saved */
function burst(from,emoji){
  if(calm()||!from) return; const r=from.getBoundingClientRect(); const box=document.createElement("div"); box.className="burst"; document.body.appendChild(box);
  for(let i=0;i<10;i++){ const s=document.createElement("span"); s.textContent=emoji; s.style.left=(r.left+r.width/2)+"px"; s.style.top=(r.top+r.height/2)+"px"; box.appendChild(s);
    const a=Math.PI*(1.1+Math.random()*.8), dist=70+Math.random()*90;
    s.animate([{transform:"translate(-50%,-50%) scale(.4)",opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px)) scale(1.15)`,opacity:1,offset:.6},{transform:`translate(calc(-50% + ${Math.cos(a)*dist*1.2}px),calc(-50% + ${Math.sin(a)*dist*1.2+40}px)) scale(.8)`,opacity:0}],{duration:900+Math.random()*300,easing:"cubic-bezier(.2,.8,.3,1)",fill:"forwards"}); }
  setTimeout(()=>box.remove(),1400);
}

/* streak milestones */
function checkStreak(){
  if(!me) return; const n=streak(); const k="trip-streak-"+me; const prev=+load(k)||0; store(k,String(n));
  if(n>prev&&n>=2){ setTimeout(()=>{ toast("🔥 רצף של "+n+" ימים! ממשיכים ככה"); if(n%5===0) confetti(); buzz([10,50,10,50,20]); },700); }
}

/* scroll: hero parallax, compact bar, back-to-top, reveal on scroll */
let ticking=false;
function onScroll(){
  ticking=false; const y=window.scrollY;
  $("fabUp").hidden= y<400;
  if(!calm()){ const sc=document.querySelector(".hero .scene"), tx=document.querySelector(".hero-txt");
    if(sc&&y<400){ sc.style.transform="translateY("+(y*.35)+"px) scale("+(1+y/1600)+")"; tx.style.opacity=String(Math.max(0,1-y/170)); tx.style.transform="translateY("+(y*.15)+"px)"; } }
  const t=$("ticket"); const mini=$("mini");
  if(view!=="shared"||!loaded||!t){ mini.classList.remove("show"); return; }
  const b=t.getBoundingClientRect().bottom; mini.classList.toggle("show",b<0);
}
window.addEventListener("scroll",()=>{ if(!ticking){ ticking=true; requestAnimationFrame(onScroll); } },{passive:true});
function renderMini(){
  const c=compute(); const mine=me? c.debts.filter(d=>d.from===me||d.to===me):c.debts; let txt="אתם מאוזנים 🎉";
  if(mine.length===1){ const d=mine[0]; txt= me&&d.to===me ? nm(d.from)+" "+g.owes(d.from)+" לך "+fmt(d.amt,showCur) : me ? g.you(me)+" "+g.owes(me)+" ל"+nm(d.to)+" "+fmt(d.amt,showCur) : nm(d.from)+" ← "+nm(d.to)+" "+fmt(d.amt,showCur); }
  else if(mine.length>1&&me){ const b=c.bal[me]||0; txt= b>0?"מגיע לך "+fmt(b,showCur):g.you(me)+" "+g.owes(me)+" "+fmt(-b,showCur); }
  $("miniTxt").textContent=txt; $("miniDay").textContent=$("heroDay").textContent+" "+$("heroSince").textContent;
}
$("mini").onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
const revealed=new WeakSet();
const io=("IntersectionObserver" in window)? new IntersectionObserver(es=>{ for(const e of es){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } } },{rootMargin:"0px 0px -6% 0px",threshold:.08}) : null;
function watchReveal(){
  if(!io||calm()) return;
  document.querySelectorAll("#viewShared > section, #viewPersonal section, #viewStats > section, .insight").forEach(el=>{
    if(revealed.has(el)) return; revealed.add(el);
    const r=el.getBoundingClientRect(); if(r.top<innerHeight) return;   /* already on screen: leave it alone */
    el.classList.add("rv"); io.observe(el);
  });
}

/* pull down at the top to refresh the rates */
(()=>{
  let y0=null, pull=0; const P=$("ptr");
  window.addEventListener("touchstart",e=>{ y0= window.scrollY<=0 && !document.querySelector(".sheet-bg:not([hidden])") ? e.touches[0].clientY : null; pull=0; },{passive:true});
  window.addEventListener("touchmove",e=>{ if(y0==null) return; pull=Math.max(0,e.touches[0].clientY-y0); if(pull<=0) return;
    const d=Math.min(110,pull*.5); P.style.transform="translate(-50%,"+(d-50)+"px) rotate("+(d*3)+"deg)"; P.style.opacity=String(Math.min(1,d/60)); P.classList.toggle("ready",d>=70); },{passive:true});
  window.addEventListener("touchend",async()=>{ if(y0==null) return; const go=P.classList.contains("ready"); y0=null;
    if(go){ P.classList.add("spin"); buzz(12); await refreshRates(); checkUpdate&&checkUpdate(); setTimeout(()=>{ P.classList.remove("spin","ready"); P.style.transform=""; P.style.opacity="0"; toast("✈️ רוענן: שער עדכני "+new Date().toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"})); },600); }
    else { P.classList.remove("ready"); P.style.transform=""; P.style.opacity="0"; } },{passive:true});
})();


/* ================= "the trip in review": story slides ================= */
let RC=null;
function recapData(loc){
  const inLoc=it=> loc ? locOf(it)===loc : locOf(it)!=="prep";
  const items=S.items.filter(it=>it.kind!=="transfer"&&inLoc(it));
  const V=it=>conv(+it.amount||0,it.cur,"ILS");
  const total=items.reduce((s,it)=>s+V(it),0);
  const dates=[...new Set(items.map(it=>it.date).filter(Boolean))].sort();
  const days= dates.length? daysBetween(dates[0],dates[dates.length-1])+1 : 0;
  const countries=[...new Set(items.map(locOf).filter(c=>CTRY[c]))];
  const cats={}; for(const it of items){ const k=catKey(it); cats[k]=(cats[k]||0)+V(it); }
  const topCat=Object.entries(cats).sort((x,y)=>y[1]-x[1])[0];
  const byDay={}; for(const it of items){ (byDay[it.date]=byDay[it.date]||[]).push(it); }
  const bigDay=Object.entries(byDay).map(([d,l])=>[d,l.reduce((s,it)=>s+V(it),0),l]).sort((x,y)=>y[1]-x[1])[0];
  const bigOne=[...items].sort((x,y)=>V(y)-V(x))[0];
  const paid={}; for(const it of items){ paid[it.payer]=(paid[it.payer]||0)+V(it); }
  const share=me? myShareItems().filter(inLoc).reduce((s,it)=>s+conv(it.amount,it.cur,"ILS"),0) : 0;
  const alone=me&&acct&&acctFor===me ? P.filter(inLoc).reduce((s,it)=>s+V(it),0) : null;
  const transfers=S.items.filter(it=>it.kind==="transfer"&&inLoc(it)).length;
  return {loc,items,total,dates,days,countries,topCat,cats,bigDay,bigOne,paid,share,alone,transfers,avg: days? total/days : 0};
}
function recapSlides(d){
  const title= d.loc ? locName(d.loc) : (S.trip||"הטיול שלנו");
  const sd=s=>{ const [y,m,dd]=s.split("-").map(Number); return dd+"."+m; };
  const range= d.dates.length ? "מ-"+sd(d.dates[0])+" עד "+sd(d.dates[d.dates.length-1]) : "";
  if(d.items.length<3) return [{bg:"g1",big:"⏳",h:"עוד קצת סבלנות",p:"הסיכום נבנה מההוצאות שלכם. אחרי כמה ימי טיול יהיה פה סיפור שלם."}];
  const S2=[];
  S2.push({bg:"g1",kick:d.loc?"הסיכום של":"הטיול שלנו בסיכום",h:title,p:range,big:"🎬"});
  S2.push({bg:"g2",kick:"יצאנו לדרך",num:d.days,unit:d.days===1?"יום":"ימים",p:d.countries.length>1?d.countries.length+" מדינות: "+d.countries.map(c=>CTRY[c].split(" ")[0]).join(" "):(d.countries[0]?CTRY[d.countries[0]]:"")});
  S2.push({bg:"g3",kick:"הוצאנו ביחד",money:d.total,p:"בממוצע "+fmt(d.avg,"ILS")+" ליום · "+d.items.length+" הוצאות"});
  if(d.topCat) S2.push({bg:"g4",kick:"הכי הרבה הלך על",big:catName(d.topCat[0]).split(" ")[0],h:catName(d.topCat[0]).split(" ").slice(1).join(" "),p:Math.round(d.topCat[1]/d.total*100)+"% מכל ההוצאות · "+fmt(d.topCat[1],"ILS")});
  if(d.bigDay) S2.push({bg:"g5",kick:"היום הכי יקר",h:dayLabel(d.bigDay[0]),money:d.bigDay[1],p:d.bigDay[2].slice().sort((x,y)=>conv(+y.amount,y.cur,"ILS")-conv(+x.amount,x.cur,"ILS")).slice(0,3).map(it=>it.desc).join(" · ")});
  if(d.bigOne) S2.push({bg:"g6",kick:"ההוצאה הכי גדולה",big:catEmoji(d.bigOne),h:d.bigOne.desc||"הוצאה",p:fmt(+d.bigOne.amount,d.bigOne.cur)+(d.bigOne.cur!=="ILS"?" ≈ "+fmt(conv(+d.bigOne.amount,d.bigOne.cur,"ILS"),"ILS"):"")});
  const pe=Object.entries(d.paid).sort((x,y)=>y[1]-x[1]);
  if(pe.length>1) S2.push({bg:"g2",kick:"מי פתח יותר את הארנק",bars:pe.map(([id,v])=>[nm(id),Math.round(v/d.total*100)]),p:nm(pe[0][0])+" "+g.paid(pe[0][0])+" "+Math.round(pe[0][1]/d.total*100)+"% מההוצאות"});
  if(me) S2.push({bg:"g3",kick:"ואת/ה?",money:d.share+(d.alone||0),p:(d.alone!=null?"🙋 לבד "+fmt(d.alone,"ILS")+" · ":"")+"👫 ביחד "+fmt(d.share,"ILS")});
  S2.push({bg:"g4",kick:"בשורה התחתונה",h:d.items.length+" הוצאות · "+d.transfers+" העברות",p:"🔥 הרצף הכי ארוך שלכם: "+bestStreak(d)+" ימים של רישום"});
  S2.push({bg:"g1",end:true,kick:"היה שווה כל שקל 💜",h:title,p:"שתפו את הסיכום"});
  return S2;
}
function bestStreak(d){ let best=0,run=0,prev=null; for(const x of d.dates){ run= prev&&daysBetween(prev,x)===1? run+1 : 1; best=Math.max(best,run); prev=x; } return best; }
function openRecap(loc){
  const d=recapData(loc||null); const slides=recapSlides(d); RC={d,slides,i:0,timer:null};
  const R=$("recap"); R.hidden=false; document.body.style.overflow="hidden"; buzz(10);
  const bars=$("rcBars"); bars.innerHTML=""; slides.forEach(()=>{ const b=document.createElement("span"); b.innerHTML="<i></i>"; bars.appendChild(b); });
  showSlide(0);
}
function closeRecap(){ if(!RC) return; clearTimeout(RC.timer); $("recap").hidden=true; document.body.style.overflow=""; RC=null; }
function showSlide(i){
  if(!RC) return; clearTimeout(RC.timer);
  if(i<0) i=0; if(i>=RC.slides.length){ closeRecap(); return; }
  RC.i=i; const s=RC.slides[i]; const B=$("rcBody"); $("recap").dataset.bg=s.bg;
  [...$("rcBars").children].forEach((b,k)=>{ b.className= k<i?"done":k===i?"now":""; });
  B.innerHTML=""; const add=(tag,cls,txt)=>{ const e=document.createElement(tag); e.className=cls; if(txt!=null) e.textContent=txt; B.appendChild(e); return e; };
  if(s.kick) add("div","rc-kick",s.kick);
  if(s.big) add("div","rc-big",s.big);
  if(s.num!=null){ const n=add("div","rc-num",""); const u=add("div","rc-unit",s.unit); countUp(n,s.num,v=>String(Math.round(v))); }
  if(s.money!=null){ const n=add("div","rc-num",""); countUp(n,s.money,v=>fmt(v,"ILS")); }
  if(s.h) add("div","rc-h",s.h);
  if(s.bars){ const w=add("div","rc-pbars",null); for(const [n,pct] of s.bars){ const r=document.createElement("div"); r.className="rc-bar"; r.innerHTML='<span></span><b><i></i></b><em></em>'; r.children[0].textContent=n; r.querySelector("em").textContent=pct+"%"; w.appendChild(r); requestAnimationFrame(()=>requestAnimationFrame(()=>{ r.querySelector("i").style.width=pct+"%"; })); } }
  if(s.p) add("div","rc-p",s.p);
  if(s.end){ const b=add("button","btn rc-share","📤 שיתוף הסיכום"); b.type="button"; b.onclick=e=>{ e.stopPropagation(); shareRecap(); }; if(!calm()) confetti(); }
  if(!s.end) RC.timer=setTimeout(()=>showSlide(RC.i+1),5200);
}
function countUp(el,to,f){ if(calm()){ el.textContent=f(to); return; } const t0=performance.now(), dur=1100; const step=n=>{ const k=Math.min(1,(n-t0)/dur), e=1-Math.pow(1-k,3); el.textContent=f(to*e); if(k<1&&el.isConnected) requestAnimationFrame(step); }; requestAnimationFrame(step); }
$("rcClose").onclick=e=>{ e.stopPropagation(); closeRecap(); };
$("recap").addEventListener("click",e=>{ if(!RC||e.target.closest("button")) return; const x=e.clientX/innerWidth; buzz(6); showSlide(RC.i+(x>.66?-1:1)); });
document.addEventListener("keydown",e=>{ if(!RC) return; if(e.key==="Escape") closeRecap(); if(e.key==="ArrowLeft") showSlide(RC.i+1); if(e.key==="ArrowRight") showSlide(RC.i-1); });
$("recapBtn").onclick=()=>openRecap(null);
async function shareRecap(){
  if(!RC) return; const d=RC.d; const W=1080,H=1350; const c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d");
  try{ await document.fonts.ready; }catch(e){}
  const gr=x.createLinearGradient(0,0,W,H); gr.addColorStop(0,"#6C4BFF"); gr.addColorStop(.55,"#B84DFF"); gr.addColorStop(1,"#FF4D8D"); x.fillStyle=gr; x.fillRect(0,0,W,H);
  x.fillStyle="rgba(255,255,255,.10)"; x.beginPath(); x.arc(160,140,360,0,Math.PI*2); x.fill(); x.beginPath(); x.arc(W-60,H-120,260,0,Math.PI*2); x.fill();
  x.direction="rtl"; x.textAlign="right"; x.fillStyle="#fff"; const R=W-90;
  const T=(txt,size,y,w)=>{ x.font=(w||600)+" "+size+"px Assistant, sans-serif"; x.fillText(txt,R,y); };
  T(d.loc?"הסיכום של":"הטיול שלנו בסיכום",44,150,500);
  T(d.loc?locName(d.loc):(S.trip||"הטיול שלנו"),78,250,700);
  const rows=[["🗓️",d.days+" ימים"],["🌏",d.countries.length+" "+(d.countries.length===1?"מדינה":"מדינות")+"  "+d.countries.map(c=>CTRY[c].split(" ")[0]).join(" ")],["💸","הוצאנו ביחד "+fmt(d.total,"ILS")],["📊","ממוצע ליום "+fmt(d.avg,"ILS")]];
  if(d.topCat) rows.push([catName(d.topCat[0]).split(" ")[0],"הכי הרבה על "+catName(d.topCat[0]).split(" ").slice(1).join(" ")+" ("+Math.round(d.topCat[1]/d.total*100)+"%)"]);
  if(d.bigOne) rows.push(["🏆","ההוצאה הגדולה: "+(d.bigOne.desc||"")]);
  let y=430; for(const [e,t] of rows){ x.font="64px sans-serif"; x.fillText(e,R,y); T(t,48,y-6,500); y+=130; }
  x.textAlign="center"; x.font="500 36px Assistant, sans-serif"; x.fillStyle="rgba(255,255,255,.85)"; x.fillText("גלי ויאירוש במזרח 🕺🏼",W/2,H-80);
  const blob=await new Promise(r=>c.toBlob(r,"image/png")); const file=new File([blob],"trip-recap.png",{type:"image/png"});
  try{ if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:"הטיול שלנו בסיכום"}); return; } }catch(e){ if(e&&e.name==="AbortError") return; }
  const u=URL.createObjectURL(file); const l=document.createElement("a"); l.href=u; l.download="trip-recap.png"; document.body.appendChild(l); l.click(); l.remove(); setTimeout(()=>URL.revokeObjectURL(u),4000);
}

/* ---- visual layer: category tiles, hero, insights ---- */
const CAT_TINT={food:"#FF8A3D",stay:"#6C4BFF",transport:"#14B8A6",fun:"#FF4D8D",party:"#B84DFF",laundry:"#3B82F6",shop:"#F59E0B",other:"#8B85A8"};
function catEmoji(it){ if(it.kind==="transfer") return "💸"; if(it._fee) return "🏧"; const k=it.cat||"other"; const l=(CATNAME[k]||OLD_CATS[k]||"✨").split(" ")[0]; return l; }
function catTile(it,payer){
  const d=document.createElement("div"); d.className="cattile"; d.style.setProperty("--tint",it.kind==="transfer"?"#0E9F7E":(CAT_TINT[it.cat]||CAT_TINT.other)); d.textContent=catEmoji(it);
  if(payer){ const w=document.createElement("span"); w.className="who c"+pidx(payer); w.textContent=nm(payer).trim().charAt(0); d.appendChild(w); }
  return d;
}
/* ---- trips: every expense belongs to one; the first trip ("t1") holds everything written before trips existed ---- */
let META={}, ALL=[], curTrip="t1";
function tripOf(x){ return x.trip||"t1"; }
function tripsList(){ const d=META||{}; return (d.trips&&d.trips.length)? d.trips : [{id:"t1",name:d.trip||"",localCur:d.localCur||"THB",startDate:d.startDate||""}]; }
function activeTrip(){ const L=tripsList(); return (META&&META.active&&L.find(t=>t.id===META.active))? META.active : L[L.length-1].id; }
function tripById(id){ return tripsList().find(t=>t.id===id)||tripsList()[0]; }
function applyTrip(){
  const L=tripsList(), act=activeTrip(), seen=load("trip-active-seen");
  let v=load("trip-view");
  /* follow a newly opened trip unless this phone deliberately looks at another one */
  if(!v||!L.find(t=>t.id===v)||(seen&&seen!==act&&v===seen)) v=act;
  store("trip-active-seen",act); curTrip=v; store("trip-view",v);
  const T=tripById(curTrip); S.trip=T.name||""; S.startDate=T.startDate||""; S.dest=CUR[T.localCur]?T.localCur:"THB"; homeMode();
}
/* until the flight you're at home: shekels, Israel, and expenses count as "before the trip" */
function homeMode(){ const st=tripStart(); S.home=!!(st&&todayStr()<st); S.localCur= S.home ? "ILS" : (S.dest||S.localCur); }
function defLoc(){ return S.home ? "prep" : S.localCur; }
function splitItems(){
  const live=ALL.filter(x=>!x.deleted&&tripOf(x)===curTrip), gone=ALL.filter(x=>x.deleted&&tripOf(x)===curTrip);
  S.items=live.filter(x=>x.kind!=="private"); RAW=ALL.filter(x=>!x.deleted&&x.kind==="private");
  BIN=gone.filter(x=>x.kind!=="private"); BINRAW=ALL.filter(x=>x.deleted&&x.kind==="private");
  return ALL.filter(x=>x.deleted);
}
async function updateTrips(fn){
  return run(()=>db.runTransaction(async tx=>{ const s=await tx.get(metaRef()); const d=s.data()||{};
    const list=(d.trips&&d.trips.length)? d.trips.map(t=>({...t})) : [{id:"t1",name:d.trip||"",localCur:d.localCur||"THB",startDate:d.startDate||""}];
    const out=fn(list,d)||{}; const patch={trips:list,...out};
    const t1=list.find(t=>t.id==="t1"); if(t1){ patch.trip=t1.name; patch.localCur=t1.localCur; if(t1.startDate) patch.startDate=t1.startDate; }
    tx.update(metaRef(),patch); }));
}
const patchTrip=(id,patch)=>updateTrips(list=>{ const t=list.find(x=>x.id===id); if(t) Object.assign(t,patch); });
function switchTrip(id){
  viewSwap(()=>{ curTrip=id; store("trip-view",id); const T=tripById(id); S.trip=T.name||""; S.startDate=T.startDate||""; S.dest=CUR[T.localCur]?T.localCur:"THB"; homeMode();
    cur.fCur=S.localCur; cur.pCur=S.localCur; cur.cFrom=S.localCur; SEEN.clear(); seenReady=false; setTimeout(()=>seenReady=true,800);
    splitItems(); refreshPersonal(); renderAll(); window.scrollTo({top:0}); });
  toast("🧳 "+(tripById(id).name||"הטיול")+(id===activeTrip()?"":" · מצב ארכיון"));
}

/* the trip starts on 12.11.2026 unless changed in settings */
const TRIP_START="2026-11-12";
function tripStart(){ if(S.startDate) return S.startDate; if(TRIP_START&&curTrip==="t1") return TRIP_START; const ds=S.items.filter(it=>it.kind!=="transfer"&&locOf(it)!=="prep"&&it.date).map(it=>it.date).sort(); return ds[0]||null; }
function daysBetween(a,b){ const [y1,m1,d1]=a.split("-").map(Number),[y2,m2,d2]=b.split("-").map(Number); return Math.round((Date.UTC(y2,m2-1,d2)-Date.UTC(y1,m1-1,d1))/864e5); }
function streak(){
  const days=new Set([...S.items.filter(it=>it.kind!=="transfer").map(it=>it.date),...P.map(it=>it.date)]);
  let n=0, d=todayStr(); if(!days.has(d)){ const y=new Date(); y.setDate(y.getDate()-1); d=y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0"); }
  while(days.has(d)){ n++; const [Y,M,D]=d.split("-").map(Number); const t=new Date(Y,M-1,D-1); d=t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0"); }
  return n;
}
const SCENES={home:["ILS"],beach:["PHP","IDR","MYR","MVR","FJD","LKR","BND"],karst:["VND","LAK"],fuji:["JPY"],city:["SGD","HKD","KRW","CNY","TWD","MOP","AED","USD","EUR","GBP","CAD","AUD","NZD","QAR","OMR"],peaks:["NPR","BTN","KGS","UZS","KZT","MNT","GEL","AMD","CHF","ISK","NOK"],taj:["INR","PKR","BDT"]};
function sceneFor(c){ for(const k in SCENES) if(SCENES[k].includes(c)) return k; return "temple"; }
function renderHero(){
  const H=$("hero"); H.hidden= !loaded || view==="stats";
  if(H.hidden) return;
  H.dataset.scene=sceneFor(S.localCur);
  const k=S.localCur; const name=(CTRY[k]||CUR[k]?.name||k); const flag=name.split(" ")[0]; const country=CTRY[k]?name.slice(flag.length+1):name;
  $("heroFlag").textContent=CTRY[k]?flag:"🌏"; $("heroCountry").textContent=CTRY[k]?country:name;
  const st=tripStart(); const diff= st? daysBetween(st,todayStr()) : 0;
  if(st&&diff<0){ const left=-diff; const to=(CTRY[S.dest]||"").split(" ").slice(1).join(" "); $("heroDay").textContent= left===1?"מחר!":"עוד "+left; $("heroSince").textContent= (left===1?"טסים":"ימים לטיסה")+(to?" ל"+to:"")+" ✈️"; }
  else { $("heroDay").textContent="יום "+(diff+1); $("heroSince").textContent="לטיול"; }
  const countries=new Set(S.items.filter(it=>it.kind!=="transfer").map(locOf).filter(c=>CTRY[c])).size;
  const C=$("heroChips"); C.innerHTML="";
  const chip=(txt,hot)=>{ const s=document.createElement("span"); s.textContent=txt; if(hot) s.className="hot"; C.appendChild(s); };
  const sk=streak(); if(sk>=2) chip("🔥 "+sk+" ימים ברצף",true);
  chip("🌏 "+countries+" "+(countries===1?"מדינה":"מדינות"));
  chip("🧾 "+S.items.filter(it=>it.kind!=="transfer").length+" הוצאות");
}
let insIdx=0, insTimer=null;
function insights(){
  const out=[]; const td=todayStr(); const sh=S.items.filter(it=>it.kind!=="transfer"&&locOf(it)!=="prep");
  const byDay={}; for(const it of sh){ byDay[it.date]=(byDay[it.date]||0)+conv(+it.amount||0,it.cur,showCur); }
  const days=Object.keys(byDay).filter(d=>d!==td); const avg=days.length? days.reduce((s,d)=>s+byDay[d],0)/days.length : 0;
  const today=byDay[td]||0;
  if(avg>0&&today>0){ const diff=(today-avg)/avg; out.push(diff<=-.1?["👏","היום הוצאתם "+fmt(today,showCur)+", "+Math.round(-diff*100)+"% פחות מהממוצע היומי"]:diff>=.1?["🧭","היום כבר "+fmt(today,showCur)+", "+Math.round(diff*100)+"% מעל הממוצע היומי ("+fmt(avg,showCur)+")"]:["🎯","היום בדיוק בקצב: "+fmt(today,showCur)+", כמו הממוצע היומי"]); }
  else if(avg>0) out.push(["☀️","עוד לא נרשמו הוצאות היום. הממוצע היומי שלכם: "+fmt(avg,showCur)]);
  const ym=thisMonth(), cats={}; let tot=0; for(const it of sh){ if(monthOf(it)!==ym) continue; const v=conv(+it.amount||0,it.cur,showCur); cats[catKey(it)]=(cats[catKey(it)]||0)+v; tot+=v; }
  const top=Object.entries(cats).sort((x,y)=>y[1]-x[1])[0]; if(top&&tot>0) out.push([catName(top[0]).split(" ")[0],"הכי הרבה החודש הולך על "+catName(top[0]).split(" ").slice(1).join(" ")+": "+Math.round(top[1]/tot*100)+"% מההוצאות"]);
  const week=sh.filter(it=>daysBetween(it.date||td,td)<7).length; if(week>0) out.push(["✍️",week+" הוצאות נרשמו השבוע. ככה המאזן תמיד מדויק"]);
  const c=compute(); if(me&&!c.debts.length&&sh.length) out.push(["🤝","אתם מאוזנים. אף אחד לא חייב כלום"]);
  return out;
}
function renderInsight(){
  const I=$("insight"); const list=(loaded&&view==="shared")?insights():[]; I.hidden=!list.length; if(!list.length) return;
  const [ico,txt]=list[insIdx%list.length]; $("insIco").textContent=ico; $("insTxt").textContent=txt;
  clearInterval(insTimer); if(list.length>1) insTimer=setInterval(()=>{ insIdx++; const L=insights(); if(!L.length) return; const [i2,t2]=L[insIdx%L.length]; $("insIco").textContent=i2; $("insTxt").textContent=t2; flash(I,"swap",400); },7000);
}
$("heroPlace").onclick=()=>$("localBtn").click();

function renderAll(){
  renderHero(); renderInsight();
  { const arch=loaded&&curTrip!==activeTrip(); $("tripNote").hidden=!arch; if(arch) $("tripNoteTxt").textContent="🗂️ אתם צופים בטיול "+(S.trip||"קודם")+" מהארכיון"; }
  requestAnimationFrame(()=>{ watchReveal(); renderMini(); onScroll(); });
  renderHeader();
  if(view==="stats"){ renderStats(); }
  else if(view==="personal"&&me){ renderPersonal(); }
  else { renderTicket(); renderConv(); renderForm(); renderCats(); renderLedger(); }
  $("form").hidden=!canWrite || !$("addSlot").contains($("form"));
  $("addCtaBtn").hidden=!canWrite || !loaded;
  $("pForm").hidden=!$("addSlot").contains($("pForm"));
  renderRecent();
  if(!$("setSheet").hidden) renderSettings();
}

/* ---- writes ---- */
async function run(fn){
  if(!canWrite||busy) return false;
  busy=true; $("status").textContent="שומר…"; document.querySelectorAll("#saveBtn,#nuSave,#pSave").forEach(b=>{ b.disabled=true; b.classList.add("busy"); });
  const done=()=>{ $("status").textContent="נשמר ✓"; setTimeout(()=>{ if($("status").textContent==="נשמר ✓") $("status").textContent=""; },2000); };
  try{
    /* without reception the write is kept on the phone and uploads later; don't wait for the server */
    const job=Promise.resolve().then(fn);
    const r=await Promise.race([job.then(()=>"ok"),new Promise(res=>setTimeout(()=>res("slow"),2500))]);
    if(r==="slow"){ $("status").textContent="⏳ נשמר בטלפון, יעלה כשתחזור קליטה"; job.then(done).catch(e=>{ console.error(e); $("status").textContent="השמירה נכשלה. נסו שוב."; }); return true; }
    done(); return true; }
  catch(e){ console.error(e); $("status").textContent= e&&e.code==="permission-denied" ? "אין הרשאה לשמור." : "השמירה נכשלה. בדקו את החיבור ונסו שוב."; return false; }
  finally{ busy=false; document.querySelectorAll("#saveBtn,#nuSave,#pSave").forEach(b=>{ b.disabled=false; b.classList.remove("busy"); }); }
}
/* ---- private space: the trip lives under a long random key that only the shared links carry (after #k=).
   Without the key nobody can read or change anything, and there is no way to list the spaces. ---- */
const KEY_RE=/^[a-z0-9]{32,64}$/;
function readKey(){
  try{ const k=new URLSearchParams(location.hash.replace(/^#/,"")).get("k"); if(k&&KEY_RE.test(k)) return k; }catch(e){}
  const s=load("trip-space"); return s&&KEY_RE.test(s)?s:null;
}
let SPACE=readKey(); if(SPACE) store("trip-space",SPACE);
function newKey(){ const a=new Uint8Array(24); crypto.getRandomValues(a); return Array.from(a,b=>(b%36).toString(36)).join("")+Date.now().toString(36).slice(-8); }
const spaceRef=()=>db.collection("spaces").doc(SPACE);
const EXP=()=>spaceRef().collection("expenses");
const metaRef=()=>spaceRef().collection("trip").doc("meta");
const keyHash=()=>SPACE?"#k="+SPACE:"";

/* ---- the preferred (local) currency ---- */
$("localBtn").onclick=()=>S.home ? openCurPicker("לאן טסים? ✈️",S.dest,c=>{ S.dest=c; patchTrip(curTrip,{localCur:c}); renderAll(); toast("✈️ מיום הטיסה המטבע יתחלף ל"+CUR[c].name); }) : openCurPicker("באיזו מדינה אתם עכשיו? 🌏",S.localCur,c=>{
  if(c===S.localCur) return;
  S.localCur=c; if(!editingId) cur.fCur=c; if(!pEditingId) cur.pCur=c; cur.cFrom=c; renderAll();
  patchTrip(curTrip,{localCur:c});
});

/* ---- who am I ---- */
function isApp(){ try{ return navigator.standalone===true||matchMedia("(display-mode: standalone)").matches; }catch(e){ return false; } }
function readParam(name){ try{ return new URLSearchParams(location.search).get(name); }catch(e){ return null; } }
function readHash(){ let u=readParam("u"); if(!u) u=decodeURIComponent(location.hash.replace("#","")); return person(u)?u:null; }
function personalUrl(id,noKey){ return PAGE_URL+"?u="+encodeURIComponent(id)+(noKey?"":keyHash()); }
function syncUrl(){
  if(!me) return;
  let u=personalUrl(me,true); if(view==="personal") u+="&v=me"; if(view==="stats") u+="&v=stats"; if(QUICK) u+="&add="+QUICK; u+=keyHash();
  try{ history.replaceState(null,"",u); }catch(e){}
}
function setMe(id,updateUrl){
  me=id; if(id) setTimeout(sinceLastVisit,300); acct=null; acctFor=null; store("trip-me",id||""); if(id){ form.payer=id; if(updateUrl) syncUrl(); refreshPersonal(); }
  $("newUser").hidden=true; renderAll(); window.scrollTo({top:0});
}
$("switchBtn").onclick=()=>{ me=null; store("trip-me",""); view="shared"; P=[]; acct=null; try{ history.replaceState(null,"",location.pathname); }catch(e){} renderAll(); $("picker").scrollIntoView({behavior:"smooth"}); };
$("viewBtn").onclick=()=>{ buzz(6); viewSwap(()=>{ view= view==="personal"?"shared":"personal"; syncUrl(); renderAll(); window.scrollTo({top:0}); }); };
$("nuCancel").onclick=()=>{ $("newUser").hidden=true; };
$("nuSave").onclick=async()=>{
  const name=$("nuName").value.trim(); showErr("nuErr");
  if(!name) return showErr("nuErr","צריך לכתוב שם");
  const nu=$("nuU").value.trim(); { const bad=uCheck(nu); if(bad) return showErr("nuErr",bad); }
  if(!canWrite) return showErr("nuErr","אין חיבור לשמירה כרגע.");
  const id=uid("p");
  const ok=await run(()=>db.runTransaction(async tx=>{ const s=await tx.get(metaRef()); const people=(s.data()?.people)||[]; tx.update(metaRef(),{people:[...people,nu?{id,name,g:nuG,u:nu}:{id,name,g:nuG}]}); }));
  if(ok){ if(!person(id)) S.people.push(nu?{id,name,g:nuG,u:nu}:{id,name,g:nuG}); $("nuU").value=""; $("nuName").value=""; setMe(id,true); }
};

/* ---- shared form ---- */
function showErr(id,msg){ const e=$(id); e.textContent=msg||""; e.hidden=!msg; if(msg){ flash(e.closest(".card,.sheet,.stack")||e,"shake",450); buzz([10,40,10]); } }
function done(btn){ if(!btn) return; buzz(10); if(calm()) return; btn.classList.add("ok"); setTimeout(()=>btn.classList.remove("ok"),900); }
$("fCur").onclick=()=>openCurPicker("באיזה מטבע שילמתם?",cur.fCur,c=>{ cur.fCur=c; renderForm(); });
$("cFrom").onclick=()=>openCurPicker("יש לי…",cur.cFrom,c=>{ cur.cFrom=c; renderConv(); });
$("cTo").onclick=()=>openCurPicker("מקבלים…",cur.cTo,c=>{ cur.cTo=c; renderConv(); });
function startEdit(it){
  if(!$("addSheet").hidden) closeSheet("addSheet");
  editingId=it.id; form.payer=it.payer; form.cat=it.cat||"other"; form.loc=locOf(it); form.pm=it.pm||"cash";
  form.among=it.pcts?Object.keys(it.pcts):((it.among&&it.among.length)?[...it.among]:S.people.map(p=>p.id));
  form.mode=it.pcts?"pct":"equal"; form.pcts=it.pcts?{...it.pcts}:{};
  $("fDesc").value=it.desc||""; $("fCatLabel").value=it.catLabel||""; $("fAmt").value=group(String(it.amount)); $("fDate").value=it.date||todayStr(); cur.fCur=it.cur;
  renderForm();
  $("formTitle").textContent="✏️ עריכת הוצאה"; $("saveBtn").textContent="שמירת שינויים"; $("cancelEdit").hidden=false;
  if(!$("addSlot").contains($("form"))) openAdd(); else $("form").scrollIntoView({behavior:"smooth",block:"start"});
}
function resetForm(){ setTimeout(()=>fDateChips(),0);
  editingId=null; $("fDesc").value=""; $("fCatLabel").value=""; $("fAmt").value=""; form.mode="equal"; form.pcts={}; form.among=null; if(me) form.payer=me; cur.fCur=S.localCur; form.loc=null;
  $("formTitle").textContent="➕ הוצאה משותפת"; $("saveBtn").textContent="הוספה"; $("cancelEdit").hidden=true; renderForm();
}
async function save(){
  showErr("fErr");
  const amount=parseFloat(String($("fAmt").value).replace(/,/g,""));
  if(!(amount>0)) return showErr("fErr","צריך להזין סכום גדול מאפס");
  if(!$("fDesc").value.trim()){ $("fDesc").focus(); return showErr("fErr","צריך לתת שם להוצאה, למשל: ארוחת ערב"); }
  if(!form.among.length) return showErr("fErr","צריך לבחור לפחות אדם אחד שמתחלק בהוצאה");
  let pcts=null;
  if(form.mode==="pct"){ pcts={}; let sum=0; for(const id of form.among){ const v=+form.pcts[id]; if(!(v>=0)) return showErr("fErr","אחוז לא תקין אצל "+nm(id)); pcts[id]=v; sum+=v; } if(Math.abs(sum-100)>0.5) return showErr("fErr","האחוזים צריכים להסתכם ל-100 (כרגע "+sum+")"); }
  const data={kind:"expense",desc:$("fDesc").value.trim(),amount,cur:cur.fCur,payer:form.payer,among:pcts?null:[...form.among],pcts,cat:form.cat,catLabel:form.cat==="other"?$("fCatLabel").value.trim():"",loc:form.loc||defLoc(),pm:form.pm||"cash",date:$("fDate").value||todayStr()};
  const id=editingId||uid("e");
  const ok=await run(()=> editingId ? EXP().doc(id).update(data) : EXP().doc(id).set({...data,createdAt:Date.now(),tz:hereTz(),by:me||null,trip:curTrip}));
  if(ok&&!editingId) notifyOthers("🧾 "+nm(me||form.payer)+" "+(fem(me||form.payer)?"הוסיפה":"הוסיף")+": "+data.desc+" "+fmt(amount,data.cur));
  if(ok){ done($("saveBtn")); burst($("saveBtn"),catEmoji(data)); setTimeout(checkStreak,400); }
  if(ok){ const keep=$("fDate").value; resetForm(); $("fDate").value=keep; if(!$("addSheet").hidden) closeSheet("addSheet"); }
}
async function addTransfer(from,to,amt){
  const id=uid("t");
  const ok=await run(()=>EXP().doc(id).set({kind:"transfer",amount:amt,cur:showCur,payer:from,to,date:todayStr(),createdAt:Date.now(),tz:hereTz(),loc:defLoc(),by:me||null,trip:curTrip}));
  if(ok){ setTimeout(()=>{ const c=compute(); if(!c.debts.length) confetti(); flash($("ticket"),"glow",900); },60); buzz([12,60,12]); }
  if(ok) notifyOthers("💸 "+nm(from)+" "+g.transferred(from)+" ל"+nm(to)+" "+fmt(amt,showCur));
  if(ok) toast("💸 נרשם: "+nm(from)+" "+g.transferred(from)+" ל"+nm(to)+" "+fmt(amt,showCur),"ביטול",()=>run(()=>EXP().doc(id).delete()).then(k=>{ if(k) toast("ההעברה בוטלה"); }));
}
let toastTimer=null;
function toast(msg,actLabel,act){
  const T=$("toast"); T.innerHTML=""; const s=document.createElement("span"); s.textContent=msg; T.appendChild(s);
  const life=actLabel?10000:3000;
  const hide=()=>{ if(calm()){ T.hidden=true; return; } T.classList.add("out"); setTimeout(()=>{ T.hidden=true; T.classList.remove("out"); },200); };
  if(actLabel){ const b=document.createElement("button"); b.type="button"; b.textContent=actLabel; b.onclick=()=>{ clearTimeout(toastTimer); hide(); buzz(8); act(); }; T.appendChild(b);
    const bar=document.createElement("i"); bar.className="tbar"; bar.style.animationDuration=life+"ms"; T.appendChild(bar); }
  T.classList.remove("out"); T.hidden=false; flash(T,"tin",320); clearTimeout(toastTimer); toastTimer=setTimeout(hide,life);
}

/* ---- personal form ---- */
$("pCur").onclick=()=>openCurPicker("באיזה מטבע שילמת?",cur.pCur,c=>{ cur.pCur=c; renderPersonal(); });
function pStartEdit(it){
  if(!$("addSheet").hidden) closeSheet("addSheet");
  pEditingId=it.id; pform.cat=it.cat||"other"; pform.loc=locOf(it); pform.pm=it.pm||"cash"; cur.pCur=it.cur;
  $("pDesc").value=it.desc||""; $("pCatLabel").value=it.catLabel||""; $("pAmt").value=group(String(it.amount)); $("pDate").value=it.date||todayStr();
  $("pFormTitle").textContent="✏️ עריכת הוצאה אישית"; $("pSave").textContent="שמירת שינויים"; $("pCancel").hidden=false; renderPersonal();
  if(!$("addSlot").contains($("pForm"))) openAdd(); else $("pForm").scrollIntoView({behavior:"smooth",block:"start"});
}
function pReset(){
  pEditingId=null; $("pDesc").value=""; $("pCatLabel").value=""; $("pAmt").value=""; cur.pCur=S.localCur; pform.loc=null;
  $("pFormTitle").textContent="➕ הוצאה אישית"; $("pSave").textContent="הוספה"; $("pCancel").hidden=true; renderPersonal();
}
async function pSave(){
  showErr("pErr");
  const amount=parseFloat(String($("pAmt").value).replace(/,/g,""));
  if(!(amount>0)) return showErr("pErr","צריך להזין סכום גדול מאפס");
  if(!$("pDesc").value.trim()){ $("pDesc").focus(); return showErr("pErr","צריך לתת שם להוצאה, למשל: קפה"); }
  const c=await loadAcct(); if(!c) return showErr("pErr","צריך להיכנס לחשבון האישי קודם.");
  const data={desc:$("pDesc").value.trim(),amount,cur:cur.pCur,cat:pform.cat,catLabel:pform.cat==="other"?$("pCatLabel").value.trim():"",loc:pform.loc||defLoc(),pm:pform.pm||"cash",date:$("pDate").value||todayStr(),trip:curTrip};
  const id=pEditingId||uid("m"); const old=P.find(x=>x.id===id);
  const doc=await encFor(c,{...data,createdAt:old?.createdAt||Date.now(),tz:old?.tz||hereTz()});
  const ok=await run(()=>EXP().doc(id).set(doc));
  if(ok){ done($("pSave")); burst($("pSave"),catEmoji(data)); setTimeout(checkStreak,400); }
  if(ok){ const keep=$("pDate").value; pReset(); $("pDate").value=keep; if(!$("addSheet").hidden) closeSheet("addSheet"); }
}
$("fLoc").onclick=()=>openLocPicker(form.loc||defLoc(),k=>{ form.loc=k; renderForm(); });
$("pLoc").onclick=()=>openLocPicker(pform.loc||defLoc(),k=>{ pform.loc=k; renderPersonal(); });
$("pSave").onclick=pSave; $("pCancel").onclick=pReset;
$("pAmt").addEventListener("input",()=>convHint("pAmt",cur.pCur,"pConv"));
$("pAmt").addEventListener("keydown",e=>{ if(e.key==="Enter") pSave(); });
$("pDesc").addEventListener("keydown",e=>{ if(e.key==="Enter") $("pAmt").focus(); });


/* ---- stats page: spending per month and by category ---- */
let stScope="trip", stMonth=null, locScope="couple";
function goView(v){ viewSwap(()=>{ view=v; syncUrl(); renderAll(); window.scrollTo({top:0}); }); }
$("statsBtn").onclick=()=>goView(view==="stats"?"shared":"stats");
$("statsBack").onclick=()=>goView("shared");
$("catMore").onclick=()=>{ stScope="trip"; stMonth=thisMonth(); goView("stats"); };
$("pCatMore").onclick=()=>{ stScope="mine"; stMonth=thisMonth(); goView("stats"); };
function statItems(){
  /* [{date,cur,amount,cat,catLabel,payer}] in the chosen scope */
  if(stScope==="mine"&&me){ return [...myShareItems(), ...(acct&&acctFor===me?P:[])]; }
  return S.items.filter(it=>it.kind!=="transfer");
}
function renderStats(){
  const mineOk=!!me;
  if(!mineOk) stScope="trip";
  seg($("stScope"),mineOk?[["trip","כל הטיול"],["mine","שלי"]]:[["trip","כל הטיול"]],v=>v===stScope,v=>{stScope=v;renderStats();});
  const items=statItems();
  const byMonth={}; let all=0;
  for(const it of items){ const m=monthOf(it); if(!m) continue; const v=conv(+it.amount||0,it.cur,showCur); byMonth[m]=(byMonth[m]||0)+v; all+=v; }
  const months=Object.keys(byMonth).sort();
  if(!stMonth||!byMonth[stMonth]) stMonth= byMonth[thisMonth()]?thisMonth():(months[months.length-1]||thisMonth());
  /* monthly bars: one series, one hue; the chosen month is emphasized */
  const M=$("stMonths"); M.innerHTML="";
  const max=Math.max(1,...months.map(m=>byMonth[m]));
  if(!months.length){ M.innerHTML='<div class="hint" style="align-self:center">עוד אין הוצאות.</div>'; }
  for(const m of months){
    const b=document.createElement("button"); b.type="button"; b.className="mbar"; b.setAttribute("role","listitem"); b.setAttribute("aria-pressed",String(m===stMonth));
    b.setAttribute("aria-label",monthName(m,true)+": "+fmt(byMonth[m],showCur)); b.title=monthName(m,true)+": "+fmt(byMonth[m],showCur);
    const v=document.createElement("span"); v.className="v num"; v.textContent=fmt(byMonth[m],showCur);
    const c=document.createElement("span"); c.className="col"; c.style.height=Math.max(3,Math.round(byMonth[m]/max*120))+"px";
    const l=document.createElement("span"); l.className="l"; l.textContent=monthName(m,false);
    b.append(v,c,l); b.onclick=()=>{ stMonth=m; renderStats(); }; M.appendChild(b);
  }
  const inM=items.filter(it=>monthOf(it)===stMonth);
  const tot=inM.reduce((s,it)=>s+conv(+it.amount||0,it.cur,showCur),0);
  const days=new Set(inM.map(it=>it.date)).size||1;
  $("stLbl").textContent= stScope==="mine" ? "ההוצאות של "+nm(me) : "ההוצאות של כל הטיול";
  $("stMonthName").textContent=monthName(stMonth,true);
  money($("stMonthTotal"),tot,showCur,"stm:"+stScope);
  if(stScope==="mine"){
    /* summary split: alone (personal) vs. my part of what we shared */
    const sum=list=>list.filter(it=>monthOf(it)===stMonth).reduce((s,it)=>s+conv(+it.amount||0,it.cur,showCur),0);
    const own= acct&&acctFor===me ? sum(P) : 0, shared=sum(myShareItems());
    const others=active().filter(p=>p.id!==me).map(p=>p.name);
    $("stCount").textContent=fmt(own,showCur); $("stL1").textContent="🙋 לבד (אישי)";
    $("stPerDay").textContent=fmt(shared,showCur); $("stL2").textContent="👫 "+(others.length===1?"עם "+others[0]:"משותף")+" (החלק שלך)";
    $("stAllTime").textContent=fmt(own+shared,showCur); $("stL3").textContent="💜 ביחד החודש";
  }else{
    $("stCount").textContent=inM.length; $("stL1").textContent="הוצאות";
    $("stPerDay").textContent=fmt(tot/days,showCur); $("stL2").textContent="ממוצע ליום";
    $("stAllTime").textContent=fmt(all,showCur); $("stL3").textContent="כל הטיול";
  }
  showinRow($("stShowin"));
  const lock=$("stLock"); lock.hidden=!(stScope==="mine"&&!(acct&&acctFor===me));
  lock.textContent="כרגע מוצג רק החלק שלך בהוצאות המשותפות. כדי לכלול גם את ההוצאות האישיות, נכנסים פעם אחת ל\"האישי שלי\" עם הסיסמה.";
  /* by category, with amount and share */
  const cats={}; for(const it of inM){ const k=catKey(it); cats[k]=(cats[k]||0)+conv(+it.amount||0,it.cur,showCur); }
  $("stCatTitle").textContent="📊 על מה הלך הכסף ב"+monthName(stMonth,true).split(" ")[0];
  const C=$("stCats"); C.innerHTML="";
  const ent=Object.entries(cats).sort((x,y)=>y[1]-x[1]); const cmax=ent[0]?.[1]||1;
  if(!ent.length) C.innerHTML='<div class="hint">אין הוצאות בחודש הזה.</div>';
  for(const [k,v] of ent){
    const r=document.createElement("div"); r.className="cat";
    r.innerHTML='<span></span><div class="bar"><i></i></div><span class="amtpct"><b class="num"></b><small class="num"></small></span>';
    r.children[0].textContent=catName(k); r.querySelector("i").style.width=(v/cmax*100).toFixed(1)+"%";
    r.querySelector("b").textContent=fmt(v,showCur); r.querySelector("small").textContent=Math.round(v/(tot||1)*100)+"%";
    r.title=catName(k)+": "+fmt(v,showCur); C.appendChild(r);
  }
  /* by country, across the whole trip */
  /* the country card has its own switch: couple (shared expenses) or personal (only my own) */
  const canMine=!!me; if(!canMine) locScope="couple";
  seg($("stLocScope"),canMine?[["couple","👫 זוגי"],["mine","🙋 אישי"],["both","💜 משולב"]]:[["couple","👫 זוגי"]],v=>v===locScope,v=>{locScope=v;renderStats();});
  const mineP= acct&&acctFor===me ? P : [];
  /* both: my own expenses plus my part of the shared ones */
  const locItems= locScope==="mine" ? mineP : locScope==="both" ? [...myShareItems(),...mineP] : S.items.filter(it=>it.kind!=="transfer");
  $("stLocNote").hidden=!((locScope==="mine"||locScope==="both")&&!(acct&&acctFor===me));
  const byC={}; for(const it of locItems){ const k=locOf(it); const o=byC[k]||(byC[k]={v:0,days:new Set()}); o.v+=conv(+it.amount||0,it.cur,showCur); if(it.date) o.days.add(it.date); }
  const ce=Object.entries(byC).sort((x,y)=>y[1].v-x[1].v); const cm=ce[0]?.[1].v||1; const CC=$("stCountries"); CC.innerHTML="";
  if(!ce.length) CC.innerHTML='<div class="hint">עוד אין הוצאות.</div>';
  for(const [k,o] of ce){
    const r=document.createElement("div"); r.className="cat";
    r.innerHTML='<span></span><div class="bar"><i></i></div><span class="amtpct"><b class="num"></b><small></small></span>';
    r.children[0].textContent=locName(k); r.querySelector("i").style.width=(o.v/cm*100).toFixed(1)+"%"; if(k!=="?"){ r.classList.add("tap"); r.title="סיכום של "+locName(k); r.onclick=()=>openRecap(k); }
    r.querySelector("b").textContent=fmt(o.v,showCur);
    const n=o.days.size; r.querySelector("small").textContent= (k==="prep"||k==="?") ? "" : (n===1?"יום אחד":n+" ימים")+" · "+fmt(o.v/(n||1),showCur)+" ליום";
    CC.appendChild(r);
  }
  /* who paid (whole trip only) */
  $("stPayersCard").hidden= stScope!=="trip";
  if(stScope==="trip"){
    const pay={}; for(const it of inM){ pay[it.payer]=(pay[it.payer]||0)+conv(+it.amount||0,it.cur,showCur); }
    const Pp=$("stPayers"); Pp.innerHTML=""; const pe=Object.entries(pay).sort((x,y)=>y[1]-x[1]); const pmax=pe[0]?.[1]||1;
    if(!pe.length) Pp.innerHTML='<div class="hint">אין הוצאות בחודש הזה.</div>';
    for(const [id,v] of pe){
      const r=document.createElement("div"); r.className="cat";
      r.innerHTML='<span></span><div class="bar"><i></i></div><span class="amtpct"><b class="num"></b><small class="num"></small></span>';
      r.children[0].textContent=nm(id); r.querySelector("i").style.width=(v/pmax*100).toFixed(1)+"%";
      r.querySelector("b").textContent=fmt(v,showCur); r.querySelector("small").textContent=Math.round(v/(tot||1)*100)+"%"; Pp.appendChild(r);
    }
  }
}

/* ---- amounts are typed with thousands separators: 25,000 or 1,250.50 ---- */
function group(s){
  s=String(s).replace(/,/g,"").replace(/[^\d.]/g,"");
  const i=s.indexOf("."); let int=i<0?s:s.slice(0,i); const frac=i<0?null:s.slice(i+1).replace(/\./g,"").slice(0,2);
  int=int.replace(/^0+(?=\d)/,"");
  const g=int.replace(/\B(?=(\d{3})+(?!\d))/g,",");
  return frac===null? g : (g||"0")+"."+frac;
}
function liveGroup(el){
  el.addEventListener("input",()=>{
    const raw=el.value, pos=el.selectionStart??raw.length;
    const before=raw.slice(0,pos).replace(/[^\d.]/g,"").length;   /* digits and dot left of the caret */
    const out=group(raw); if(out===raw) return;
    el.value=out;
    let n=0, c=0; while(c<out.length&&n<before){ if(/[\d.]/.test(out[c])) n++; c++; }
    try{ el.setSelectionRange(c,c); }catch(e){}
  });
}
for(const id of ["fAmt","pAmt","cA","cB","cwAmt","cwFee","caAmt","cxAmt","cxGot"]) liveGroup($(id));

/* ---- floating buttons: back to top, quick add ---- */
let addHome=null;
function openAdd(){
  if(view==="stats") goView("shared");
  const id= view==="personal"&&me ? "pForm" : "form";
  if(id==="pForm"&&!(acct&&acctFor===me)){ window.scrollTo({top:0,behavior:"smooth"}); $("lockPw").focus(); return; }
  const f=$(id); addHome={f,parent:f.parentNode,next:f.nextSibling};
  $("addSlot").appendChild(f); f.hidden=false; openSheet("addSheet");
  try{ fDateChips(); pDateChips(); }catch(e){}
  setTimeout(()=>{ try{ $(id==="pForm"?"pAmt":"fAmt").focus(); }catch(e){} },80);
}
function restoreAdd(){ if(!addHome) return; addHome.parent.insertBefore(addHome.f,addHome.next); addHome.f.hidden=true; addHome=null; }
$("fabAdd").onclick=openAdd;
$("addCtaBtn").onclick=()=>{ buzz(8); openAdd(); };
$("pAddCtaBtn").onclick=()=>{ buzz(8); openAdd(); };
/* "again": the last few different expenses, one tap to start from them */
function recentOf(list){ const seen=new Set(), out=[];
  for(const it of [...list].sort((x,y)=>(y.createdAt||0)-(x.createdAt||0))){ if(it.kind==="transfer"||it._fee||it.type==="cash") continue; const k=norm(it.desc||""); if(!k||seen.has(k)) continue; seen.add(k); out.push(it); if(out.length>=4) break; }
  return out; }
function chipsFor(box,list,pick){
  box.innerHTML=""; const its=recentOf(list); box.hidden=!its.length||!canWrite; if(box.hidden) return;
  const l=document.createElement("span"); l.className="lab"; l.textContent="שוב:"; box.appendChild(l);
  for(const it of its){ const b=document.createElement("button"); b.type="button";
    const ic=document.createElement("span"); ic.textContent=(catName(catKey(it)).match(/^\S+/)||[""])[0];
    const t=document.createElement("span"); t.textContent=it.desc;
    const a=document.createElement("span"); a.className="amt num"; a.textContent=fmt(+it.amount,it.cur);
    b.append(ic,t,a); b.onclick=()=>{ buzz(6); pick(it); }; box.appendChild(b); }
}
function renderRecent(){
  if(view!=="personal") chipsFor($("recentChips"),S.items,it=>{
    if(editingId) resetForm();
    $("fDesc").value=it.desc||""; $("fAmt").value=group(String(it.amount)); cur.fCur=it.cur||cur.fCur; form.cat=it.cat||"other"; $("fCatLabel").value=it.catLabel||""; form.pm=it.pm||form.pm;
    $("fDate").value=todayStr(); renderForm(); openAdd(); setTimeout(()=>{ try{ $("fAmt").select(); }catch(e){} },120); });
  if(view==="personal"&&acct&&acctFor===me) chipsFor($("pRecentChips"),P,it=>{
    $("pDesc").value=it.desc||""; $("pAmt").value=group(String(it.amount)); cur.pCur=it.cur||cur.pCur; pform.cat=it.cat||"other"; $("pCatLabel").value=it.catLabel||""; pform.pm=it.pm||pform.pm;
    $("pDate").value=todayStr(); renderPersonal(); openAdd(); setTimeout(()=>{ try{ $("pAmt").select(); }catch(e){} },120); });
  else $("pRecentChips").hidden=true;
}
/* quick date chips in the form */
function dateChips(inp,box){
  const y=new Date(Date.now()-864e5), ys=y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0");
  const opts=[["today","היום",todayStr()],["yday","אתמול",ys]];
  const paint=()=>{ box.innerHTML=""; for(const [k,l,v] of opts){ const b=document.createElement("button"); b.type="button"; b.textContent=l; b.setAttribute("aria-pressed",String(inp.value===v)); b.onclick=()=>{ inp.value=v; inp.dispatchEvent(new Event("change",{bubbles:true})); buzz(5); paint(); }; box.appendChild(b); } };
  inp.addEventListener("change",paint); inp.addEventListener("input",paint); paint(); return paint;
}
const fDateChips=dateChips($("fDate"),$("fDateChips"));
const pDateChips=$("pDate")&&$("pDateChips")?dateChips($("pDate"),$("pDateChips")):()=>{};
/* bottom tab bar */
function renderTabs(){
  const on=loaded&&!!me&&!!person(me)&&canWrite; $("tabbar").hidden=!on; document.body.classList.toggle("has-tabs",on);
  for(const b of $("tabbar").querySelectorAll("[data-v]")){ const v=b.dataset.v; const act= v==="acct" ? !$("acctSheet").hidden : v===view; b.classList.toggle("on",act); b.setAttribute("aria-current",act?"page":"false"); }
}
$("tabbar").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; buzz(6);
  if(b.id==="tabAdd") return openAdd();
  const v=b.dataset.v; if(v==="acct") return $("acctBtn").click();
  if(v===view){ window.scrollTo({top:0,behavior:"smooth"}); return; }
  if(v==="personal"&&!me) return; goView(v); });
$("addClose").onclick=()=>closeSheet("addSheet");
$("fabUp").onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
window.addEventListener("scroll",()=>{ $("fabUp").hidden= window.scrollY<400; },{passive:true});
$("lSearch").addEventListener("input",renderLedger);
$("pSearch").addEventListener("input",renderPersonal);

/* ---- daily summary in the personal view: alone / together / combined, in shekels unless chosen otherwise ---- */
function renderDaily(){
  const S2=$("dShowin"); S2.innerHTML="";
  const quick=["ILS",S.localCur,"USD"].filter((x,i,arr)=>arr.indexOf(x)===i);
  for(const q of quick){ const b=document.createElement("button"); b.type="button"; b.className="chip"; b.textContent=(CUR[q].sym?CUR[q].sym+" ":"")+CUR[q].name; b.setAttribute("aria-pressed",String(dayCur===q)); b.onclick=()=>{ dayCur=q; renderDaily(); }; S2.appendChild(b); }
  const o=document.createElement("button"); o.type="button"; o.className="curbtn"; o.textContent=quick.includes(dayCur)?"🔎 מטבע אחר":curText(dayCur);
  o.onclick=()=>openCurPicker("להציג את הסיכום היומי ב…",dayCur,c=>{ dayCur=c; renderDaily(); }); S2.appendChild(o);
  const share=myShareItems(); const days=new Map();
  const add=(it,k,v)=>{ if(!it.date) return; const o=days.get(it.date)||{alone:0,tog:0}; o[k]+=v; days.set(it.date,o); };
  for(const it of P) add(it,"alone",conv(+it.amount||0,it.cur,dayCur));
  for(const it of share) add(it,"tog",conv(it.amount,it.cur,dayCur));
  const T=$("dTable"); T.innerHTML="";
  const list=[...days.entries()].sort((x,y)=>y[0].localeCompare(x[0]));
  if(!list.length){ T.innerHTML='<tr><td colspan="4" class="hint">עוד אין הוצאות.</td></tr>'; return; }
  for(const [d,o] of list.slice(0,dayLimit)){
    const tr=document.createElement("tr");
    const c=(txt,cls)=>{ const td=document.createElement("td"); td.textContent=txt; if(cls) td.className=cls; tr.appendChild(td); };
    c(shortDay(d)); c(fmt(o.alone,dayCur),"num"); c(fmt(o.tog,dayCur),"num"); c(fmt(o.alone+o.tog,dayCur),"num strong");
    T.appendChild(tr);
  }
  $("dMore").hidden=list.length<=dayLimit;
}
let dayLimit=7;
function shortDay(s){ if(s===todayStr()) return "היום"; const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString("he-IL",{weekday:"short"}).replace("יום ","")+" "+d+"."+m; }

/* ---- cash wallet (personal): withdrawals in, cash payments out ---- */
function cashPaidByMe(){
  const out=[];
  for(const it of S.items){ if(it.kind==="transfer"||it.payer!==me||it.pm!=="cash") continue; out.push(it); }
  for(const it of P){ if(it.pm==="cash") out.push(it); }
  return out;
}
function cashBalances(){
  const since=Math.min(...CASH.map(x=>x.createdAt||Infinity));
  const bal={};
  const add=(c,v)=>{ bal[c]=(bal[c]||0)+v; };
  for(const x of CASH){
    if(x.sub==="withdraw"||x.sub==="adjust"||x.sub==="reset") add(x.cur,+x.amount||0);
    if(x.sub==="exchange"){ add(x.cur,-(+x.amount||0)); add(x.toCur,+x.toAmount||0); }
  }
  /* cash payments count from the first wallet entry on */
  for(const it of cashPaidByMe()){ if((it.createdAt||0)<since) continue; add(it.cur,-(+it.amount||0)); }
  for(const c in bal) bal[c]=Math.round(bal[c]*100)/100;
  return bal;
}
function renderCash(){
  const bal=cashBalances(); CASHBAL=bal;
  const fees=CASH.filter(x=>x.sub==="withdraw"&&+x.fee>0).reduce((s,x)=>s+conv(+x.fee,x.feeCur||x.cur,"ILS"),0);
  const B=$("cashBal"); B.innerHTML="";
  const curs=Object.keys(bal).filter(c=>Math.abs(bal[c])>0.004);
  if(!CASH.length){ B.innerHTML='<div class="hint">עוד לא נרשמו משיכות. כשמושכים מזומן מכספומט, לוחצים "משיכה מכספומט", ומאז היתרה מתעדכנת לבד בכל תשלום במזומן.</div>'; }
  else if(!curs.length){ B.innerHTML='<div class="cashline main"><b class="num">0</b><small class="hint">הארנק ריק</small></div>'; }
  else for(const c of curs.sort((x,y)=>(y===S.localCur)-(x===S.localCur))){
    const d=document.createElement("div"); d.className="cashline"+(c===curs[0]?" main":"");
    const n=document.createElement("b"); n.className="num"; n.textContent=fmt(bal[c],c); if(bal[c]<0) n.classList.add("neg");
    const s=document.createElement("small"); s.className="hint num"; s.textContent= c!=="ILS" ? "≈ "+fmt(conv(bal[c],c,"ILS"),"ILS") : "";
    d.append(n,s); B.appendChild(d);
  }
  $("cashFees").textContent= fees>0 ? "עמלות משיכה: "+fmt(fees,"ILS") : "";
  /* history: every change shows as + / − */
  const L=$("cashList"); L.innerHTML="";
  const label={withdraw:"🏧 משיכה מכספומט",adjust:"± עדכון ידני",reset:"🔄 איפוס ארנק",exchange:"💱 החלפת מטבע"};
  for(const x of [...CASH].sort((p,q)=>(q.createdAt||0)-(p.createdAt||0))){
    const r=document.createElement("div"); r.className="row"; r.dataset.id=x.id;
    const dot=document.createElement("div"); dot.className="dot c2"; dot.textContent=(label[x.sub]||"·").split(" ")[0];
    const main=document.createElement("div"); main.className="main";
    const t=document.createElement("div"); t.className="t"; t.textContent=(label[x.sub]||"").replace(/^\S+ /,"")+(x.note?" · "+x.note:"");
    const m=document.createElement("div"); m.className="m"; m.textContent=withTime(x,dayLabel(x.date)+(+x.fee>0?" · עמלה "+fmt(+x.fee,x.feeCur||x.cur)+" (נרשמה כהוצאה)":""));
    main.append(t,m);
    const right=document.createElement("div"); right.className="r";
    const sign=v=>(v>0?"+":v<0?"−":"")+fmt(Math.abs(v),"X").replace(/ X$/,"");
    const line=(v,c)=>{ const b=document.createElement("b"); b.className="num "+(v<0?"neg":"pos"); b.textContent=(v>0?"+":v<0?"−":"")+fmt(Math.abs(v),c); right.appendChild(b); };
    if(x.sub==="exchange"){ line(-(+x.amount),x.cur); line(+x.toAmount,x.toCur); } else line(+x.amount,x.cur);
    const rep1= x.sub==="withdraw"||x.sub==="exchange"||x.sub==="adjust";
    const acts=document.createElement("div"); acts.className="acts";
    if(rep1){ const ag=document.createElement("button"); ag.className="link"; ag.type="button"; ag.textContent="🔁 שוב"; ag.onclick=()=>againCash(x); acts.appendChild(ag); }
    acts.appendChild(delBtn(()=>delItem({id:x.id,desc:label[x.sub]||"ארנק"},true))); right.appendChild(acts);
    r.append(dot,main,right); tapRow(r);
    L.appendChild(swipeWrap(r,{id:x.id},true,{again:rep1?()=>againCash(x):null,againLabel:x.sub==="withdraw"?"🔁 עוד משיכה כזו":"🔁 שוב להיום",del:()=>delItem({id:x.id,desc:(label[x.sub]||"ארנק").replace(/^\S+ /,"")},true)}));
  }
  /* panels */
  for(const [k,id] of [["w","cashW"],["a","cashA"],["x","cashX"],["r","cashR"]]) $(id).hidden=cashForm!==k;
  for(const [k,id] of [["w","cashWBtn"],["a","cashABtn"],["x","cashXBtn"],["r","cashRBtn"]]) $(id).setAttribute("aria-pressed",String(cashForm===k));
  setCurBtn("cwCur",cur.cw||S.localCur); setCurBtn("cwFeeCur",cur.cwFee||S.localCur); setCurBtn("caCur",cur.ca||S.localCur);
  setCurBtn("cxFrom",cur.cxF||S.localCur); setCurBtn("cxTo",cur.cxT||(S.localCur==="USD"?"ILS":"USD"));
  seg($("caMode"),[["count","🔢 יש לי בארנק"],["minus","➖ הורדה"],["plus","➕ הוספה"]],v=>v===caMode,v=>{ caMode=v; renderCash(); });
  const c=cur.ca||S.localCur;
  $("caNow").textContent="לפי האפליקציה: "+fmt(bal[c]||0,c);
  $("caAmt").placeholder= caMode==="count" ? "כמה יש בארנק עכשיו" : caMode==="minus" ? "כמה להוריד (הוצאה שלא נרשמה)" : "כמה להוסיף";
  $("cashRText").textContent= curs.length ? "האיפוס מאפס את היתרה ל-0 ("+curs.map(k=>fmt(bal[k],k)).join(", ")+"). זה נרשם בהיסטוריה, ואפשר לבטל דרך המחיקה." : "הארנק כבר על 0.";
}
let CASHBAL={}, caMode="count";
/* repeat a wallet entry for today (another withdrawal of the same amount, the same exchange…) */
async function againCash(x){
  const keep=["sub","amount","cur","fee","feeCur","toAmount","toCur","note","mode"]; const e={};
  for(const k of keep) if(x[k]!==undefined&&x[k]!==null) e[k]=x[k];
  const ok=await cashSave(e); if(ok){ buzz(10); toast("🔁 נרשם שוב להיום"); }
}
async function cashSave(entry){
  const c=await loadAcct(); if(!c) return false;
  const doc=await encFor(c,{type:"cash",...entry,createdAt:Date.now(),tz:hereTz(),loc:defLoc(),date:entry.date||todayStr(),trip:curTrip});
  return run(()=>EXP().doc(uid("w")).set(doc));
}
const num=id=>parseFloat(String($(id).value).replace(/,/g,""));
function openCash(k,focus){ cashForm= cashForm===k?null:k; renderCash(); if(cashForm&&focus) $(focus).focus(); }
$("cashWBtn").onclick=()=>openCash("w","cwAmt");
$("cashABtn").onclick=()=>openCash("a","caAmt");
$("cashXBtn").onclick=()=>{ openCash("x","cxAmt"); cxFill(); };
$("cashRBtn").onclick=()=>openCash("r");
$("cwCur").onclick=()=>openCurPicker("באיזה מטבע משכת?",cur.cw||S.localCur,c=>{ cur.cw=c; renderCash(); });
$("cwFeeCur").onclick=()=>openCurPicker("באיזה מטבע העמלה?",cur.cwFee||S.localCur,c=>{ cur.cwFee=c; renderCash(); });
$("caCur").onclick=()=>openCurPicker("איזה מטבע?",cur.ca||S.localCur,c=>{ cur.ca=c; renderCash(); });
$("cxFrom").onclick=()=>openCurPicker("נתתי…",cur.cxF||S.localCur,c=>{ cur.cxF=c; renderCash(); cxFill(); });
$("cxTo").onclick=()=>openCurPicker("קיבלתי…",cur.cxT||"USD",c=>{ cur.cxT=c; renderCash(); cxFill(); });
function cxFill(){ const a=num("cxAmt"); const f=cur.cxF||S.localCur, t=cur.cxT||(S.localCur==="USD"?"ILS":"USD"); if(a>0&&!$("cxTo").dataset.touched) $("cxGot").value=group(String(Math.round(conv(a,f,t)*100)/100)); }
$("cxAmt").addEventListener("input",()=>{ delete $("cxTo").dataset.touched; cxFill(); });
$("cxGot").addEventListener("input",()=>{ $("cxTo").dataset.touched="1"; });
$("cwSave").onclick=async()=>{
  showErr("cwErr"); const amt=num("cwAmt"), fee=num("cwFee")||0;
  if(!(amt>0)) return showErr("cwErr","כמה משכת?");
  const ok=await cashSave({sub:"withdraw",amount:amt,cur:cur.cw||S.localCur,fee,feeCur:cur.cwFee||S.localCur,desc:"משיכה מכספומט"});
  if(ok){ $("cwAmt").value=""; $("cwFee").value=""; cashForm=null; toast("🏧 נרשמה משיכה של "+fmt(amt,cur.cw||S.localCur)+(fee>0?" (העמלה נרשמה כהוצאה)":"")); }
};
$("caSave").onclick=async()=>{
  showErr("caErr"); const v=num("caAmt"); const c=cur.ca||S.localCur;
  if(!(v>=0)) return showErr("caErr","צריך להזין סכום");
  const diff= caMode==="count" ? Math.round((v-(CASHBAL[c]||0))*100)/100 : caMode==="minus" ? -v : v;
  if(!diff){ cashForm=null; renderCash(); return toast("היתרה כבר מדויקת ✓"); }
  const ok=await cashSave({sub:"adjust",amount:diff,cur:c,note:$("caNote").value.trim(),desc:"עדכון ארנק"});
  if(ok){ $("caAmt").value=""; $("caNote").value=""; cashForm=null; toast((diff<0?"➖ ירד ":"➕ נוסף ")+fmt(Math.abs(diff),c)+" בארנק"); }
};
$("cxSave").onclick=async()=>{
  showErr("cxErr"); const a=num("cxAmt"), b=num("cxGot"); const f=cur.cxF||S.localCur, t=cur.cxT||(S.localCur==="USD"?"ILS":"USD");
  if(!(a>0)||!(b>0)) return showErr("cxErr","צריך למלא כמה נתת וכמה קיבלת");
  if(f===t) return showErr("cxErr","בוחרים שני מטבעות שונים");
  const ok=await cashSave({sub:"exchange",amount:a,cur:f,toAmount:b,toCur:t,desc:"החלפת מטבע"});
  if(ok){ $("cxAmt").value=""; $("cxGot").value=""; delete $("cxTo").dataset.touched; cashForm=null; toast("💱 הוחלפו "+fmt(a,f)+" ב-"+fmt(b,t)); }
};
$("cashRSave").onclick=async()=>{
  const bal=cashBalances(); const curs=Object.keys(bal).filter(c=>Math.abs(bal[c])>0.004);
  if(!curs.length){ cashForm=null; renderCash(); return; }
  for(const c of curs) await cashSave({sub:"reset",amount:-bal[c],cur:c,desc:"איפוס ארנק"});
  cashForm=null; toast("🔄 הארנק אופס ל-0");
};
$("dMore").onclick=()=>{ dayLimit+=30; renderDaily(); };

/* ---- repeat an expense for today, and undo for deletes ---- */
async function again(it,personal){
  const id=uid(personal?"m":"e"); const base={...it}; delete base.id;
  Object.assign(base,{date:todayStr(),createdAt:Date.now(),tz:hereTz(),loc:defLoc(),trip:curTrip});
  let ok;
  if(personal){ const c=await loadAcct(); if(!c) return; const doc=await encFor(c,base); ok=await run(()=>EXP().doc(id).set(doc)); }
  else { base.by=me||null; delete base.source; ok=await run(()=>EXP().doc(id).set(base)); if(ok) notifyOthers("🧾 "+nm(me||it.payer)+" "+(fem(me||it.payer)?"הוסיפה":"הוסיף")+": "+(base.desc||"הוצאה")+" "+fmt(+base.amount,base.cur)); }
  if(ok) toast("🔁 נוסף שוב להיום: "+(it.desc||"הוצאה"),"ביטול",()=>run(()=>personal?EXP().doc(id).update({deleted:true,deletedAt:Date.now(),deletedBy:me||null}):EXP().doc(id).delete()));
}
/* deleting moves an expense to the recycle bin for 30 days */
const BIN_DAYS=30;
async function delItem(it,personal){
  const r0=document.querySelector('.row[data-id="'+CSS.escape(it.id)+'"]'); const row=r0&&r0.closest(".swipe")||r0;
  if(row&&!calm()){ row.classList.add("leave"); buzz(12); await new Promise(r=>setTimeout(r,240)); }
  SEEN.delete(it.id);
  const ok=await run(()=>EXP().doc(it.id).update({deleted:true,deletedAt:Date.now(),deletedBy:me||null}));
  if(ok) toast("🗑 הועבר לסל המחזור: "+(it.kind==="transfer"?"העברה":(it.desc||"הוצאה")),"ביטול",()=>restoreItem(it.id));
}
async function restoreItem(id){ const k=await run(()=>EXP().doc(id).update({deleted:false,deletedAt:null,deletedBy:null})); if(k) toast("שוחזר ✓"); }
async function purgeItem(id){ await run(()=>EXP().doc(id).delete()); }
async function renderBin(){
  const L=$("binList"); if(!L) return; L.innerHTML="";
  const rows=[...BIN.map(it=>({...it,_mine:false}))];
  const c=await loadAcct().catch(()=>null);
  if(c){ for(const r of BINRAW){ if(r.tag!==c.tag) continue; try{ const pb=await crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(r.iv)},c.key,unb64(r.data)); rows.push({...JSON.parse(dec.decode(pb)),id:r.id,deletedAt:r.deletedAt,deletedBy:r.deletedBy,_mine:true}); }catch(e){} } }
  rows.sort((x,y)=>(y.deletedAt||0)-(x.deletedAt||0));
  $("binCount").textContent=rows.length?"("+rows.length+")":"";
  if(!rows.length){ L.innerHTML='<div class="hint">הסל ריק.</div>'; return; }
  for(const it of rows){
    const r=document.createElement("div"); r.className="prow binrow";
    const t=document.createElement("div"); t.className="bininfo";
    const left=Math.max(0,BIN_DAYS-Math.floor((Date.now()-(it.deletedAt||0))/864e5));
    t.innerHTML='<b></b><small class="hint"></small>';
    t.querySelector("b").textContent=(it._mine?"🔐 ":"")+(it.kind==="transfer"?"💸 "+nm(it.payer)+" ← "+nm(it.to):(it.desc||"הוצאה"))+" · "+fmt(+it.amount,it.cur);
    t.querySelector("small").textContent=(it.deletedBy?"נמחק ע״י "+nm(it.deletedBy)+" · ":"")+"יימחק לגמרי בעוד "+left+" ימים";
    const rs=document.createElement("button"); rs.type="button"; rs.className="btn small"; rs.textContent="↩️ שחזור"; rs.onclick=()=>restoreItem(it.id);
    const del=document.createElement("button"); del.type="button"; del.className="btn small danger"; del.textContent="מחיקה סופית";
    del.onclick=()=>{ if(del.dataset.sure){ purgeItem(it.id); } else { del.dataset.sure="1"; del.textContent="בטוח?"; setTimeout(()=>{ if(del.isConnected){ delete del.dataset.sure; del.textContent="מחיקה סופית"; } },3000); } };
    r.append(t,rs,del); L.appendChild(r);
  }
}

/* ---- name suggestions from earlier expenses ---- */
function suggest(inputId,boxId,pool,apply){
  const box=$(boxId); const q=norm($(inputId).value); box.innerHTML="";
  if(!q){ box.hidden=true; return; }
  const seen=new Set(), out=[];
  for(const it of [...pool].sort((x,y)=>(y.createdAt||0)-(x.createdAt||0))){
    const d=(it.desc||"").trim(); const k=norm(d); if(!d||seen.has(k)||k===q||!k.includes(q)) continue; seen.add(k); out.push(it); if(out.length>=4) break;
  }
  box.hidden=!out.length;
  for(const it of out){ const b=document.createElement("button"); b.type="button"; b.className="chip"; b.textContent=it.desc+" · "+fmt(+it.amount,it.cur);
    b.onclick=()=>{ apply(it); box.hidden=true; }; box.appendChild(b); }
}
$("fDesc").addEventListener("input",()=>suggest("fDesc","fSuggest",S.items.filter(x=>x.kind!=="transfer"),it=>{
  $("fDesc").value=it.desc; form.cat=it.cat||"other"; $("fCatLabel").value=it.catLabel||"";
  if(!$("fAmt").value){ $("fAmt").value=group(String(it.amount)); cur.fCur=it.cur||cur.fCur; }
  renderForm(); }));
$("pDesc").addEventListener("input",()=>suggest("pDesc","pSuggest",P,it=>{
  $("pDesc").value=it.desc; pform.cat=it.cat||"other"; $("pCatLabel").value=it.catLabel||"";
  if(!$("pAmt").value){ $("pAmt").value=group(String(it.amount)); cur.pCur=it.cur||cur.pCur; }
  renderPersonal(); }));

/* ---- notifications: in the app, and to the phone through the free ntfy app ---- */
function notifyOthers(text){
  if(!me) return;
  for(const p of active()){ if(p.id===me||!p.ntfy) continue;
    try{ fetch("https://ntfy.sh/"+encodeURIComponent(p.ntfy)+"?tags=moneybag&click="+encodeURIComponent(personalUrl(p.id,true)),{method:"POST",body:/^💸/.test(text)?"💸 נרשמה העברה חדשה":"🧾 נוספה הוצאה חדשה",keepalive:true}).catch(()=>{}); }catch(e){} }
}
function sinceLastVisit(){
  if(!me) return;
  const key="trip-seen-"+me; const last=+load(key)||0; store(key,String(Date.now()));
  if(!last) return;
  const fresh=S.items.filter(it=>it.by&&it.by!==me&&(it.createdAt||0)>last);
  FRESH=new Set(fresh.map(it=>it.id));
  if(fresh.length){ const by=[...new Set(fresh.map(it=>it.by))].map(nm).join(" ו");
    toast("🔔 "+by+" "+(fresh.length===1?"הוסיף/ה הוצאה אחת":"הוסיפו "+fresh.length+" הוצאות")+" מאז הפעם הקודמת (מסומנות ברשימה)"); renderAll(); }
}
function renderNotif(){
  if(!me){ $("notifSec").hidden=true; return; } $("notifSec").hidden=false;
  const t=person(me)?.ntfy; $("ntfyOff").hidden=!!t; $("ntfyOn").hidden=!t;
  if(t) $("ntfyTopic").textContent=t;
}
$("ntfyEnable").onclick=async()=>{
  const topic="trip-"+Array.from(crypto.getRandomValues(new Uint8Array(9)),x=>x.toString(16).padStart(2,"0")).join("");
  const ok=await run(()=>db.runTransaction(async tx=>{ const s=await tx.get(metaRef()); const people=((s.data()?.people)||[]).map(p=>p.id===me?{...p,ntfy:topic}:p); tx.update(metaRef(),{people}); }));
  if(ok){ const p=person(me); if(p) p.ntfy=topic; renderNotif(); }
};
$("ntfyCopy").onclick=()=>{ const t=$("ntfyTopic").textContent; try{ navigator.clipboard.writeText(t).then(()=>{ $("ntfyCopy").textContent="הועתק ✓"; setTimeout(()=>$("ntfyCopy").textContent="העתקה",1500); }); }catch(e){} };
$("ntfyTest").onclick=()=>{ const t=person(me)?.ntfy; if(!t) return;
  fetch("https://ntfy.sh/"+encodeURIComponent(t)+"",{method:"POST",body:"🔔 בדיקה: ההתראות עובדות!"}).then(r=>toast(r.ok?"נשלחה התראת בדיקה ✓":"השליחה נכשלה")).catch(()=>toast("השליחה נכשלה. בדקו קליטה.")); };
$("ntfyOffBtn").onclick=async()=>{
  const ok=await run(()=>db.runTransaction(async tx=>{ const s=await tx.get(metaRef()); const people=((s.data()?.people)||[]).map(p=>{ if(p.id!==me) return p; const q={...p}; delete q.ntfy; return q; }); tx.update(metaRef(),{people}); }));
  if(ok){ const p=person(me); if(p) delete p.ntfy; renderNotif(); }
};

/* ---- export a backup for Excel ---- */
$("exportBtn").onclick=async()=>{
  const esc=v=>{ let s=String(v==null?"":v); if(typeof v!=="number"&&/^[=+\-@\t\r]/.test(s)) s="'"+s; return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; };
  const head=["סוג","תאריך","שעה","שם","קטגוריה","סכום","מטבע","בשקלים","מי שילם","בין מי","מדינה"];
  const rows=[head];
  const line=(type,it,payer,among)=>rows.push([type,it.date,timeOf(it),it.kind==="transfer"?"העברה ל"+nm(it.to):(it.desc||""),it.kind==="transfer"?"":catName(catKey(it)),it.amount,it.cur,Math.round(conv(+it.amount||0,it.cur,"ILS")*100)/100,payer,among,locName(locOf(it))]);
  for(const it of [...S.items].sort((x,y)=>(x.date||"").localeCompare(y.date||""))) line(it.kind==="transfer"?"העברה":"משותף",it,nm(it.payer),it.kind==="transfer"?"":splitText(it));
  if(me&&acct&&acctFor===me) for(const it of [...P].sort((x,y)=>(x.date||"").localeCompare(y.date||""))) line("אישי של "+nm(me),it,nm(me),"");
  const csv="\ufeff"+rows.map(r=>r.map(esc).join(",")).join("\r\n");
  const name=(S.trip||"trip").replace(/[^\w\u0590-\u05FF]+/g,"-").replace(/^-|-$/g,"")+"-"+todayStr()+".csv";
  const file=new File([csv],name,{type:"text/csv"});
  try{ if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:name}); return; } }catch(e){ if(e&&e.name==="AbortError") return; }
  const url=URL.createObjectURL(file); const l=document.createElement("a"); l.href=url; l.download=name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(()=>URL.revokeObjectURL(url),4000);
};

/* ---- settings sheet ---- */
let delAsk=null;
function usesPerson(id){ return S.items.some(it=>it.payer===id||it.to===id||(it.among||[]).includes(id)||(it.pcts&&id in it.pcts)); }
function renderTrips(){
  const L=$("tripList"); L.innerHTML=""; const act=activeTrip();
  for(const t of [...tripsList()].reverse()){
    const n=ALL.filter(x=>!x.deleted&&x.kind!=="private"&&x.kind!=="transfer"&&tripOf(x)===t.id).length;
    const r=document.createElement("div"); r.className="triprow"+(t.id===curTrip?" on":"");
    const info=document.createElement("div"); info.className="bininfo";
    const b=document.createElement("b"); b.textContent=(CTRY[t.localCur]||"🧳").split(" ")[0]+" "+(t.name||"טיול");
    const s=document.createElement("small"); s.className="hint"; s.textContent=(t.startDate?"מ-"+t.startDate.split("-").reverse().join(".")+" · ":"")+n+" הוצאות"+(t.id===act?" · הטיול הנוכחי":" · בארכיון");
    info.append(b,s); r.appendChild(info);
    if(t.id===curTrip){ const on=document.createElement("span"); on.className="chip dark"; on.textContent="פתוח"; r.appendChild(on); }
    else { const o=document.createElement("button"); o.type="button"; o.className="btn small"; o.textContent="פתיחה"; o.onclick=()=>{ closeSheet("setSheet"); switchTrip(t.id); }; r.appendChild(o); }
    L.appendChild(r);
  }
  setCurBtn("ntCur",cur.nt||S.localCur);
}
$("ntOpen").onclick=()=>{ $("ntForm").hidden=!$("ntForm").hidden; if(!$("ntForm").hidden) $("ntName").focus(); };
$("ntCur").onclick=()=>openCurPicker("באיזה מטבע מתחילים?",cur.nt||S.localCur,c=>{ cur.nt=c; renderTrips(); });
$("ntSave").onclick=async()=>{
  showErr("ntErr"); const name=$("ntName").value.trim(); const start=$("ntStart").value; const lc=cur.nt||S.localCur;
  if(!name) return showErr("ntErr","איך קוראים לטיול?");
  const id="t"+Date.now().toString(36);
  const ok=await updateTrips(list=>{ list.push({id,name,localCur:lc,startDate:start||""}); return {active:id}; });
  if(ok){ $("ntName").value=""; $("ntStart").value=""; $("ntForm").hidden=true; META={...META,trips:[...tripsList(),{id,name,localCur:lc,startDate:start||""}],active:id}; closeSheet("setSheet"); switchTrip(id); confetti(); }
};
$("tripBack").onclick=()=>switchTrip(activeTrip());
function renderSettings(){
  renderTrips();
  renderNotif(); renderBin();
  applyTheme(themePref());
  if(document.activeElement!==$("sTrip")) $("sTrip").value=S.trip||"";
  if(document.activeElement!==$("sStart")) $("sStart").value=tripStart()||"";
  const L=$("people"); L.innerHTML="";
  const bal=compute().bal;
  for(const p of active()){
    const row=document.createElement("div"); row.className="prow";
    const n=document.createElement("input"); n.value=p.name; n.maxLength=20; n.setAttribute("aria-label","שם של "+p.name);
    n.onchange=()=>{ const v=n.value.trim(); if(!v){ n.value=p.name; return; } renamePerson(p.id,v); };
    const share=document.createElement("button"); share.type="button"; share.className="btn small"; share.textContent="🔗 קישור";
    share.onclick=()=>shareUrl(share,personalUrl(p.id),"הקישור של "+p.name);
    const del=document.createElement("button"); del.type="button"; del.className="btn small danger"; del.textContent="🗑"; del.setAttribute("aria-label","מחיקת "+p.name);
    del.onclick=()=>{ delAsk= delAsk===p.id?null:p.id; renderSettings(); };
    row.append(n,share,del);
    if(delAsk===p.id){
      const cf=document.createElement("div"); cf.className="confirm";
      const b=bal[p.id]||0; const open=Math.abs(b)>=conv(0.5,"ILS",showCur);
      const msg=document.createElement("span");
      msg.textContent= open ? "ל"+p.name+" יש יתרה פתוחה של "+fmt(Math.abs(b),showCur)+". אחרי המחיקה ההוצאות הקודמות יישארו בחשבון. למחוק בכל זאת?" :
        usesPerson(p.id) ? "למחוק את "+p.name+"? ההוצאות הקודמות יישארו ברשימה, אבל לא יהיה אפשר לבחור אותו/ה בהוצאות חדשות." : "למחוק את "+p.name+"?";
      const yes=document.createElement("button"); yes.type="button"; yes.className="btn small danger"; yes.textContent="כן, למחוק"; yes.onclick=()=>removePerson(p.id);
      const no=document.createElement("button"); no.type="button"; no.className="btn small"; no.textContent="ביטול"; no.onclick=()=>{ delAsk=null; renderSettings(); };
      cf.append(msg,yes,no); row.appendChild(cf);
    }
    L.appendChild(row);
  }
  $("acctSec").hidden=!me;
  if(me){ const p=person(me); const inNow=!!(acct&&acctFor===me);
    $("acctText").textContent= !p?.vk ? "עוד לא נוצר חשבון אישי. נכנסים אליו דרך הכפתור \"האישי שלי\"." : inNow ? "את/ה מחובר/ת לחשבון האישי של "+nm(me)+" במכשיר הזה." : "החשבון קיים, אבל במכשיר הזה עוד לא נכנסת אליו.";
    $("acctChange").hidden=!inNow; $("acctLogout").hidden=!inNow; }
}
async function renamePerson(id,name){
  await run(()=>db.runTransaction(async tx=>{ const s=await tx.get(metaRef()); const people=((s.data()?.people)||[]).map(p=>p.id===id?{...p,name}:p); tx.update(metaRef(),{people}); }));
}
async function removePerson(id){
  const keep=usesPerson(id);
  const ok=await run(()=>db.runTransaction(async tx=>{ const s=await tx.get(metaRef()); let people=(s.data()?.people)||[];
    people= keep ? people.map(p=>p.id===id?{...p,archived:true}:p) : people.filter(p=>p.id!==id);
    tx.update(metaRef(),{people}); }));
  if(ok){ delAsk=null; if(me===id){ $("switchBtn").click(); } }
}
function shareUrl(btn,url,title){
  const old=btn.textContent; const ok=()=>{ btn.textContent="הועתק ✓"; setTimeout(()=>btn.textContent=old,1500); };
  if(navigator.share){ navigator.share({title:title||S.trip,url}).catch(()=>{}); return; }
  try{ navigator.clipboard.writeText(url).then(ok,()=>{ prompt("העתיקו את הקישור:",url); }); }catch(e){}
}
$("settingsBtn").onclick=()=>{ delAsk=null; $("pwChange").hidden=true; renderSettings(); openSheet("setSheet"); };
$("setClose").onclick=()=>closeSheet("setSheet");

/* ---- account chip at the top: who is signed in on this phone ---- */
const U_RE=/^[A-Za-z0-9][A-Za-z0-9._]{2,19}$/;
function uCheck(u,except){ if(!u) return ""; if(!U_RE.test(u)) return "שם משתמש: 3–20 תווים, אותיות באנגלית, מספרים, נקודה או קו תחתון."; if(S.people.some(p=>p.id!==except&&!p.archived&&(p.u||"").toLowerCase()===u.toLowerCase())) return "שם המשתמש "+u+" כבר תפוס."; return ""; }
async function setHandle(id,u){
  return run(()=>db.runTransaction(async tx=>{ const s=await tx.get(metaRef()); const people=(s.data()?.people)||[];
    if(u&&people.some(p=>p.id!==id&&!p.archived&&(p.u||"").toLowerCase()===u.toLowerCase())) throw new Error("taken");
    tx.update(metaRef(),{people:people.map(p=>p.id===id?{...p,u}:p)}); }));
}
/* the first two usernames, chosen by Yair */
let handlesSet=false;
function defaultHandles(){
  if(handlesSet||!canWrite) return; handlesSet=true;
  const want={yair:"Yair.28",gali:"Gali.06"};
  const todo=S.people.filter(p=>want[p.id]&&!p.u&&!uCheck(want[p.id],p.id));
  if(!todo.length) return;
  run(()=>db.runTransaction(async tx=>{ const s=await tx.get(metaRef()); const people=(s.data()?.people)||[];
    tx.update(metaRef(),{people:people.map(p=>want[p.id]&&!p.u?{...p,u:want[p.id]}:p)}); }));
}
function ini(n){ n=String(n||"").trim(); const w=n.split(/\s+/); return w.length>1 ? w[0].charAt(0)+w[1].charAt(0) : n.slice(0,2); }
function renderAcct(){
  const c=$("acctBtn"), on=!!me&&!!person(me);
  c.classList.toggle("out",!on);
  $("acctAv").textContent= on ? ini(nm(me)) : "👤";
  $("acctName").textContent= on ? nm(me) : "התחברות";
  $("acctDot").hidden= !(on&&acct&&acctFor===me);
  c.setAttribute("aria-label", on ? "החשבון של "+nm(me) : "בחירת משתמש");
}
function quickUrl(kind){ return PAGE_URL+"?u="+encodeURIComponent(me)+"&add="+(kind==="me"?"me":"1")+keyHash(); }
function fillAcct(){
  const f=fem(me), open=!!(acct&&acctFor===me), hasPw=!!person(me)?.vk;
  $("acctAv2").textContent=ini(nm(me));
  $("acctName2").textContent=nm(me);
  $("acctSub").textContent=(f?"מחוברת":"מחובר")+" בטלפון הזה";
  $("acctTrip").textContent=S.trip||"הטיול";
  $("acctLock").textContent= open ? "פתוחות 🔓" : hasPw ? "נעולות 🔒" : "עוד אין סיסמה";
  $("acctConn").textContent= !canWrite ? "קריאה בלבד" : navigator.onLine===false ? "בלי קליטה, נשמר בטלפון" : "מחובר ✓";
  const u=person(me)?.u||"";
  $("acctHandle").textContent= u? "@"+u : "";
  $("acctU").textContent= u||"עוד אין";
  $("acctUEdit").hidden=!canWrite;
  const L=$("acctList"); L.innerHTML="";
  for(const p of active()){
    const r=document.createElement("div"); r.className="acct-p";
    const a=document.createElement("span"); a.className="av"; a.textContent=ini(p.name);
    const w=document.createElement("span"); w.className="who";
    const b=document.createElement("b"); b.textContent=p.name;
    const sm=document.createElement("small"); sm.dir="ltr"; sm.style.textAlign="right"; sm.textContent= p.u? "@"+p.u : "בלי שם משתמש";
    w.append(b,sm); r.append(a,w);
    if(p.id===me){ const t=document.createElement("span"); t.className="me"; t.textContent= fem(me)?"זו את":"זה אתה"; r.append(t); }
    else { const sh=document.createElement("button"); sh.type="button"; sh.className="btn small"; sh.textContent="📤 קישור"; sh.setAttribute("aria-label","שליחת הקישור של "+p.name); sh.onclick=()=>shareUrl(sh,personalUrl(p.id),"הקישור של "+p.name+" ל"+(S.trip||"טיול")); r.append(sh); }
    L.append(r);
  }
  $("acctNew").hidden=!canWrite; $("acctQuickBox").hidden=!canWrite;
  $("acctLockBtn").hidden=!open;
  $("acctMine").textContent= view==="personal" ? "🤝 לחשבון המשותף" : "👤 להוצאות האישיות שלי";
  $("acctMine").hidden=!canWrite;
}
$("acctBtn").onclick=()=>{ buzz(6);
  if(!me||!person(me)){ const pk=$("picker"); if(!pk.hidden){ pk.scrollIntoView({behavior:"smooth",block:"center"}); } return; }
  fillAcct(); openSheet("acctSheet"); };
$("acctClose").onclick=()=>closeSheet("acctSheet");
const copyQuick=(kind,b)=>{ const u=quickUrl(kind), old=b.textContent;
  const done=()=>{ b.textContent="הועתק ✓"; toast("📋 הקישור הועתק. עכשיו פותחים את ספארי ומדביקים"); setTimeout(()=>b.textContent=old,1600); };
  try{ navigator.clipboard.writeText(u).then(done,()=>prompt("העתיקו את הקישור:",u)); }catch(e){ prompt("העתיקו את הקישור:",u); } };
$("acctQuick").onclick=()=>copyQuick("1",$("acctQuick"));
$("acctQuickMe").onclick=()=>copyQuick("me",$("acctQuickMe"));
$("acctQuickHow").onclick=()=>{ const h=$("acctQuickHelp"); h.hidden=!h.hidden; $("acctQuickHow").textContent=h.hidden?"איך מוסיפים למסך הבית?":"סגירת ההסבר"; };
$("acctUEdit").onclick=()=>{ const b=$("acctUBox"); b.hidden=!b.hidden; showErr("acctUErr"); if(!b.hidden){ $("acctUIn").value=person(me)?.u||""; $("acctUIn").focus(); } };
$("acctUSave").onclick=async()=>{
  const u=$("acctUIn").value.trim(); const bad=uCheck(u,me); if(bad) return showErr("acctUErr",bad);
  const ok=await setHandle(me,u); if(!ok) return showErr("acctUErr","לא נשמר. ייתכן ששם המשתמש כבר תפוס.");
  const p=person(me); if(p) p.u=u; $("acctUBox").hidden=true; fillAcct(); toast(u?"🪪 שם המשתמש עכשיו "+u:"שם המשתמש הוסר"); };
let anG="m";
function renderAnG(){ seg($("anG"),[["m","זכר"],["f","נקבה"]],v=>v===anG,v=>{ anG=v; renderAnG(); }); }
$("acctNew").onclick=()=>{ const f=$("acctNewF"); f.hidden=!f.hidden; showErr("anErr"); renderAnG(); if(!f.hidden) $("anName").focus(); };
$("anCancel").onclick=()=>{ $("acctNewF").hidden=true; };
$("anSave").onclick=async()=>{
  const name=$("anName").value.trim(), u=$("anU").value.trim(); showErr("anErr");
  if(!name) return showErr("anErr","צריך לכתוב שם");
  if(!u) return showErr("anErr","צריך לבחור שם משתמש, למשל Noa.12");
  const bad=uCheck(u); if(bad) return showErr("anErr",bad);
  const id=uid("p");
  const ok=await run(()=>db.runTransaction(async tx=>{ const s=await tx.get(metaRef()); const people=(s.data()?.people)||[];
    if(people.some(p=>!p.archived&&(p.u||"").toLowerCase()===u.toLowerCase())) throw new Error("taken");
    tx.update(metaRef(),{people:[...people,{id,name,g:anG,u}]}); }));
  if(!ok) return showErr("anErr","לא נשמר. נסו שוב.");
  if(!person(id)) S.people.push({id,name,g:anG,u});
  $("anName").value=""; $("anU").value=""; $("acctNewF").hidden=true; fillAcct();
  toast("✨ "+name+" "+(anG==="f"?"הצטרפה":"הצטרף")+" לטיול","📤 שליחת קישור",()=>shareUrl($("acctNew"),personalUrl(id),"הקישור של "+name+" ל"+(S.trip||"טיול")));
};
$("acctMine").onclick=()=>{ closeSheet("acctSheet"); $("viewBtn").click(); };
$("acctSwitch").onclick=()=>{ closeSheet("acctSheet"); $("switchBtn").click(); };
$("acctLockBtn").onclick=()=>{ store("trip-ak-"+me,""); acct=null; acctFor=null; P=[]; if(view==="personal") view="shared"; closeSheet("acctSheet"); renderAll(); toast("🔒 האישי ננעל בטלפון הזה"); };
$("shareAll").onclick=()=>shareUrl($("shareAll"),PAGE_URL+keyHash(),S.trip);
$("sStartSave").onclick=async()=>{ const v=$("sStart").value; if(!/^\d{4}-\d{2}-\d{2}$/.test(v)) return; const ok=await patchTrip(curTrip,{startDate:v}); if(ok){ S.startDate=v; renderHero(); toast("📅 הטיול מתחיל ב-"+v.split("-").reverse().join(".")); } };
$("sTripSave").onclick=async()=>{ const v=$("sTrip").value.trim(); if(!v) return; await patchTrip(curTrip,{name:v}); };
$("acctLogout").onclick=()=>{ store("trip-ak-"+me,""); acct=null; acctFor=null; P=[]; renderAll(); renderSettings(); };
$("acctChange").onclick=()=>{ $("pwChange").hidden=!$("pwChange").hidden; };
$("pwSave").onclick=async()=>{
  showErr("pwErr"); const a=$("newPw").value, b=$("newPw2").value;
  if(a.length<4) return showErr("pwErr","הסיסמה צריכה להיות לפחות 4 תווים");
  if(a!==b) return showErr("pwErr","שתי הסיסמאות לא זהות");
  $("pwSave").disabled=true;
  try{ await setPassword(a); $("newPw").value=""; $("newPw2").value=""; $("pwChange").hidden=true; $("status").textContent="הסיסמה עודכנה ✓"; await refreshPersonal(); renderSettings(); }
  catch(e){ console.error(e); showErr("pwErr","לא הצלחנו לעדכן. בדקו את החיבור ונסו שוב."); }
  finally{ $("pwSave").disabled=false; }
};

/* ---- wiring ---- */
$("saveBtn").onclick=save; $("cancelEdit").onclick=resetForm;
$("fAmt").addEventListener("input",()=>convHint("fAmt",cur.fCur,"fConv"));
$("fAmt").addEventListener("keydown",e=>{ if(e.key==="Enter") save(); });
$("fDesc").addEventListener("keydown",e=>{ if(e.key==="Enter") $("fAmt").focus(); });
$("cA").addEventListener("input",()=>{ cLast="A"; renderConv(); });
$("cB").addEventListener("input",()=>{ cLast="B"; renderConv(); });
$("cSwap").onclick=()=>{ const f=cur.cFrom; cur.cFrom=cur.cTo; cur.cTo=f; const a=$("cA").value; $("cA").value=$("cB").value; $("cB").value=a; $("cSwap").classList.toggle("spin"); renderConv(); };
$("fDate").value=todayStr(); $("pDate").value=todayStr();
if(readParam("v")==="me") view="personal"; if(readParam("v")==="stats") view="stats";
applyTheme(themePref());
document.body.classList.add("boot"); setTimeout(()=>document.body.classList.remove("boot"),1400);
renderAll();
refreshRates(); setInterval(refreshRates,60*60*1000);
/* pick up new versions by itself (the home-screen app otherwise keeps an old copy) */
async function checkUpdate(manual){
  try{
    const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"}); if(!r.ok) return;
    const v=(await r.json()).v; if(!v||!window.APP_V||v===window.APP_V||window.APP_V.startsWith("__")) return "latest";
    let tried=null; try{ tried=sessionStorage.getItem("trip-upd"); }catch(e){}
    if(tried===v&&!manual) return "stuck";
    try{ sessionStorage.setItem("trip-upd",v); }catch(e){}
    const q=new URLSearchParams(location.search); q.set("r",v);
    location.replace(location.pathname+"?"+q.toString()+location.hash);
  }catch(e){}
}
function verLabel(v){ const m=/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)/.exec(v||""); if(!m) return "—";
  const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5])); return d.toLocaleString("he-IL",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}); }
$("verText").textContent="הגרסה אצלך: "+verLabel(window.APP_V);
$("verCheck").onclick=async()=>{ $("verCheck").disabled=true; $("verCheck").textContent="בודק…";
  const res=await checkUpdate(true);
  $("verCheck").disabled=false;
  $("verCheck").textContent= res==="latest" ? "✓ זו הגרסה העדכנית" : res==="stuck" ? "יש גרסה חדשה, סגרו ופתחו את האפליקציה" : "בדיקת עדכונים"; };
checkUpdate(); setInterval(()=>checkUpdate(),10*60*1000);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") checkUpdate(); });
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible"&&(!S.fx.at||Date.now()-S.fx.at>3600e3)) refreshRates(); });

/* ---- no key: either move the old open trip into a private space (once), or ask for the private link ---- */
function gate(html){
  let g=document.getElementById("spaceGate");
  if(!g){ g=document.createElement("div"); g.id="spaceGate"; g.style.cssText="position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(20,14,40,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)"; document.body.appendChild(g); }
  g.innerHTML='<div dir="rtl" style="background:#fff;color:#1d1630;border-radius:22px;padding:22px;max-width:420px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,.3);font-family:inherit;display:flex;flex-direction:column;gap:12px;text-align:right">'+html+'</div>';
  return g;
}
function askForLink(msg){
  const g=gate('<div style="font-size:40px">🔒</div><b style="font-size:20px">'+msg+'</b><div style="color:#6a6378;font-size:15px">הדביקו כאן את הקישור שקיבלתם בוואטסאפ, ותיכנסו. צריך לעשות את זה רק פעם אחת בטלפון הזה.</div><input id="gateIn" type="url" inputmode="url" placeholder="הדביקו כאן את הקישור" style="font:inherit;font-size:16px;padding:12px 14px;border-radius:12px;border:2px solid #e3dcf2;direction:ltr"><div id="gateErr" style="color:#c2185b;font-size:14px;min-height:1em"></div><button id="gateGo" type="button" class="btn">כניסה</button>');
  g.querySelector("#gateGo").onclick=()=>{
    const v=g.querySelector("#gateIn").value.trim(); const m=/[#&]k=([a-z0-9]{32,64})/.exec(v);
    if(!m){ g.querySelector("#gateErr").textContent="זה לא נראה כמו הקישור של הטיול. העתיקו את כל הקישור ונסו שוב."; return; }
    store("trip-space",m[1]); const u=/[?&]u=([^&#]+)/.exec(v);
    location.replace(PAGE_URL+(u?"?u="+u[1]:"")+"#k="+m[1]); location.reload(); /* a hash-only change does not reload by itself */
  };
}
async function noSpace(){
  const legacyMeta=db.collection("trip").doc("meta");
  let snap=null; try{ snap=await legacyMeta.get(); }catch(e){}
  if(!snap||!snap.exists||snap.data().migrated){ askForLink(snap&&snap.exists?"הטיול עבר לקישור מאובטח":"צריך את הקישור של הטיול"); return; }
  const g=gate('<div style="font-size:40px">🔐</div><b style="font-size:20px">הטיול עובר לקישור מאובטח</b><div style="color:#6a6378;font-size:15px">עד עכשיו כל מי שידע את שם הפרויקט יכול היה לראות ולשנות את ההוצאות. עכשיו רק מי שיש לו את הקישור יוכל להיכנס, בלי שום התחברות. כל ההוצאות עוברות כמו שהן, ואחרי זה תקבלו קישור חדש לשלוח לכולם.</div><div id="gateErr" style="color:#c2185b;font-size:14px;min-height:1em"></div><button id="gateGo" type="button" class="btn">יצירת קישור מאובטח</button>');
  g.querySelector("#gateGo").onclick=async()=>{
    const b=g.querySelector("#gateGo"); b.disabled=true; b.textContent="מעבירים את ההוצאות…";
    try{
      const k=newKey(); const sp=db.collection("spaces").doc(k);
      const meta=(await legacyMeta.get()).data(); const items=await db.collection("expenses").get();
      let batch=db.batch(), n=0; const commits=[];
      batch.set(sp.collection("trip").doc("meta"),meta);
      for(const d of items.docs){ batch.set(sp.collection("expenses").doc(d.id),d.data()); if(++n%400===0){ commits.push(batch.commit()); batch=db.batch(); } }
      commits.push(batch.commit()); await Promise.all(commits);
      const check=await sp.collection("expenses").get();
      if(check.size!==items.size) throw new Error("count "+check.size+"/"+items.size);
      await legacyMeta.update({migrated:true,migratedAt:Date.now()});
      store("trip-space",k); store("trip-moved","1");
      const u=readParam("u")||load("trip-me");
      location.replace(PAGE_URL+(u?"?u="+encodeURIComponent(u):"")+"#k="+k); location.reload();
    }catch(e){ console.error(e); b.disabled=false; b.textContent="יצירת קישור מאובטח"; g.querySelector("#gateErr").textContent="ההעברה לא הצליחה ("+(e.code||e.message||"שגיאה")+"). שום דבר לא נמחק. נסו שוב."; }
  };
}

/* ---- data ---- */
const cfg=window.FIREBASE_CONFIG;
if(!cfg||!window.firebase){
  $("roNote").hidden=false; $("roNote").textContent="האפליקציה עוד לא מחוברת למסד נתונים. מחשבון ההמרה כבר עובד.";
  return;
}
firebase.initializeApp(cfg); db=firebase.firestore(); canWrite=true;
if(!SPACE){ noSpace(); return; }
try{ const pr=db.enablePersistence&&db.enablePersistence({synchronizeTabs:true}); if(pr&&pr.catch) pr.catch(()=>{}); }catch(e){}
if("serviceWorker" in navigator&&location.protocol==="https:") navigator.serviceWorker.register("sw.js").catch(()=>{});
function netNote(){ $("netNote").hidden=navigator.onLine!==false; }
window.addEventListener("online",netNote); window.addEventListener("offline",netNote); netNote();
let gotMeta=false, gotItems=false, firstMeta=true;
const ready=()=>{
  if(gotMeta&&gotItems&&!loaded){
    loaded=true; form.among=null; me=readHash(); setTimeout(()=>{ seenReady=true; },1500);
    /* opened from the home-screen icon: remember who uses this phone */
    if(!me&&isApp()){ const r=load("trip-me"); if(person(r)&&!person(r).archived){ me=r; syncUrl(); } }
    if(me) store("trip-me",me);
    if(me){ form.payer=me; refreshPersonal(); if(location.hash&&!readParam("u")) syncUrl(); setTimeout(sinceLastVisit,600); }
    if(load("trip-moved")==="1"){ try{ localStorage.removeItem("trip-moved"); }catch(e){} setTimeout(()=>{ toast("🔒 מאובטח! שלחו לכולם קישור חדש","לקישורים",()=>$("settingsBtn").click()); },900); }
    else view="shared";
    /* opened from the quick-add icon or shortcut: straight to a new expense */
    if(QUICK&&canWrite){
      view= QUICK==="me"&&me ? "personal" : "shared";
      if(me) syncUrl();
      setTimeout(()=>{ renderAll(); openAdd(); },350);
    }
  }
  renderAll();
};
const timer=setTimeout(()=>{ if(!loaded) $("status").textContent="הנתונים עדיין לא נטענו. בדקו את החיבור לאינטרנט."; },10000);
metaRef().onSnapshot(async s=>{
  if(!s.exists){
    try{ await db.runTransaction(async tx=>{ const c=await tx.get(metaRef()); if(c.exists) return; tx.set(metaRef(),SEED_META); for(const it of SEED_ITEMS){ const {id,...rest}=it; tx.set(EXP().doc(id),rest); } }); }
    catch(e){ console.error(e); $("status").textContent="לא הצלחנו ליצור את הטיול במסד הנתונים."; }
    return;
  }
  const d=s.data(); const prevLocal=S.localCur;
  const was=curTrip; META=d; S.people=d.people||[]; applyTrip(); if(ALL.length&&was!==curTrip){ splitItems(); }
  if(firstMeta||prevLocal!==S.localCur){ if(!editingId) cur.fCur=S.localCur; if(!pEditingId) cur.pCur=S.localCur; cur.cFrom=S.localCur; }
  firstMeta=false;
  gotMeta=true; clearTimeout(timer); if(/נטענו/.test($("status").textContent)) $("status").textContent="";
  if(loaded&&me){ acct=null; acctFor=null; refreshPersonal(); }
  defaultHandles();
  if(!$("acctSheet").hidden&&me&&$("acctUBox").hidden&&$("acctNewF").hidden) fillAcct();
  ready();
},e=>{ console.error(e); $("status").textContent="לא הצלחנו לטעון את הנתונים."; });
let firstItems=true;
EXP().onSnapshot({includeMetadataChanges:true},snap=>{
  PENDING=new Set(snap.docs.filter(d=>d.metadata&&d.metadata.hasPendingWrites).map(d=>d.id));
  if(!firstItems&&loaded&&me&&snap.docChanges) for(const ch of snap.docChanges()){
    const d=ch.doc.data(); if(ch.type!=="added"||!d||d.deleted||tripOf(d)!==curTrip||d.kind==="private"||!d.by||d.by===me||(ch.doc.metadata&&ch.doc.metadata.hasPendingWrites)) continue;
    toast("🔔 "+nm(d.by)+" "+(fem(d.by)?"הוסיפה":"הוסיף")+": "+(d.kind==="transfer"?"העברה ל"+nm(d.to):(d.desc||"הוצאה"))+" "+fmt(+d.amount,d.cur));
  }
  firstItems=false;
  ALL=snap.docs.map(d=>({id:d.id,...d.data()}));
  const gone=splitItems();
  if(!purged&&!snap.metadata?.fromCache){ purged=true; const cut=Date.now()-BIN_DAYS*864e5; for(const x of gone){ if((x.deletedAt||0)<cut) EXP().doc(x.id).delete().catch(()=>{}); } }
  if(loaded) refreshPersonal();
  if(!$("setSheet").hidden) renderBin();
  gotItems=true; ready();
},e=>{ console.error(e); });
})();
