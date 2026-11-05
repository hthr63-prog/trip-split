(function(){
const $=id=>document.getElementById(id);
const PAGE_URL=location.origin+location.pathname;

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
let view="shared";                 // "shared" | "personal"
let P=[], pLoaded=false, pEditingId=null, pform={cat:"food"};
let cur={fCur:null,pCur:null,cFrom:null,cTo:"ILS"};
let cLast="A";                     // which converter field the person typed in

/* ---- theme ---- */
function themePref(){ return load("trip-theme")||"auto"; }
function isDark(){ const t=themePref(); return t==="dark"||(t==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches); }
function applyTheme(t){
  if(t==="auto"){ delete document.documentElement.dataset.theme; store("trip-theme",""); }
  else { document.documentElement.dataset.theme=t; store("trip-theme",t); }
  $("themeBtn").textContent=isDark()?"☀️":"🌙";
  if($("themeSeg")) seg($("themeSeg"),[["light","☀️ בהיר"],["dark","🌙 כהה"],["auto","📱 לפי המכשיר"]],v=>v===themePref(),v=>applyTheme(v));
}
$("themeBtn").onclick=()=>applyTheme(isDark()?"light":"dark");
try{ matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>applyTheme(themePref())); }catch(e){}

/* ---- search keywords per currency ---- */
const KW={THB:"תאילנד thailand bangkok בנגקוק",VND:"וייטנאם vietnam",LAK:"לאוס laos",KHR:"קמבודיה cambodia",MMK:"מיאנמר בורמה myanmar burma",MYR:"מלזיה malaysia",SGD:"סינגפור singapore",IDR:"אינדונזיה באלי indonesia bali",PHP:"פיליפינים philippines",BND:"ברוניי brunei",JPY:"יפן japan",KRW:"קוריאה korea",CNY:"סין china",HKD:"הונג קונג hong kong",MOP:"מקאו macau",TWD:"טייוואן taiwan",MNT:"מונגוליה mongolia",INR:"הודו india",NPR:"נפאל nepal",LKR:"סרי לנקה sri lanka",BTN:"בהוטן bhutan",MVR:"מלדיביים maldives",BDT:"בנגלדש bangladesh",PKR:"פקיסטן pakistan",KZT:"קזחסטן kazakhstan",UZS:"אוזבקיסטן uzbekistan",KGS:"קירגיזסטן kyrgyzstan",AED:"אמירויות דובאי uae dubai emirates",ILS:"ישראל israel שקל nis shekel",USD:"ארצות הברית אמריקה usa us dollar",EUR:"אירופה europe euro",GBP:"בריטניה אנגליה לונדון uk england pound",CHF:"שווייץ switzerland",AUD:"אוסטרליה australia",NZD:"ניו זילנד new zealand",CAD:"קנדה canada",TRY:"טורקיה turkey",GEL:"גאורגיה גרוזיה georgia",AMD:"ארמניה armenia",AZN:"אזרבייגן azerbaijan",JOD:"ירדן jordan",EGP:"מצרים egypt",QAR:"קטאר qatar",OMR:"עומאן oman",MAD:"מרוקו morocco",ZAR:"דרום אפריקה south africa",KES:"קניה kenya",TZS:"טנזניה tanzania",FJD:"פיגי fiji",MXN:"מקסיקו mexico",BRL:"ברזיל brazil",ARS:"ארגנטינה argentina",CLP:"צילה chile",PEN:"פרו peru",COP:"קולומביה colombia",CZK:"צכיה פראג czech prague",HUF:"הונגריה hungary",PLN:"פולין poland",RON:"רומניה romania",BGN:"בולגריה bulgaria",RSD:"סרביה serbia",SEK:"שוודיה sweden",NOK:"נורווגיה norway",DKK:"דנמרק denmark",ISK:"איסלנד iceland"};
const norm=s=>String(s||"").toLowerCase().replace(/[׳'"`]/g,"").replace(/\s+/g," ").trim();

/* ---- sheets ---- */
function openSheet(id){ $(id).hidden=false; document.body.style.overflow="hidden"; }
function closeSheet(id){ $(id).hidden=true; if(id==="addSheet") restoreAdd(); if($("curSheet").hidden&&$("setSheet").hidden&&$("addSheet").hidden) document.body.style.overflow=""; }
for(const id of ["curSheet","setSheet","addSheet"]) $(id).addEventListener("click",e=>{ if(e.target.id===id) closeSheet(id); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ if(!$("curSheet").hidden) closeSheet("curSheet"); else { closeSheet("setSheet"); closeSheet("addSheet"); } } });

/* ---- currency picker ---- */
let sheetCb=null, sheetCur=null;
function curText(c){ const i=CUR[c]; return i? (i.sym?i.sym+" ":"")+c : c; }
function setCurBtn(id,c){ const b=$(id); if(b) b.textContent=curText(c); }
function recentCurs(){ const seen=[]; [...S.items,...P].sort((x,y)=>(y.createdAt||0)-(x.createdAt||0)).forEach(it=>{ if(it.cur&&!seen.includes(it.cur)) seen.push(it.cur); }); return seen.slice(0,5); }
function openCurPicker(title,current,cb){
  sheetCb=cb; sheetCur=current; $("curSheetTitle").textContent=title; $("curSearch").value="";
  openSheet("curSheet"); renderCurList();
  setTimeout(()=>{ try{ $("curSearch").focus({preventScroll:true}); }catch(e){} },60);
}
function renderCurList(){
  const q=norm($("curSearch").value); const L=$("curList"); L.innerHTML="";
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
    b.setAttribute("aria-pressed",String(isOn(val))); b.onclick=()=>onPick(val); el.appendChild(b);
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
  $("title").textContent=S.trip||"החשבון של הטיול";
  document.title=(S.trip||"החשבון של הטיול");
  const names=active().map(p=>p.name);
  $("sub").textContent= me? (view==="personal"?"ההוצאות האישיות של "+nm(me):"היי "+nm(me)+" 👋 · "+names.length+" משתתפים") : (names.length? "החשבון המשותף של "+(names.length>1?names.slice(0,-1).join(", ")+" ו"+names[names.length-1]:names[0]) : "");
  $("settingsBtn").hidden=!canWrite;
  const showMine=!!me&&canWrite;
  $("viewBtn").hidden=!showMine; $("toprow").classList.toggle("one",!showMine);
  $("viewBtn").setAttribute("aria-pressed",String(view==="personal"));
  $("meBadge").textContent= me? nm(me).trim().charAt(0) : "";
  $("viewTxt").textContent= view==="personal" ? "← לחשבון המשותף" : "האישי שלי";
  $("viewSmall").textContent= view==="personal" ? "חזרה" : (me&&fem(me)?"רק את רואה":"רק אתה רואה");
  const lc=CUR[S.localCur]; $("localSym").textContent=lc.sym||S.localCur.slice(0,1); $("localName").textContent=lc.name;
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
  $("fabAdd").hidden= !canWrite || !loaded;
}

/* ---- render: shared ---- */
function renderTicket(){
  const c=compute();
  const V=$("verdict"), D=$("debts"), B=$("breakdown"); V.innerHTML=""; D.innerHTML=""; B.innerHTML="";
  const amt=v=>{ const s=document.createElement("span"); s.className="amt num"; s.textContent=fmt(v,showCur); return s; };
  if(me){
    $("ticketLbl").textContent="המאזן של "+nm(me);
    $("stPaid").textContent=fmt(c.paid[me]||0,showCur); $("stPaidLbl").textContent="שילמת";
    $("stShare").textContent=fmt(c.share[me]||0,showCur); $("stShareLbl").textContent="החלק שלך";
  }else{
    $("ticketLbl").textContent="מי חייב למי";
    const a=active()[0]?.id, b=active()[1]?.id;
    $("stPaid").textContent=fmt(c.paid[a]||0,showCur); $("stPaidLbl").textContent=a?nm(a)+" "+g.paid(a):"";
    $("stShare").textContent=fmt(c.paid[b]||0,showCur); $("stShareLbl").textContent=b?nm(b)+" "+g.paid(b):"";
  }
  $("stTotal").textContent=fmt(c.total,showCur);
  const mine=me? c.debts.filter(d=>d.from===me||d.to===me) : c.debts;
  const br=()=>V.appendChild(document.createElement("br"));
  if(!loaded){ V.textContent="טוען…"; }
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
    }
  }
  if(me&&S.items.length){
    const parts=Object.entries(c.net[me]||{}).filter(([k,x])=>Math.abs(conv(x,k,"ILS"))>=0.5);
    if(parts.length>1||(parts.length===1&&parts[0][0]!==showCur)){
      const lead=document.createElement("span"); lead.textContent="לפי מטבע ההוצאה:"; B.appendChild(lead);
      for(const [k,x] of parts){ const s=document.createElement("span"); s.className="num"; s.textContent=(x>0?"+":"")+fmt(x,k)+(k!==showCur?" ≈ "+fmt(conv(x,k,showCur),showCur):""); B.appendChild(s); }
    }
  }
  showinRow($("showin"));
}
function setShow(c){ showCur=c; store("trip-show",c); renderAll(); }

function fmtRate(r){ return r>=100?r.toFixed(1):r>=1?r.toFixed(4):r.toPrecision(4); }
function plain(v){ if(!isFinite(v)) return ""; const a=Math.abs(v); return String(Math.round(v*(a>=1000?1:100))/(a>=1000?1:100)); }
function renderConv(){
  if(!cur.cFrom) cur.cFrom=S.localCur;
  const f=cur.cFrom, t=cur.cTo; setCurBtn("cFrom",f); setCurBtn("cTo",t);
  const pa=v=>parseFloat(String(v).replace(/,/g,""));
  if(cLast==="A"){ const a=pa($("cA").value); if(document.activeElement!==$("cB")) $("cB").value= a>=0? plain(conv(a,f,t)) : ""; }
  else { const b=pa($("cB").value); if(document.activeElement!==$("cA")) $("cA").value= b>=0? plain(conv(b,t,f)) : ""; }
  const r=conv(1,f,t);
  $("cRate").innerHTML=""; const s1=document.createElement("span"); s1.textContent="1 "+f+" = "+fmtRate(r)+" "+t; const s2=document.createElement("span"); s2.textContent="1 "+t+" = "+fmtRate(1/r)+" "+f; $("cRate").append(s1,s2);
  const Q=$("cQuick"); Q.innerHTML="";
  const mult=Math.max(1,Math.pow(10,Math.floor(Math.log10(perUsd(f)||1))));
  for(const x of [100,500,1000].map(v=>v*mult)){ const b=document.createElement("button"); b.type="button"; b.className="chip"; b.textContent=fmt(x,f)+" = "+fmt(conv(x,f,t),t); b.onclick=()=>{ cLast="A"; $("cA").value=x; renderConv(); }; Q.appendChild(b); }
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
function catKey(it){ const l=(it.catLabel||"").trim(); return (it.cat||"other")==="other"&&l ? "other:"+l : (it.cat||"other"); }
function catName(k){ return k.startsWith("other:") ? "✨ "+k.slice(6) : (CATNAME[k]||OLD_CATS[k]||"✨ אחר"); }
function monthOf(it){ return (it.date||"").slice(0,7); }
function thisMonth(){ return todayStr().slice(0,7); }
function monthName(ym,long){ const [y,m]=ym.split("-").map(Number); return new Date(y,m-1,1).toLocaleDateString("he-IL",long?{month:"long",year:"numeric"}:{month:"short"}); }
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
function delBtn(onConfirm){
  const d=document.createElement("button"); d.className="link danger"; d.type="button"; d.textContent="מחיקה";
  d.onclick=()=>{ if(d.dataset.sure){ onConfirm(); } else { d.dataset.sure="1"; d.textContent="בטוח?"; setTimeout(()=>{ if(d.isConnected){ delete d.dataset.sure; d.textContent="מחיקה"; } },3000); } };
  return d;
}
function renderLedger(){
  seg($("filter"),[["all","הכול"],...active().map(p=>[p.id,p.name])],v=>v===filter,v=>{filter=v;renderLedger();});
  const L=$("ledger"); L.innerHTML="";
  const q=norm($("lSearch").value);
  const list=S.items.filter(it=>(filter==="all"||it.payer===filter)&&matches(it,q)).sort((x,y)=>(y.date||"").localeCompare(x.date||"")||(y.createdAt||0)-(x.createdAt||0));
  if(!list.length){ const e=document.createElement("div"); e.className="empty"; e.textContent=!loaded?"טוען את ההוצאות…":q?"לא נמצאה הוצאה שמתאימה לחיפוש":S.items.length?"אין הוצאות בסינון הזה":"כאן יופיעו ההוצאות, מסודרות לפי ימים."; L.appendChild(e); return; }
  let curDay=null, box=null;
  for(const it of list){
    if(it.date!==curDay){ curDay=it.date; box=document.createElement("div"); box.className="day"; const h=document.createElement("h3"); h.textContent=dayLabel(it.date); box.appendChild(h); L.appendChild(box); }
    const r=document.createElement("div"); r.className="row"+(it.kind==="transfer"?" transfer":"");
    const dot=document.createElement("div"); dot.className="dot c"+pidx(it.payer); dot.textContent=nm(it.payer).trim().charAt(0);
    const main=document.createElement("div"); main.className="main";
    const t=document.createElement("div"); t.className="t"; const m=document.createElement("div"); m.className="m";
    if(it.kind==="transfer"){ t.textContent="💸 "+nm(it.payer)+" "+g.transferred(it.payer)+" ל"+nm(it.to); m.textContent=withTime(it,"סגירת חשבון"); }
    else{ t.textContent=it.desc||"הוצאה"; m.textContent=withTime(it,nm(it.payer)+" "+g.paid(it.payer)+" · "+splitText(it)+" · "+catName(catKey(it))); }
    main.append(t,m);
    const right=document.createElement("div"); right.className="r";
    const b=document.createElement("b"); b.className="num"; b.textContent=fmt(+it.amount,it.cur); right.appendChild(b);
    if(it.cur!=="ILS"){ const s=document.createElement("span"); s.className="m num"; s.textContent="≈ "+fmt(conv(+it.amount,it.cur,"ILS"),"ILS"); right.appendChild(s); }
    if(me&&it.kind!=="transfer"){ const sh=sharesOf(it); const d=(it.payer===me?+it.amount:0)-(+it.amount)*(sh[me]||0); if(Math.abs(d)>0.0001){ const s=document.createElement("span"); s.className="mine num "+(d>0?"plus":"minus"); s.textContent=(d>0?"מגיע לך ":"עליך ")+fmt(Math.abs(d),it.cur); right.appendChild(s); } }
    if(canWrite){
      const acts=document.createElement("div");
      if(it.kind!=="transfer"){ const e=document.createElement("button"); e.className="link"; e.type="button"; e.textContent="עריכה"; e.onclick=()=>startEdit(it); acts.appendChild(e); }
      acts.appendChild(delBtn(()=>run(()=>db.collection("expenses").doc(it.id).delete())));
      right.appendChild(acts);
    }
    r.append(dot,main,right); box.appendChild(r);
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
    P=out; pLoaded=true; if(view==="personal") renderAll();
  }catch(e){ console.error(e); pLoaded=true; }
}
async function setPassword(pw){
  /* create or replace the account password; moves existing personal items to the new key */
  const raw=await deriveRaw(me,pw); const nc=await ctxFromRaw(raw);
  const moving=[];
  const old=await loadAcct(); if(old) moving.push(...(await decryptMine(old)));
  const legacy=load("trip-pk-"+me); if(legacy){ moving.push(...(await decryptMine(await legacyCtx(legacy)))); }
  const batch=db.batch();
  for(const it of moving){ const {id,...rest}=it; batch.set(db.collection("expenses").doc(id),await encFor(nc,rest)); }
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
  $("pAll").textContent=fmt(own+share,showCur); $("pOwn").textContent=fmt(own,showCur); $("pShare").textContent=fmt(share,showCur); $("pToday").textContent=fmt(today,showCur);
  showinRow($("pShowin"));
  catBars("pCats","pCatPanel",cats);
  if(!cur.pCur) cur.pCur=S.localCur; setCurBtn("pCur",cur.pCur);
  seg($("pCat"),CATS,v=>v===pform.cat,v=>{pform.cat=v;renderPersonal(); if(v==="other") $("pCatLabel").focus();});
  $("pCatLabel").hidden=pform.cat!=="other";
  convHint("pAmt",cur.pCur,"pConv");
  const L=$("pLedger"); L.innerHTML="";
  const pq=norm($("pSearch").value);
  const list=P.filter(it=>matches(it,pq)).sort((x,y)=>(y.date||"").localeCompare(x.date||"")||(y.createdAt||0)-(x.createdAt||0));
  if(!list.length){ const e=document.createElement("div"); e.className="empty"; e.textContent=!pLoaded?"טוען…":"עוד אין הוצאות אישיות. מה שתוסיפו כאן שמור בחשבון שלכם, ואף אחד אחר לא רואה אותו."; L.appendChild(e); }
  let curDay=null, box=null;
  for(const it of list){
    if(it.date!==curDay){ curDay=it.date; box=document.createElement("div"); box.className="day"; const h=document.createElement("h3"); h.textContent=dayLabel(it.date); box.appendChild(h); L.appendChild(box); }
    const r=document.createElement("div"); r.className="row";
    const dot=document.createElement("div"); dot.className="dot c"+pidx(me); dot.textContent=nm(me).trim().charAt(0);
    const main=document.createElement("div"); main.className="main";
    const t=document.createElement("div"); t.className="t"; t.textContent=it.desc||"הוצאה";
    const m=document.createElement("div"); m.className="m"; m.textContent=withTime(it,"אישי · "+catName(catKey(it)));
    main.append(t,m);
    const right=document.createElement("div"); right.className="r";
    const b=document.createElement("b"); b.className="num"; b.textContent=fmt(+it.amount,it.cur); right.appendChild(b);
    if(it.cur!=="ILS"){ const s=document.createElement("span"); s.className="m num"; s.textContent="≈ "+fmt(conv(+it.amount,it.cur,"ILS"),"ILS"); right.appendChild(s); }
    const acts=document.createElement("div");
    const e=document.createElement("button"); e.className="link"; e.type="button"; e.textContent="עריכה"; e.onclick=()=>pStartEdit(it); acts.appendChild(e);
    acts.appendChild(delBtn(()=>run(()=>db.collection("expenses").doc(it.id).delete())));
    right.appendChild(acts);
    r.append(dot,main,right); box.appendChild(r);
  }
}
function renderAll(){
  renderHeader();
  if(view==="stats"){ renderStats(); }
  else if(view==="personal"&&me){ renderPersonal(); }
  else { renderTicket(); renderConv(); renderForm(); renderCats(); renderLedger(); }
  $("form").hidden=!canWrite;
  if(!$("setSheet").hidden) renderSettings();
}

/* ---- writes ---- */
async function run(fn){
  if(!canWrite||busy) return false;
  busy=true; $("status").textContent="שומר…"; document.querySelectorAll("#saveBtn,#nuSave,#pSave").forEach(b=>b.disabled=true);
  try{ await fn(); $("status").textContent="נשמר ✓"; setTimeout(()=>{ if($("status").textContent==="נשמר ✓") $("status").textContent=""; },2000); return true; }
  catch(e){ console.error(e); $("status").textContent= e&&e.code==="permission-denied" ? "אין הרשאה לשמור." : "השמירה נכשלה. בדקו את החיבור ונסו שוב."; return false; }
  finally{ busy=false; document.querySelectorAll("#saveBtn,#nuSave,#pSave").forEach(b=>b.disabled=false); }
}
const metaRef=()=>db.collection("trip").doc("meta");

/* ---- the preferred (local) currency ---- */
$("localBtn").onclick=()=>openCurPicker("באיזו מדינה אתם עכשיו? 🌏",S.localCur,c=>{
  if(c===S.localCur) return;
  S.localCur=c; if(!editingId) cur.fCur=c; if(!pEditingId) cur.pCur=c; cur.cFrom=c; renderAll();
  run(()=>metaRef().update({localCur:c}));
});

/* ---- who am I ---- */
function isApp(){ try{ return navigator.standalone===true||matchMedia("(display-mode: standalone)").matches; }catch(e){ return false; } }
function readParam(name){ try{ return new URLSearchParams(location.search).get(name); }catch(e){ return null; } }
function readHash(){ let u=readParam("u"); if(!u) u=decodeURIComponent(location.hash.replace("#","")); return person(u)?u:null; }
function personalUrl(id){ return PAGE_URL+"?u="+encodeURIComponent(id); }
function syncUrl(){
  if(!me) return;
  let u=personalUrl(me); if(view==="personal") u+="&v=me"; if(view==="stats") u+="&v=stats";
  try{ history.replaceState(null,"",u); }catch(e){}
}
function setMe(id,updateUrl){
  me=id; acct=null; acctFor=null; store("trip-me",id||""); if(id){ form.payer=id; if(updateUrl) syncUrl(); refreshPersonal(); }
  $("newUser").hidden=true; renderAll(); window.scrollTo({top:0});
}
$("switchBtn").onclick=()=>{ me=null; store("trip-me",""); view="shared"; P=[]; acct=null; try{ history.replaceState(null,"",location.pathname); }catch(e){} renderAll(); $("picker").scrollIntoView({behavior:"smooth"}); };
$("viewBtn").onclick=()=>{ view= view==="personal"?"shared":"personal"; syncUrl(); renderAll(); window.scrollTo({top:0}); };
$("nuCancel").onclick=()=>{ $("newUser").hidden=true; };
$("nuSave").onclick=async()=>{
  const name=$("nuName").value.trim(); showErr("nuErr");
  if(!name) return showErr("nuErr","צריך לכתוב שם");
  if(!canWrite) return showErr("nuErr","אין חיבור לשמירה כרגע.");
  const id=uid("p");
  const ok=await run(()=>db.runTransaction(async tx=>{ const s=await tx.get(metaRef()); const people=(s.data()?.people)||[]; tx.update(metaRef(),{people:[...people,{id,name,g:nuG}]}); }));
  if(ok){ if(!person(id)) S.people.push({id,name,g:nuG}); $("nuName").value=""; setMe(id,true); }
};

/* ---- shared form ---- */
function showErr(id,msg){ const e=$(id); e.textContent=msg||""; e.hidden=!msg; }
$("fCur").onclick=()=>openCurPicker("באיזה מטבע שילמתם?",cur.fCur,c=>{ cur.fCur=c; renderForm(); });
$("cFrom").onclick=()=>openCurPicker("יש לי…",cur.cFrom,c=>{ cur.cFrom=c; renderConv(); });
$("cTo").onclick=()=>openCurPicker("מקבלים…",cur.cTo,c=>{ cur.cTo=c; renderConv(); });
function startEdit(it){
  if(!$("addSheet").hidden) closeSheet("addSheet");
  editingId=it.id; form.payer=it.payer; form.cat=it.cat||"other";
  form.among=it.pcts?Object.keys(it.pcts):((it.among&&it.among.length)?[...it.among]:S.people.map(p=>p.id));
  form.mode=it.pcts?"pct":"equal"; form.pcts=it.pcts?{...it.pcts}:{};
  $("fDesc").value=it.desc||""; $("fCatLabel").value=it.catLabel||""; $("fAmt").value=it.amount; $("fDate").value=it.date||todayStr(); cur.fCur=it.cur;
  renderForm();
  $("formTitle").textContent="✏️ עריכת הוצאה"; $("saveBtn").textContent="שמירת שינויים"; $("cancelEdit").hidden=false;
  $("form").scrollIntoView({behavior:"smooth",block:"start"});
}
function resetForm(){
  editingId=null; $("fDesc").value=""; $("fCatLabel").value=""; $("fAmt").value=""; form.mode="equal"; form.pcts={}; form.among=null; if(me) form.payer=me; cur.fCur=S.localCur;
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
  const data={kind:"expense",desc:$("fDesc").value.trim(),amount,cur:cur.fCur,payer:form.payer,among:pcts?null:[...form.among],pcts,cat:form.cat,catLabel:form.cat==="other"?$("fCatLabel").value.trim():"",date:$("fDate").value||todayStr()};
  const id=editingId||uid("e");
  const ok=await run(()=> editingId ? db.collection("expenses").doc(id).update(data) : db.collection("expenses").doc(id).set({...data,createdAt:Date.now(),tz:hereTz()}));
  if(ok){ const keep=$("fDate").value; resetForm(); $("fDate").value=keep; if(!$("addSheet").hidden) closeSheet("addSheet"); }
}
function addTransfer(from,to,amt){ const id=uid("t"); run(()=>db.collection("expenses").doc(id).set({kind:"transfer",amount:amt,cur:showCur,payer:from,to,date:todayStr(),createdAt:Date.now(),tz:hereTz()})); }

/* ---- personal form ---- */
$("pCur").onclick=()=>openCurPicker("באיזה מטבע שילמת?",cur.pCur,c=>{ cur.pCur=c; renderPersonal(); });
function pStartEdit(it){
  if(!$("addSheet").hidden) closeSheet("addSheet");
  pEditingId=it.id; pform.cat=it.cat||"other"; cur.pCur=it.cur;
  $("pDesc").value=it.desc||""; $("pCatLabel").value=it.catLabel||""; $("pAmt").value=it.amount; $("pDate").value=it.date||todayStr();
  $("pFormTitle").textContent="✏️ עריכת הוצאה אישית"; $("pSave").textContent="שמירת שינויים"; $("pCancel").hidden=false; renderPersonal();
  $("pForm").scrollIntoView({behavior:"smooth",block:"start"});
}
function pReset(){
  pEditingId=null; $("pDesc").value=""; $("pCatLabel").value=""; $("pAmt").value=""; cur.pCur=S.localCur;
  $("pFormTitle").textContent="➕ הוצאה אישית"; $("pSave").textContent="הוספה"; $("pCancel").hidden=true; renderPersonal();
}
async function pSave(){
  showErr("pErr");
  const amount=parseFloat(String($("pAmt").value).replace(/,/g,""));
  if(!(amount>0)) return showErr("pErr","צריך להזין סכום גדול מאפס");
  if(!$("pDesc").value.trim()){ $("pDesc").focus(); return showErr("pErr","צריך לתת שם להוצאה, למשל: קפה"); }
  const c=await loadAcct(); if(!c) return showErr("pErr","צריך להיכנס לחשבון האישי קודם.");
  const data={desc:$("pDesc").value.trim(),amount,cur:cur.pCur,cat:pform.cat,catLabel:pform.cat==="other"?$("pCatLabel").value.trim():"",date:$("pDate").value||todayStr()};
  const id=pEditingId||uid("m"); const old=P.find(x=>x.id===id);
  const doc=await encFor(c,{...data,createdAt:old?.createdAt||Date.now(),tz:old?.tz||hereTz()});
  const ok=await run(()=>db.collection("expenses").doc(id).set(doc));
  if(ok){ const keep=$("pDate").value; pReset(); $("pDate").value=keep; if(!$("addSheet").hidden) closeSheet("addSheet"); }
}
$("pSave").onclick=pSave; $("pCancel").onclick=pReset;
$("pAmt").addEventListener("input",()=>convHint("pAmt",cur.pCur,"pConv"));
$("pAmt").addEventListener("keydown",e=>{ if(e.key==="Enter") pSave(); });
$("pDesc").addEventListener("keydown",e=>{ if(e.key==="Enter") $("pAmt").focus(); });


/* ---- stats page: spending per month and by category ---- */
let stScope="trip", stMonth=null;
function goView(v){ view=v; syncUrl(); renderAll(); window.scrollTo({top:0}); }
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
  $("stMonthTotal").textContent=fmt(tot,showCur);
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

/* ---- floating buttons: back to top, quick add ---- */
let addHome=null;
function openAdd(){
  if(view==="stats") goView("shared");
  const id= view==="personal"&&me ? "pForm" : "form";
  if(id==="pForm"&&!(acct&&acctFor===me)){ window.scrollTo({top:0,behavior:"smooth"}); $("lockPw").focus(); return; }
  const f=$(id); addHome={f,parent:f.parentNode,next:f.nextSibling};
  $("addSlot").appendChild(f); f.hidden=false; openSheet("addSheet");
  setTimeout(()=>{ try{ $(id==="pForm"?"pAmt":"fAmt").focus(); }catch(e){} },80);
}
function restoreAdd(){ if(!addHome) return; addHome.parent.insertBefore(addHome.f,addHome.next); addHome=null; }
$("fabAdd").onclick=openAdd;
$("addClose").onclick=()=>closeSheet("addSheet");
$("fabUp").onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
window.addEventListener("scroll",()=>{ $("fabUp").hidden= window.scrollY<400; },{passive:true});
$("lSearch").addEventListener("input",renderLedger);
$("pSearch").addEventListener("input",renderPersonal);

/* ---- settings sheet ---- */
let delAsk=null;
function usesPerson(id){ return S.items.some(it=>it.payer===id||it.to===id||(it.among||[]).includes(id)||(it.pcts&&id in it.pcts)); }
function renderSettings(){
  applyTheme(themePref());
  if(document.activeElement!==$("sTrip")) $("sTrip").value=S.trip||"";
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
$("shareAll").onclick=()=>shareUrl($("shareAll"),PAGE_URL,S.trip);
$("sTripSave").onclick=async()=>{ const v=$("sTrip").value.trim(); if(!v) return; await run(()=>metaRef().update({trip:v})); };
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

/* ---- data ---- */
const cfg=window.FIREBASE_CONFIG;
if(!cfg||!window.firebase){
  $("roNote").hidden=false; $("roNote").textContent="האפליקציה עוד לא מחוברת למסד נתונים. מחשבון ההמרה כבר עובד.";
  return;
}
firebase.initializeApp(cfg); db=firebase.firestore(); canWrite=true;
let gotMeta=false, gotItems=false, firstMeta=true;
const ready=()=>{
  if(gotMeta&&gotItems&&!loaded){
    loaded=true; form.among=null; me=readHash();
    /* opened from the home-screen icon: remember who uses this phone */
    if(!me&&isApp()){ const r=load("trip-me"); if(person(r)&&!person(r).archived){ me=r; syncUrl(); } }
    if(me) store("trip-me",me);
    if(me){ form.payer=me; refreshPersonal(); if(location.hash&&!readParam("u")) syncUrl(); }
    else view="shared";
  }
  renderAll();
};
const timer=setTimeout(()=>{ if(!loaded) $("status").textContent="הנתונים עדיין לא נטענו. בדקו את החיבור לאינטרנט."; },10000);
metaRef().onSnapshot(async s=>{
  if(!s.exists){
    try{ await db.runTransaction(async tx=>{ const c=await tx.get(metaRef()); if(c.exists) return; tx.set(metaRef(),SEED_META); for(const it of SEED_ITEMS){ const {id,...rest}=it; tx.set(db.collection("expenses").doc(id),rest); } }); }
    catch(e){ console.error(e); $("status").textContent="לא הצלחנו ליצור את הטיול במסד הנתונים."; }
    return;
  }
  const d=s.data(); const prevLocal=S.localCur;
  S.trip=d.trip||""; S.localCur=CUR[d.localCur]?d.localCur:"THB"; S.people=d.people||[];
  if(firstMeta||prevLocal!==S.localCur){ if(!editingId) cur.fCur=S.localCur; if(!pEditingId) cur.pCur=S.localCur; cur.cFrom=S.localCur; }
  firstMeta=false;
  gotMeta=true; clearTimeout(timer); if(/נטענו/.test($("status").textContent)) $("status").textContent="";
  if(loaded&&me){ acct=null; acctFor=null; refreshPersonal(); }
  ready();
},e=>{ console.error(e); $("status").textContent="לא הצלחנו לטעון את הנתונים."; });
db.collection("expenses").onSnapshot(snap=>{
  const all=snap.docs.map(d=>({id:d.id,...d.data()}));
  S.items=all.filter(x=>x.kind!=="private"); RAW=all.filter(x=>x.kind==="private"); if(loaded) refreshPersonal();
  gotItems=true; ready();
},e=>{ console.error(e); });
})();
