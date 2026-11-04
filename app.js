(function(){
const $=id=>document.getElementById(id);
const PAGE_URL=location.origin+location.pathname;

const ASIA=[["THB","באט תאילנדי","฿"],["VND","דונג וייטנאמי","₫"],["LAK","קיפ לאוסי","₭"],["KHR","ריאל קמבודי","៛"],["MMK","קיאט מיאנמרי"],["MYR","רינגיט מלזי","RM"],["SGD","דולר סינגפורי","S$"],["IDR","רופיה אינדונזית","Rp"],["PHP","פסו פיליפיני","₱"],["BND","דולר ברוניי"],["JPY","ין יפני","¥"],["KRW","וון קוריאני","₩"],["CNY","יואן סיני","CN¥"],["HKD","דולר הונג קונגי","HK$"],["MOP","פטקה מקאו"],["TWD","דולר טייוואני","NT$"],["MNT","טוגריק מונגולי","₮"],["INR","רופי הודי","₹"],["NPR","רופי נפאלי"],["LKR","רופי סרי לנקי"],["BTN","נגולטרום בהוטני"],["MVR","רופיה מלדיבית"],["BDT","טאקה בנגלדשי","৳"],["PKR","רופי פקיסטני"],["KZT","טנגה קזחי","₸"],["UZS","סום אוזבקי"],["KGS","סום קירגיזי"],["AED","דירהם אמירותי"]];
const MAIN=[["ILS","שקל","₪"],["USD","דולר אמריקאי","$"],["EUR","אירו","€"]];
const OTHER=[["GBP","לירה שטרלינג","£"],["CHF","פרנק שווייצרי"],["AUD","דולר אוסטרלי","A$"],["NZD","דולר ניו זילנדי","NZ$"],["CAD","דולר קנדי","C$"],["TRY","לירה טורקית","₺"],["GEL","לארי גאורגי"],["AMD","דראם ארמני"],["AZN","מנאט אזרבייג׳ני"],["JOD","דינר ירדני"],["EGP","לירה מצרית"],["QAR","ריאל קטארי"],["OMR","ריאל עומאני"],["MAD","דירהם מרוקאי"],["ZAR","ראנד דרום אפריקאי"],["KES","שילינג קנייתי"],["TZS","שילינג טנזני"],["FJD","דולר פיג׳י"],["MXN","פסו מקסיקני"],["BRL","ריאל ברזילאי"],["ARS","פסו ארגנטינאי"],["CLP","פסו צ׳יליאני"],["PEN","סול פרואני"],["COP","פסו קולומביאני"],["CZK","קורונה צ׳כית"],["HUF","פורינט הונגרי"],["PLN","זלוטי פולני"],["RON","לאו רומני"],["BGN","לב בולגרי"],["RSD","דינר סרבי"],["SEK","קרונה שוודית"],["NOK","קרונה נורווגית"],["DKK","קרונה דנית"],["ISK","קרונה איסלנדית"]];
const CUR={}; for(const [c,n,s] of [...MAIN,...ASIA,...OTHER]) CUR[c]={name:n,sym:s||""};
const CATS=[["food","אוכל"],["stay","לינה"],["transport","תחבורה"],["fun","אטרקציות"],["shop","קניות"],["other","אחר"]];
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
let cur={fCur:null,pCur:null,cFrom:null,cTo:"ILS"};   // chosen currencies on the page
let pinned=false;                  // opened through a personal link

/* ---- search keywords per currency ---- */
const KW={THB:"תאילנד thailand bangkok בנגקוק",VND:"וייטנאם וייטנאם vietnam",LAK:"לאוס laos",KHR:"קמבודיה cambodia",MMK:"מיאנמר בורמה myanmar burma",MYR:"מלזיה malaysia",SGD:"סינגפור singapore",IDR:"אינדונזיה באלי indonesia bali",PHP:"פיליפינים philippines",BND:"ברוניי brunei",JPY:"יפן japan",KRW:"קוריאה korea",CNY:"סין china",HKD:"הונג קונג hong kong",MOP:"מקאו macau",TWD:"טייוואן taiwan",MNT:"מונגוליה mongolia",INR:"הודו india",NPR:"נפאל nepal",LKR:"סרי לנקה sri lanka",BTN:"בהוטן bhutan",MVR:"מלדיביים maldives",BDT:"בנגלדש bangladesh",PKR:"פקיסטן pakistan",KZT:"קזחסטן kazakhstan",UZS:"אוזבקיסטן uzbekistan",KGS:"קירגיזסטן kyrgyzstan",AED:"אמירויות דובאי uae dubai emirates",ILS:"ישראל israel שקל nis shekel",USD:"ארצות הברית אמריקה usa us dollar",EUR:"אירופה europe euro",GBP:"בריטניה אנגליה לונדון uk england pound",CHF:"שווייץ switzerland",AUD:"אוסטרליה australia",NZD:"ניו זילנד new zealand",CAD:"קנדה canada",TRY:"טורקיה turkey",GEL:"גאורגיה גרוזיה georgia",AMD:"ארמניה armenia",AZN:"אזרבייגן azerbaijan",JOD:"ירדן jordan",EGP:"מצרים egypt",QAR:"קטאר qatar",OMR:"עומאן oman",MAD:"מרוקו morocco",ZAR:"דרום אפריקה south africa",KES:"קניה kenya",TZS:"טנזניה tanzania",FJD:"פיגי fiji",MXN:"מקסיקו mexico",BRL:"ברזיל brazil",ARS:"ארגנטינה argentina",CLP:"צילה chile",PEN:"פרו peru",COP:"קולומביה colombia",CZK:"צכיה פראג czech prague",HUF:"הונגריה hungary",PLN:"פולין poland",RON:"רומניה romania",BGN:"בולגריה bulgaria",RSD:"סרביה serbia",SEK:"שוודיה sweden",NOK:"נורווגיה norway",DKK:"דנמרק denmark",ISK:"איסלנד iceland"};
const norm=s=>String(s||"").toLowerCase().replace(/[׳'"`]/g,"").replace(/\s+/g," ").trim();

/* ---- currency picker (bottom sheet with search) ---- */
let sheetCb=null, sheetCur=null;
function curText(c){ const i=CUR[c]; return i? (i.sym?i.sym+" ":"")+c : c; }
function setCurBtn(id,c){ const b=$(id); if(b) b.textContent=curText(c); }
function recentCurs(){ const seen=[]; [...S.items,...P].sort((x,y)=>(y.createdAt||0)-(x.createdAt||0)).forEach(it=>{ if(it.cur&&!seen.includes(it.cur)) seen.push(it.cur); }); return seen.slice(0,5); }
function openCurPicker(title,current,cb){
  sheetCb=cb; sheetCur=current; $("curSheetTitle").textContent=title; $("curSearch").value="";
  $("curSheet").hidden=false; renderCurList();
  setTimeout(()=>{ try{ $("curSearch").focus({preventScroll:true}); }catch(e){} },50);
}
function closeCurPicker(){ $("curSheet").hidden=true; sheetCb=null; }
function renderCurList(){
  const q=norm($("curSearch").value); const L=$("curList"); L.innerHTML="";
  const item=c=>{ const i=CUR[c]; const b=document.createElement("button"); b.type="button"; b.className="curitem"; b.setAttribute("aria-selected",String(c===sheetCur));
    const s=document.createElement("span"); s.className="sym"; s.textContent=i.sym||"·";
    const n=document.createElement("span"); n.textContent=i.name;
    const k=document.createElement("span"); k.className="code"; k.textContent=c;
    b.append(s,n,k); b.onclick=()=>{ const cb=sheetCb; closeCurPicker(); if(cb) cb(c); }; return b; };
  const group=(label,codes)=>{ if(!codes.length) return; const h=document.createElement("h3"); h.textContent=label; L.appendChild(h); codes.forEach(c=>L.appendChild(item(c))); };
  if(q){
    const all=[...MAIN,...ASIA,...OTHER].map(([c])=>c);
    const hits=all.filter(c=>norm(c+" "+CUR[c].name+" "+(KW[c]||"")+" "+CUR[c].sym).includes(q));
    if(!hits.length){ const e=document.createElement("div"); e.className="empty"; e.textContent="לא נמצא מטבע בשם הזה. נסו שם מדינה או קוד של 3 אותיות."; L.appendChild(e); return; }
    group("תוצאות",hits); return;
  }
  const top=[S.localCur,"ILS","USD",...recentCurs()].filter((c,i,a)=>CUR[c]&&a.indexOf(c)===i);
  group("נפוצים אצלכם",top); group("אסיה",ASIA.map(x=>x[0])); group("מטבעות עיקריים",MAIN.map(x=>x[0])); group("עוד מטבעות",OTHER.map(x=>x[0]));
}
$("curSearch").addEventListener("input",renderCurList);
$("curSearch").addEventListener("keydown",e=>{ if(e.key==="Enter"){ const f=$("curList").querySelector(".curitem"); if(f) f.click(); } if(e.key==="Escape") closeCurPicker(); });
$("curClose").onclick=closeCurPicker;
$("curSheet").addEventListener("click",e=>{ if(e.target.id==="curSheet") closeCurPicker(); });

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
  const o=document.createElement("button"); o.type="button"; o.className="curbtn"; o.textContent=quick.includes(showCur)?"מטבע אחר":curText(showCur);
  o.onclick=()=>openCurPicker("להציג את הסכומים ב…",showCur,setShow); el.appendChild(o);
}

/* ---- render: shared ---- */
function renderHeader(){
  $("title").textContent=S.trip||"החשבון של הטיול";
  document.title=(S.trip||"החשבון של הטיול");
  const names=S.people.map(p=>p.name);
  $("sub").textContent= me? (view==="personal"?"ההוצאות האישיות של "+nm(me):"המבט של "+nm(me)+" · "+names.length+" משתתפים") : (names.length? "החשבון המשותף של "+(names.length>1?names.slice(0,-1).join(", ")+" ו"+names[names.length-1]:names[0]) : "");
  $("settingsBtn").hidden=!canWrite || !$("settings").hidden;
  $("viewBtn").hidden=!me||!canWrite;
  $("viewBtn").textContent= view==="personal" ? "← לחשבון המשותף" : "ההוצאות האישיות שלי";
  $("viewBtn").className= view==="personal" ? "btn" : "btn primary";
  const lc=CUR[S.localCur]; $("localName").textContent=(lc.sym?lc.sym+" ":"")+lc.name;
  $("localBtn").hidden=!canWrite;
  const W=$("whoBtns"); W.innerHTML="";
  S.people.forEach((p,i)=>{ const b=document.createElement("button"); b.type="button"; b.className="btn big "+(i===0?"primary":i===1?"sun":""); b.textContent="אני "+p.name; b.onclick=()=>setMe(p.id,true); W.appendChild(b); });
  const nb=document.createElement("button"); nb.type="button"; nb.className="btn big"; nb.textContent="משתמש חדש"; nb.onclick=()=>{ $("newUser").hidden=false; $("nuName").focus(); }; W.appendChild(nb);
  seg($("nuG"),[["m","זכר"],["f","נקבה"]],v=>v===nuG,v=>{nuG=v;renderHeader();});
  $("picker").hidden=!!me || !loaded;
  $("foot").hidden=!me;
  $("footWho").textContent= me? "מחובר/ת בתור "+nm(me)+"." : "";
  $("viewShared").hidden= view!=="shared" && !!me;
  $("viewPersonal").hidden= !(view==="personal" && me);
}
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
    const a=S.people[0]?.id, b=S.people[1]?.id;
    $("stPaid").textContent=fmt(c.paid[a]||0,showCur); $("stPaidLbl").textContent=a?nm(a)+" "+g.paid(a):"";
    $("stShare").textContent=fmt(c.paid[b]||0,showCur); $("stShareLbl").textContent=b?nm(b)+" "+g.paid(b):"";
  }
  $("stTotal").textContent=fmt(c.total,showCur);
  const mine=me? c.debts.filter(d=>d.from===me||d.to===me) : c.debts;
  if(!loaded){ V.textContent="טוען…"; }
  else if(!S.items.length){ V.textContent="עוד אין הוצאות."; }
  else if(!c.debts.length){ V.textContent="אתם מאוזנים, אף אחד לא חייב כלום"; }
  else if(me&&!mine.length){ V.textContent=fem(me)?"את מאוזנת, אף אחד לא חייב לך ואת לא חייבת לאף אחד":"אתה מאוזן, אף אחד לא חייב לך ואתה לא חייב לאף אחד"; }
  else if(mine.length===1){
    const d=mine[0];
    if(me&&d.to===me) V.append(nm(d.from)+" "+g.owes(d.from)+" לך ",amt(d.amt));
    else if(me) V.append(g.you(me)+" "+g.owes(me)+" ל"+nm(d.to)+" ",amt(d.amt));
    else V.append(nm(d.from)+" "+g.owes(d.from)+" ל"+nm(d.to)+" ",amt(d.amt));
  }else{
    if(me){ const b=c.bal[me]||0; if(b>0) V.append("בסך הכול מגיע לך ",amt(b)); else V.append("בסך הכול "+g.you(me)+" "+g.owes(me)+" ",amt(-b)); }
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
      const b=document.createElement("button"); b.type="button"; b.className="btn sun"; b.textContent="סמנו ש"+nm(d.from)+" "+g.transferred(d.from)+" ל"+nm(d.to)+" "+fmt(d.amt,showCur);
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
  requestAnimationFrame(()=>$("ticket").style.setProperty("--cut",$("ticketTop").offsetHeight+"px"));
}
function setShow(c){ showCur=c; store("trip-show",c); renderAll(); }

function fmtRate(r){ return r>=100?r.toFixed(1):r>=1?r.toFixed(4):r.toPrecision(4); }
function renderConv(){
  if(!cur.cFrom) cur.cFrom=S.localCur;
  const a=parseFloat(String($("cAmt").value).replace(/,/g,"")); const f=cur.cFrom, t=cur.cTo;
  setCurBtn("cFrom",f); $("cTo").textContent=(CUR[t].sym?CUR[t].sym+" ":"")+CUR[t].name+" · "+t;
  $("cOut").textContent= a>=0? fmt(conv(a,f,t),t) : "—";
  const r=conv(1,f,t);
  $("cRate").textContent="1 "+f+" = "+fmtRate(r)+" "+t+"  ·  1 "+t+" = "+fmtRate(1/r)+" "+f;
  const Q=$("cQuick"); Q.innerHTML="";
  const mult=Math.max(1,Math.pow(10,Math.floor(Math.log10(perUsd(f)||1))));
  for(const x of [100,500,1000].map(v=>v*mult)){ const b=document.createElement("button"); b.type="button"; b.className="btn small"; b.textContent=fmt(x,f)+" = "+fmt(conv(x,f,t),t); b.onclick=()=>{ $("cAmt").value=x; renderConv(); }; Q.appendChild(b); }
  const at=S.fx.at;
  $("fxDate").textContent= S.fx.live&&at ? "שער עדכני · "+at.toLocaleString("he-IL",{day:"numeric",month:"numeric",hour:"2-digit",minute:"2-digit"}) : at ? "שער שמור מ-"+at.toLocaleDateString("he-IL",{day:"numeric",month:"long"}) : "טוען שער עדכני…";
}

function renderForm(){
  const ids=S.people.map(p=>p.id);
  if(!form.payer||!person(form.payer)) form.payer=me||ids[0];
  if(!form.among) form.among=[...ids];
  form.among=form.among.filter(person);
  if(!cur.fCur) cur.fCur=S.localCur; setCurBtn("fCur",cur.fCur);
  seg($("fPayer"),S.people.map(p=>[p.id,p.name+" "+g.paid(p.id)]),v=>v===form.payer,v=>{form.payer=v;renderForm();});
  seg($("fAmong"),S.people.map(p=>[p.id,p.name]),v=>form.among.includes(v),v=>{ form.among=form.among.includes(v)?form.among.filter(x=>x!==v):[...form.among,v]; renderForm(); });
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
  seg($("fCat"),CATS,v=>v===form.cat,v=>{form.cat=v;renderForm();});
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
    r.children[0].textContent=CATNAME[k]||"אחר"; r.children[2].textContent=fmt(v,showCur)+" · "+Math.round(v/total*100)+"%";
    $(el).appendChild(r);
  }
}
function renderCats(){ catBars("cats","catPanel",compute().cats); }
function dayLabel(s){
  if(!s) return "ללא תאריך"; if(s===todayStr()) return "היום";
  const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString("he-IL",{weekday:"long",day:"numeric",month:"long"});
}
function splitText(it){
  if(it.pcts) return Object.entries(it.pcts).map(([k,v])=>nm(k)+" "+v+"%").join(" · ");
  const among=(it.among&&it.among.length)?it.among:S.people.map(p=>p.id);
  if(among.length===1) return "רק של "+nm(among[0]);
  if(among.length===S.people.length) return S.people.length===2?"חצי-חצי":"שווה בין כולם";
  return "שווה בין "+among.map(nm).join(", ");
}
function delBtn(onConfirm){
  const d=document.createElement("button"); d.className="link danger"; d.type="button"; d.textContent="מחיקה";
  d.onclick=()=>{ if(d.dataset.sure){ onConfirm(); } else { d.dataset.sure="1"; d.textContent="בטוח?"; setTimeout(()=>{ if(d.isConnected){ delete d.dataset.sure; d.textContent="מחיקה"; } },3000); } };
  return d;
}
function renderLedger(){
  seg($("filter"),[["all","הכול"],...S.people.map(p=>[p.id,p.name+" "+g.paid(p.id)])],v=>v===filter,v=>{filter=v;renderLedger();});
  const L=$("ledger"); L.innerHTML="";
  const list=S.items.filter(it=>filter==="all"||it.payer===filter).sort((x,y)=>(y.date||"").localeCompare(x.date||"")||(y.createdAt||0)-(x.createdAt||0));
  if(!list.length){ const e=document.createElement("div"); e.className="empty"; e.textContent=!loaded?"טוען את ההוצאות…":S.items.length?"אין הוצאות בסינון הזה":"כאן יופיעו ההוצאות, מסודרות לפי ימים."; L.appendChild(e); return; }
  let curDay=null, box=null;
  for(const it of list){
    if(it.date!==curDay){ curDay=it.date; box=document.createElement("div"); box.className="day"; const h=document.createElement("h3"); h.textContent=dayLabel(it.date); box.appendChild(h); L.appendChild(box); }
    const r=document.createElement("div"); r.className="row"+(it.kind==="transfer"?" transfer":"");
    const dot=document.createElement("div"); dot.className="dot c"+pidx(it.payer); dot.textContent=nm(it.payer).trim().charAt(0);
    const main=document.createElement("div"); main.className="main";
    const t=document.createElement("div"); t.className="t"; const m=document.createElement("div"); m.className="m";
    if(it.kind==="transfer"){ t.textContent=nm(it.payer)+" "+g.transferred(it.payer)+" ל"+nm(it.to); m.textContent="סגירת חשבון"; }
    else{ t.textContent=it.desc||"הוצאה"; m.textContent=nm(it.payer)+" "+g.paid(it.payer)+" · "+splitText(it)+" · "+(CATNAME[it.cat]||"אחר"); }
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

/* ---- render: personal ---- */
function myShareItems(){
  /* my part of each shared expense, in its own currency */
  const out=[];
  for(const it of S.items){ if(it.kind==="transfer") continue; const sh=sharesOf(it)[me]||0; if(sh>0) out.push({...it,amount:(+it.amount||0)*sh}); }
  return out;
}
function renderPersonal(){
  if(view!=="personal"||!me) return;
  const shared=myShareItems();
  let own=0, share=0, today=0; const cats={}; const td=todayStr();
  for(const it of P){ const v=conv(+it.amount||0,it.cur,showCur); own+=v; cats[it.cat||"other"]=(cats[it.cat||"other"]||0)+v; if(it.date===td) today+=v; }
  for(const it of shared){ const v=conv(it.amount,it.cur,showCur); share+=v; cats[it.cat||"other"]=(cats[it.cat||"other"]||0)+v; if(it.date===td) today+=v; }
  $("pAll").textContent=fmt(own+share,showCur); $("pOwn").textContent=fmt(own,showCur); $("pShare").textContent=fmt(share,showCur); $("pToday").textContent=fmt(today,showCur);
  $("pLbl").textContent="ההוצאות של "+nm(me)+" בטיול · רק "+(fem(me)?"את רואה":"אתה רואה")+" את המסך הזה";
  showinRow($("pShowin"));
  requestAnimationFrame(()=>$("pTicket").style.setProperty("--cut",$("pTicketTop").offsetHeight+"px"));
  catBars("pCats","pCatPanel",cats);
  if(!cur.pCur) cur.pCur=S.localCur; setCurBtn("pCur",cur.pCur);
  seg($("pCat"),CATS,v=>v===pform.cat,v=>{pform.cat=v;renderPersonal();});
  convHint("pAmt",cur.pCur,"pConv");
  const L=$("pLedger"); L.innerHTML="";
  const list=[...P].sort((x,y)=>(y.date||"").localeCompare(x.date||"")||(y.createdAt||0)-(x.createdAt||0));
  if(!list.length){ const e=document.createElement("div"); e.className="empty"; e.textContent=!pLoaded?"טוען…":"עוד אין הוצאות אישיות. מה שתוסיפו כאן נשמר רק אצלכם, ואף אחד אחר לא רואה אותו."; L.appendChild(e); }
  let curDay=null, box=null;
  for(const it of list){
    if(it.date!==curDay){ curDay=it.date; box=document.createElement("div"); box.className="day"; const h=document.createElement("h3"); h.textContent=dayLabel(it.date); box.appendChild(h); L.appendChild(box); }
    const r=document.createElement("div"); r.className="row";
    const dot=document.createElement("div"); dot.className="dot c"+pidx(me); dot.textContent=nm(me).trim().charAt(0);
    const main=document.createElement("div"); main.className="main";
    const t=document.createElement("div"); t.className="t"; t.textContent=it.desc||"הוצאה";
    const m=document.createElement("div"); m.className="m"; m.textContent="אישי · "+(CATNAME[it.cat]||"אחר");
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
  $("pKeyLink").textContent=personalUrl(me)+"&v=me&k="+pKey();
}
function renderAll(){
  renderHeader();
  if(view==="personal"&&me){ renderPersonal(); }
  else { renderTicket(); renderConv(); renderForm(); renderCats(); renderLedger(); }
  $("form").hidden=!canWrite;
}

/* ---- writes ---- */
async function run(fn){
  if(!canWrite||busy) return false;
  busy=true; $("status").textContent="שומר…"; document.querySelectorAll("#saveBtn,#saveSettings,#nuSave,#pSave").forEach(b=>b.disabled=true);
  try{ await fn(); $("status").textContent="נשמר"; setTimeout(()=>{ if($("status").textContent==="נשמר") $("status").textContent=""; },2000); return true; }
  catch(e){ console.error(e); $("status").textContent= e&&e.code==="permission-denied" ? "אין הרשאה לשמור. צריך לעדכן את כללי האבטחה ב-Firebase." : "השמירה נכשלה. בדקו את החיבור ונסו שוב."; return false; }
  finally{ busy=false; document.querySelectorAll("#saveBtn,#saveSettings,#nuSave,#pSave").forEach(b=>b.disabled=false); }
}
const metaRef=()=>db.collection("trip").doc("meta");

/* ---- the preferred (local) currency ---- */
$("localBtn").onclick=()=>openCurPicker("באיזו מדינה אתם עכשיו?",S.localCur,c=>{
  if(c===S.localCur) return;
  S.localCur=c; if(!editingId) cur.fCur=c; if(!pEditingId) cur.pCur=c; cur.cFrom=c; renderAll();
  run(()=>metaRef().update({localCur:c}));
});

/* ---- who am I ---- */
function readParam(name){ try{ return new URLSearchParams(location.search).get(name); }catch(e){ return null; } }
function readHash(){ let u=readParam("u"); if(!u) u=decodeURIComponent(location.hash.replace("#","")); return person(u)?u:null; }
function personalUrl(id){ return PAGE_URL+"?u="+encodeURIComponent(id); }
function syncUrl(){
  if(!me) return;
  let u=personalUrl(me); if(view==="personal") u+="&v=me";
  try{ history.replaceState(null,"",u); }catch(e){}
}
function setMe(id,updateUrl){
  me=id; if(id){ form.payer=id; if(updateUrl) syncUrl(); subscribePersonal(); }
  $("newUser").hidden=true; renderAll(); window.scrollTo({top:0});
}
$("switchBtn").onclick=()=>{ me=null; view="shared"; pinned=false; P=[]; try{ history.replaceState(null,"",location.pathname); }catch(e){} renderAll(); $("picker").scrollIntoView({behavior:"smooth"}); };
$("viewBtn").onclick=()=>{ view= view==="personal"?"shared":"personal"; syncUrl(); renderAll(); window.scrollTo({top:0}); };
$("nuCancel").onclick=()=>{ $("newUser").hidden=true; };
$("nuSave").onclick=async()=>{
  const name=$("nuName").value.trim(); showErr("nuErr");
  if(!name) return showErr("nuErr","צריך לכתוב שם");
  if(!canWrite) return showErr("nuErr","אין חיבור לשמירה כרגע.");
  const id=uid("p");
  const ok=await run(()=>db.runTransaction(async tx=>{ const s=await tx.get(metaRef()); const people=(s.data()?.people)||[]; tx.update(metaRef(),{people:[...people,{id,name,g:nuG}]}); }));
  if(ok){ if(!person(id)) S.people.push({id,name,g:nuG}); setMe(id,true); }
};

/* ---- shared form ---- */
function showErr(id,msg){ const e=$(id); e.textContent=msg||""; e.hidden=!msg; }
$("fCur").onclick=()=>openCurPicker("באיזה מטבע שילמתם?",cur.fCur,c=>{ cur.fCur=c; renderForm(); });
$("cFrom").onclick=()=>openCurPicker("להמיר ממטבע",cur.cFrom,c=>{ cur.cFrom=c; renderConv(); });
$("cTo").onclick=()=>openCurPicker("להמיר אל",cur.cTo,c=>{ cur.cTo=c; renderConv(); });
function startEdit(it){
  editingId=it.id; form.payer=it.payer; form.cat=it.cat||"other";
  form.among=it.pcts?Object.keys(it.pcts):((it.among&&it.among.length)?[...it.among]:S.people.map(p=>p.id));
  form.mode=it.pcts?"pct":"equal"; form.pcts=it.pcts?{...it.pcts}:{};
  $("fDesc").value=it.desc||""; $("fAmt").value=it.amount; $("fDate").value=it.date||todayStr(); cur.fCur=it.cur;
  renderForm();
  $("formTitle").textContent="עריכת הוצאה"; $("saveBtn").textContent="שמירת שינויים"; $("cancelEdit").hidden=false;
  $("form").scrollIntoView({behavior:"smooth",block:"start"});
}
function resetForm(){
  editingId=null; $("fDesc").value=""; $("fAmt").value=""; form.mode="equal"; form.pcts={}; form.among=null; if(me) form.payer=me; cur.fCur=S.localCur;
  $("formTitle").textContent="הוצאה משותפת חדשה"; $("saveBtn").textContent="הוספה"; $("cancelEdit").hidden=true; renderForm();
}
async function save(){
  showErr("fErr");
  const amount=parseFloat(String($("fAmt").value).replace(/,/g,""));
  if(!(amount>0)) return showErr("fErr","צריך להזין סכום גדול מאפס");
  if(!form.among.length) return showErr("fErr","צריך לבחור לפחות אדם אחד שמתחלק בהוצאה");
  let pcts=null;
  if(form.mode==="pct"){ pcts={}; let sum=0; for(const id of form.among){ const v=+form.pcts[id]; if(!(v>=0)) return showErr("fErr","אחוז לא תקין אצל "+nm(id)); pcts[id]=v; sum+=v; } if(Math.abs(sum-100)>0.5) return showErr("fErr","האחוזים צריכים להסתכם ל-100 (כרגע "+sum+")"); }
  const data={kind:"expense",desc:$("fDesc").value.trim(),amount,cur:cur.fCur,payer:form.payer,among:pcts?null:[...form.among],pcts,cat:form.cat,date:$("fDate").value||todayStr()};
  const id=editingId||uid("e");
  const ok=await run(()=> editingId ? db.collection("expenses").doc(id).update(data) : db.collection("expenses").doc(id).set({...data,createdAt:Date.now()}));
  if(ok){ const keep=$("fDate").value; resetForm(); $("fDate").value=keep; }
}
function addTransfer(from,to,amt){ const id=uid("t"); run(()=>db.collection("expenses").doc(id).set({kind:"transfer",amount:amt,cur:showCur,payer:from,to,date:todayStr(),createdAt:Date.now()})); }

/* ---- personal expenses: stored under a private key only this person holds ---- */
function pKey(){
  if(!me) return null;
  let k=load("trip-pk-"+me);
  if(!k){ const a=new Uint8Array(18); crypto.getRandomValues(a); k=Array.from(a,x=>x.toString(16).padStart(2,"0")).join(""); store("trip-pk-"+me,k); }
  return k;
}
/* personal items live in the shared "expenses" collection, encrypted with the person's private key;
   only someone holding that key can find (tag) and read (AES-GCM) them */
let RAW=[], pCrypto=null, pCryptoFor=null, pSeq=0;
const enc=new TextEncoder(), dec=new TextDecoder();
const b64=buf=>btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function sha(s){ return new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s))); }
async function pCtx(){
  const k=pKey(); if(pCrypto&&pCryptoFor===k) return pCrypto;
  const raw=await sha("key:"+k);
  const key=await crypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,["encrypt","decrypt"]);
  const tag=Array.from(await sha("tag:"+k),x=>x.toString(16).padStart(2,"0")).join("").slice(0,32);
  pCrypto={key,tag}; pCryptoFor=k; return pCrypto;
}
async function pEncrypt(obj){
  const {key,tag}=await pCtx(); const iv=crypto.getRandomValues(new Uint8Array(12));
  const data=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,enc.encode(JSON.stringify(obj)));
  return {kind:"private",amount:1,tag,iv:b64(iv),data:b64(data)};
}
async function refreshPersonal(){
  const seq=++pSeq;
  if(!me||!window.crypto||!crypto.subtle){ P=[]; pLoaded=true; return; }
  try{
    const {key,tag}=await pCtx(); const out=[];
    for(const r of RAW){ if(r.tag!==tag) continue;
      try{ const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(r.iv)},key,unb64(r.data)); out.push({...JSON.parse(dec.decode(plain)),id:r.id}); }catch(e){} }
    if(seq!==pSeq) return;
    P=out; pLoaded=true; if(view==="personal") renderAll();
  }catch(e){ console.error(e); pLoaded=true; }
}
function subscribePersonal(){ P=[]; pLoaded=false; refreshPersonal(); }
async function pWrite(id,obj){ const doc=await pEncrypt(obj); return db.collection("expenses").doc(id).set(doc); }
$("pCur").onclick=()=>openCurPicker("באיזה מטבע שילמת?",cur.pCur,c=>{ cur.pCur=c; renderPersonal(); });
function pStartEdit(it){
  pEditingId=it.id; pform.cat=it.cat||"other"; cur.pCur=it.cur;
  $("pDesc").value=it.desc||""; $("pAmt").value=it.amount; $("pDate").value=it.date||todayStr();
  $("pFormTitle").textContent="עריכת הוצאה אישית"; $("pSave").textContent="שמירת שינויים"; $("pCancel").hidden=false; renderPersonal();
  $("pForm").scrollIntoView({behavior:"smooth",block:"start"});
}
function pReset(){
  pEditingId=null; $("pDesc").value=""; $("pAmt").value=""; cur.pCur=S.localCur;
  $("pFormTitle").textContent="הוצאה אישית חדשה"; $("pSave").textContent="הוספה"; $("pCancel").hidden=true; renderPersonal();
}
async function pSave(){
  showErr("pErr");
  const amount=parseFloat(String($("pAmt").value).replace(/,/g,""));
  if(!(amount>0)) return showErr("pErr","צריך להזין סכום גדול מאפס");
  const data={desc:$("pDesc").value.trim(),amount,cur:cur.pCur,cat:pform.cat,date:$("pDate").value||todayStr()};
  const id=pEditingId||uid("m");
  const old=P.find(x=>x.id===id); const ok=await run(()=>pWrite(id,{...data,createdAt:old?.createdAt||Date.now()}));
  if(ok){ const keep=$("pDate").value; pReset(); $("pDate").value=keep; }
}
$("pSave").onclick=pSave; $("pCancel").onclick=pReset;
$("pAmt").addEventListener("input",()=>convHint("pAmt",cur.pCur,"pConv"));
$("pAmt").addEventListener("keydown",e=>{ if(e.key==="Enter") pSave(); });
$("pDesc").addEventListener("keydown",e=>{ if(e.key==="Enter") $("pAmt").focus(); });
$("pKeyCopy").onclick=()=>shareLink($("pKeyCopy"),$("pKeyLink"));

/* ---- settings ---- */
function openSettings(){
  $("sTrip").value=S.trip||"";
  const L=$("links"); L.innerHTML="";
  const addRow=(label,url,id)=>{ const row=document.createElement("div"); row.className="linkrow";
    let n; if(id){ n=document.createElement("input"); n.id="pname-"+id; n.value=label; n.maxLength=20; n.setAttribute("aria-label","שם"); } else { n=document.createElement("b"); n.textContent=label; }
    const code=document.createElement("code"); code.textContent=url;
    const btn=document.createElement("button"); btn.type="button"; btn.className="btn small"; btn.textContent="העתקת קישור"; btn.onclick=()=>shareLink(btn,code);
    row.append(n,code,btn); L.appendChild(row); };
  addRow("קישור כללי",PAGE_URL,null);
  for(const p of S.people) addRow(p.name,personalUrl(p.id),p.id);
  showErr("sErr"); $("settings").hidden=false; renderHeader();
}
function shareLink(btn,code){
  const ok=()=>{ btn.textContent="הועתק"; setTimeout(()=>btn.textContent="העתקת קישור",1500); };
  if(navigator.share){ navigator.share({title:S.trip,url:code.textContent}).catch(()=>{}); return; }
  try{ navigator.clipboard.writeText(code.textContent).then(ok,()=>selectText(code)); }catch(e){ selectText(code); }
}
function selectText(el){ const r=document.createRange(); r.selectNodeContents(el); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }
async function saveSettings(){
  const trip=$("sTrip").value.trim();
  const names={}; for(const p of S.people){ const v=$("pname-"+p.id).value.trim(); if(!v) return showErr("sErr","לכל משתתף צריך שם"); names[p.id]=v; }
  const ok=await run(()=>db.runTransaction(async tx=>{ const s=await tx.get(metaRef()); const people=((s.data()?.people)||[]).map(p=>({...p,name:names[p.id]||p.name})); tx.update(metaRef(),{trip,people}); }));
  if(ok) closeSettings();
}
function closeSettings(){ $("settings").hidden=true; renderHeader(); }
$("settingsBtn").onclick=openSettings; $("closeSettings").onclick=closeSettings; $("saveSettings").onclick=saveSettings;

/* ---- wiring ---- */
$("saveBtn").onclick=save; $("cancelEdit").onclick=resetForm;
$("fAmt").addEventListener("input",()=>convHint("fAmt",cur.fCur,"fConv"));
$("fAmt").addEventListener("keydown",e=>{ if(e.key==="Enter") save(); });
$("fDesc").addEventListener("keydown",e=>{ if(e.key==="Enter") $("fAmt").focus(); });
$("cAmt").addEventListener("input",renderConv);
$("cSwap").onclick=()=>{ const f=cur.cFrom; cur.cFrom=cur.cTo; cur.cTo=f; renderConv(); };
$("fDate").value=todayStr(); $("pDate").value=todayStr();
/* a private link (?k=…) restores personal expenses on a new device */
(()=>{ const u=readParam("u"), k=readParam("k"); if(u&&k&&/^[0-9a-f]{20,64}$/.test(k)) store("trip-pk-"+u,k); if(readParam("v")==="me") view="personal"; })();
renderAll();
refreshRates(); setInterval(refreshRates,60*60*1000);
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
    if(me){ pinned=true; form.payer=me; subscribePersonal(); if(location.hash&&!readParam("u")) syncUrl(); }
    else view="shared";
  }
  renderAll();
};
const timer=setTimeout(()=>{ if(!loaded) $("status").textContent="הנתונים עדיין לא נטענו. בדקו את החיבור לאינטרנט."; },10000);
metaRef().onSnapshot(async s=>{
  if(!s.exists){
    try{ await db.runTransaction(async tx=>{ const c=await tx.get(metaRef()); if(c.exists) return; tx.set(metaRef(),SEED_META); for(const it of SEED_ITEMS){ const {id,...rest}=it; tx.set(db.collection("expenses").doc(id),rest); } }); }
    catch(e){ console.error(e); $("status").textContent="לא הצלחנו ליצור את הטיול במסד הנתונים. בדקו את כללי האבטחה ב-Firebase."; }
    return;
  }
  const d=s.data(); const prevLocal=S.localCur;
  S.trip=d.trip||""; S.localCur=CUR[d.localCur]?d.localCur:"THB"; S.people=d.people||[];
  if(firstMeta||prevLocal!==S.localCur){ if(!editingId) cur.fCur=S.localCur; if(!pEditingId) cur.pCur=S.localCur; cur.cFrom=S.localCur; }
  firstMeta=false;
  gotMeta=true; clearTimeout(timer); if(/נטענו/.test($("status").textContent)) $("status").textContent=""; ready();
},e=>{ console.error(e); $("status").textContent="לא הצלחנו לטעון את הנתונים. בדקו את כללי האבטחה ב-Firebase."; });
db.collection("expenses").onSnapshot(snap=>{
  const all=snap.docs.map(d=>({id:d.id,...d.data()}));
  S.items=all.filter(x=>x.kind!=="private"); RAW=all.filter(x=>x.kind==="private"); refreshPersonal();
  gotItems=true; ready();
},e=>{ console.error(e); });
})();
