(function(){
const $=id=>document.getElementById(id);
const PAGE_URL=location.origin+location.pathname;
/* "Hey Siri": a Shortcut opens the quick-add link with what was said after #…&say= (it stays on the phone, like the key) */
const SAY=(()=>{ try{ return (new URLSearchParams(location.hash.replace(/^#/,"")).get("say")||"").slice(0,120); }catch(e){ return ""; } })();
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
let lastUndo=null;   /* the last action that can be undone (toast "ביטול"), for shake-to-undo */
const MONEY=new Map();   /* last shown value per number, to count from it */
function money(el,v,cur,key){
  if(!el) return; key=key||el.id||""; const prev=MONEY.get(key); MONEY.set(key,{v,cur});
  /* a new display currency rolls too: from the number shown a moment ago to the new one, in the new currency */
  /* written straight away: any roll still running on this element is stopped, or it would land on an old number */
  if(calm()||!prev||!isFinite(prev.v)||!isFinite(v)||Math.abs(prev.v-v)<0.005){
    if(el.__to===v&&el.__toCur===cur&&el.classList.contains("ticking")) return;   /* already rolling to this very number */
    el.__cnt=(el.__cnt||0)+1; el.__to=v; el.__toCur=cur; el.classList.remove("ticking"); el.textContent=fmt(v,cur); return; }
  el.__to=v; el.__toCur=cur;
  /* the number rolls to its new value on a spring (motion.js), like a meter settling */
  el.classList.add("ticking");
  if(window.Motion){ Motion.count(el,prev.v,v,x=>{ el.textContent=fmt(x,cur); if(x===v) el.classList.remove("ticking"); },"smooth"); return; }
  el.textContent=fmt(v,cur); el.classList.remove("ticking");
}
function flash(el,cls,ms){ if(!el||calm()) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(()=>el.classList.remove(cls),ms||600); }
function viewSwap(fn){ if(document.startViewTransition&&!calm()){ try{ document.startViewTransition(fn); return; }catch(e){} } fn(); }
let popKey=null;
/* all square: the two of you meet in the middle, a heart, and a shimmer across the screen */
function kissFx(a,b){
  if(calm()) return; const box=document.createElement("div"); box.className="kiss"; box.setAttribute("aria-hidden","true");
  const mk=(id,side)=>{ const d=document.createElement("div"); d.className="kiss-b "+side; d.textContent=ini(nm(id)); box.appendChild(d); return d; };
  const A=mk(a,"l"), B=mk(b,"r"), H=document.createElement("div"); H.className="kiss-h"; H.textContent="💜"; box.appendChild(H);
  const sh=document.createElement("div"); sh.className="kiss-sh"; box.appendChild(sh); document.body.appendChild(box);
  const t={duration:900,easing:"cubic-bezier(.3,1.25,.5,1)",fill:"forwards"};
  A.animate([{transform:"translateX(-46vw) scale(.6)",opacity:0},{transform:"translateX(-30px) scale(1) rotate(8deg)",opacity:1}],t);
  B.animate([{transform:"translateX(46vw) scale(.6)",opacity:0},{transform:"translateX(30px) scale(1) rotate(-8deg)",opacity:1}],t);
  H.animate([{transform:"translate(-50%,-50%) scale(0)",opacity:0},{transform:"translate(-50%,-50%) scale(0)",opacity:0,offset:.55},{transform:"translate(-50%,-120%) scale(1.6)",opacity:1,offset:.8},{transform:"translate(-50%,-220%) scale(1.2)",opacity:0}],{duration:1700,easing:"ease-out",fill:"forwards"});
  sh.animate([{transform:"translateX(120%) skewX(-18deg)"},{transform:"translateX(-120%) skewX(-18deg)"}],{duration:1100,delay:500,easing:"ease-in-out",fill:"both"});
  box.animate([{opacity:1},{opacity:1,offset:.8},{opacity:0}],{duration:2200,fill:"forwards"}).finished.then(()=>box.remove());
  buzz([10,40,10,40,30]); sound("chime");
}
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
/* guess the category from the name: first from what you called things before, then from common words */
const CAT_WORDS={
  transport:["מונית","טקסי","taxi","טוקטוק","טוק טוק","tuk","גרב","גראב","grab","bolt","בולט","אובר","uber","אוטובוס","bus","רכבת","train","סליפר","sleeper","מעבורת","ferry","סירה","לונגטייל","longtail","boat","טיסה","טיסות","flight","שדה תעופה","airport","דלק","fuel","קטנוע","אופנוע","scooter","bike","טרנספר","transfer","הסעה","ואן","מיניבוס","מיניוואן","van","סונגתאו","songthaew","bts","mrt","מטרו","metro","חניה","parking","הובלה"],
  stay:["מלון","hotel","הוסטל","hostel","לינה","צימר","באנגלו","bungalow","airbnb","איירביאנבי","אירביאנבי","גסטהאוס","guesthouse","guest house","resort","ריזורט","לילה","לילות","night","חדר","room","וילה","villa"],
  food:["ארוחה","ארוחת","בוקר","breakfast","צהריים","lunch","ערב","dinner","אוכל","food","קפה","coffee","אספרסו","קפוצ","לאטה","תה","שייק","shake","מיץ","juice","פאד תאי","pad thai","מסעדה","restaurant","פיצה","pizza","המבורגר","burger","ברגר","גלידה","ice cream","מאפה","מאפייה","bakery","סושי","sushi","ראמן","ramen","נודלס","noodle","אורז","rice","פו","pho","סלט","salad","פירות","fruit","מנגו","mango","קוקוס","coconut","דוכן","street food","סנדוויץ","טוסט","קרואסון","שוק לילה","night market","סבן","7-11","711","seven","סופר","supermarket","מכולת","חטיף","snack","מים","water","שתייה","בננה","פנקייק","pancake","קארי","curry","ברביקיו","bbq","דים סאם"],
  party:["בירה","beer","קוקטייל","cocktail","משקה","drink","בר","bar","פאב","pub","מועדון","club","מסיבה","party","פול מון","full moon","וודקה","וויסקי","יין","wine","שוט","shot","באקט","bucket"],
  fun:["כניסה","entrance","ticket","כרטיס כניסה","מקדש","temple","פארק","park","טרק","trek","סיור","tour","שנורקל","snorkel","צלילה","dive","diving","קורס","course","שיעור","class","עיסוי","מסאז","massage","ספא","spa","מוזיאון","museum","אטרקציה","קייאק","kayak","רפטינג","rafting","זיפליין","zipline","פילים","elephant","מופע","show","הופעה","מואי","muay","קולנוע","cinema","איים","island","שייט","cruise","מפל","waterfall"],
  laundry:["כביסה","laundry","מכבסה","ייבוש","גיהוץ"],
  shop:["קניות","shopping","מזכרת","מזכרות","souvenir","מגנט","magnet","בגד","בגדים","חולצה","shirt","מכנסיים","pants","שמלה","dress","נעליים","shoes","כפכפים","גרביים","socks","תיק","bag","כובע","hat","משקפי","קרם","sunscreen","סים","sim","esim","מטען","charger","כבל","cable","קניון","mall","מתנה","gift","תכשיט","שעון","פארם","pharmacy","תרופה","תרופות"],
  other:["ויזה","visa","ביטוח","insurance","עמלה","fee","טיפ","tip","קנס","fine"]
};
function catNorm(t){ return " "+String(t||"").toLowerCase().replace(/[׳'"`’.,!?()\-–_/]+/g," ").replace(/\s+/g," ").trim()+" "; }
function guessCat(desc,pool){
  const q=catNorm(desc).trim(); if(q.length<2) return null;
  /* 1. you already named something like this: use what you chose then */
  let hist=null;
  for(const it of [...(pool||[])].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))){ if(!it.cat||it.kind==="transfer"||it._fee) continue; const d=catNorm(it.desc).trim(); if(d&&(d===q||(q.length>=3&&d.startsWith(q))||(d.length>=4&&q.startsWith(d)))){ hist=it.cat; break; } }
  /* 2. common words, also with a Hebrew prefix (במונית, לקפה, והמלון) */
  /* the earliest word in the name wins ("מונית למלון" is a taxi); a longer word breaks ties */
  const t=catNorm(desc); let best=null, len=0, pos=1e9;
  for(const [cat,words] of Object.entries(CAT_WORDS)) for(const w of words){ const k=catNorm(w).trim();
    const at=t.indexOf(k); if(at<0) continue; const before=t.slice(0,at), sp=before.lastIndexOf(" "), pre=before.slice(sp+1);
    if(pre.length>2||!/^[והבלמשכ]*$/.test(pre)) continue;
    if(sp<pos||(sp===pos&&k.length>len)){ best=cat; len=k.length; pos=sp; } }
  /* "food" was the old default, so an old food entry does not beat a clear word */
  if(hist&&!(hist==="food"&&best&&best!=="food")) return hist;
  return best;
}

/* rates snapshot (units per 1 USD), used only until live rates load */
const SNAPSHOT={"ILS":3.171842,"USD":1,"EUR":0.890365,"THB":33.719076,"VND":25729.735232,"LAK":22505.1838,"KHR":4065.593788,"MMK":2098.794175,"MYR":4.072794,"SGD":1.279887,"IDR":18143.678069,"PHP":63.478823,"BND":1.279887,"JPY":157.949155,"KRW":1340.784427,"CNY":6.684037,"HKD":7.845861,"MOP":8.081237,"TWD":32.830657,"MNT":3601.958391,"INR":94.779591,"NPR":151.71843,"LKR":331.826006,"BTN":94.779591,"MVR":15.459298,"BDT":124.174282,"PKR":275.809125,"KZT":452.607877,"UZS":11885.050986,"KGS":87.457295,"AED":3.6725,"GBP":0.743257,"CHF":0.817104,"AUD":1.432863,"NZD":1.785676,"CAD":1.397182,"TRY":50.017333,"GEL":2.593158,"JOD":0.709,"EGP":55.339922,"QAR":3.64,"OMR":0.384886,"ZAR":16.566684,"MXN":18.801918,"BRL":5.488807,"ARS":1550.805724,"CLP":981.86821,"PEN":3.452304,"COP":3245.471352,"CZK":21.682276,"HUF":324.682409,"PLN":3.930636,"RON":4.756031,"BGN":1.741402,"SEK":9.759447,"NOK":9.26785,"DKK":6.654908,"ISK":121.298704,"MAD":9.795078,"KES":129.924573,"TZS":2643.325335,"FJD":2.248705,"RSD":104.76815,"AMD":359.039516,"AZN":1.7};

/* written once, the first time the database is empty */
const SEED_META={trip:"גלי ויאירוש במזרח🕺🏼🥳",localCur:"THB",people:[{id:"yair",name:"יאיר",g:"m"},{id:"gali",name:"גלי",g:"f"}]};
const SEED_ITEMS=[
  {id:"sw-hotel-chiangmai",kind:"expense",desc:"מלון צאנג מאי",amount:50.57,cur:"USD",payer:"yair",among:["yair","gali"],pcts:null,cat:"stay",date:"2026-10-29",createdAt:1793260800000,source:"splitwise"},
  {id:"sw-sleeper-chiangmai",kind:"expense",desc:"סליפר צאנג מאי",amount:68.39,cur:"USD",payer:"yair",among:["yair","gali"],pcts:null,cat:"transport",date:"2026-10-29",createdAt:1793260801000,source:"splitwise"}];

let S={trip:"",localCur:"THB",people:[],items:[],fx:{rates:{...SNAPSHOT},at:null,live:false}};
let db=null, canWrite=false, busy=false, editingId=null, filter="all", loaded=false;
let form={payer:null,among:null,mode:"equal",pcts:{},cat:null,catSet:false};
let me=null, showCur=load("trip-show")||"ILS"; if(!CUR[showCur]) showCur="ILS";
let nuG="m";

function load(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function store(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function person(id){ return S.people.find(p=>p.id===id); }
function active(){ return S.people.filter(p=>!p.archived); }
function nm(id){ return person(id)?.name||"מישהו"; }
/* "each paid their own part": a shared expense (it counts in every total) that leaves no debt between you */
const EACH="each";
function paidShare(it,id){ if(!it) return 0; if(it.payer===EACH&&it.kind!=="transfer") return sharesOf(it)[id]||0; return it.payer===id?1:0; }
function payName(it){ return it.payer===EACH ? "כל אחד על עצמו" : nm(it.payer); }
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
  if(got){ S.fx={rates:next,at:stamp,live:true}; store("trip-fx",JSON.stringify({rates:next,at:stamp.toISOString()})); renderAll(); setTimeout(freezeOld,1500); }
}
try{ const c=JSON.parse(load("trip-fx")||"null"); if(c&&c.rates){ S.fx={rates:{...SNAPSHOT,...c.rates},at:new Date(c.at),live:false}; } }catch(e){}

/* ---- money ---- */
function perUsd(c){ return +S.fx.rates[c]||NaN; }
/* every shared expense and transfer keeps the rate of the moment it was entered (rIls: 1 unit = rIls shekels).
   Balances add up those frozen shekel values, so a later move in rates never changes who owes what. */
function rateNow(c){ return c==="ILS" ? 1 : conv(1,c,"ILS"); }
/* a shared expense paid by card in a foreign currency costs the payer 1% more (card fee, Max "Backpacker").
   That 1% is part of the expense, so it is split like the expense: nobody pays a fee for the other. */
/* the 1% foreign-card fee is Yair & Gali's card (Max Backpacker); a new trip starts without it */
/* the card's fee on foreign-currency charges, set per trip (settings); Yair & Gali's trip keeps its 1% */
function feeR(){ try{ const v=META&&META.cardFee; if(typeof v==="number"&&v>=0&&v<0.1) return v; return isOurs()?0.01:0; }catch(e){ return 0.01; } }
function feePct(){ return +(feeR()*100).toFixed(2)+"%"; }
function feeOn(){ return feeR()>0; }
function feeRate(it){ return feeOn()&&it&&it.kind!=="transfer"&&it.pm==="card"&&!it._fee&&it.cur&&it.cur!=="ILS" ? feeR() : 0; }
function ils(it){ const v=+it.amount||0; return it.rIls>0 ? v*it.rIls : conv(v,it.cur||"ILS","ILS"); }
function conv(v,from,to){ if(from===to) return v; return v/perUsd(from)*perUsd(to); }
/* what an expense cost, in the currency shown: one rule for every total in the app.
   Its own amount when shown in its own currency; otherwise at the rate saved when it was entered
   (what it really cost then), so totals don't drift as rates move and always equal the rows they sum. */
/* ================= not part of the trip: subscriptions and bills at home =================
   A personal expense can be "not of the trip" (Spotify, Disney+, a bill at home): it comes out of the bank
   (the budget) but is left out of every trip number. "Every month" repeats it on the same day each month. */
function recurDates(it,upto){ upto=upto||todayStr(); const out=[]; if(!it.date) return out; const [y,m,d]=it.date.split("-").map(Number);
  for(let k=0;k<240;k++){ const t=new Date(y,m-1+k,1), last=new Date(t.getFullYear(),t.getMonth()+1,0).getDate(); const ds=t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(Math.min(d,last)).padStart(2,"0"); if(ds>upto) break; out.push(ds); }
  return out; }
function expandRecur(list,upto){ const out=[]; for(const it of list||[]){ if(it.recur!=="month"){ out.push(it); continue; } recurDates(it,upto).forEach((ds,k)=>out.push(k?{...it,date:ds,_of:it.id,_occ:k}:it)); } return out; }
/* my personal expenses that belong to the trip (every month's charge counted) */
function PT(){ return expandRecur(P).filter(it=>!it.offTrip); }
/* ================= spreading: one payment, many nights =================
   An expense with spread {n,from} is counted as n equal daily parts from "from" (its date if not set).
   Days, averages, towns and months see only the parts up to today; the balance, the budget and the list
   keep the real payment on the day it was paid. */
function spreadN(it){ const n=it&&it.kind!=="transfer"&&it.spread&&Math.round(+it.spread.n); return n>1?Math.min(n,366):1; }
function spreadAll(list,upto){ upto=upto||todayStr(); const out=[];
  for(const it of list||[]){ const n=spreadN(it); if(n<2){ out.push(it); continue; } const from=it.spread.from||it.date; if(!from){ out.push(it); continue; }
    for(let i=0;i<n;i++){ const d=dayAdd(from,i); if(d>upto) break; out.push({...it,date:d,amount:(+it.amount||0)/n,_of:it.id,_part:i+1,_parts:n}); } }
  return out; }
/* what was paid ahead for days still to come */
function spreadAhead(list,upto){ upto=upto||todayStr(); let v=0; for(const it of list||[]){ const n=spreadN(it); if(n<2) continue; const from=it.spread.from||it.date; for(let i=0;i<n;i++){ if(dayAdd(from,i)>upto) v+=spend(it)/n; } } return v; }
const nUniq=list=>new Set(list.map(x=>x._of||x.id)).size;
/* in the lists: a spread expense shows on each of its days (other than the day it was paid) as "used today",
   at the top of that day; the day's total is what was used that day, the same number the daily average counts */
function ledgerParts(list,upto){ upto=upto||todayStr(); const out=[];
  for(const it of list||[]){ const n=spreadN(it); if(n<2) continue; const from=it.spread.from||it.date;
    for(let i=0;i<n;i++){ const d=dayAdd(from,i); if(d>upto) break; if(d===it.date) continue;
      out.push({...it,id:"vp-"+it.id+"-"+i,_vpart:true,_of:it.id,_i:i+1,_n:n,date:d,amount:(+it.amount||0)/n,createdAt:Date.parse(d+"T23:59:59")||0}); } }
  return out; }
/* what an entry adds to its own day: a spread payment only its own day's part (or nothing, if paid after its days) */
function dayVal(it){ if(it._vpart) return spend(it); const n=spreadN(it); if(n<2) return spend(it); const from=it.spread.from||it.date, end=dayAdd(from,n-1); return it.date>=from&&it.date<=end ? spend(it)/n : 0; }
function spreadNote(it){ const n=spreadN(it); if(n<2) return ""; const from=it.spread.from||it.date, end=dayAdd(from,n-1), sd=x=>{ const [y,m,d]=x.split("-"); return +d+"."+(+m); };
  return it.date>=from&&it.date<=end ? "🗓️ נפרס על "+n+" ימים ("+sd(from)+"–"+sd(end)+") · מתוכו היום "+fmt((+it.amount||0)/n,it.cur)+" · " : "🗓️ נפרס על "+sd(from)+"–"+sd(end)+" · נספר בימים ההם · "; }
function partRow(it,orig,personal){
  const r=document.createElement("div"); r.className="row vpart"; r.dataset.of=it._of; const sd=x=>{ const [y,m,d]=x.split("-"); return +d+"."+(+m); };
  const dot=catTile(it,null); const main=document.createElement("div"); main.className="main";
  const t=document.createElement("div"); t.className="t"; t.textContent="🗓️ "+(it.desc||"הוצאה");
  const m=document.createElement("div"); m.className="m"; m.textContent="נוצל היום · שולם ב-"+sd(orig?orig.date:it.date)+" · יום "+it._i+" מתוך "+it._n+(personal?" · אישי":"");
  main.append(t,m); const right=document.createElement("div"); right.className="r"; const b=document.createElement("b"); b.className="num"; b.textContent=fmt(+it.amount,it.cur); right.appendChild(b);
  if(it.cur!=="ILS"){ const s=document.createElement("span"); s.className="m num"; s.textContent="≈ "+fmt(spend(it,"ILS"),"ILS"); right.appendChild(s); }
  r.append(dot,main,right);
  if(orig&&canWrite){ r.setAttribute("role","button"); r.tabIndex=0; r.onclick=()=>{ buzz(5); personal?pStartEdit(orig):startEdit(orig); }; }
  return r; }
function spend(it,to){ to=to||showCur; const c=it.cur||"ILS", v=+it.amount||0; if(c===to) return v; return conv(ils(it),"ILS",to); }
/* number formatters are costly to create: make the three once */
const NF=[0,1,2].map(d=>new Intl.NumberFormat("en-US",{minimumFractionDigits:0,maximumFractionDigits:d}));
function fmt(v,cur){
  const info=CUR[cur]||{sym:""}; const a=Math.abs(v);
  if(!isFinite(a)) return "—";
  const dig=a>=1000?0:a>=100?1:2;
  let t=NF[dig].format(a);
  if(a>0&&a<0.01) t=a.toPrecision(2);
  const sign=v<0?"-":"";
  return info.sym? sign+info.sym+t : sign+t+" "+cur;
}
function curLabel(c){ const i=CUR[c]; return i? c+" · "+i.name : c; }
function sharesOf(it){
  const out={};
  if(it.kind==="transfer"){ out[it.to]=1; return out; }
  if(it.pcts){ let sum=0; for(const k in it.pcts) sum+=+it.pcts[k]||0; if(sum>0){ for(const k in it.pcts) out[k]=(+it.pcts[k]||0)/sum; return out; } }
  const among=(it.among&&it.among.length)?it.among:active().map(p=>p.id);
  for(const k of among) out[k]=1/among.length; return out;
}
/* what a settle-up of amt (in cur) from→to closes, per original currency: the payer's whole position
   (what they owe and what is owed to them, in every currency), scaled to the part being paid, at today's rates */
function settleOf(from,to,amt,cur){
  const n=compute().net[from]||{}, pos=Object.entries(n).filter(([,x])=>Math.abs(x)>0.004);
  const total=-pos.reduce((a,[c,x])=>a+conv(x,c,cur),0); if(!(total>0)||!(amt>0)) return null;
  let k=amt/total; if(Math.abs(k-1)<0.005) k=1; if(k>1) return null;      /* paying more than owed: keep it a plain transfer */
  const v={}; for(const [c,x] of pos) v[c]=Math.round(-x*k*1e6)/1e6; return v;
}
let froze=false;
function freezeOld(){
  if(froze||!canWrite||navigator.onLine===false||!S.fx.live) return;
  const old=ALL.filter(x=>!x.deleted&&x.kind!=="private"&&(x.kind==="expense"||x.kind==="transfer")&&!(x.rIls>0)&&x.cur&&x.cur!=="ILS");
  froze=true; if(!old.length) return;
  const batch=db.batch(); let n=0;
  for(const x of old){ const r=rateNow(x.cur); if(r>0){ batch.update(EXP().doc(x.id),{rIls:r}); n++; } }
  if(n) batch.commit().catch(e=>{ console.error(e); froze=false; });
}
function compute(){
  /* net: what each person paid minus their share, per original currency (for the per-currency breakdown);
     base: the same in shekels at each expense's own rate (for the balance itself) */
  const net={}, base={}; let total=0; const paid={}, share={}, cats={};
  const add=(id,c,v,b)=>{ if(!net[id]) net[id]={}; net[id][c]=(net[id][c]||0)+v; base[id]=(base[id]||0)+b; };
  for(const p of S.people){ net[p.id]={}; base[p.id]=0; paid[p.id]=0; share[p.id]=0; }
  for(const it of S.items){
    /* older settle-ups (before rates were frozen) recorded what they closed per currency */
    if(it.kind==="transfer"&&!(it.rIls>0)&&it.vec&&typeof it.vec==="object"){ for(const c in it.vec){ const v=+it.vec[c]||0, b=conv(v,c,"ILS"); add(it.payer,c,v,b); add(it.to,c,-v,-b); } continue; }
    const c=it.cur||"ILS", vb=ils(it), sh=sharesOf(it), f=1+feeRate(it), v=(+it.amount||0)*f, vf=vb*f;
    if(it.payer===EACH&&it.kind!=="transfer"){ for(const k in sh) add(k,c,v*sh[k],vf*sh[k]); } else add(it.payer,c,v,vf);
    for(const k in sh) add(k,c,-v*sh[k],-vf*sh[k]);
    if(it.kind==="transfer") continue;
    const sv=spend(it); total+=sv;   /* shown totals: the same value as every other total (the 1% stays in the balance only) */
    if(it.payer===EACH){ for(const k in sh) paid[k]=(paid[k]||0)+sv*sh[k]; } else paid[it.payer]=(paid[it.payer]||0)+sv;
    for(const k in sh) share[k]=(share[k]||0)+sv*sh[k];
    const ck=it.cat||"other"; cats[ck]=(cats[ck]||0)+sv;
  }
  const bal={}; for(const id in base) bal[id]=conv(base[id],"ILS",showCur);
  const eps=conv(0.5,"ILS",showCur);
  const cr=Object.entries(bal).filter(([,b])=>b>eps).map(([id,b])=>({id,b})).sort((x,y)=>y.b-x.b);
  const dr=Object.entries(bal).filter(([,b])=>b<-eps).map(([id,b])=>({id,b:-b})).sort((x,y)=>y.b-x.b);
  const debts=[]; let i=0,j=0;
  while(i<dr.length&&j<cr.length){ const x=Math.min(dr[i].b,cr[j].b); if(x>eps) debts.push({from:dr[i].id,to:cr[j].id,amt:x}); dr[i].b-=x; cr[j].b-=x; if(dr[i].b<=eps) i++; if(cr[j].b<=eps) j++; }
  return {net,base,bal,total,paid,share,cats,debts};
}

/* ---- extra state ---- */
let view="shared";
let editOrig=null, PENDING=new Set(), FRESH=new Set(), BIN=[], BINRAW=[], purged=false, CASH=[], dayCur="ILS", cashForm=null;                 // "shared" | "personal"
let P=[], pLoaded=false, pEditingId=null, pform={cat:null,catSet:false}, BUDGET=null, INCOME=[];
let cur={fCur:null,pCur:null,cFrom:null,cTo:"ILS"};
let cLast="A";                     // which converter field the person typed in

/* ---- theme ---- */
function themePref(){ return load("trip-theme")||"auto"; }
function isDark(){ const t=themePref(); return t==="dark"||(t==="auto"&&document.documentElement.dataset.theme==="dark"); }
function applyTheme(t){
  if(t==="auto"){ store("trip-theme",""); window.FX&&FX.autoTheme(true); }
  else { document.documentElement.dataset.theme=t; store("trip-theme",t); }
  $("themeBtn").setAttribute("aria-checked",String(isDark())); $("themeBtn").dataset.mode=themePref(); $("themeBtn").setAttribute("aria-label","מצב תצוגה: "+({auto:"אוטומטי לפי השקיעה",light:"בהיר",dark:"כהה"})[themePref()]);
  if($("motionBtn")) $("motionBtn").onclick=()=>window.askMotion&&window.askMotion(true);
  if($("jsonBtn")) $("jsonBtn").onclick=()=>backupJson();
  if($("delTripBtn")) $("delTripBtn").onclick=()=>deleteTrip();
  if($("tourBtn")) $("tourBtn").onclick=()=>{ closeSheet("setSheet"); setTimeout(()=>tour(false),250); };
  if($("inviteBtn")) $("inviteBtn").onclick=()=>{ if(!me){ toast("קודם בוחרים מי אתם"); return; } inviteSheet(); };
  if($("siriBtn")) $("siriBtn").onclick=()=>{ if(!me){ toast("קודם בוחרים מי אתם"); return; } siriHelp(); };
  if($("soundSeg")) seg($("soundSeg"),[["on","🔔 צלילים"],["off","🔕 בלי"]],v=>v===(load("trip-sound")==="off"?"off":"on"),v=>{ store("trip-sound",v); applyTheme(themePref()); if(v==="on") sound("coin"); });
  if($("themeSeg")) seg($("themeSeg"),[["auto","🌅 אוטומטי"],["light","☀️ בהיר"],["dark","🌙 כהה"]],v=>v===themePref(),v=>applyTheme(v));
}
/* three places on the switch: ☀️ light · 🌅 automatic (by sunset where you are) · 🌙 dark. Tap a place, or tap to move on. */
$("themeBtn").onclick=e=>{ const r=document.documentElement, b=$("themeBtn"), box=b.getBoundingClientRect();
  const order=["light","auto","dark"]; let next;
  if(e&&e.clientX&&box.width){ next=order[Math.max(0,Math.min(2,Math.floor((e.clientX-box.left)/box.width*3)))]; if(next===themePref()) next=order[(order.indexOf(next)+1)%3]; }
  else next=order[(order.indexOf(themePref())+1)%3];
  if(!calm()){ r.classList.add("theming"); setTimeout(()=>r.classList.remove("theming"),500); } buzz(6); applyTheme(next);
  toast(({auto:"🌅 אוטומטי: כהה מהשקיעה ועד הזריחה",light:"☀️ בהיר",dark:"🌙 כהה"})[next]); };
/* automatic: dark after sunset where you are, light after sunrise (fx.js); the switch above sets it by hand */

/* ---- search keywords per currency ---- */
const KW={THB:"תאילנד thailand bangkok בנגקוק",VND:"וייטנאם vietnam",LAK:"לאוס laos",KHR:"קמבודיה cambodia",MMK:"מיאנמר בורמה myanmar burma",MYR:"מלזיה malaysia",SGD:"סינגפור singapore",IDR:"אינדונזיה באלי indonesia bali",PHP:"פיליפינים philippines",BND:"ברוניי brunei",JPY:"יפן japan",KRW:"קוריאה korea",CNY:"סין china",HKD:"הונג קונג hong kong",MOP:"מקאו macau",TWD:"טייוואן taiwan",MNT:"מונגוליה mongolia",INR:"הודו india",NPR:"נפאל nepal",LKR:"סרי לנקה sri lanka",BTN:"בהוטן bhutan",MVR:"מלדיביים maldives",BDT:"בנגלדש bangladesh",PKR:"פקיסטן pakistan",KZT:"קזחסטן kazakhstan",UZS:"אוזבקיסטן uzbekistan",KGS:"קירגיזסטן kyrgyzstan",AED:"אמירויות דובאי uae dubai emirates",ILS:"ישראל israel שקל nis shekel",USD:"ארצות הברית אמריקה usa us dollar",EUR:"אירופה europe euro",GBP:"בריטניה אנגליה לונדון uk england pound",CHF:"שווייץ switzerland",AUD:"אוסטרליה australia",NZD:"ניו זילנד new zealand",CAD:"קנדה canada",TRY:"טורקיה turkey",GEL:"גאורגיה גרוזיה georgia",AMD:"ארמניה armenia",AZN:"אזרבייגן azerbaijan",JOD:"ירדן jordan",EGP:"מצרים egypt",QAR:"קטאר qatar",OMR:"עומאן oman",MAD:"מרוקו morocco",ZAR:"דרום אפריקה south africa",KES:"קניה kenya",TZS:"טנזניה tanzania",FJD:"פיגי fiji",MXN:"מקסיקו mexico",BRL:"ברזיל brazil",ARS:"ארגנטינה argentina",CLP:"צילה chile",PEN:"פרו peru",COP:"קולומביה colombia",CZK:"צכיה פראג czech prague",HUF:"הונגריה hungary",PLN:"פולין poland",RON:"רומניה romania",BGN:"בולגריה bulgaria",RSD:"סרביה serbia",SEK:"שוודיה sweden",NOK:"נורווגיה norway",DKK:"דנמרק denmark",ISK:"איסלנד iceland"};
const norm=s=>String(s||"").toLowerCase().replace(/[׳'"`]/g,"").replace(/\s+/g," ").trim();

/* ---- sheets ---- */
/* sheets move on springs (motion.js): up on open, follow the finger down, settle back or close */
const M=window.Motion;
function sheetEl(s){ return s.querySelector(".sheet"); }
function openSheet(id){ const s=$(id); s.classList.remove("closing"); const wasHidden=s.hidden; s.hidden=false; document.body.style.overflow="hidden"; if(id==="acctSheet") renderTabs();
  const sh=sheetEl(s); if(sh&&!sh.querySelector(".grab")){ const g=document.createElement("div"); g.className="grab"; g.setAttribute("aria-hidden","true"); sh.prepend(g); }
  if(!M||calm()||!wasHidden) return;
  s.classList.add("msp"); const wide=innerWidth>=640;
  M.animate(s,[{opacity:0},{opacity:1}],{spring:"snappy"});
  M.animate(sh,wide?[{opacity:0,transform:"scale(.94)"},{opacity:1,transform:"none"}]:[{transform:"translateY(100%)"},{transform:"none"}],{spring:"smooth"});
  if(id==="addSheet"){ const f=$("addSlot").firstElementChild; if(f) M.enter([...f.children].filter(c=>!c.hidden),{delay:90,stagger:26,max:8}); }
}
function closeSheet(id){
  const s=$(id); if(s.hidden) return;
  if(M&&!calm()&&s.classList.contains("msp")){ const sh=sheetEl(s); if(s.dataset.closing) return; s.dataset.closing="1";
    const fin=()=>{ delete s.dataset.closing; if(sh){ sh.style.transform=""; sh.getAnimations().forEach(a=>a.cancel()); } s.getAnimations().forEach(a=>a.cancel()); s.hidden=true; s.classList.remove("msp"); if(id==="addSheet") restoreAdd(); if($("curSheet").hidden&&$("setSheet").hidden&&$("addSheet").hidden&&$("acctSheet").hidden) document.body.style.overflow=""; if(id==="acctSheet") renderTabs(); };
    const from=sh&&sh.style.transform||"none";
    Promise.all([M.animate(s,[{opacity:1},{opacity:0}],{spring:"snappy",keep:true}), sh?M.animate(sh,innerWidth>=640?[{opacity:1,transform:"none"},{opacity:0,transform:"scale(.96)"}]:[{transform:from},{transform:"translateY(100%)"}],{spring:"snappy",keep:true}):null]).then(fin);
    return; }
  const finish=()=>{ s.hidden=true; s.classList.remove("closing"); if(id==="addSheet") restoreAdd(); if($("curSheet").hidden&&$("setSheet").hidden&&$("addSheet").hidden&&$("acctSheet").hidden) document.body.style.overflow=""; };
  if(calm()) return finish();
  s.classList.add("closing"); setTimeout(finish,190);
}
for(const id of ["curSheet","setSheet","addSheet","acctSheet"]) $(id).addEventListener("click",e=>{ if(e.target.id===id) closeSheet(id); });
/* drag a sheet down to close it (from the top, or anywhere while it is scrolled to the top) */
for(const id of ["curSheet","setSheet","addSheet","acctSheet"]){ const s=$(id), sh=sheetEl(s); if(!sh) continue;
  let y0=0,t0=0,dy=0,on=false,pid=null;
  sh.addEventListener("pointerdown",e=>{ if(innerWidth>=640||e.pointerType==="mouse"&&e.button!==0) return; if(e.target.closest("input,textarea,select,button,.seg,.curlist,.recent")) return; if(sh.scrollTop>0&&!e.target.closest(".sheet-head,.grab")) return; y0=e.clientY; t0=performance.now(); dy=0; on=true; pid=e.pointerId; },{passive:true});
  sh.addEventListener("pointermove",e=>{ if(!on||e.pointerId!==pid) return; dy=Math.max(0,e.clientY-y0); if(dy>4){ sh.style.transform="translateY("+dy+"px)"; s.style.opacity=String(Math.max(.35,1-dy/600)); } },{passive:true});
  const end=()=>{ if(!on) return; on=false; const v=dy/Math.max(1,performance.now()-t0);
    if(dy>110||(dy>30&&v>.55)){ s.classList.add("msp"); s.style.opacity=""; buzz(6); closeSheet(id); }
    else if(dy>0){ const from=sh.style.transform; sh.style.transform=""; s.style.opacity=""; if(M) M.animate(sh,[{transform:from},{transform:"none"}],{spring:"bouncy"}); } };
  sh.addEventListener("pointerup",end); sh.addEventListener("pointercancel",end);
}
/* after saving: a little chip with the expense flies from the button into the total, which pops */
/* the landing: a ring and sparks burst from where the money hit */
function hitFx(r){
  if(calm()) return; const cx=r.left+r.width/2, cy=r.top+r.height/2;
  const ring=document.createElement("div"); ring.className="hit-ring"; ring.style.left=cx+"px"; ring.style.top=cy+"px"; document.body.appendChild(ring);
  ring.animate([{transform:"translate(-50%,-50%) scale(.2)",opacity:.9},{transform:"translate(-50%,-50%) scale(2.6)",opacity:0}],{duration:620,easing:"cubic-bezier(.2,.8,.2,1)"}).finished.then(()=>ring.remove());
  for(let i=0;i<9;i++){ const s=document.createElement("i"); s.className="hit-spark"; s.style.left=cx+"px"; s.style.top=cy+"px"; document.body.appendChild(s);
    const ang=i/9*Math.PI*2+Math.random()*.4, d=50+Math.random()*40;
    s.animate([{transform:"translate(-50%,-50%) scale(1)",opacity:1},{transform:`translate(calc(-50% + ${Math.cos(ang)*d}px),calc(-50% + ${Math.sin(ang)*d}px)) scale(.2)`,opacity:0}],{duration:520+Math.random()*200,easing:"cubic-bezier(.2,.8,.3,1)"}).finished.then(()=>s.remove()); }
}
function flyToTotal(from,label){
  if(!M||calm()||!from) return;
  const a=from.getBoundingClientRect(); if(!a.width) return;
  const chip=document.createElement("div"); chip.className="fly-chip"; chip.textContent=label; document.body.appendChild(chip);
  const cw=chip.offsetWidth, ch=chip.offsetHeight; chip.style.left=(a.left+a.width/2-cw/2)+"px"; chip.style.top=(a.top+a.height/2-ch/2)+"px";
  setTimeout(()=>{ const t=$("sfBig"), r=t&&!$("sofar").hidden?t.getBoundingClientRect():null;
    const ok=r&&r.bottom>0&&r.top<innerHeight;
    const dx=ok?(r.left+r.width/2)-(a.left+a.width/2):0, dy=ok?(r.top+r.height/2)-(a.top+a.height/2):-120;
    /* an arc: up and over, shrinking into a glowing ball, then it lands on the total with a hit */
    const mx=dx*.5, my=Math.min(dy,0)*.5-90;
    const a2=chip.animate([{transform:"translate(0,0) scale(1) rotate(0)",opacity:1,borderRadius:"999px"},
        {transform:`translate(${mx}px,${my}px) scale(.8) rotate(-8deg)`,opacity:1,offset:.45},
        {transform:`translate(${dx}px,${dy}px) scale(${ok?.32:.6}) rotate(6deg)`,opacity:ok?.95:0}],{duration:720,easing:"cubic-bezier(.45,.05,.3,1)",fill:"forwards"});
    a2.finished.then(()=>{ chip.remove(); if(ok){ M.pop(t); hitFx(r); buzz([8,30,14]); } sound("coin"); }).catch(()=>chip.remove());
  },260);
}
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ if(!$("curSheet").hidden) closeSheet("curSheet"); else if(!$("hereSheet").hidden) closeSheet("hereSheet"); else { closeSheet("setSheet"); closeSheet("addSheet"); } } });

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
  if(sheetMode==="town") return renderTownList(q,L);
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
  if(!el) return;
  /* same buttons, same choice as last time: just refresh what a tap does. Rebuilding and measuring every row on
     every render forced the whole page to be laid out again and again (the main cause of stalls). */
  const key=JSON.stringify(opts.map(([v,l])=>[v,l,!!isOn(v)]));
  if(el.__segKey===key&&el.children.length){ const bs=el.querySelectorAll(":scope > button"); opts.forEach(([val],i)=>{ const b=bs[i]; if(b){ const pk=(el.id||"")+"|"+val; b.onclick=()=>{ popKey=pk; buzz(6); onPick(val); }; } });
    /* drawn while hidden (a closed sheet): give it its pill once it can be seen */
    if(window.Motion&&!el.querySelector(":scope > .seg-ind")) queueGlide(el,null); return; }
  el.__segKey=key;
  /* keep the gliding pill across re-renders, so a second render mid-glide does not cut it short */
  /* where the pill was: remembered from last time, not measured (measuring here forced a full layout per row) */
  const ind=el.querySelector(":scope > .seg-ind"); let was=null; try{ was=ind&&ind.dataset.to?JSON.parse(ind.dataset.to):null; }catch(e){}
  el.innerHTML=""; if(ind) el.prepend(ind);
  for(const [val,label] of opts){
    const b=document.createElement("button"); b.type="button"; b.textContent=label;
    const pk=(el.id||"")+"|"+val; b.setAttribute("aria-pressed",String(isOn(val)));
    if(popKey===pk){ b.classList.add("pop"); popKey=null; }
    b.onclick=()=>{ popKey=pk; buzz(6); onPick(val); }; el.appendChild(b);
  }
  if(window.Motion) queueGlide(el,was);
}
function queueGlide(el,was){ GLIDE.set(el,was); if(!glideRaf) glideRaf=requestAnimationFrame(()=>{ glideRaf=0; const q=[...GLIDE]; GLIDE.clear(); for(const [r,w] of q) if(r.isConnected) Motion.glide(r,w); }); }
/* all pills are measured together once the page has been drawn: one layout instead of one per row */
const GLIDE=new Map(); let glideRaf=0;
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
  /* the name under the home-screen icon: a new trip's own name (Yair & Gali's stays as it is) */
  if(loaded&&!isOurs()){ const m=document.querySelector('meta[name="apple-mobile-web-app-title"]'); if(m) m.setAttribute("content",(S.trip||"יומן הטיול").replace(/[^\p{L}\p{N} ]/gu,"").trim().slice(0,18)||"יומן הטיול"); }
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
const SETTLE_AT=500;   /* ₪ */
/* once a day per phone, a short note when the debt crosses the line */
function settleToast(d){ const k="trip-nudge-"+todayStr(); if(load(k)) return; store(k,"1");
  setTimeout(()=>toast("🤝 "+(d.to===me?nm(d.from)+" "+g.owes(d.from)+" לך ":g.you(me)+" "+g.owes(me)+" ל"+nm(d.to)+" ")+fmt(d.amt,showCur)+". אולי זה זמן לסגור חשבון","לסגירה",()=>{ const b=document.querySelector("#debts .btn.nudge"); if(b){ b.scrollIntoView({block:"center",behavior:"smooth"}); setTimeout(()=>b.click(),450); } }),1800); }
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
  /* a gentle reminder to settle once the debt is worth ₪500 or more (at today's rate) */
  const big=d=>conv(d.amt,showCur,"ILS")>=SETTLE_AT;
  if(loaded&&me&&mine.some(big)){ const d=mine.find(big), n=document.createElement("div"); n.className="settle-nudge"; n.setAttribute("role","note");
    n.textContent="🤝 החוב עבר "+fmt(SETTLE_AT,"ILS")+". אולי זה זמן טוב לסגור חשבון";
    D.appendChild(n); settleToast(d); }
  if(canWrite){
    for(const d of mine){
      const row=document.createElement("div"); row.className="debt";
      const b=document.createElement("button"); b.type="button"; b.className="btn"; b.textContent="✓ סמנו ש"+nm(d.from)+" "+g.transferred(d.from)+" ל"+nm(d.to)+" "+fmt(d.amt,showCur);
      b.onclick=()=>{ buzz(6); row.innerHTML=""; row.classList.add("ask");
        const q=document.createElement("span"); q.className="ask-q"; q.textContent="איך "+(fem(d.from)?"היא העבירה":"הוא העביר")+"?"; row.appendChild(q);
        const mk=(txt,pm,c)=>{ const x=document.createElement("button"); x.type="button"; x.className="btn small"; x.textContent=txt; x.onclick=()=>addTransfer(d.from,d.to,Math.round(conv(d.amt,showCur,c)*100)/100,pm,c); row.appendChild(x); };
        /* cash changes hands in a real currency: offer the local one too, so the wallet gets the right notes */
        const lc=S.localCur;
        if(lc&&lc!==showCur){ mk("💵 "+fmt(conv(d.amt,showCur,lc),lc)+" במזומן","cash",lc); mk("💵 "+fmt(d.amt,showCur)+" במזומן","cash",showCur); }
        else mk("💵 מזומן","cash",showCur);
        mk("🏦 העברה לחשבון","bank",showCur);
        const no=document.createElement("button"); no.type="button"; no.className="link"; no.textContent="ביטול"; no.onclick=()=>renderAll(); row.appendChild(no); };
      if(big(d)) b.classList.add("nudge");
      row.appendChild(b); D.appendChild(row);
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
  if(cur.cFrom===cur.cTo&&!window.__cPicked){ cur.cTo= cur.cFrom==="ILS" ? (S.dest&&S.dest!=="ILS"?S.dest:"USD") : "ILS"; }
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

/* the "spread over nights" row of a form (k = "f" shared, "p" personal) */
function renderSpread(k,f){
  /* a range of days, picked from the calendar (backwards too: a motorbike paid on the last day);
     the quick choices count forward from the expense's date */
  const n=f.spread&&f.spread.n>1?f.spread.n:1, base=$(k+"Date").value||todayStr();
  const quick=[2,3,4,5,7], custom=n>1&&!(quick.includes(n)&&f.spread.from===base);
  const opts=[["1","לא"],...quick.map(q=>[String(q),String(q)]),["r","📅 מתאריך עד תאריך"]];
  seg($(k+"Spread"),opts,v=>v==="r"?custom:(!custom&&+v===n),v=>{
    if(v==="r"){ const to= f.spread ? dayAdd(f.spread.from,f.spread.n-1) : base; f.spread={from:f.spread?f.spread.from:dayAdd(base,-6),n:0}; f.spread.n=daysBetween(f.spread.from,to)+1; if(f.spread.n<2){ f.spread.from=dayAdd(to,-1); f.spread.n=2; } }
    else { const m=+v; f.spread= m>1 ? {n:m,from:base} : null; }
    renderSpread(k,f); });
  const L=$(k+"SpreadFromL"), A=$(k+"SpreadFrom"), B=$(k+"SpreadTo"), info=$(k+"SpreadInfo"); L.hidden=n<2;
  if(n>1){ const to=dayAdd(f.spread.from,n-1); A.value=f.spread.from; B.value=to; A.max=B.value; B.min=A.value;
    const set=(from,end)=>{ if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(end)) return; if(end<from){ const t=from; from=end; end=t; }
      const m=Math.min(366,daysBetween(from,end)+1); f.spread= m>1 ? {n:m,from} : null; renderSpread(k,f); };
    A.onchange=()=>set(A.value,B.value); B.onchange=()=>set(A.value,B.value);
    const amt=parseFloat(String($(k+"Amt").value).replace(/,/g,""))||0, c=(k==="f"?cur.fCur:cur.pCur)||S.localCur, sd=x=>{ const [y,m,d]=x.split("-"); return +d+"."+(+m); };
    info.textContent=(amt>0?"≈ "+fmt(amt/n,c)+" ליום · ":"")+n+" ימים · "+sd(f.spread.from)+"–"+sd(to)+" · כל יום נספר בממוצע היומי ביום שלו"; }
  else info.textContent="";
  moreSum();
}
/* ================= "how much did we pay last time?" =================
   While a name is typed: what the same thing cost before, in this country, in the form's currency;
   a warning when the amount typed is well above that. */
function priceHint(k){
  const el=$(k+"PriceHint"); if(!el) return; const q=catNorm($(k+"Desc").value).trim(); el.hidden=true; el.className="pricehint"; if(q.length<2) return;
  const f= k==="f"?form:pform, loc=f.loc||defLoc(), c=(k==="f"?cur.fCur:cur.pCur)||S.localCur, skip= k==="f"?editingId:pEditingId;
  const pool=[...S.items.filter(it=>it.kind!=="transfer"),...(acct&&acctFor===me?P:[])].filter(it=>!it._fee&&it.id!==skip&&!it.offTrip&&locOf(it)===loc);
  const same=pool.filter(it=>{ const d=catNorm(it.desc).trim(); return d&&(d===q||(q.length>=3&&(d.startsWith(q)||q.startsWith(d))&&Math.min(d.length,q.length)>=3)); });
  if(!same.length) return;
  const v=same.map(it=>spend(it,c)).sort((a,b)=>a-b), lo=v[0], hi=v[v.length-1], mid=v[Math.floor(v.length/2)];
  const last=same.slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.createdAt||0)-(a.createdAt||0))[0], sd=x=>{ const [y,m,d]=(x||"").split("-"); return +d+"."+(+m); };
  const where=CTRY[loc]?" ב"+CTRY[loc].split(" ").slice(1).join(" "):"";
  let t= v.length===1 ? "💬 פעם קודמת"+where+": "+fmt(lo,c)+" ("+sd(last.date)+")" : "💬 שילמתם "+v.length+" פעמים"+where+": "+(Math.abs(hi-lo)<0.5?fmt(lo,c):fmt(lo,c)+"–"+fmt(hi,c))+" · בדרך כלל "+fmt(mid,c);
  const amt=parseFloat(String($(k+"Amt").value).replace(/,/g,""))||0;
  if(amt>0&&amt>hi*1.3){ t+=" · ⚠️ יקר מהרגיל"; el.classList.add("hi"); } else if(amt>0&&amt<lo*0.75){ t+=" · 👍 זול מהרגיל"; el.classList.add("lo"); }
  el.textContent=t; el.hidden=false;
}
function renderForm(){
  const ids=active().map(p=>p.id);
  if(!form.payer||(form.payer!==EACH&&!person(form.payer))) form.payer=me||ids[0];
  if(!form.among) form.among=[...ids];
  form.among=form.among.filter(person);
  if(!cur.fCur) cur.fCur=S.localCur; setCurBtn("fCur",cur.fCur);
  const payers=active(); if(form.payer&&!payers.find(p=>p.id===form.payer)&&person(form.payer)) payers.push(person(form.payer));
  seg($("fPm"),[["cash","💵 מזומן"],["card","💳 כרטיס"]],v=>v===(form.pm||"cash"),v=>{form.pm=v;renderForm();});
  seg($("fPayer"),[...payers.map(p=>[p.id,p.name+" "+g.paid(p.id)]),...(ids.length>1?[[EACH,"👫 כל אחד על עצמו"]]:[])],v=>v===form.payer,v=>{form.payer=v;renderForm(); if(v===EACH) toast("👫 כל אחד שילם את החלק שלו: נספר כהוצאה משותפת, בלי חוב ביניכם");});
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
  $("fLoc").textContent=locName(form.loc||defLoc()); renderSpread("f",form); moreSum(); priceHint("f");
  seg($("fCat"),CATS,v=>v===form.cat,v=>{form.cat=v;form.catSet=true;renderForm(); if(v==="other") $("fCatLabel").focus();});
  $("fCatAuto").hidden=!(form.cat&&!form.catSet);
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
  for(const it of S.items){ if(it.kind==="transfer"||monthOf(it)!==ym) continue; const k=catKey(it); cats[k]=(cats[k]||0)+spend(it); }
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
/* how it was paid, on every expense row; old entries without a mark count as cash, so they say so */
function pmText(it){ if(!it||it.kind==="transfer"||it._fee) return ""; if(it.pm==="bank") return "🏦 מהבנק"; return it.pm==="card" ? "💳 כרטיס"+(feeRate(it)?" · עמלה\u00a0"+feePct():"") : "💵 מזומן"; }
/* the search: every word must match something about the expense — what, who, category, how paid, amount,
   date (29.10, 29/10, October, a weekday), country (or "הכנות" / "לפני הטיול"), town, currency.
   A word like >500 or <100 compares the amount (in the currency shown); 200-500 is a range. */
let matchPC=null, matchPCat=0;
function matchCtx(){ const now=Date.now(); if(!matchPC||now-matchPCat>800){ matchPC=placeCtx(); matchPCat=now; } return matchPC; }
function matches(it,q){
  if(!q) return true;
  const PC=matchCtx(), loc=PC.effLoc(it), [y,m,d]=(it.date||"--").split("-");
  const place= loc==="prep" ? "לפני הטיול הכנות הכנה" : loc==="?" ? "לא ידוע" : (CTRY[loc]||locName(loc));
  const town= it.town || (()=>{ const k=PC.stayOf(it); return k>=0&&PC.stays[k] ? PC.stays[k].n : ""; })();
  const dates= it.date ? [+d+"."+(+m),+d+"/"+(+m),+d+"."+(+m)+"."+y.slice(2),it.date,monthName(y+"-"+m,true)].join(" ") : "";
  const hay=norm([it.desc,pmText(it),it.pm==="card"?"כרטיס אשראי":it.pm==="cash"?"מזומן":"",catName(catKey(it)),it.catLabel||"",payName(it),it.payer===EACH?active().map(p=>p.name).join(" "):"",it.to?nm(it.to):"",it.kind==="transfer"?"העברה":"",it.cur,CUR[it.cur]?.name,String(it.amount),dayLabel(it.date),dates,place,town].join(" "));
  const val=spend(it);
  return q.split(" ").filter(Boolean).every(w=>{
    let r=w.match(/^([<>])=?(\d+(?:\.\d+)?)$/); if(r) return r[1]===">" ? val>=+r[2] : val<=+r[2];
    r=w.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/); if(r) return val>=+r[1]&&val<=+r[2];
    /* spelling varies (צאנג / צ׳יאנג, תאילנד / טאילנד): also try without י and ו */
    return hay.includes(w) || hay.replace(/[יו]/g,"").includes(w.replace(/[יו]/g,"")); });
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
function sharedDay(d){ const v=spreadAll(S.items.filter(it=>it.kind!=="transfer")).filter(it=>it.date===d).reduce((s,it)=>s+spend(it),0); return v>0?"סה״כ "+fmt(v,showCur):""; }
function mineDay(d){
  const alone=spreadAll(PT()).filter(it=>it.date===d).reduce((s,it)=>s+spend(it),0);
  const tog=spreadAll(myShareItems()).filter(it=>it.date===d).reduce((s,it)=>s+spend(it),0);
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
/* lists keep their place: rows that stay slide to their new spot, new rows drop in, all on springs */
function flipKeys(box){ const m=new Map(); if(!box) return m;
  box.querySelectorAll(".row[data-id]").forEach(r=>m.set("r:"+r.dataset.id,r.closest(".swipe")||r));
  box.querySelectorAll(".day > h3").forEach(h=>m.set("h:"+h.textContent.slice(0,24),h)); return m; }
function flipList(box,render){
  const live= M&&!calm()&&box&&box.offsetParent!==null&&seenReady;
  const vis=r=>r.bottom>-80&&r.top<innerHeight+80;
  const before=new Map(); if(live) for(const [k,el] of flipKeys(box)){ const r=el.getBoundingClientRect(); if(vis(r)) before.set(k,r); }
  const out=render(); if(!live) return out;
  const fresh=[];
  for(const [k,el] of flipKeys(box)){ const b=el.getBoundingClientRect(); if(!vis(b)) continue; const a=before.get(k);
    if(a){ const dx=a.left-b.left, dy=a.top-b.top; if(Math.abs(dx)>.5||Math.abs(dy)>.5) M.animate(el,[{transform:`translate(${dx}px,${dy}px)`},{transform:"none"}],{spring:"smooth"}); }
    else if(k.startsWith("r:")&&before.size) fresh.push(el); }
  if(fresh.length&&fresh.length<8&&!window.__deck) M.enter(fresh,{spring:"bouncy",stagger:45});
  return out; }
const LIST_STEP=40, listLim={shared:LIST_STEP,mine:LIST_STEP};
/* folded days: which past days were opened by hand (per list), kept while the app is open */
/* folded list: months → days → expenses. What you opened or closed by hand is kept while the app is open. */
const FOLD={shared:new Map(),mine:new Map()};
function groupDays(list){ const m=new Map(); for(const it of list){ const a=m.get(it.date)||[]; a.push(it); m.set(it.date,a); } return m; }
/* the day open by default: today, or on a day with nothing yet the latest day (so the screen is not empty) */
function autoDay(list){ const t=todayStr(); return list.some(it=>it.date===t)||!list.length ? t : list[0].date; }
function isOpen(k,key,def){ const v=FOLD[k].get(key); return v===undefined?def:v; }
function foldState(list,k){ const a=autoDay(list), tm=todayStr().slice(0,7);
  return { day:d=>d===todayStr()||isOpen(k,"d"+d,d===a), month:m=>isOpen(k,"m"+m,m===tm||m===a.slice(0,7)) }; }
/* one line for a whole past month: name, how many days and expenses, the total; tap to see its days */
function monthFold(L,ym,items,open,k,redraw,sum){
  const b=document.createElement("button"); b.type="button"; b.className="monthfold"+(open?" on":""); b.setAttribute("aria-expanded",String(open));
  const n=items.filter(it=>it.kind!=="transfer"&&!it._vpart).length, days=new Set(items.map(it=>it.date)).size;
  const tx=document.createElement("span"); tx.className="df-tx"; const t=document.createElement("b"); t.textContent="🗓️ "+monthName(ym,true);
  const sub=document.createElement("small"); sub.textContent=(days===1?"יום אחד":days+" ימים")+" · "+(n===1?"הוצאה אחת":n+" הוצאות"); tx.append(t,sub);
  const c=document.createElement("span"); c.className="df-go num"; c.textContent=sum>0?fmt(sum,showCur):"";
  const ch=document.createElement("i"); ch.className="df-ch"; ch.setAttribute("aria-hidden","true"); ch.textContent="▾";
  b.dataset.ym=ym;
  b.append(tx,c,ch); b.onclick=()=>{ buzz(5); FOLD[k].set("m"+ym,!open); window.__deck=!open; redraw(); if(!open&&window.Cinema) Cinema.opened(k==="shared"?"ledger":"pLedger","m",ym); }; L.appendChild(b);
}
function dayFold(box,h,date,items,open,k,redraw){
  box.classList.add("fold"); box.classList.toggle("shut",!open);
  if(date===todayStr()) return;
  /* one compact line replaces the day title: date and what was in it on the right, the day's total and ▾ on the left */
  const sum=document.createElement("button"); sum.type="button"; sum.className="dayfold"; sum.setAttribute("aria-expanded",String(open));
  const n=(items||[]).filter(it=>it.kind!=="transfer"&&!it._vpart).length, tr=(items||[]).filter(it=>it.kind==="transfer").length;
  const tx=document.createElement("span"); tx.className="df-tx";
  const d=document.createElement("b"); d.textContent=h.firstChild?h.firstChild.textContent:date;
  const sub=document.createElement("small"); sub.textContent=[...new Set((items||[]).map(catEmoji))].slice(0,5).join(" ")+"  "+(n===1?"הוצאה אחת":n+" הוצאות")+(tr?" · "+(tr===1?"העברה":tr+" העברות"):"");
  tx.append(d,sub);
  const c=document.createElement("span"); c.className="df-go num"; c.textContent=((h.querySelector(".daysum")||{}).textContent||"").replace(/^סה״כ /,"");
  const ch=document.createElement("i"); ch.className="df-ch"; ch.setAttribute("aria-hidden","true"); ch.textContent="▾";
  sum.append(tx,c,ch); h.hidden=true;
  box.dataset.date=date;
  sum.onclick=()=>{ buzz(5); FOLD[k].set("d"+date,!open); window.__deck=!open; redraw(); if(!open&&window.Cinema) Cinema.opened(k==="shared"?"ledger":"pLedger","d",date); };
  h.after(sum);
}
function moreBtn(L,left,fn){ if(left<=0) return; const b=document.createElement("button"); b.type="button"; b.className="btn block more-rows"; b.textContent="עוד "+Math.min(left,LIST_STEP)+" הוצאות · נשארו "+left; b.onclick=()=>{ buzz(5); fn(); }; L.appendChild(b); }
function renderLedger(){ return flipList($("ledger"),renderLedger_); }
function renderLedger_(){
  seg($("filter"),[["all","הכול"],...active().map(p=>[p.id,p.name]),["transfers","💸 העברות"]],v=>v===filter,v=>{filter=v;listLim.shared=LIST_STEP;renderLedger();});
  const L=$("ledger"); L.innerHTML="";
  const q=norm($("lSearch").value);
  const base=S.items.filter(it=>(filter==="all"||(filter==="transfers"?it.kind==="transfer":paidShare(it,filter)>0))&&matches(it,q));
  const list=base.concat(ledgerParts(base)).sort((x,y)=>(y.date||"").localeCompare(x.date||"")||(y.createdAt||0)-(x.createdAt||0));
  if(!loaded){ for(let i=0;i<3;i++){ const s=document.createElement("div"); s.className="row skelrow"; s.innerHTML='<span class="skel dotsk"></span><span><span class="skel" style="width:60%"></span><br><span class="skel" style="width:40%;height:.7em"></span></span><span class="skel" style="width:3.5em"></span>'; L.appendChild(s); } return; }
  if(!list.length){ const e=document.createElement("div");
    if(loaded&&!q&&!S.items.length){ richEmpty(e,"🧳","עוד אין הוצאות בטיול","הקפה הראשון, המונית מהשדה, הכול מתחיל כאן.","➕ הוצאה ראשונה",openAdd); }
    else { e.className="empty"; e.textContent=!loaded?"":q?"לא נמצאה הוצאה שמתאימה לחיפוש":"אין הוצאות בסינון הזה"; }
    L.appendChild(e); return; }
  let curDay=null, box=null, skip=false, curMon=null, skipMon=false;
  /* today in full; earlier days fold into one line each, past months into one line each (tap to open). Searching or filtering opens everything. */
  const fold=!q&&filter==="all", st=foldState(list,"shared"), byDay=fold?groupDays(list):null, tm=todayStr().slice(0,7);
  /* a long trip has hundreds of rows: draw the newest ones, more on request */
  const shown=fold?list:list.slice(0,listLim.shared);
  for(const it of shown){
    const ym=(it.date||"").slice(0,7);
    if(fold&&ym!==curMon){ curMon=ym; skipMon=false; if(ym!==tm){ const mi=list.filter(x=>(x.date||"").slice(0,7)===ym); skipMon=!st.month(ym);
        monthFold(L,ym,mi,!skipMon,"shared",renderLedger,mi.filter(x=>x.kind!=="transfer").reduce((a,x)=>a+dayVal(x),0)); } }
    if(skipMon) continue;
    if(it.date!==curDay){ curDay=it.date; box=document.createElement("div"); box.className="day"; const h=document.createElement("h3"); dayHead(h,it.date,sharedDay(it.date)); box.appendChild(h); L.appendChild(box);
      skip=fold&&!st.day(it.date); if(fold) dayFold(box,h,it.date,byDay.get(it.date),!skip,"shared",renderLedger); }
    if(skip) continue;
    if(it._vpart){ box.appendChild(partRow(it,S.items.find(x=>x.id===it._of),false)); continue; }
    const r=document.createElement("div"); r.className="row"+(it.kind==="transfer"?" transfer":"")+(FRESH.has(it.id)?" fresh":"")+(PENDING.has(it.id)?" pending":"")+(isNew(it.id)?" enter":""); r.dataset.id=it.id;
    const dot=catTile(it, it.kind==="transfer"||it.payer===EACH?null:it.payer);
    const main=document.createElement("div"); main.className="main";
    const t=document.createElement("div"); t.className="t"; const m=document.createElement("div"); m.className="m";
    if(it.kind==="transfer"){ t.textContent="💸 "+nm(it.payer)+" "+g.transferred(it.payer)+" ל"+nm(it.to); m.textContent=withTime(it,"סגירת חשבון"+(it.pm==="cash"?" · 💵 מזומן":it.pm==="bank"?" · 🏦 העברה לחשבון":"")); }
    else{ t.textContent=(PENDING.has(it.id)?"⏳ ":"")+(it.desc||"הוצאה"); if(notesOf(it).length){ const nb=document.createElement("button"); nb.type="button"; nb.className="note-badge"+(noteUnseen(it)?" new":""); nb.textContent="💬 "+notesOf(it).length; nb.setAttribute("aria-label",notesOf(it).length+" הערות"); nb.onclick=e=>{ e.stopPropagation(); showNotes(it); }; t.appendChild(nb); } m.textContent=withTime(it,spreadNote(it)+(it.payer===EACH?"👫 כל אחד שילם על עצמו":nm(it.payer)+" "+g.paid(it.payer))+" · "+pmText(it)+(feeRate(it)?"\u00a0מתחלקת":"")+" · "+splitText(it)+" · "+catName(catKey(it)).replace(/^\S+\s/,"")); }
    main.append(t,m);
    const right=document.createElement("div"); right.className="r";
    const b=document.createElement("b"); b.className="num"; b.textContent=fmt(+it.amount,it.cur); right.appendChild(b);
    if(it.cur!=="ILS"){ const s=document.createElement("span"); s.className="m num"; s.textContent="≈ "+fmt(ils(it),"ILS"); right.appendChild(s); }
    if(me&&it.kind!=="transfer"){ const sh=sharesOf(it); const fa=(+it.amount)*(1+feeRate(it)); const d=fa*paidShare(it,me)-fa*(sh[me]||0); if(Math.abs(d)>0.0001){ const s=document.createElement("span"); s.className="mine num "+(d>0?"plus":"minus"); s.textContent=(d>0?"מגיע לך ":"עליך ")+fmt(Math.abs(d),it.cur); right.appendChild(s); } }
    if(canWrite){
      const acts=document.createElement("div"); acts.className="acts";
      if(it.kind!=="transfer"){ const e=document.createElement("button"); e.className="link"; e.type="button"; e.textContent="עריכה"; e.onclick=()=>startEdit(it); acts.appendChild(e);
        if(it.hist&&it.hist.length){ const hb=document.createElement("button"); hb.className="link"; hb.type="button"; hb.textContent="🕘 גרסאות"; hb.onclick=()=>showHistory(it,false); acts.appendChild(hb); }
        const nt=document.createElement("button"); nt.className="link"; nt.type="button"; nt.textContent="💬 הערה"; nt.onclick=()=>showNotes(it); acts.appendChild(nt); }
      if(it.kind!=="transfer"){ const ag=document.createElement("button"); ag.className="link"; ag.type="button"; ag.textContent="🔁 שוב"; ag.title="להוסיף את אותה הוצאה להיום"; ag.onclick=()=>again(it,false); acts.prepend(ag); }
      const d=delBtn(()=>delItem(it,false)); if(it.kind==="transfer"){ d.textContent="ביטול ההעברה"; d.dataset.label="ביטול ההעברה"; }
      acts.appendChild(d);
      r.appendChild(acts);
    }
    r.append(dot,main,right); tapRow(r); box.appendChild(swipeWrap(r,it,false));
  }
  if(!fold) moreBtn(L,list.length-shown.length,()=>{ listLim.shared+=LIST_STEP; renderLedger(); });
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
    const fees=CASH.filter(x=>(x.sub==="withdraw"||x.sub==="exchange")&&+x.fee>0).map(x=>{ const st=tripStart(), early= x.sub==="exchange"&&st&&(x.date||"")<st;   /* rate loss on money changed before the flight counts as trip spending */
      return {id:"fee-"+x.id,_wid:x.id,_fee:true,desc:x.sub==="exchange"?"הפרשי שער בצ׳יינג׳":"עמלת משיכה",amount:+x.fee,cur:x.feeCur||x.cur,cat:"other",catLabel:x.sub==="exchange"?"הפרשי שער":"עמלות משיכה",pm:"fee",date:early?st:x.date,createdAt:x.createdAt,tz:x.tz,loc:early?(S.dest||x.loc):x.loc}; });
    for(const x of CASH){ const v=cardFee(x); if(v>0) fees.push({id:"cfee-"+x.id,_wid:x.id,_fee:true,desc:"עמלת כרטיס "+feePct()+" על משיכה",amount:v,cur:x.cur,cat:"other",catLabel:"עמלות משיכה",pm:"fee",date:x.date,createdAt:(x.createdAt||0)+1,tz:x.tz,loc:x.loc}); }
    INCOME=mine.filter(x=>x.type==="budget-in");
    BUDGET=mine.filter(x=>x.type==="budget").sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))[0]||null;
    STOPS=mine.filter(x=>x.type==="stop");
    setTimeout(moveOldStops,1500);
    P=[...mine.filter(x=>x.type!=="cash"&&x.type!=="budget"&&x.type!=="budget-in"&&x.type!=="stop"),...fees]; pLoaded=true; syncCardFees(); if(!$("acctSheet").hidden) fillAcct(); if(view==="personal") renderAll();
  }catch(e){ console.error(e); pLoaded=true; }
}
/* too easy to guess offline: only digits, or built from the person's name or username */
function weakPw(pw){ const p=pw.toLowerCase(), q=person(me)||{};
  if(/^\d+$/.test(p)||/^(.)\1+$/.test(p)) return true;
  const ids=[q.name,q.u,(q.u||"").split(/[._]/)[0],me].filter(Boolean).map(x=>String(x).toLowerCase()).filter(x=>x.length>=2);
  return ids.some(x=>p.includes(x)); }
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
    "בוחרים סיסמה (לפחות 8 תווים, שלא דומה לשם). איתה ההוצאות האישיות שלך יופיעו בכל טלפון ובכל דפדפן, ואף אחד אחר לא יוכל לקרוא אותן. חשוב לזכור אותה: אי אפשר לשחזר סיסמה שנשכחה.";
  $("lockPw2Wrap").hidden=has; $("lockBtn").textContent= has? "כניסה" : "יצירת חשבון";
  $("lockPw").setAttribute("autocomplete",has?"current-password":"new-password");
}
$("lockBtn").onclick=async()=>{
  showErr("lockErr"); const pw=$("lockPw").value; const p=person(me);
  if(pw.length<4) return showErr("lockErr","הסיסמה צריכה להיות לפחות 4 תווים");
  if(!person(me)?.vk&&pw.length<8) return showErr("lockErr","סיסמה חדשה צריכה להיות לפחות 8 תווים");
  if(!person(me)?.vk&&weakPw(pw)) return showErr("lockErr","הסיסמה קלה לניחוש. בחרו משהו שלא דומה לשם ולא רק מספרים");
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
function renderPForm(){
  if(!cur.pCur) cur.pCur=S.localCur; setCurBtn("pCur",cur.pCur);
  $("pLoc").textContent=locName(pform.loc||defLoc()); renderSpread("p",pform); moreSum(); priceHint("p");
  seg($("pPm"),[["cash","💵 מזומן"],["card","💳 כרטיס"],["bank","🏦 מהבנק"]],v=>v===(pform.pm||"cash"),v=>{pform.pm=v;renderPForm();});
  /* of the trip, or not (a subscription or a bill at home): comes out of the bank, stays out of the trip */
  seg($("pOff"),[["trip","✈️ של הטיול"],["home","🏠 לא קשור לטיול"]],v=>v===(pform.offTrip?"home":"trip"),v=>{ pform.offTrip=v==="home"; if(pform.offTrip&&(pform.pm||"cash")==="cash") pform.pm="card"; if(!pform.offTrip) pform.recur=null; renderPForm(); });
  { const R=$("pRecur"); R.hidden=!pform.offTrip; seg(R,[["once","פעם אחת"],["month","🔁 כל חודש"]],v=>v===(pform.recur==="month"?"month":"once"),v=>{ pform.recur=v==="month"?"month":null; renderPForm(); });
    const d=$("pDate").value||todayStr(); $("pOffInfo").textContent= !pform.offTrip ? "" : (pform.recur==="month" ? "🔁 ירד מהבנק ב-"+(+d.slice(8))+" בכל חודש · " : "")+"לא נספר בהוצאות הטיול, רק בעו״ש"; }
  seg($("pCat"),CATS,v=>v===pform.cat,v=>{pform.cat=v;pform.catSet=true;renderPForm(); if(v==="other") $("pCatLabel").focus();});
  $("pCatAuto").hidden=!(pform.cat&&!pform.catSet);
  $("pCatLabel").hidden=pform.cat!=="other";
  convHint("pAmt",cur.pCur,"pConv"); saveLabel();
}
function renderPersonal(){ renderPForm(); const out=flipList($("pLedger"),renderPersonal_); try{ if(view==="personal") renderJourney("mine"); }catch(e){} return out; }
function renderPersonal_(){
  if(view!=="personal"||!me) return;
  const locked=!(acct&&acctFor===me);
  $("lockCard").hidden=!locked; $("pBody").hidden=locked;
  if(locked){ renderLock(); return; }
  const shared=myShareItems();
  let own=0, share=0, today=0; const cats={}; const td=todayStr();
  const ym=thisMonth();
  for(const it of PT()){ const v=spend(it); own+=v; if(monthOf(it)===ym){ const k=catKey(it); cats[k]=(cats[k]||0)+v; } if(it.date===td) today+=v; }
  for(const it of shared){ const v=spend(it); share+=v; if(monthOf(it)===ym){ const k=catKey(it); cats[k]=(cats[k]||0)+v; } if(it.date===td) today+=v; }
  $("pCatTitle").textContent="📊 לאן הלך הכסף שלך ב"+monthName(ym,true).split(" ")[0];
  $("pLbl").textContent="ההוצאות של "+nm(me)+" בטיול · רק "+(fem(me)?"את רואה":"אתה רואה")+" את המסך הזה";
  $("pOnly").textContent= fem(me)?"רק את רואה":"רק אתה רואה";
  money($("pAll"),own+share,showCur); money($("pOwn"),own,showCur); money($("pShare"),share,showCur); money($("pToday"),today,showCur);
  showinRow($("pShowin"));
  renderDaily(); renderCash(); renderMoney();
  catBars("pCats","pCatPanel",cats);
  const L=$("pLedger"); L.innerHTML="";
  const pq=norm($("pSearch").value);
  const pbase=P.filter(it=>matches(it,pq));
  const list=pbase.concat(ledgerParts(pbase.filter(x=>!x.offTrip))).sort((x,y)=>(y.date||"").localeCompare(x.date||"")||(y.createdAt||0)-(x.createdAt||0));
  if(!list.length){ const e=document.createElement("div");
    if(pLoaded&&!pq) richEmpty(e,"🔐","עוד אין הוצאות אישיות","מזכרות, קפה, עיסוי. "+(fem(me)?"רק את רואה אותן.":"רק אתה רואה אותן."),"➕ הוצאה אישית",openAdd);
    else { e.className="empty"; e.textContent=!pLoaded?"טוען…":"לא נמצאה הוצאה שמתאימה לחיפוש"; }
    L.appendChild(e); }
  let curDay=null, box=null, skip=false, curMon=null, skipMon=false;
  const fold=!pq, st=foldState(list,"mine"), byDay=fold?groupDays(list):null, tm=todayStr().slice(0,7);
  const shown=fold?list:list.slice(0,listLim.mine);
  for(const it of shown){
    const ym=(it.date||"").slice(0,7);
    if(fold&&ym!==curMon){ curMon=ym; skipMon=false; if(ym!==tm){ const mi=list.filter(x=>(x.date||"").slice(0,7)===ym); skipMon=!st.month(ym);
        monthFold(L,ym,mi,!skipMon,"mine",renderPersonal,mi.filter(x=>!x.offTrip).reduce((a,x)=>a+dayVal(x),0)); } }
    if(skipMon) continue;
    if(it.date!==curDay){ curDay=it.date; box=document.createElement("div"); box.className="day"; const h=document.createElement("h3"); dayHead(h,it.date,(()=>{ const v=list.filter(x=>x.date===it.date&&!x.offTrip).reduce((a,x)=>a+dayVal(x),0); return v>0?"סה״כ "+fmt(v,showCur):""; })()); box.appendChild(h); L.appendChild(box);
      skip=fold&&!st.day(it.date); if(fold) dayFold(box,h,it.date,byDay.get(it.date),!skip,"mine",renderPersonal); }
    if(skip) continue;
    if(it._vpart){ box.appendChild(partRow(it,P.find(x=>x.id===it._of),true)); continue; }
    const r=document.createElement("div"); r.className="row"+(isNew(it.id)?" enter":""); r.dataset.id=it.id;
    const dot=catTile(it,null);
    const main=document.createElement("div"); main.className="main";
    const t=document.createElement("div"); t.className="t"; t.textContent=it.desc||"הוצאה";
    const m=document.createElement("div"); m.className="m"; m.textContent=withTime(it,"אישי · "+(it.offTrip?"🏠 לא מהטיול · "+(it.recur==="month"?"🔁 כל חודש ("+recurDates(it).length+" חיובים) · ":""):"")+spreadNote(it)+(it._fee?"":pmText(it)+" · ")+catName(catKey(it)).replace(/^\S+\s/,""));
    main.append(t,m);
    const right=document.createElement("div"); right.className="r";
    const b=document.createElement("b"); b.className="num"; b.textContent=fmt(+it.amount,it.cur); right.appendChild(b);
    if(it.cur!=="ILS"){ const s=document.createElement("span"); s.className="m num"; s.textContent="≈ "+fmt(spend(it,"ILS"),"ILS"); right.appendChild(s); }
    const acts=document.createElement("div"); acts.className="acts";
    if(it._fee){ const n=document.createElement("span"); n.className="m fee-note"; n.textContent= it.catLabel==="הפרשי שער" ? "💱 מתוך החלפה בארנק" : it._pfx ? "💳 מחושב לבד מהתשלומים בכרטיס" : "🏧 מתוך משיכה בארנק"; right.appendChild(n);
      const w=CASH.find(x=>x.id===it._wid);
      r.append(dot,main,right); r.dataset.id=it.id;
      box.appendChild(w ? swipeWrap(r,it,true,{again:()=>againCash(w),againLabel:w.sub==="exchange"?"🔁 עוד החלפה כזו":"🔁 עוד משיכה כזו",del:()=>delItem({id:w.id,desc:w.sub==="exchange"?"החלפת מטבע":"משיכה מכספומט"},true),delLabel:w.sub==="exchange"?"🗑 מחיקת ההחלפה":"🗑 מחיקת המשיכה"}) : r); continue; }
    const e=document.createElement("button"); e.className="link"; e.type="button"; e.textContent="עריכה"; e.onclick=()=>pStartEdit(it); acts.appendChild(e);
    if(it.hist&&it.hist.length){ const hb=document.createElement("button"); hb.className="link"; hb.type="button"; hb.textContent="🕘 גרסאות"; hb.onclick=()=>showHistory(it,true); acts.appendChild(hb); }
    const ag=document.createElement("button"); ag.className="link"; ag.type="button"; ag.textContent="🔁 שוב"; ag.onclick=()=>again(it,true); acts.prepend(ag);
    acts.appendChild(delBtn(()=>delItem(it,true)));
    r.appendChild(acts);
    r.append(dot,main,right); tapRow(r); box.appendChild(swipeWrap(r,it,true));
  }
  if(!fold) moreBtn(L,list.length-shown.length,()=>{ listLim.mine+=LIST_STEP; renderPersonal(); });
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
    if(open){ r.classList.add("open"); r.setAttribute("aria-expanded","true"); buzz(5); if(M) M.enter(r.querySelectorAll(".acts > *"),{spring:"snappy",stagger:35}); } };
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
    /* rubber band: heavy until the line, then it gives way */
    dx= mx>0&&!canAgain ? mx*.2 : mx; const ad=Math.abs(dx), ease=Math.sign(dx)*(ad<TH ? ad*.5 : TH*.5+(ad-TH)*.95);
    r.style.transform="translateX("+ease+"px)"; w.classList.toggle("to-again",dx>0); w.classList.toggle("to-del",dx<0);
    const now= Math.abs(dx)>TH ? Math.sign(dx) : 0; if(now!==armed){ armed=now; w.classList.toggle("armed",!!now); if(now) buzz(10); }
  });
  const end=()=>{ if(!drag) return; drag=false; w.classList.remove("dragging");
    const act=armed, from=r.style.transform||"none"; r.style.transform="";
    if(M&&!calm()&&from!=="none"){
      if(act<0){ /* the bin swallows the row: it shrinks and tips into the bin, which gulps */
        const bin=w.querySelector(".sw-del"); w.classList.add("gulp");
        r.animate([{transform:from,opacity:1},{transform:"translateX(-62%) scale(.55) rotate(-6deg)",opacity:.9,offset:.55},{transform:"translateX(-78%) scale(.05) rotate(-18deg)",opacity:0}],{duration:520,easing:"cubic-bezier(.5,0,.75,0)",fill:"forwards"});
        /* the delete runs on a timer, not on the animation: a re-draw in the middle must not lose it */
        setTimeout(()=>{ if(bin) bin.animate([{transform:"scale(1.18)"},{transform:"scale(1.5) rotate(-10deg)"},{transform:"scale(1)"}],{duration:380,easing:"cubic-bezier(.3,1.6,.5,1)"}); buzz([6,24,12]); sound("swoosh"); },520);
        setTimeout(()=>{ w.classList.remove("armed","to-again","to-del","gulp"); doDel(); },680); return; }
      M.animate(r,[{transform:from},{transform:"none"}],{spring:"bouncy"}).then(()=>w.classList.remove("armed","to-again","to-del"));
      if(act>0&&canAgain){ M.pop(r); doAgain(); } return; }
    w.classList.remove("armed","to-again","to-del");
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
  if(!io||calm()||window.__cinema) return;   /* the cinema layer (cinema.js) moves the cards */
  document.querySelectorAll("#viewShared > section, #viewPersonal section, #viewStats > section, .insight").forEach(el=>{
    if(revealed.has(el)) return; revealed.add(el);
    const r=el.getBoundingClientRect(); if(r.top<innerHeight) return;   /* already on screen: leave it alone */
    el.classList.add("rv"); io.observe(el);
  });
}

/* coins pop out of the open backpack while the rates refresh */
function coins(from){
  if(calm()) return; const r=from.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
  for(let i=0;i<7;i++){ const c=document.createElement("span"); c.className="coin"; c.textContent=["🪙","💵","🪙","💶","🪙","💴","🪙"][i]; c.style.left=cx+"px"; c.style.top=cy+"px"; document.body.appendChild(c);
    const dx=(i-3)*26+(Math.random()-.5)*14, up=70+Math.random()*50;
    c.animate([{transform:"translate(-50%,-50%) scale(.3) rotate(0)",opacity:0},{transform:`translate(calc(-50% + ${dx*.6}px),calc(-50% - ${up}px)) scale(1) rotate(${dx*3}deg)`,opacity:1,offset:.45},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + 40px)) scale(.7) rotate(${dx*6}deg)`,opacity:0}],{duration:1000+i*60,delay:i*55,easing:"cubic-bezier(.2,.7,.4,1)",fill:"backwards"}).finished.then(()=>c.remove()); }
}
/* pull down at the top to refresh the rates */
(()=>{
  let y0=null, pull=0; const P=$("ptr");
  window.addEventListener("touchstart",e=>{ y0= window.scrollY<=0 && !document.querySelector(".sheet-bg:not([hidden])") ? e.touches[0].clientY : null; pull=0; },{passive:true});
  window.addEventListener("touchmove",e=>{ if(y0==null) return; pull=Math.max(0,e.touches[0].clientY-y0); if(pull<=0) return;
    const d=Math.min(110,pull*.5); P.style.transform="translate(-50%,"+(d-50)+"px) rotate("+(Math.sin(d/9)*12)+"deg) scale("+(0.7+d/220)+")"; P.style.opacity=String(Math.min(1,d/60)); P.classList.toggle("ready",d>=70); },{passive:true});
  window.addEventListener("touchend",async()=>{ if(y0==null) return; const go=P.classList.contains("ready"); y0=null;
    if(go){ P.classList.add("spin"); buzz(12); coins(P); sound("coins"); await refreshRates(); checkUpdate&&checkUpdate(); setTimeout(()=>{ P.classList.remove("spin","ready"); P.style.transform=""; P.style.opacity="0"; toast("✈️ רוענן: שער עדכני "+new Date().toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"})); },600); }
    else { P.classList.remove("ready"); P.style.transform=""; P.style.opacity="0"; } },{passive:true});
})();


/* ================= "the trip in review": story slides ================= */
let RC=null;
function recapData(loc,range){
  /* the trip itself: what was paid before it (flights, insurance) is left out, a booking for a town of the trip is in */
  const PCr=placeCtx(), stR=tripStart(), tdR=todayStr();
  const inLoc0=it=> loc ? PCr.effLoc(it)===loc : PCr.effLoc(it)!=="prep";
  const inLoc=it=> inLoc0(it)&&(!range||(it.date>=range.from&&it.date<=range.to));
  const items=spreadAll(S.items.filter(it=>it.kind!=="transfer")).filter(inLoc);
  const V=it=>spend(it,"ILS");
  const total=items.reduce((s,it)=>s+V(it),0);
  const dates=[...new Set(items.map(it=>it.date).filter(Boolean))].sort();
  /* days = trip days: from the start of the trip (or the first day in this country) to today, never the booking days before it */
  let d0=dates[0]; if(d0&&stR&&d0<stR) d0=stR; const dEnd= !loc||loc===S.localCur ? tdR : dates[dates.length-1];
  const days= d0&&dEnd>=d0 ? daysBetween(d0,dEnd)+1 : 0;
  const countries=[...new Set(PCr.major.filter(c=>CTRY[c]).concat(!S.home&&CTRY[S.localCur]?[S.localCur]:[]))].filter(c=>!loc||c===loc);
  const cats={}; for(const it of items){ const k=catKey(it); cats[k]=(cats[k]||0)+V(it); }
  const topCat=Object.entries(cats).sort((x,y)=>y[1]-x[1])[0];
  const byDay={}; for(const it of items){ (byDay[it.date]=byDay[it.date]||[]).push(it); }
  const bigDay=Object.entries(byDay).map(([d,l])=>[d,l.reduce((s,it)=>s+V(it),0),l]).sort((x,y)=>y[1]-x[1])[0];
  const bigOne=[...items].sort((x,y)=>V(y)-V(x))[0];
  const paid={}; for(const it of items){ if(it.payer===EACH){ const sh=sharesOf(it); for(const k in sh) paid[k]=(paid[k]||0)+V(it)*sh[k]; } else paid[it.payer]=(paid[it.payer]||0)+V(it); }
  const share=me? myShareItems().filter(inLoc).reduce((s,it)=>s+spend(it,"ILS"),0) : 0;
  const alone=me&&acct&&acctFor===me ? PT().filter(inLoc).reduce((s,it)=>s+V(it),0) : null;
  const transfers=S.items.filter(it=>it.kind==="transfer"&&inLoc(it)).length;
  return {loc,week:range||null,items,total,dates,days:range?7:days,countries,topCat,cats,bigDay,bigOne,paid,share,alone,transfers,avg: (range?7:days)? total/(range?7:days) : 0};
}
/* ================= the trip book: one page to keep (print / save as PDF) ================= */
function tripBook(){
  const st=tripStart(), td=todayStr(); const PC=placeCtx(), V=it=>spend(it,"ILS");
  const orig=S.items.filter(it=>it.kind!=="transfer"&&PC.effLoc(it)!=="prep"), parts=spreadAll(orig);
  const sd=x=>{ const [y,m,d]=x.split("-"); return +d+"."+(+m)+"."+y.slice(2); }, esc=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const total=parts.reduce((a,it)=>a+V(it),0), days= st&&st<=td ? daysBetween(st,td)+1 : 0, prep=S.items.filter(it=>it.kind!=="transfer"&&PC.effLoc(it)==="prep").reduce((a,it)=>a+V(it),0);
  const byC={}; for(const it of parts){ const k=PC.effLoc(it); if(!CTRY[k]) continue; const o=byC[k]||(byC[k]={v:0,min:null,max:null}); o.v+=V(it); if(!o.min||it.date<o.min) o.min=it.date; if(!o.max||it.date>o.max) o.max=it.date; }
  const cats={}; for(const it of parts) cats[catKey(it)]=(cats[catKey(it)]||0)+V(it);
  const c=compute(), people=active();
  const stops=tripStops(), legs=(()=>{ try{ return journeyLegs("shared"); }catch(e){ return []; } })();
  let globe=""; try{ const g=GLOBE; if(g&&g.cv){ drawGlobe(g); globe=g.cv.toDataURL("image/png"); } }catch(e){}
  const rec=tripRecords()||[];
  const o=document.createElement("div"); o.id="book"; o.setAttribute("dir","rtl");
  o.innerHTML='<div class="bk-bar"><button type="button" class="btn small" id="bkClose">סגירה</button><button type="button" class="btn primary small" id="bkPrint">🖨️ שמירה כ-PDF</button></div>'+
   '<article class="bk"><header><div class="bk-kick">📕 ספר הטיול</div><h1>'+esc(S.trip||"הטיול שלנו")+'</h1><p>'+(st?sd(st)+" – "+sd(td)+" · ":"")+days+" ימים · "+esc(people.map(p=>p.name).join(", "))+'</p></header>'+
   (globe?'<img class="bk-globe" alt="המסלול על הגלובוס" src="'+globe+'">':'')+
   '<section><h2>במספרים</h2><div class="bk-nums"><div><b>'+fmt(total,"ILS")+'</b><small>הוצאנו בטיול</small></div><div><b>'+fmt(days?total/days:0,"ILS")+'</b><small>ממוצע ליום</small></div><div><b>'+nUniq(parts)+'</b><small>הוצאות</small></div><div><b>'+Object.keys(byC).length+'</b><small>מדינות</small></div></div>'+
     (prep>0.5?'<p class="bk-note">ועוד '+fmt(prep,"ILS")+' לפני הטיול (טיסות, ביטוח, ציוד)</p>':'')+'</section>'+
   (Object.keys(byC).length?'<section><h2>לפי מדינה</h2><table>'+Object.entries(byC).sort((a,b)=>b[1].v-a[1].v).map(([k,o])=>{ const from=st&&o.min<st?st:o.min, end=k===S.localCur&&!S.home?td:o.max, n=daysBetween(from,end)+1; return '<tr><td>'+esc(CTRY[k])+'</td><td>'+n+' ימים</td><td>'+fmt(o.v,"ILS")+'</td><td>'+fmt(o.v/Math.max(1,n),"ILS")+' ליום</td></tr>'; }).join("")+'</table></section>':'')+
   (legs.length?'<section><h2>המסלול</h2><table>'+legs.map(l=>'<tr><td>📍 '+esc(l.name)+'</td><td>'+(l.from?sd(l.from):"")+(l.left?" – "+sd(l.left):l.last?" – היום":"")+'</td><td>'+l.days+' ימים</td><td>'+fmt(conv(l.spent,showCur,"ILS"),"ILS")+'</td></tr>').join("")+'</table></section>':'')+
   (rec.length?'<section><h2>🏆 שיאים</h2><table>'+rec.map(([ic,t,v,sub])=>'<tr><td>'+ic+' '+esc(t)+'</td><td>'+fmt(v,"ILS")+'</td><td>'+esc(sub)+'</td></tr>').join("")+'</table></section>':'')+
   '<section><h2>על מה הלך הכסף</h2><table>'+Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>'<tr><td>'+esc(catName(k))+'</td><td>'+fmt(v,"ILS")+'</td><td>'+Math.round(v/Math.max(1,total)*100)+'%</td></tr>').join("")+'</table></section>'+
   (people.length>1?'<section><h2>מי שילם</h2><table>'+people.map(p=>'<tr><td>'+esc(p.name)+'</td><td>שילם/ה '+fmt(conv(c.paid[p.id]||0,showCur,"ILS"),"ILS")+'</td><td>החלק '+fmt(conv(c.share[p.id]||0,showCur,"ILS"),"ILS")+'</td></tr>').join("")+'</table></section>':'')+
   '<footer>נוצר ב-'+sd(td)+' · יומן הטיול</footer></article>';
  document.body.appendChild(o); document.body.classList.add("book-open");
  o.querySelector("#bkClose").onclick=()=>{ o.remove(); document.body.classList.remove("book-open"); };
  o.querySelector("#bkPrint").onclick=()=>{ buzz(5); window.print(); };
}
/* ================= the trip's records ================= */
function tripRecords(){
  const st=tripStart(), td=todayStr(); if(!st||st>td) return null; const PC=placeCtx(), onTrip=it=>PC.effLoc(it)!=="prep";
  const orig=S.items.filter(it=>it.kind!=="transfer"&&onTrip(it)), parts=spreadAll(orig), sd=x=>{ const [y,m,d]=x.split("-"); return +d+"."+(+m); };
  if(orig.length<3) return null; const V=it=>spend(it,"ILS"), out=[];
  const byDay={}; for(const it of parts){ if(it.date<st||it.date>td) continue; byDay[it.date]=(byDay[it.date]||0)+V(it); }
  const days=Object.entries(byDay); if(days.length){ const hi=days.slice().sort((a,b)=>b[1]-a[1])[0]; out.push(["📈","היום הכי יקר",hi[1],sd(hi[0])]);
    const full=days.filter(([d])=>d<td); if(full.length>=2){ const lo=full.slice().sort((a,b)=>a[1]-b[1])[0]; out.push(["🪶","היום הכי חסכוני",lo[1],sd(lo[0])]); } }
  const meals=orig.filter(it=>catKey(it)==="food"&&+it.amount>0); if(meals.length>=2){ const m=meals.slice().sort((a,b)=>V(a)-V(b))[0]; out.push(["🍜","הארוחה הכי זולה",V(m),(m.desc||"")+" · "+sd(m.date)]); }
  const big=orig.slice().sort((a,b)=>V(b)-V(a))[0]; if(big) out.push(["💸","ההוצאה הכי גדולה",V(big),(big.desc||"")+" · "+sd(big.date)]);
  try{ const towns=journeyTowns(journeyLegs("shared")).filter(t=>t.days>=2); if(towns.length>=2){ const pd=t=>conv(t.spent,showCur,"ILS")/t.days; const s2=towns.slice().sort((a,b)=>pd(a)-pd(b)); out.push(["🏙️","העיר הכי משתלמת",pd(s2[0]),s2[0].name+" · ליום"]); out.push(["🏨","העיר הכי יקרה",pd(s2[s2.length-1]),s2[s2.length-1].name+" · ליום"]); } }catch(e){}
  const cats={}; for(const it of parts) cats[catKey(it)]=(cats[catKey(it)]||0)+V(it); const tc=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0], tot=Object.values(cats).reduce((a,b)=>a+b,0);
  if(tc&&tot>0) out.push([catName(tc[0]).split(" ")[0],"הכי הרבה הלך על",tc[1],catName(tc[0]).split(" ").slice(1).join(" ")+" · "+Math.round(tc[1]/tot*100)+"%"]);
  return out;
}
function renderRecords(){ const card=$("stRecCard"); if(!card) return; if($("bookBtn")) $("bookBtn").onclick=()=>tripBook(); const r=tripRecords(); card.hidden=!r||!r.length; if(card.hidden) return;
  const G=$("stRecs"); G.innerHTML=""; for(const [ic,t,v,sub] of r){ const d=document.createElement("div"); d.className="rec"; d.innerHTML='<span class="ic"></span><small></small><b class="num"></b><span></span>';
    d.children[0].textContent=ic; d.children[1].textContent=t; d.children[2].textContent=fmt(conv(v,"ILS",showCur),showCur); d.children[3].textContent=sub; G.appendChild(d); } }
function recapSlides(d){
  const title= d.week ? "השבוע שלנו" : d.loc ? locName(d.loc) : (S.trip||"הטיול שלנו");
  const sd=s=>{ const [y,m,dd]=s.split("-").map(Number); return dd+"."+m; };
  const range= d.week ? "מ-"+sd(d.week.from)+" עד "+sd(d.week.to) : d.dates.length ? "מ-"+sd(d.dates[0])+" עד "+sd(d.dates[d.dates.length-1]) : "";
  if(d.items.length<3) return [{bg:"g1",big:"⏳",h:"עוד קצת סבלנות",p:"הסיכום נבנה מההוצאות שלכם. אחרי כמה ימי טיול יהיה פה סיפור שלם."}];
  const S2=[];
  S2.push({bg:"g1",kick:d.week?"שבוע שעבר בסיכום":d.loc?"הסיכום של":"הטיול שלנו בסיכום",h:title,p:range,big:"🎬"});
  if(!d.week) S2.push({bg:"g2",kick:"יצאנו לדרך",num:d.days,unit:d.days===1?"יום":"ימים",p:d.countries.length>1?d.countries.length+" מדינות: "+d.countries.map(c=>CTRY[c].split(" ")[0]).join(" "):(d.countries[0]?CTRY[d.countries[0]]:"")});
  S2.push({bg:"g3",kick:"הוצאנו ביחד",money:d.total,p:"בממוצע "+fmt(d.avg,"ILS")+" ליום · "+nUniq(d.items)+" הוצאות"});
  if(d.topCat) S2.push({bg:"g4",kick:"הכי הרבה הלך על",big:catName(d.topCat[0]).split(" ")[0],h:catName(d.topCat[0]).split(" ").slice(1).join(" "),p:Math.round(d.topCat[1]/d.total*100)+"% מכל ההוצאות · "+fmt(d.topCat[1],"ILS")});
  if(d.bigDay) S2.push({bg:"g5",kick:"היום הכי יקר",h:dayLabel(d.bigDay[0]),money:d.bigDay[1],p:d.bigDay[2].slice().sort((x,y)=>conv(+y.amount,y.cur,"ILS")-conv(+x.amount,x.cur,"ILS")).slice(0,3).map(it=>it.desc).join(" · ")});
  if(d.bigOne) S2.push({bg:"g6",kick:"ההוצאה הכי גדולה",big:catEmoji(d.bigOne),h:d.bigOne.desc||"הוצאה",p:fmt(+d.bigOne.amount,d.bigOne.cur)+(d.bigOne.cur!=="ILS"?" ≈ "+fmt(conv(+d.bigOne.amount,d.bigOne.cur,"ILS"),"ILS"):"")});
  const pe=Object.entries(d.paid).sort((x,y)=>y[1]-x[1]);
  if(pe.length>1) S2.push({bg:"g2",kick:"מי פתח יותר את הארנק",bars:pe.map(([id,v])=>[nm(id),Math.round(v/d.total*100)]),p:nm(pe[0][0])+" "+g.paid(pe[0][0])+" "+Math.round(pe[0][1]/d.total*100)+"% מההוצאות"});
  if(me) S2.push({bg:"g3",kick:fem(me)?"ואת?":"ואתה?",money:d.share+(d.alone||0),p:(d.alone!=null?"🙋 לבד "+fmt(d.alone,"ILS")+" · ":"")+"👫 ביחד "+fmt(d.share,"ILS")});
  if(!d.week&&!d.loc){ const rr=tripRecords(); if(rr&&rr.length>=3){ const pick=rr.filter(x=>/זולה|משתלמת|חסכוני/.test(x[1])).slice(0,3); if(pick.length) S2.push({bg:"g5",kick:"🏆 שיאי הטיול",h:pick[0][1]+": "+fmt(pick[0][2],"ILS"),p:pick.map(x=>x[0]+" "+x[1]+" · "+x[3]).join("  ·  ")}); } }
  S2.push({bg:"g4",kick:"בשורה התחתונה",h:nUniq(d.items)+" הוצאות · "+d.transfers+" העברות",p:"🔥 הרצף הכי ארוך שלכם: "+bestStreak(d)+" ימים של רישום"});
  S2.push({bg:"g1",end:true,kick:d.week?"שבוע טוב 💜":"היה שווה כל שקל 💜",h:title,p:"שתפו את הסיכום"});
  return S2;
}
function bestStreak(d){ let best=0,run=0,prev=null; for(const x of d.dates){ run= prev&&daysBetween(prev,x)===1? run+1 : 1; best=Math.max(best,run); prev=x; } return best; }
function openRecap(loc,range){
  const d=recapData(loc||null,range||null); const slides=recapSlides(d); RC={d,slides,i:0,timer:null};
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
$("weekBtn").onclick=()=>weekly(true);
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
function catEmoji(it){ if(it.kind==="transfer") return "💸"; if(it._fee) return it.catLabel==="הפרשי שער"?"💱":it._pfx?"💳":"🏧"; const k=it.cat||"other"; const l=(CATNAME[k]||OLD_CATS[k]||"✨").split(" ")[0]; return l; }
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
  const T=tripById(curTrip); S.trip=T.name||""; S.startDate=T.startDate||""; S.dest=CUR[T.localCur]?T.localCur:"THB";
  /* Israel was until 12.11; the trip (days, daily average) starts on 13.11 */
  if(curTrip==="t1"&&S.startDate==="2026-11-12"){ S.startDate="2026-11-13"; setTimeout(()=>{ if(canWrite) patchTrip("t1",{startDate:"2026-11-13"}).catch(()=>{}); },4000); }
  homeMode();
}
/* until the flight you're at home: shekels, Israel, and expenses count as "before the trip" */
function homeMode(){ const st=tripStart(); S.home=!!(st&&todayStr()<st); S.localCur= S.home ? "ILS" : (S.dest||S.localCur); }
function defLoc(){ return S.home ? "prep" : S.localCur; }
/* the town an expense belongs to: picked by hand, or the place you were on that day (the journey), or where the phone is */
function autoTown(date){ try{ const st=tripStops(); if(st.length){ const own=stayDays(st), k=own.get(date||todayStr()); if(k!=null) return st[k].n; }
  return (date||todayStr())===todayStr() ? hereName() : ""; }catch(e){ return ""; } }
function townOf(it){ return it.town || autoTown(it.date); }
/* where a town is on the globe: a stop of ours, a town we know, or the main city of its country */
function townLL(name,loc){ const s=tripStops().find(x=>x.n===name); if(s) return [s.lat,s.lng]; const t=TOWNS.find(x=>x[0]===name); if(t) return [t[1],t[2]];
  const P=PLACE[loc]||PLACE[S.localCur]; return P?[P[0],P[1]]:null; }
function townBtn(el,town,date){ el.innerHTML=""; const a=document.createElement("span"); a.textContent="🏙️ "+(town||autoTown(date)||"עיר"); el.appendChild(a);
  if(!town){ const s=document.createElement("small"); s.textContent=" · אוטומטי"; el.appendChild(s); } }
function openTownPicker(current,date,cb){
  sheetMode="town"; sheetCb=cb; sheetCur=current||null; $("curSheetTitle").textContent="באיזו עיר? 🏙️"; $("curSearch").value="";
  $("curSearch").placeholder="🔎 חיפוש עיר, או כותבים עיר חדשה"; sheetDate=date; openSheet("curSheet"); renderCurList(); }
let sheetDate=null;
function renderTownList(q,L){
  const raw=$("curSearch").value.trim();
  const item=(label,val,sub)=>{ const b=document.createElement("button"); b.type="button"; b.className="curitem"; b.setAttribute("aria-selected",String(val===sheetCur)); b.style.gridTemplateColumns="1fr auto";
    const n=document.createElement("span"); n.textContent=label; b.appendChild(n); if(sub){ const s=document.createElement("small"); s.className="sub"; s.textContent=sub; b.appendChild(s); }
    b.onclick=()=>{ const cb=sheetCb; closeSheet("curSheet"); sheetCb=null; if(cb) cb(val); }; return b; };
  const group=(label,els)=>{ if(!els.length) return; const h=document.createElement("h3"); h.textContent=label; L.appendChild(h); els.forEach(e=>L.appendChild(e)); };
  const auto=autoTown(sheetDate);
  const ours=[...new Set(tripStops().map(x=>x.n))], rest=TOWNS.map(t=>t[0]).filter(n=>!ours.includes(n)).sort((a,b)=>a.localeCompare(b,"he"));
  const f=n=>!q||norm(n).includes(q);
  if(!q) group("אוטומטי",[item("📍 "+(auto||"לפי היעדים")+" · אוטומטי",null,"לפי היעד שלכם באותו יום")]);
  group("היעדים שלנו",ours.filter(f).map(n=>item(n,n)));
  group(q?"ערים":"עוד ערים",rest.filter(f).map(n=>item(n,n)));
  if(raw&&![...ours,...rest].includes(raw)) group("עיר חדשה",[item("✏️ "+raw.slice(0,40),raw.slice(0,40),"על המיקום של המדינה שנבחרה")]);
}
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
const TRIP_START="2026-11-13";
/* the trip this app was first built for (its own defaults stay as they were) */
function isOurs(){ return S.people.some(p=>p.id==="yair")&&S.people.some(p=>p.id==="gali"); }
function tripStart(){ if(S.startDate) return S.startDate; if(TRIP_START&&curTrip==="t1"&&isOurs()) return TRIP_START; const ds=S.items.filter(it=>it.kind!=="transfer"&&locOf(it)!=="prep"&&it.date).map(it=>it.date).sort(); return ds[0]||null; }
function daysBetween(a,b){ const [y1,m1,d1]=a.split("-").map(Number),[y2,m2,d2]=b.split("-").map(Number); return Math.round((Date.UTC(y2,m2-1,d2)-Date.UTC(y1,m1-1,d1))/864e5); }
function streak(){
  const days=new Set([...S.items.filter(it=>it.kind!=="transfer").map(it=>it.date),...P.map(it=>it.date)]);
  let n=0, d=todayStr(); if(!days.has(d)){ const y=new Date(); y.setDate(y.getDate()-1); d=y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0"); }
  while(days.has(d)){ n++; const [Y,M,D]=d.split("-").map(Number); const t=new Date(Y,M-1,D-1); d=t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0"); }
  return n;
}
const SCENES={home:["ILS"],beach:["PHP","IDR","MYR","MVR","FJD","LKR","BND"],karst:["VND","LAK"],fuji:["JPY"],city:["SGD","HKD","KRW","CNY","TWD","MOP","AED","USD","EUR","GBP","CAD","AUD","NZD","QAR","OMR"],peaks:["NPR","BTN","KGS","UZS","KZT","MNT","GEL","AMD","CHF","ISK","NOK"],taj:["INR","PKR","BDT"]};
function sceneFor(c){ for(const k in SCENES) if(SCENES[k].includes(c)) return k; return "temple"; }
const PLACE={ILS:[32.08,34.78],THB:[13.75,100.5],VND:[21.03,105.85],LAK:[17.97,102.6],KHR:[11.56,104.92],MMK:[16.8,96.15],MYR:[3.14,101.69],SGD:[1.35,103.82],IDR:[-8.65,115.22],PHP:[14.6,120.98],JPY:[35.68,139.69],KRW:[37.57,126.98],CNY:[39.9,116.4],HKD:[22.3,114.17],TWD:[25.03,121.56],INR:[28.61,77.21],NPR:[27.7,85.32],LKR:[6.93,79.86],MVR:[4.18,73.51],BTN:[27.47,89.64],MNT:[47.92,106.92],USD:[40.71,-74.0],EUR:[48.86,2.35],GBP:[51.5,-0.12],AUD:[-33.87,151.21],AED:[25.2,55.27]};
/* the phone's own location, rounded to ~1 km and kept only on this phone (never uploaded); refreshed when the app opens */
let HERE=(()=>{ try{ const v=JSON.parse(load("trip-here")||"null"); return v&&isFinite(v.lat)&&isFinite(v.lng)?v:null; }catch(e){ return null; } })();
function hereNow(){ return HERE&&Date.now()-(HERE.at||0)<3*864e5 ? HERE : null; }
let hereAsked=0;
/* Location is asked for ONCE. After that it is read only if the phone already allows it (no repeated prompts);
   the "📍 איפה אנחנו?" button in the journey asks on purpose. */
async function geoState(){ try{ return (await navigator.permissions.query({name:"geolocation"})).state; }catch(e){ return "unknown"; } }
async function askHere(force){
  if(!navigator.geolocation) return; if(!force&&Date.now()-hereAsked<20*60e3) return;
  /* a place picked by hand wins over the phone's guess for a day */
  if(!force&&HERE&&HERE.manual&&Date.now()-(HERE.at||0)<864e5) return;
  if(!force){ const st=await geoState(); if(st==="denied") return; if(st!=="granted"){ if(load("trip-geo-asked3")) return; store("trip-geo-asked3","1"); } }
  hereAsked=Date.now();
  try{ navigator.geolocation.getCurrentPosition(p=>{
      const lat=Math.round(p.coords.latitude*100)/100, lng=Math.round(p.coords.longitude*100)/100;
      const moved=!HERE||Math.abs(HERE.lat-lat)>0.01||Math.abs(HERE.lng-lng)>0.01;
      const wasManual=HERE&&HERE.manual; HERE={lat,lng,at:Date.now()}; store("trip-here",JSON.stringify(HERE)); if((moved||wasManual)&&loaded){ renderHero(); if(window.FX) FX.autoTheme(); } if(hereOpen()) fillHere(); { const t=nearTown(lat,lng); if(t) recordTown(t,!!(force&&wasManual)); } if(force){ const t=nearTown(lat,lng), last=tripStops().slice(-1)[0]; toast("📍 "+(t?t.name+(last&&last.n===t.name?" · כבר במסע, אין עצירה חדשה":" · נוספה למסע"):"לא מצאתי עיר מוכרת קרובה")); } if(window.__mnTown){ const t=nearTown(lat,lng); if(t) window.__mnTown(t.name); window.__mnTown=null; }
    },e=>{ if(force) toast(e&&e.code===1?"📍 המיקום חסום. מאשרים בהגדרות: פרטיות ← שירותי מיקום ← אתרי ספארי":"📍 לא הצלחתי למצוא מיקום כרגע"); },{enableHighAccuracy:false,maximumAge:force?60e3:30*60e3,timeout:20000}); }catch(e){}
}
setTimeout(askHere,1500);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") askHere(); });
/* ================= the visa: days left in the country =================
   Days allowed are set once per country (the rules for an Israeli passport change, so they are asked, not guessed);
   the day of entry comes from the journey (the first day of the trip in that country), and can be changed.
   Kept with the trip, so both of you see it. */
function visaOf(c){ const T=tripById(curTrip)||{}; return (T.visa||{})[c]||null; }
function visaEntry(c){
  const v=visaOf(c); if(v&&v.entry) return {date:v.entry,auto:false};
  const st=tripStart(); if(!st) return null; const PC=placeCtx(); let first=null;
  /* a stop with no expenses of its own takes the country of the stop before it (or after) */
  const mj=PC.major.slice(); for(let i=0;i<mj.length;i++) if(!mj[i]) mj[i]=mj[i-1]||null; for(let i=mj.length-1;i>=0;i--) if(!mj[i]) mj[i]=mj[i+1]||null;
  for(const [d,k] of PC.own) if(mj[k]===c&&(!first||d<first)) first=d;
  if(!first) for(const it of S.items) if(it.kind!=="transfer"&&it.date>=st&&PC.effLoc(it)===c&&(!first||it.date<first)) first=it.date;
  if(!first&&c===S.localCur&&st<=todayStr()) first=st;
  return first?{date:first,auto:true}:null; }
function visaInfo(c){ const v=visaOf(c), e=visaEntry(c); if(!e) return null; const days=v&&+v.days>0?+v.days:0; if(!days) return {entry:e.date,auto:e.auto,days:0};
  const last=dayAdd(e.date,days-1); return {entry:e.date,auto:e.auto,days,last,left:daysBetween(todayStr(),last)}; }
function visaChip(c){ const i=visaInfo(c), n=(CTRY[c]||"").split(" ").slice(1).join(" "); if(!i) return null;
  if(!i.days) return ["🛂 ויזה ל"+n+"?",false];
  if(i.left<0) return ["⛔ חרגתם מהוויזה ב-"+(-i.left)+" ימים",true];
  if(i.left===0) return ["🛂 היום היום האחרון בוויזה!",true];
  return ["🛂 עוד "+i.left+" "+(i.left===1?"יום":"ימים")+" בוויזה",i.left<=7]; }
function openVisa(c){
  c=c||S.localCur; const n=(CTRY[c]||c).split(" ").slice(1).join(" ")||c; const v=visaOf(c)||{}; let days=+v.days||0; let entry=(visaEntry(c)||{}).date||todayStr(), entrySet=!!v.entry;
  const o=document.createElement("div"); o.className="hist-bg"; o.setAttribute("role","dialog"); o.setAttribute("aria-label","ויזה");
  const box=document.createElement("div"); box.className="hist"; o.appendChild(box); const close=()=>o.remove(); o.addEventListener("click",e=>{ if(e.target===o) close(); });
  const draw=()=>{ box.innerHTML="";
    const h=document.createElement("div"); h.className="hist-h"; const t=document.createElement("b"); t.textContent="🛂 ויזה · "+(CTRY[c]||n); const x=document.createElement("button"); x.type="button"; x.className="btn small"; x.textContent="סגירה"; x.onclick=close; h.append(t,x); box.appendChild(h);
    const q=document.createElement("div"); q.className="hint"; q.textContent="כמה ימים מותר לכם להיות ב"+n+"?"; box.appendChild(q);
    const sg=document.createElement("div"); sg.className="seg"; box.appendChild(sg);
    const opts=[[15,"15"],[30,"30"],[45,"45"],[60,"60"],[90,"90"]]; if(days&&!opts.some(o=>o[0]===days)) opts.push([days,String(days)]); opts.push(["x","אחר…"]);
    seg(sg,opts.map(o=>[String(o[0]),o[1]]),k=>+k===days,k=>{ if(k==="x"){ const a=parseInt(prompt("כמה ימים?",days||"30"),10); if(!(a>0)) return; k=String(Math.min(a,365)); } days=+k; draw(); });
    const lab=document.createElement("label"); lab.className="j-lab"; const sp=document.createElement("span"); sp.textContent="🛬 נכנסתם ב־"+(entrySet?"":" (לפי המסלול)"); const inp=document.createElement("input"); inp.type="date"; inp.value=entry; inp.onchange=()=>{ if(/^\d{4}-\d{2}-\d{2}$/.test(inp.value)){ entry=inp.value; entrySet=true; draw(); } }; lab.append(sp,inp); box.appendChild(lab);
    const info=document.createElement("p"); info.className="here-now";
    if(days){ const last=dayAdd(entry,days-1), left=daysBetween(todayStr(),last), sd=x=>{ const [y,m,d]=x.split("-"); return +d+"."+(+m)+"."+y.slice(2); }; info.textContent="יום אחרון: "+sd(last)+" · "+(left>=0?"עוד "+left+" ימים":"⛔ חרגתם ב-"+(-left)+" ימים")+" · תזכורת שבוע לפני"; }
    else info.textContent="בוחרים מספר ימים, והאפליקציה סופרת לאחור ומזכירה שבוע לפני.";
    box.appendChild(info);
    const tip=document.createElement("small"); tip.className="here-tip"; tip.textContent="הכללים לדרכון ישראלי משתנים. כדאי לוודא באתר הרשמי של המדינה או אצל הקונסוליה, ולעדכן כאן אם הארכתם."; box.appendChild(tip);
    const row=document.createElement("div"); row.className="actions";
    const save=document.createElement("button"); save.type="button"; save.className="btn primary small"; save.textContent="שמירה";
    save.onclick=async()=>{ const T=tripById(curTrip)||{}; const all={...(T.visa||{})}; all[c]= days ? {days,...(entrySet?{entry}:{})} : null; if(!all[c]) delete all[c];
      const ok=await patchTrip(curTrip,{visa:all}); if(ok!==false){ if(T) T.visa=all; close(); renderHero(); toast(days?"🛂 נשמר: "+days+" ימים ב"+n:"🛂 הוויזה הוסרה"); } };
    row.appendChild(save);
    if(v.days){ const del=document.createElement("button"); del.type="button"; del.className="btn small"; del.textContent="הסרה"; del.onclick=()=>{ days=0; save.onclick(); }; row.appendChild(del); }
    box.appendChild(row); };
  draw(); document.body.appendChild(o);
}
/* once a day, from a week before the last day */
/* ================= moving on: settle up before the border =================
   When the country changes (or the visa is about to end): who should pay whom to close the account,
   and how much cash of the old currency is still in the wallet. */
function settleHint(fromCur,toCur){
  if(!me) return null; const c=compute(), d=c.debts.find(x=>x.from===me||x.to===me);
  let cashLeft=0; try{ if(CASH.length) cashLeft=+(cashBalances()[fromCur]||0); }catch(e){}
  const parts=[]; if(d&&d.amt>conv(5,"ILS",showCur)) parts.push(d.to===me ? nm(d.from)+" "+g.owes(d.from)+" לך "+fmt(d.amt,showCur) : g.you(me)+" "+g.owes(me)+" ל"+nm(d.to)+" "+fmt(d.amt,showCur));
  if(cashLeft>0.5) parts.push("נשארו לך "+fmt(cashLeft,fromCur)+" במזומן");
  if(!parts.length) return null;
  const n=(CTRY[toCur]||"").split(" ").slice(1).join(" ");
  return {text:"🧳 "+(n?"לפני שעוברים ל"+n+": ":"לפני שעוברים מדינה: ")+parts.join(" · "),debt:!!d};
}
function settleNudge(fromCur,toCur){ const h=settleHint(fromCur,toCur); if(!h) return;
  setTimeout(()=>toast(h.text,h.debt?"לסגירה":null,h.debt?()=>{ goView&&view!=="shared"&&goView("shared"); setTimeout(()=>{ const b=document.querySelector("#debts .btn.nudge")||document.getElementById("debts"); if(b){ b.scrollIntoView({block:"center",behavior:"smooth"}); if(b.click&&b.classList.contains("btn")) setTimeout(()=>b.click(),450); } },300); }:null,12000),700); }
function visaNudge(){ if(!loaded||S.home) return; const c=S.localCur, i=visaInfo(c); if(!i||!i.days||i.left>7) return; const k="trip-visa-"+c+"-"+todayStr(); if(load(k)) return; store(k,"1");
  const n=(CTRY[c]||"").split(" ").slice(1).join(" "), [y,m,d]=i.last.split("-");
  setTimeout(()=>toast(i.left<0?"⛔ חרגתם מהוויזה ב"+n+" ב-"+(-i.left)+" ימים":"🛂 עוד "+i.left+" ימים לוויזה ב"+n+" · יום אחרון "+(+d)+"."+(+m),"פרטים",()=>openVisa(c),9000),2500);
  /* the last three days: time to close the account and spend the cash */
  if(i.left<=3&&i.left>=0){ const h=settleHint(c,null); if(h) setTimeout(()=>toast(h.text,h.debt?"לסגירה":null,h.debt?()=>{ const b=document.querySelector("#debts .btn.nudge"); if(b){ b.scrollIntoView({block:"center",behavior:"smooth"}); setTimeout(()=>b.click(),450); } }:null,12000),12500); } }
function renderHero(){
  const H=$("hero"); H.hidden= !loaded || view==="stats";
  if(H.hidden) return;
  H.dataset.scene=sceneFor(S.localCur);
  /* where the sky is: where the phone is (sunrise/sunset of the real place). Without location permission,
     the capital (or main hub) of the country whose currency is in use; Israel before the flight */
  { const h=hereNow(), L=h?[h.lat,h.lng]:(PLACE[S.localCur]||PLACE.ILS); H.dataset.lat=L[0]; H.dataset.lng=L[1]; H.dataset.where=h?"here":"capital";
    const b=$("heroHere"), nm=hereName(); b.textContent= nm ? "📍 "+nm+(h&&h.manual?" ✏️":"") : "📍 איפה אנחנו?"; b.classList.toggle("ask",!nm); }
  const k=S.localCur; const name=(CTRY[k]||CUR[k]?.name||k); const flag=name.split(" ")[0]; const country=CTRY[k]?name.slice(flag.length+1):name;
  $("heroFlag").textContent=CTRY[k]?flag:"🌏"; $("heroCountry").textContent=CTRY[k]?country:name;
  const st=tripStart(); const diff= st? daysBetween(st,todayStr()) : 0;
  if(st&&diff<0){ const left=-diff; const to=(CTRY[S.dest]||"").split(" ").slice(1).join(" "); $("heroDay").textContent= left===1?"מחר!":"עוד "+left; $("heroSince").textContent= (left===1?"טסים":"ימים לטיסה")+(to?" ל"+to:"")+" ✈️"; }
  else { $("heroDay").textContent="יום "+(diff+1); $("heroSince").textContent="לטיול"; }
  /* countries you have been in: the country of each stay on the journey (and the one you are in now) */
  const countries=(()=>{ const st=tripStart(); if(!st||st>todayStr()) return 0; const PC=placeCtx(); const set=new Set(PC.major.filter(c=>CTRY[c])); if(!S.home&&CTRY[S.localCur]) set.add(S.localCur); return set.size; })();
  const C=$("heroChips"); C.innerHTML="";
  const chip=(txt,hot)=>{ const s=document.createElement("span"); s.textContent=txt; if(hot) s.className="hot"; C.appendChild(s); };
  const sk=streak(); if(sk>=2) chip("🔥 "+sk+" ימים ברצף",true);
  chip("🌏 "+countries+" "+(countries===1?"מדינה":"מדינות"));
  chip("🧾 "+S.items.filter(it=>it.kind!=="transfer").length+" הוצאות");
  /* the visa: days left in this country (tap to set) */
  if(!S.home&&CTRY[S.localCur]){ const vc=visaChip(S.localCur); if(vc){ const el=document.createElement("button"); el.type="button"; el.className="hero-visa"+(vc[1]?" hot":""); el.textContent=vc[0]; el.onclick=()=>{ buzz(5); openVisa(S.localCur); }; C.appendChild(el); } }
  visaNudge();
}
let insIdx=0, insTimer=null;
function insights(){
  const out=[]; const td=todayStr(); const sh=spreadAll(S.items.filter(it=>it.kind!=="transfer"&&locOf(it)!=="prep"));
  const byDay={}; for(const it of sh){ byDay[it.date]=(byDay[it.date]||0)+spend(it); }
  const days=Object.keys(byDay).filter(d=>d!==td); const avg=days.length? days.reduce((s,d)=>s+byDay[d],0)/days.length : 0;
  const today=byDay[td]||0;
  if(false&&avg>0&&today>0){ const diff=(today-avg)/avg; out.push(diff<=-.1?["👏","היום הוצאתם "+fmt(today,showCur)+", "+Math.round(-diff*100)+"% פחות מהממוצע היומי"]:diff>=.1?["🧭","היום כבר "+fmt(today,showCur)+", "+Math.round(diff*100)+"% מעל הממוצע היומי ("+fmt(avg,showCur)+")"]:["🎯","היום בדיוק בקצב: "+fmt(today,showCur)+", כמו הממוצע היומי"]); }
  else if(false) out.push(["☀️",""]);
  const ym=thisMonth(), cats={}; let tot=0; for(const it of sh){ if(monthOf(it)!==ym) continue; const v=spend(it); cats[catKey(it)]=(cats[catKey(it)]||0)+v; tot+=v; }
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
/* ---- where are we: the phone's location, or a city and country picked by hand ---- */
function hereName(){ const h=hereNow(); if(!h) return ""; if(h.name) return h.name; try{ const t=nearTown(h.lat,h.lng); return t?t.name:""; }catch(e){ return ""; } }
function hereOpen(){ const s=$("hereSheet"); return s&&!s.hidden; }
async function fillHere(){
  const h=hereNow(), st=await geoState(), nm=hereName();
  $("hereNowTxt").textContent= h ? (h.manual?"✏️ נבחר ידנית: ":"📡 לפי הטלפון: ")+(nm||"מקום לא מוכר")+(h.manual&&h.ctry&&CTRY[h.ctry]?" · "+CTRY[h.ctry]:"") : st==="denied" ? "📵 המיקום חסום בטלפון הזה. מאשרים בהגדרות ← פרטיות ← שירותי מיקום ← אתרי ספארי ← \"בעת השימוש ביישום\"" : "עוד אין מיקום בטלפון הזה";
  const sel=$("hereCtry"); if(!sel.options.length){ for(const [k,v] of Object.entries(CTRY).sort((a,b)=>a[1].split(" ").slice(1).join(" ").localeCompare(b[1].split(" ").slice(1).join(" "),"he"))){ const o=document.createElement("option"); o.value=k; o.textContent=v; sel.appendChild(o); }
    const dl=$("hereTowns"); for(const t of TOWNS){ const o=document.createElement("option"); o.value=t[0]; dl.appendChild(o); } }
  sel.value= h&&h.ctry&&CTRY[h.ctry] ? h.ctry : CTRY[S.localCur] ? S.localCur : "THB";
  $("hereCity").value= nm.replace(/^ליד /,"");
}
async function setHereManual(city,ctry){
  city=(city||"").trim().slice(0,40); if(!city){ toast("✏️ כותבים שם של עיר"); $("hereCity").focus(); return; }
  const t=TOWNS.find(x=>x[0]===city), P=PLACE[ctry];
  /* a known town has its own spot; another city is put at its country's main city (enough for sunset) */
  const lat= t ? t[1] : P ? P[0] : HERE ? HERE.lat : 13.75, lng= t ? t[2] : P ? P[1] : HERE ? HERE.lng : 100.5;
  HERE={lat,lng,at:Date.now(),manual:true,name:city,ctry}; store("trip-here",JSON.stringify(HERE));
  closeSheet("hereSheet"); renderHero(); if(window.FX) FX.autoTheme();
  await recordTown({name:city,lat,lng},true);
  if(ctry!==S.localCur&&canWrite&&!S.home&&CUR[ctry]) toast("📍 "+city+" · אם עברתם מדינה, מחליפים מטבע בלחיצה על "+((CTRY[S.localCur]||"").split(" ")[0]||"הדגל"));
  else toast("📍 עכשיו ב"+city);
}
$("heroHere").onclick=()=>{ buzz(5); fillHere(); openSheet("hereSheet"); };
$("hereClose").onclick=()=>closeSheet("hereSheet");
$("hereGps").onclick=()=>{ buzz(6); askHere(true); };
$("hereSave").onclick=()=>setHereManual($("hereCity").value,$("hereCtry").value);
$("hereCity").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); $("hereSave").click(); } });


/* a tap that lands just outside a small pill (in the gap or the padding around it) goes to the nearest one */
function nearTap(box,sel){ box.addEventListener("click",e=>{ if(e.target.closest(sel)) return;
  let best=null,bd=1e9; for(const b of box.querySelectorAll(sel)){ const r=b.getBoundingClientRect(); if(!r.width) continue;
    const dx=Math.max(r.left-e.clientX,0,e.clientX-r.right), dy=Math.max(r.top-e.clientY,0,e.clientY-r.bottom), d=Math.hypot(dx,dy); if(d<bd){ bd=d; best=b; } }
  if(best&&bd<=12) best.click(); }); }
nearTap($("sofar").querySelector(".sf-top"),"#sfSeg button");
nearTap($("showin"),".chip,.curbtn"); nearTap($("sfShow"),".chip,.curbtn");
/* ---- "so far": spent until now, for the trip / this month / today ---- */
let sfScope=(()=>{ try{ return localStorage.getItem("trip-sf")||"trip"; }catch(e){ return "trip"; } })();
function sfDays(scope){
  const td=todayStr(); if(scope==="day") return 1;
  const st=tripStart(); const from= scope==="month" ? (st&&st.slice(0,7)===td.slice(0,7)&&st>td.slice(0,7)+"-01" ? st : td.slice(0,7)+"-01") : st;
  if(!from||from>td) return 0;
  return Math.round((new Date(td+"T12:00")-new Date(from+"T12:00"))/864e5)+1;
}
function renderSofar(){
  const box=$("sofar"); const personal= view==="personal"&&!!me;
  const locked= personal && !(acct&&acctFor===me);
  box.hidden= !loaded || view==="stats" || locked || !S.items.length&&!personal;
  if(box.hidden) return;
  const td=todayStr(), ym=thisMonth();
  /* long stays spread over their nights: the card counts each night on its day, up to today */
  const SI=spreadAll(S.items), SP=personal?spreadAll(PT()):[], SMS=personal||me?spreadAll(myShareItems()):[];
  /* the place you are in now: what it has cost so far, every visit (an expense marked with a town counts there) */
  const stays=tripStops(), ownD=stayDays(stays), townAt=d=>{ const k=ownD.get(d); return k!=null?stays[k].n:""; };
  const onTripNow= tripStart()&&tripStart()<=td, town= onTripNow ? townAt(td) : "", townOfIt=it=>it.town||townAt(it.date||"");
  /* the destination is two places, shown one at a time: the town you are in and the country it is in */
  const ctry= onTripNow&&!S.home&&CTRY[S.localCur] ? S.localCur : "", ctryName= ctry ? CTRY[ctry].split(" ").slice(1).join(" ") : "";
  let place=load("trip-sf-place")||"town"; if(place==="town"&&!town) place="country"; if(place==="country"&&!ctry) place="town";
  const here= place==="town" ? town : ctryName;
  const tabs=[["trip","הטיול"],...(town||ctry?[["town","היעד"]]:[]),["month","החודש"],["day","היום"]];
  /* the saved choice stays; until the places have loaded the card shows the trip */
  const scope= sfScope==="town"&&!here ? "trip" : sfScope;
  seg($("sfSeg"),tabs,v=>v===scope,v=>{ sfScope=v; try{ localStorage.setItem("trip-sf",v); }catch(e){} renderSofar(); });
  const stT=tripStart();
  const PC=placeCtx();
  /* the town is always taken out of its country's expenses, so it can never cost more than the country */
  const kNow=PC.own.get(td), townCtry=(kNow!=null&&PC.major[kNow])||ctry;
  const inCtry=(it,c)=> PC.effLoc(it)===c;
  const onTownDays=it=> it.town ? it.town===town : PC.stays.some((x,i)=>x.n===town&&PC.stayOf(it)===i);
  const inPlace=it=> place==="town" ? onTownDays(it)&&(!townCtry||inCtry(it,townCtry)) : inCtry(it,ctry);
  /* what happened on the town's days but is not counted there (marked another country, or before the trip) */
  const leftOut= scope==="town"&&place==="town" ? [...SI.filter(it=>it.kind!=="transfer"),...(personal?SP:[])].filter(it=>onTownDays(it)&&!inPlace(it)) : [];
  { const ps=$("sfPlace"); ps.hidden= scope!=="town"; if(scope==="town") seg(ps,[...(town?[["town","🏙️ "+town]]:[]),...(ctry?[["country",CTRY[ctry]]]:[])],v=>v===place,v=>{ store("trip-sf-place",v); renderSofar(); }); }
  const inScope=it=> scope==="trip" ? true : scope==="town" ? inPlace(it) : scope==="month" ? monthOf(it)===ym : it.date===td;
  const V=it=>spend(it);
  /* days in the place: the town's own days on the journey; for the country, every day from the first one there until today */
  let townDays=0; if(place==="town") townDays=[...ownD].filter(([,k])=>stays[k].n===town).length;
  else { let f=[...SI,...(personal?SP:[])].filter(it=>it.kind!=="transfer"&&inPlace(it)).map(it=>it.date).filter(Boolean).sort()[0]; if(f&&stT&&f<stT) f=stT; townDays= f&&f<=td ? daysBetween(f,td)+1 : 0; }   /* a booking made before the trip doesn't add days */
  const days= scope==="town" ? townDays : sfDays(scope);
  const R=$("sfRow"); R.innerHTML="";
  /* money cells roll to their new value like the big number (also on a currency switch); counts are plain text */
  const cell=(val,label,sw)=>{ const d=document.createElement("div"); const b=document.createElement("b"); b.className="num"; const key="sfc"+R.children.length;
    if(typeof val==="number") money(b,val,showCur,key); else { b.textContent=val; MONEY.delete(key); } const l=document.createElement("span");
    if(sw){ const i=document.createElement("i"); i.className="sw"; i.style.background=sw; l.appendChild(i); } l.appendChild(document.createTextNode(label)); d.append(b,l); R.appendChild(d); };
  const st=tripStart();
  const daysCell=()=>{ if(st&&st>td){ cell(String(Math.round((new Date(st+"T12:00")-new Date(td+"T12:00"))/864e5)),"ימים לטיסה"); }
    else if(days>0) cell(String(days),scope==="day"?"יום":scope==="town"?"ימים ב"+here:(scope==="month"?"ימים החודש":"ימים בטיול"));
    else if(false){ cell(String(Math.round((new Date(st+"T12:00")-new Date(td+"T12:00"))/864e5)),"ימים לטיסה"); }
    else cell("—","ימים"); };
  /* averages count only what was spent on the trip itself, not flights and insurance bought before it */
  const onTrip=it=> PC.effLoc(it)!=="prep";
  const preTrip= !!st && st>td;
  const dd=(a,b)=>Math.round((new Date(b+"T12:00")-new Date(a+"T12:00"))/864e5)+1;
  const pre=it=>!onTrip(it);
  /* before the flight: average of the preparations, counted from the first one */
  const firstPrep=[...SI.filter(x=>x.kind!=="transfer"),...(personal?SP:[])].filter(pre).map(x=>x.date||td).sort()[0];
  const prepDays= firstPrep&&firstPrep<=td ? dd(firstPrep,td) : 0;
  /* third column, by the tab: trip = per day, month = per month, today = per day with today against it */
  const avgCell=(total,sumFor)=>{
    const pFilter= preTrip ? pre : onTrip, pDays= preTrip ? prepDays : sfDays("trip"), pStart= preTrip ? firstPrep : st;
    if(!pDays){ daysCell(); return; }
    const daily=sumFor(pFilter)/pDays, tail= preTrip ? " בהכנות" : "";
    let val=daily, label="ממוצע ליום"+tail, badge=null;
    if(scope==="month"){
      val=daily*30.44; label=(pDays>=30?"ממוצע לחודש":"קצב לחודש")+tail;
      const ms=td.slice(0,7)+"-01", from= pStart&&pStart>ms ? pStart : ms;
      if(pStart&&pStart<ms&&daily>0){ const rate=sumFor(it=>inScope(it)&&pFilter(it))/dd(from,td); const pct=Math.round((rate-daily)/daily*100);
        badge=[pct>0?"up":"down", pct===0?"החודש בדיוק בקצב":"החודש "+(pct>0?"▲ ":"▼ ")+Math.abs(pct)+"%"]; }
    } else if(scope==="town"){
      /* per day in this place, against the trip's own average, in money */
      const tDaily= days>0 ? total/days : 0; label="ממוצע ליום ב"+here; val=tDaily;
      if(daily>0&&total>0&&pDays>days){ const diff=tDaily-daily; badge= Math.abs(diff)<0.5 ? ["","בדיוק כמו בטיול"] : [diff>0?"up":"down",(diff>0?"▲ ":"▼ ")+fmt(Math.max(1,Math.round(Math.abs(diff))),showCur)+" מהממוצע בטיול"]; }
    } else if(scope==="day"&&pDays>=2&&daily>0){
      /* today: the daily average as it stands with today in it, and how much today moved it */
      label="בקצב הזה, ממוצע ליום"+tail;
      const prev=(sumFor(pFilter)-sumFor(it=>pFilter(it)&&inScope(it)))/(pDays-1), diff=daily-prev;
      badge= total===0 ? ["","היום עוד כלום"] : Math.abs(diff)<0.5 ? ["","היום בדיוק בקצב"] : [diff>0?"up":"down","היום "+(diff>0?"העלה ":"הוריד ")+fmt(Math.max(1,Math.round(Math.abs(diff))),showCur)];
    }
    const d=document.createElement("div"); const bb=document.createElement("b"); bb.className="num"; money(bb,val,showCur,"sfc"+R.children.length);
    const l=document.createElement("span"); l.textContent=label; if(label.length>14) l.className="wrap"; d.append(bb,l);
    if(badge){ const t=document.createElement("em"); t.className="sf-delta "+badge[0]; t.textContent=badge[1]; d.appendChild(t); }
    R.appendChild(d);
  };
  const flightNote= preTrip ? " · ✈️ עוד "+(dd(td,st)-1)+" ימים לטיסה" : "";
  const scopeWord= scope==="trip" ? "בטיול" : scope==="town" ? "ב"+here : scope==="month" ? "ב"+monthName(ym,true).split(" ")[0] : "היום";
  if(!personal){
    const its=SI.filter(it=>it.kind!=="transfer"&&inScope(it));
    const total=its.reduce((a,it)=>a+V(it),0);
    const mine= me ? its.reduce((a,it)=>a+V(it)*(sharesOf(it)[me]||0),0) : 0;
    const paid= me ? its.reduce((a,it)=>a+V(it)*paidShare(it,me),0) : 0;
    $("sfKick").textContent=(scope==="town"?"הוצאנו ":"הוצאנו עד עכשיו ")+scopeWord;
    money($("sfBig"),total,showCur,"sf");
    const all2=SI.filter(it=>it.kind!=="transfer");
    const partsNote=(()=>{ if(scope!=="day") return ""; const ps=its.filter(x=>x._of&&x._parts); if(!ps.length) return ""; return " · "+ps.slice(0,2).map(x=>"🗓️ כולל "+fmt(V(x),showCur)+" מ\""+(x.desc||"הוצאה")+"\" (יום "+x._part+" מתוך "+x._parts+")").join(" · "); })();
    $("sfSub").textContent=( its.length ? nUniq(its)+" הוצאות"+(scope!=="day"&&days>0?" · "+(days===1?"יום אחד":days+" ימים"):"") : (scope==="day"?"עוד לא נרשמו הוצאות היום":"עוד לא נרשמו הוצאות") )+partsNote+flightNote;
    $("sfBar").hidden=true;
    { const ah= scope==="trip"||scope==="month" ? spreadAhead(S.items.filter(it=>it.kind!=="transfer")) : 0; if(ah>0.5) $("sfSub").textContent+=" · 🗓️ עוד "+fmt(ah,showCur)+" שולם מראש לימים הבאים"; }
    if(me){ cell(mine,"החלק שלך"); cell(paid,"שילמת"); avgCell(total,f=>all2.filter(f).reduce((a,it)=>a+V(it),0)); }
    else { cell(String(its.length),"הוצאות"); daysCell(); avgCell(total,f=>all2.filter(f).reduce((a,it)=>a+V(it),0)); }
    R.hidden=false;
  } else {
    const own=SP.filter(it=>inScope(it)).reduce((a,it)=>a+V(it),0);
    const tog=SMS.filter(it=>inScope(it)).reduce((a,it)=>a+V(it),0);
    const all=own+tog;
    $("sfKick").textContent=(scope==="town"?"הוצאת ":"הוצאת עד עכשיו ")+scopeWord;
    money($("sfBig"),all,showCur,"sf");
    const partsNoteP=(()=>{ if(scope!=="day") return ""; const ps=[...SP,...SMS].filter(x=>x._of&&x._parts&&inScope(x)); if(!ps.length) return ""; const by=new Map(); for(const x of ps){ const o=by.get(x._of)||{x,v:0}; o.v+=V(x); by.set(x._of,o); } return " · "+[...by.values()].slice(0,2).map(o=>"🗓️ כולל "+fmt(o.v,showCur)+" מ\""+(o.x.desc||"הוצאה")+"\" (יום "+o.x._part+" מתוך "+o.x._parts+")").join(" · "); })();
    $("sfSub").textContent=( all>0 ? "לבד + החלק שלך במשותף"+(scope!=="day"&&days>0?" · "+(days===1?"יום אחד":days+" ימים"):"") : (scope==="day"?"עוד אין הוצאות היום":"עוד אין הוצאות") )+partsNoteP+flightNote;
    const bar=$("sfBar"); bar.hidden=!(all>0);
    if(all>0){ $("sfBarA").style.width=(own/all*100)+"%"; $("sfBarB").style.width=(tog/all*100)+"%"; }
    cell(own,"לבד","#14B8A6"); cell(tog,"ביחד","linear-gradient(135deg,#6C4BFF,#FF4D8D)");
    avgCell(all,f=>SP.filter(f).reduce((a,it)=>a+V(it),0)+SMS.filter(f).reduce((a,it)=>a+V(it),0));
  }
  /* a tap on the note lists what was left out and why, so a gap is never a mystery */
  { const sub=$("sfSub"); let n=sub.parentNode.querySelector(".sf-left"); if(!leftOut.length){ if(n) n.remove(); }
    else { if(!n){ n=document.createElement("button"); n.type="button"; n.className="sf-left"; sub.after(n); }
      n.textContent="ⓘ "+(nUniq(leftOut)===1?"הוצאה אחת":nUniq(leftOut)+" הוצאות")+" מהימים האלה לא נספרות כאן";
      n.onclick=()=>{ buzz(5); toast(leftOut.slice(0,6).map(it=>(it.desc||"הוצאה")+" "+fmt(V(it),showCur)+" · מסומנת "+locName(PC.effLoc(it))).join(" • ")+(leftOut.length>6?" • …":"")+" — אפשר לשנות מדינה בעריכת ההוצאה",null,null,9000); }; } }
  { const bb=$("sfBud"), r= personal ? budgetCalc() : null; bb.hidden=!r;
    if(r){ bb.querySelector(".t").textContent= r.left<0 ? "עברת את התקציב ב-"+fmt(-r.left,r.cur) : "נשארו "+fmt(r.left,r.cur)+" מהתקציב";
      { const W=worthCalc(r); bb.querySelector(".w").textContent= W.cash.length ? "· עם המזומן "+fmt(W.total,W.cur) : ""; }
      { const rw=runwayCalc(r), el=bb.querySelector(".rw"); el.hidden=!(rw&&rw.days!=null); if(rw&&rw.days!=null) el.textContent="⏳ בקצב הזה הכסף מספיק לעוד כ-"+rw.days.toLocaleString("en-US")+" ימים"+runwayLong(rw.days)+" · עד "+rw.until; }
      bb.querySelector("i").style.width=Math.round((1-r.pct)*100)+"%"; bb.classList.toggle("warn",r.left>=0&&r.left<r.amount*0.15); bb.classList.toggle("over",r.left<0); } }
  /* the personal screen has no other card with the currency switch now */
  const sh=$("sfShow"); sh.hidden=!personal; if(personal) showinRow(sh);
}
/* ================= where is my money =================
   Bank (what is left of the budget), the cash in each currency, what was paid ahead and not used yet
   (the rest of a hotel), and the account with the others: what you really have, right now. */
function renderMoney(){
  const card=$("moneyCard"); if(!card) return; const on= view==="personal"&&me&&acct&&acctFor===me; card.hidden=!on; if(!on) return;
  const C=showCur, R=$("moneyRows"); R.innerHTML=""; let total=0;
  const row=(ic,t,v,sub,neutral)=>{ const d=document.createElement("div"); d.className="money-row"; const a=document.createElement("span"); a.textContent=ic+" "+t; const b=document.createElement("b"); b.className="num"+(v<0?" minus":""); b.textContent=(v<0?"−":"")+fmt(Math.abs(v),C); d.append(a,b); if(sub){ const s=document.createElement("small"); s.textContent=sub; d.appendChild(s); } R.appendChild(d); if(!neutral) total+=v; };
  const r=budgetCalc();
  if(r) row("🏦","בבנק (מה שנשאר מהתקציב)",conv(r.left,r.cur,C));
  else row("🏦","בבנק",0,"עוד לא הוגדר תקציב · מגדירים בכרטיס התקציב, ואז רואים כאן כמה נשאר",true);
  let bal={}; try{ bal=CASH.length?cashBalances():{}; }catch(e){}
  const cash=Object.entries(bal).filter(([,v])=>v>0.004).sort((a,b)=>conv(b[1],b[0],C)-conv(a[1],a[0],C));
  for(const [c,v] of cash) row("💵","מזומן · "+(CUR[c]?.name||c),conv(v,c,C),c!==C?fmt(v,c):"");
  /* cash paid in a currency the wallet never had: not money you hold, just a hint to record where it came from */
  const missing=Object.entries(bal).filter(([,v])=>v<-0.004);
  if(missing.length) row("💵","שולם במזומן בלי רישום בארנק",0,missing.map(([c,v])=>fmt(-v,c)).join(" · ")+" · מוסיפים בארנק \"מזומן מהבית\" כדי שיסתדר",true);
  if(!cash.length) row("💵","מזומן בארנק",0,"אין מזומן רשום · מוסיפים משיכה או מזומן מהבית בארנק",true);
  /* paid ahead, not used yet: my part of what is spread over days still to come */
  const mine=[...P.filter(x=>!x._pfx&&!x.offTrip),...myShareItems()], ahead=spreadAhead(mine);
  if(ahead>0.5){ const names=[...new Set(mine.filter(x=>spreadN(x)>1&&dayAdd(x.spread.from||x.date,spreadN(x)-1)>todayStr()).map(x=>x.desc||"הוצאה"))].slice(0,3).join(", ");
    row("🗓️","שולם מראש ועוד לא נוצל",ahead,names?names+" · הימים שעוד לא עברו":""); }
  /* the account with the others */
  if(me&&active().length>1){ const c=compute(); const my=(c.bal||{})[me]||0; const d=c.debts.filter(x=>x.from===me||x.to===me);
    const sub=d.map(x=>x.to===me?nm(x.from)+" "+g.owes(x.from)+" לך "+fmt(x.amt,C):g.you(me)+" "+g.owes(me)+" ל"+nm(x.to)+" "+fmt(x.amt,C)).join(" · ");
    if(Math.abs(my)>0.004) row("🤝",my>0?"מגיע לך מהשותפים":"מגיע ממך לשותפים",my,sub); else row("🤝","החשבון עם השותפים",0,"מאוזן, אף אחד לא חייב",true); }
  $("moneyTotal").textContent=fmt(total,C);
  $("moneyNote").textContent= r ? "התקציב לפי מה שהזנת ועדכוני הבנק · המזומן לפי הארנק · הכול ב"+(CUR[C]?.name||C)+" בשער של היום" : "";
}
function renderAll(){
  syncCardFees(); applyG(); if(loaded&&!window.__mornT){ window.__mornT=setTimeout(()=>{ window.__mornT=0; morning(); checkMedals(); setTimeout(()=>weekly(false),document.querySelector(".morning")?3600:200); },900); } renderHero(); renderInsight(); renderSofar();
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
    if(r==="slow"){ $("status").textContent="⏳ נשמר בטלפון, יעלה כשתחזור קליטה"; toast("⏳ נשמר בטלפון, יעלה כשתחזור קליטה"); job.then(done).catch(e=>{ console.error(e); $("status").textContent="השמירה נכשלה. נסו שוב."; }); return true; }
    done(); return true; }
  catch(e){ if(e&&e.code==="needs-network"){ $("status").textContent="📶 בשביל זה צריך קליטה. נסו שוב כשתחזור."; toast("📶 בשביל זה צריך קליטה. ההוצאות עצמן נשמרות גם בלי."); return false; }
    console.error(e); $("status").textContent= e&&e.code==="permission-denied" ? "אין הרשאה לשמור." : "השמירה נכשלה. בדקו את החיבור ונסו שוב."; return false; }
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
  const fromCur=S.localCur; settleNudge(fromCur,c);
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
  me=id; if(id) setTimeout(sinceLastVisit,300);
  if(id&&QUICK&&!window.__qOpened&&canWrite){ window.__qOpened=true; view= QUICK==="me" ? "personal" : "shared"; setTimeout(()=>{ if(view!=="personal"||(acct&&acctFor===me)) openAdd(); },400); } acct=null; acctFor=null; store("trip-me",id||""); if(id){ form.payer=id; if(updateUrl) syncUrl(); refreshPersonal(); }
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
/* field: the input that is missing. It gets a red ring, the cursor, and scrolls into view; typing clears both. */
function showErr(id,msg,field){ const e=$(id); e.textContent=msg||""; e.hidden=!msg; document.querySelectorAll(".bad-f").forEach(x=>x.classList.remove("bad-f"));
  if(!msg) return; flash(e.closest(".card,.sheet,.stack")||e,"shake",450); buzz([10,40,10]);
  if(field){ const box=field.closest(".amount")||field; box.classList.add("bad-f");
    try{ box.scrollIntoView({block:"center",behavior:calm()?"auto":"smooth"}); field.focus({preventScroll:true}); }catch(_){}
    const clear=()=>{ box.classList.remove("bad-f"); if(e.textContent===msg){ e.hidden=true; e.textContent=""; } };
    field.addEventListener("input",clear,{once:true}); field.addEventListener("click",clear,{once:true}); } }
function dayWord(v){ const t=todayStr(); if(!v||v===t) return "היום"; const y=new Date(Date.now()-864e5), ys=y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0"); if(v===ys) return "אתמול"; const a=v.split("-").map(Number); return a[2]+"."+a[1]; }
/* the folded "date · place" line of both forms; it turns amber when the date is not today */
function moreSum(){ for(const [k,f] of [["f",form],["p",pform]]){ const el=$(k+"MoreSum"); if(!el) continue; const v=$(k+"Date").value; const tw=f.town||autoTown(v||todayStr()); if($(k+"Town")) townBtn($(k+"Town"),f.town,v||todayStr()); el.textContent="📅 "+dayWord(v)+" · "+locName(f.loc||defLoc())+(tw?" · "+tw:"")+(f.spread&&f.spread.n>1?" · 🗓️ "+f.spread.n+" ימים":""); $(k+"More").classList.toggle("off",!!v&&v!==todayStr()); } }
/* texts that speak to one person, in his or her gender */
function applyG(){ if(!me) return; const f=fem(me); document.querySelectorAll("[data-gm]").forEach(e=>{ const t=f?e.dataset.gf:e.dataset.gm; if(e.textContent!==t) e.textContent=t; }); }
function done(btn){ if(!btn) return; buzz(10); if(calm()) return; btn.classList.add("ok"); setTimeout(()=>btn.classList.remove("ok"),900); }
$("fCur").onclick=()=>openCurPicker("באיזה מטבע שילמתם?",cur.fCur,c=>{ cur.fCur=c; renderForm(); });
$("cFrom").onclick=()=>openCurPicker("יש לי…",cur.cFrom,c=>{ cur.cFrom=c; renderConv(); });
$("cTo").onclick=()=>openCurPicker("מקבלים…",cur.cTo,c=>{ cur.cTo=c; window.__cPicked=true; renderConv(); });
function startEdit(it){
  if(!$("addSheet").hidden) closeSheet("addSheet");
  editingId=it.id; editOrig=JSON.parse(JSON.stringify(it)); form.payer=it.payer; form.cat=it.cat||"other"; form.catSet=true; form.loc=locOf(it); form.town=it.town||null; form.spread=it.spread&&it.spread.n>1?{...it.spread}:null; form.pm=it.pm||"cash";
  form.among=it.pcts?Object.keys(it.pcts):((it.among&&it.among.length)?[...it.among]:S.people.map(p=>p.id));
  form.mode=it.pcts?"pct":"equal"; form.pcts=it.pcts?{...it.pcts}:{};
  $("fDesc").value=it.desc||""; $("fCatLabel").value=it.catLabel||""; $("fAmt").value=group(String(it.amount)); $("fDate").value=it.date||todayStr(); cur.fCur=it.cur;
  renderForm();
  $("formTitle").textContent="✏️ עריכת הוצאה"; $("saveBtn").textContent="שמירת שינויים"; $("cancelEdit").hidden=false; saveLabel();
  if(!$("addSlot").contains($("form"))) openAdd(); else $("form").scrollIntoView({behavior:"smooth",block:"start"});
}
function resetForm(){ setTimeout(()=>fDateChips(),0);
  editingId=null; form.cat=null; form.catSet=false; $("fDesc").value=""; $("fCatLabel").value=""; $("fAmt").value=""; form.mode="equal"; form.pcts={}; form.among=null; if(me) form.payer=me; cur.fCur=S.localCur; form.loc=null; form.town=null; form.spread=null;
  $("formTitle").textContent="➕ הוצאה משותפת"; $("saveBtn").textContent="הוספה"; $("cancelEdit").hidden=true; renderForm(); saveLabel();
}
async function save(){
  showErr("fErr");
  const amount=parseFloat(String($("fAmt").value).replace(/,/g,""));
  if(!(amount>0)) return showErr("fErr","צריך להזין סכום גדול מאפס",$("fAmt"));
  if(!$("fDesc").value.trim()) return showErr("fErr","צריך לתת שם להוצאה, למשל: ארוחת ערב",$("fDesc"));
  if(!form.among.length) return showErr("fErr","צריך לבחור לפחות אדם אחד שמתחלק בהוצאה",$("fAmong"));
  let pcts=null;
  if(form.mode==="pct"){ pcts={}; let sum=0; for(const id of form.among){ const v=+form.pcts[id]; if(!(v>=0)) return showErr("fErr","אחוז לא תקין אצל "+nm(id)); pcts[id]=v; sum+=v; } if(Math.abs(sum-100)>0.5) return showErr("fErr","האחוזים צריכים להסתכם ל-100 (כרגע "+sum+")"); }
  const data={rIls:(editingId&&editOrig&&editOrig.cur===cur.fCur&&editOrig.rIls>0)?editOrig.rIls:rateNow(cur.fCur),kind:"expense",desc:$("fDesc").value.trim(),amount,cur:cur.fCur,payer:form.payer,among:pcts?null:[...form.among],pcts,cat:form.cat||"other",catLabel:form.cat==="other"?$("fCatLabel").value.trim():"",loc:form.loc||defLoc(),pm:form.pm||"cash",date:$("fDate").value||todayStr(),...((form.town||editingId)?{town:form.town||null}:{}),...((form.spread||editingId)?{spread:form.spread||null}:{})};
  const id=editingId||uid("e");
  let patch=data;
  /* an empty text and a missing one are the same: no change */
  if(editingId&&editOrig){ patch={}; const z=v=>v===""||v===undefined?null:v; for(const k of Object.keys(data)){ if(JSON.stringify(z(data[k]))!==JSON.stringify(z(editOrig[k]))) patch[k]=data[k]; } }
  if(editingId&&!Object.keys(patch).length){ const keep=$("fDate").value; resetForm(); $("fDate").value=keep; closeSheet("addSheet"); toast("לא שונה כלום"); return; }
  /* every edit keeps what it replaced (the last 10), so a wrong edit can be put back */
  let undoOld=null;
  if(editingId&&editOrig){ undoOld={}; for(const k of Object.keys(patch)) undoOld[k]=editOrig[k]??null; patch.hist=histPush(editOrig.hist,undoOld); }
  const job=run(()=> editingId ? EXP().doc(id).update(patch) : EXP().doc(id).set({...data,createdAt:Date.now(),tz:hereTz(),by:me||null,trip:curTrip}));
  /* optimistic: the sheet goes away at once; if saving fails it comes back with everything still filled in */
  const fromBtn=$("saveBtn").getBoundingClientRect().width?$("saveBtn"):null, label=catEmoji(data)+" "+fmt(amount,data.cur);
  if(!$("addSheet").hidden){ buzz(10); flyToTotal(fromBtn,label); closeSheet("addSheet"); }
  const ok=await job;
  if(!ok&&canWrite){ setTimeout(()=>{ openAdd(); showErr("fErr","לא נשמר. בדקו את החיבור ונסו שוב."); },400); return; }
  if(ok&&!editingId) notifyOthers("🧾 "+nm(me||active()[0]?.id)+" "+(fem(me||active()[0]?.id)?"הוסיפה":"הוסיף")+": "+data.desc+" "+fmt(amount,data.cur));
  if(ok&&!editingId) toast((/^⏳/.test($("status").textContent)?"⏳ נשמר בטלפון, יעלה כשתחזור קליטה · ":"✓ נוסף: ")+label,"ביטול",()=>run(()=>EXP().doc(id).update({deleted:true,deletedAt:Date.now(),deletedBy:me||null})),6000);
  if(ok&&undoOld) toast("✏️ השינויים נשמרו","ביטול",()=>restoreVersion(id,false,undoOld),10000);
  if(ok){ done($("saveBtn")); setTimeout(checkStreak,400); }
  if(ok){ const keep=$("fDate").value; resetForm(); $("fDate").value=keep; if(!$("addSheet").hidden) closeSheet("addSheet"); }
}
async function addTransfer(from,to,amt,pm,tc){
  const showCur_=showCur; const showCur2=tc||showCur_;
  const id=uid("t");
  const ok=await run(()=>EXP().doc(id).set({kind:"transfer",amount:amt,cur:showCur2,rIls:rateNow(showCur2),payer:from,to,pm:pm==="cash"?"cash":"bank",date:todayStr(),createdAt:Date.now(),tz:hereTz(),loc:defLoc(),by:me||null,trip:curTrip}));
  if(ok){ setTimeout(()=>{ const c=compute(); if(!c.debts.length){ kissFx(from,to); setTimeout(confetti,900); } flash($("ticket"),"glow",900); },60); buzz([12,60,12]); }
  if(ok) notifyOthers("💸 "+nm(from)+" "+g.transferred(from)+" ל"+nm(to)+" "+fmt(amt,showCur2));
  if(ok) toast("💸 נרשם: "+nm(from)+" "+g.transferred(from)+" ל"+nm(to)+" "+fmt(amt,showCur2)+(pm==="cash"?" במזומן · עודכן בארנק":" בהעברה · עודכן בתקציב"),"ביטול",()=>run(()=>EXP().doc(id).delete()).then(k=>{ if(k) toast("ההעברה בוטלה"); }));
}
let toastTimer=null;
function toast(msg,actLabel,act,ms){
  if(actLabel==="ביטול"&&act) lastUndo={msg,act,until:Date.now()+(ms||10000)+20000};
  const T=$("toast"); T.innerHTML=""; const s=document.createElement("span"); s.textContent=msg; T.appendChild(s);
  const life=ms||(actLabel?10000:3000);
  const hide=()=>{ if(calm()){ T.hidden=true; return; } T.classList.add("out"); setTimeout(()=>{ T.hidden=true; T.classList.remove("out"); },200); };
  if(actLabel){ const b=document.createElement("button"); b.type="button"; b.textContent=actLabel; b.onclick=()=>{ clearTimeout(toastTimer); hide(); buzz(8); act(); }; T.appendChild(b);
    const bar=document.createElement("i"); bar.className="tbar"; bar.style.animationDuration=life+"ms"; T.appendChild(bar); }
  T.classList.remove("out"); T.hidden=false; flash(T,"tin",320); clearTimeout(toastTimer); toastTimer=setTimeout(hide,life);
}

/* ---- personal form ---- */
$("pCur").onclick=()=>openCurPicker("באיזה מטבע שילמת?",cur.pCur,c=>{ cur.pCur=c; renderPersonal(); });
function pStartEdit(it){
  if(!$("addSheet").hidden) closeSheet("addSheet");
  pEditingId=it.id; pform.cat=it.cat||"other"; pform.catSet=true; pform.loc=locOf(it); pform.town=it.town||null; pform.offTrip=!!it.offTrip; pform.recur=it.recur||null; pform.spread=it.spread&&it.spread.n>1?{...it.spread}:null; pform.pm=it.pm||"cash"; cur.pCur=it.cur;
  $("pDesc").value=it.desc||""; $("pCatLabel").value=it.catLabel||""; $("pAmt").value=group(String(it.amount)); $("pDate").value=it.date||todayStr();
  $("pFormTitle").textContent="✏️ עריכת הוצאה אישית"; $("pSave").textContent="שמירת שינויים"; $("pCancel").hidden=false; saveLabel(); renderPersonal();
  if(!$("addSlot").contains($("pForm"))) openAdd(); else $("pForm").scrollIntoView({behavior:"smooth",block:"start"});
}
function pReset(){
  pEditingId=null; pform.cat=null; pform.catSet=false; $("pDesc").value=""; $("pCatLabel").value=""; $("pAmt").value=""; cur.pCur=S.localCur; pform.loc=null; pform.town=null; pform.offTrip=false; pform.recur=null; pform.spread=null;
  $("pFormTitle").textContent="➕ הוצאה אישית"; $("pSave").textContent="הוספה"; $("pCancel").hidden=true; renderPersonal(); saveLabel();
}
async function pSave(){
  showErr("pErr");
  const amount=parseFloat(String($("pAmt").value).replace(/,/g,""));
  if(!(amount>0)) return showErr("pErr","צריך להזין סכום גדול מאפס",$("pAmt"));
  if(!$("pDesc").value.trim()) return showErr("pErr","צריך לתת שם להוצאה, למשל: קפה",$("pDesc"));
  const c=await loadAcct(); if(!c) return showErr("pErr","צריך להיכנס לחשבון האישי קודם.");
  const data={desc:$("pDesc").value.trim(),amount,cur:cur.pCur,cat:pform.cat||"other",catLabel:pform.cat==="other"?$("pCatLabel").value.trim():"",loc:pform.loc||defLoc(),pm:pform.pm||"cash",date:$("pDate").value||todayStr(),trip:curTrip,...(pform.offTrip?{offTrip:true}:{}),...(pform.offTrip&&pform.recur==="month"?{recur:"month"}:{}),...(pform.town?{town:pform.town}:{}),...(pform.spread?{spread:pform.spread}:{})};
  const id=pEditingId||uid("m"); const old=P.find(x=>x.id===id);
  /* the rate of the day is kept with it, like the shared ones, so its value in shekels stays what it cost */
  data.rIls=(old&&old.cur===data.cur&&old.rIls>0)?old.rIls:rateNow(data.cur);
  let undoOldP=null;
  if(old){ const ch={}; for(const k of Object.keys(data)) if(JSON.stringify(data[k]??null)!==JSON.stringify(old[k]??null)) ch[k]=old[k]??null; if(Object.keys(ch).length){ undoOldP=ch; data.hist=histPush(old.hist,ch); } else if(old.hist) data.hist=old.hist; }
  const doc=await encFor(c,{...data,createdAt:old?.createdAt||Date.now(),tz:old?.tz||hereTz()});
  const job=run(()=>EXP().doc(id).set(doc));
  if(!$("addSheet").hidden){ buzz(10); flyToTotal($("pSave"),catEmoji(data)+" "+fmt(amount,data.cur)); closeSheet("addSheet"); }
  const ok=await job;
  if(!ok&&canWrite){ setTimeout(()=>{ openAdd(); showErr("pErr","לא נשמר. בדקו את החיבור ונסו שוב."); },400); return; }
  if(ok&&!old) toast((/^⏳/.test($("status").textContent)?"⏳ נשמר בטלפון, יעלה כשתחזור קליטה · ":"✓ נוסף: ")+catEmoji(data)+" "+fmt(amount,data.cur),"ביטול",()=>run(()=>EXP().doc(id).update({deleted:true,deletedAt:Date.now(),deletedBy:me||null})),6000);
  if(ok&&undoOldP) toast("✏️ השינויים נשמרו","ביטול",()=>restoreVersion(id,true,undoOldP),10000);
  if(ok){ done($("pSave")); setTimeout(checkStreak,400); }
  if(ok){ const keep=$("pDate").value; pReset(); $("pDate").value=keep; if(!$("addSheet").hidden) closeSheet("addSheet"); }
}
$("fLoc").onclick=()=>openLocPicker(form.loc||defLoc(),k=>{ form.loc=k; renderForm(); });
$("fTown").onclick=()=>openTownPicker(form.town,$("fDate").value||todayStr(),t=>{ form.town=t; renderForm(); });
$("pTown").onclick=()=>openTownPicker(pform.town,$("pDate").value||todayStr(),t=>{ pform.town=t; renderPForm(); });
$("pLoc").onclick=()=>openLocPicker(pform.loc||defLoc(),k=>{ pform.loc=k; renderPersonal(); });
$("pSave").onclick=pSave; $("pCancel").onclick=pReset;
$("pAmt").addEventListener("input",()=>convHint("pAmt",cur.pCur,"pConv"));
$("pAmt").addEventListener("keydown",e=>{ if(e.key==="Enter") pSave(); });
$("pDesc").addEventListener("keydown",e=>{ if(e.key==="Enter") $("pAmt").focus(); });


/* ---- stats page: spending per month and by category ---- */
let stScope="trip", stMonth=null, locScope="couple";
/* where the last tap was: the next screen grows out of that spot */
let lastTap=null; document.addEventListener("pointerdown",e=>{ lastTap={x:e.clientX,y:e.clientY,t:Date.now()}; },{capture:true,passive:true});
function goView(v){
  /* the current screen shrinks back into the distance and the new one opens as a circle from the button you pressed */
  if(document.startViewTransition&&!calm()&&v!==view){ const R=document.documentElement, tp=lastTap&&Date.now()-lastTap.t<1500?lastTap:{x:innerWidth/2,y:innerHeight-40};
    R.style.setProperty("--vx",tp.x+"px"); R.style.setProperty("--vy",tp.y+"px"); R.classList.add("vt-hole");
    try{ const t=document.startViewTransition(()=>{ view=v; syncUrl(); renderAll(); window.scrollTo({top:0}); }); const done=()=>R.classList.remove("vt-hole"); t.finished.then(done,done); setTimeout(done,1200); return; }catch(e){ R.classList.remove("vt-hole"); } }
  /* with motion.js: the new screen's blocks rise in one after another instead of a whole-page cross-fade */
  if(M&&!calm()){ view=v; syncUrl(); renderAll(); window.scrollTo({top:0});
    const box=$(v==="stats"?"viewStats":v==="personal"?"viewPersonal":"viewShared");
    const parts=[$("hero"),$("sofar"),...(box?box.querySelectorAll(":scope > *, :scope > #pBody > *"):[])].filter(el=>el&&!el.hidden&&el.offsetParent!==null&&el.id!=="pBody"&&el.getBoundingClientRect().top<innerHeight);
    M.enter(parts.slice(0,6),{stagger:45}); return; }
  viewSwap(()=>{ view=v; syncUrl(); renderAll(); window.scrollTo({top:0}); }); }
$("statsBtn").onclick=()=>goView(view==="stats"?"shared":"stats");
$("statsBack").onclick=()=>goView("shared");
$("catMore").onclick=()=>{ stScope="trip"; stMonth=thisMonth(); goView("stats"); };
$("pCatMore").onclick=()=>{ stScope="mine"; stMonth=thisMonth(); goView("stats"); };
function statItems(){
  /* [{date,cur,amount,cat,catLabel,payer}] in the chosen scope */
  if(stScope==="mine"&&me){ return spreadAll([...myShareItems(), ...(acct&&acctFor===me?PT():[])]); }
  return spreadAll(S.items.filter(it=>it.kind!=="transfer"));
}
/* ================= the journey: where you were, day by day (private) =================
   The phone's place is matched to the nearest town from a built-in list (nothing is looked up online)
   and kept as an encrypted personal entry, one per town change, so only you see it. */
const TOWNS=[["תל אביב",32.08,34.78],["ירושלים",31.77,35.21],["בנגקוק",13.75,100.5],["צ׳יאנג מאי",18.79,98.98],["פאי",19.36,98.44],["צ׳יאנג ראי",19.91,99.83],["צ׳יאנג דאו",19.37,98.96],["מה הונג סון",19.3,97.97],["סוקוטאי",17.01,99.82],["איוטאיה",14.35,100.57],["קנצ׳נבורי",14.02,99.53],["הואה הין",12.57,99.96],["פטאיה",12.93,100.88],["קו צ׳אנג",12.06,102.33],["קו סמט",12.57,101.45],["קו פנגן",9.73,100.02],["קו סמוי",9.51,100.01],["קו טאו",10.1,99.84],["קרבי",8.09,98.91],["אאו נאנג",8.04,98.82],["פוקט",7.88,98.39],["קו פי פי",7.74,98.77],["קו לנטה",7.62,99.05],["קו ליפה",6.49,99.3],["קאו סוק",8.91,98.53],["האט יאי",7.01,100.47],["אודון תאני",17.41,102.79],["נונג קאי",17.88,102.74],["לואנג פרבנג",19.89,102.13],["ונג ויינג",18.92,102.45],["ויינטיאן",17.97,102.6],["נונג קיאו",20.57,102.62],["פאקסה",15.12,105.8],["4000 האיים",14.11,105.85],["האנוי",21.03,105.85],["הא לונג",20.95,107.08],["סאפה",22.34,103.84],["הא ג׳יאנג",22.82,104.98],["נין בין",20.25,105.97],["פונג נה",17.59,106.28],["הואה",16.46,107.59],["דה נאנג",16.05,108.2],["הוי אן",15.88,108.33],["נה טראנג",12.24,109.19],["דלאת",11.94,108.44],["מוי נה",10.93,108.29],["הו צ׳י מין",10.78,106.7],["קאן טו",10.03,105.78],["פו קוק",10.29,103.98],["סיאם ריפ",13.36,103.86],["פנום פן",11.56,104.92],["קמפוט",10.61,104.18],["קו רונג",10.73,103.25],["בטמבנג",13.1,103.2],["יאנגון",16.84,96.17],["בגאן",21.17,94.86],["מנדליי",21.97,96.08],["אגם אינלה",20.55,96.92],["קואלה לומפור",3.14,101.69],["פנאנג",5.41,100.33],["לנגקאווי",6.35,99.8],["מלאקה",2.19,102.25],["קמרון היילנדס",4.47,101.38],["האיים פרהנטיאן",5.92,102.73],["סינגפור",1.35,103.82],["אובוד",-8.51,115.26],["קוטה, באלי",-8.72,115.17],["צ׳אנגו",-8.65,115.14],["האיים גילי",-8.35,116.04],["לומבוק",-8.65,116.32],["יוגיקרטה",-7.8,110.36],["ג׳קרטה",-6.2,106.85],["לבואן באג׳ו",-8.5,119.88],["מנילה",14.6,120.98],["אל נידו",11.19,119.4],["קורון",12.0,120.2],["סבו",10.32,123.89],["סיארגאו",9.85,126.05],["בוהול",9.65,123.85],["דלהי",28.61,77.21],["מומבאי",19.08,72.88],["גואה",15.5,73.83],["ריישיקש",30.09,78.27],["מנאלי",32.24,77.19],["דרמסלה",32.22,76.32],["וארנסי",25.32,83.0],["ג׳איפור",26.91,75.79],["אגרה",27.18,78.01],["קטמנדו",27.7,85.32],["פוקרה",28.21,83.99],["קולומבו",6.93,79.86],["אלה",6.87,81.05],["קנדי",7.29,80.63],["טוקיו",35.68,139.69],["קיוטו",35.01,135.77],["אוסקה",34.69,135.5],["סיאול",37.57,126.98],["הונג קונג",22.32,114.17],["טאיפיי",25.03,121.57],["בייג׳ינג",39.9,116.4]];
function kmBetween(a,b,c,d){ const R=6371, r=Math.PI/180, x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2; return 2*R*Math.asin(Math.sqrt(x)); }
function nearTown(lat,lng){ let best=null, km=1e9; for(const t of TOWNS){ const k=kmBetween(lat,lng,t[1],t[2]); if(k<km){ km=k; best=t; } } return best&&km<60 ? {name:best[0],lat:best[1],lng:best[2],km} : best ? {name:"ליד "+best[0],lat:Math.round(lat*10)/10,lng:Math.round(lng*10)/10,km} : null; }
let STOPS=[];   /* old personal stops (before the journey became shared); merged in and moved over once */
/* The journey is shared by the trip: a list of {n: town, lat, lng, d: arrival date}. Either phone adds a stop when
   it finds itself in a new town; stops can also be added or fixed by hand. Only the town (its centre) is kept. */
/* ================= the journey: places you stayed =================
   A stay is {n: town, lat, lng (the town centre), d: arrival, e: departure (empty = still there)}. Shared by the trip.
   Every day of the trip belongs to the stay that covers it; that is how days, money and per-day averages are counted. */
function tripStops(){ const T=tripById(curTrip)||{}; const sh=(T.stops||[]).map(x=>({...x}));
  for(const x of STOPS){ if(!sh.some(y=>y.n===x.name&&y.d===x.date)) sh.push({n:x.name,lat:x.lat,lng:x.lng,d:x.date,at:x.createdAt||0,old:true}); }
  return mergeStays(sh.filter(x=>x&&x.n&&x.d).sort((a,b)=>a.d.localeCompare(b.d)||(a.at||0)-(b.at||0))); }
/* the same town twice in a row without leaving it in between is one stay, not two visits */
function mergeStays(list){ const out=[];
  for(const x of list){ const p=out[out.length-1];
    if(p&&p.n===x.n&&(!p.e||p.e>=x.d)){ if(!p.e||!x.e) p.e= p.e&&!x.e&&p.e>=x.d ? null : (x.e||null); else p.e= x.e>p.e ? x.e : p.e; if(x.pin&&!p.pin){ p.lat=x.lat; p.lng=x.lng; p.pin=1; } continue; }
    out.push(x); }
  return out; }
const dayAdd=(s,n)=>{ const [y,m,d]=s.split("-").map(Number); const t=new Date(y,m-1,d+n); return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0"); };
/* which stay each day belongs to: the latest arrival on or before it, unless that stay had already been left */
function stayDays(stays){
  const st=tripStart(), today=todayStr(); if(!stays.length) return new Map();
  /* a stay picked up automatically (never set by hand) that starts after the trip did: it counts from the start */
  const first=stays[0]; if(st&&first.d>st&&!first.m) { first.d0=first.d; first.d=st; first.est=true; }
  const own=new Map(); const from=st&&st<first.d?st:first.d;
  for(let day=from; day<=today; day=dayAdd(day,1)){
    let k=-1; for(let i=0;i<stays.length;i++){ if(stays[i].d<=day) k=i; }
    if(k<0) continue; const x=stays[k]; if(x.e&&day>x.e) continue;
    /* the day you leave belongs to the next place if you arrive there that day */
    if(x.e&&day===x.e&&stays[k+1]&&stays[k+1].d===day) continue;
    own.set(day,k);
  }
  return own;
}
/* the money of a day, for the couple (shared) or for me (mine alone + my share of the shared) */
function dayItems(mode){
  if(mode==="mine") return spreadAll([...(acct&&acctFor===me?PT():[]).map(it=>({...it,_alone:true})), ...myShareItems()]);
  return spreadAll(S.items.filter(it=>it.kind!=="transfer"));
}
/* where an expense really was, one rule for the town, the country and the globe:
   each stay has a country (the one most of its expenses are marked with); an expense of unknown place
   (paid in shekels or dollars, no country set) belongs to the country of the stay it happened in;
   an expense marked with another country, or as "before the trip", is not part of the town */
function placeCtx(){
  const stays=tripStops(), own=stayDays(stays), cnt=stays.map(()=>({}));
  for(const it of [...S.items,...(acct&&acctFor===me?PT():[])]){ if(it.kind==="transfer") continue; const k=it.town ? stays.findIndex(s=>s.n===it.town) : own.get(it.date||""); if(k==null||k<0) continue;
    const l=locOf(it); if(l==="prep"||l==="?") continue; cnt[k][l]=(cnt[k][l]||0)+1; }
  const major=cnt.map(c=>(Object.entries(c).sort((a,b)=>b[1]-a[1])[0]||[null])[0]);
  const stayOf=it=> it.town ? (()=>{ let k=-1; stays.forEach((x,i)=>{ if(x.n===it.town&&(k<0||x.d<=(it.date||""))) k=i; }); return k; })() : (own.has(it.date||"")?own.get(it.date):-1);
  const st=tripStart();
  /* paid before the trip: "before the trip", unless it is marked with a town of the trip (a hotel booked ahead belongs to its town and country) */
  const effLoc=it=>{ const l=locOf(it); if(st&&(it.date||"")<st&&!(it.town&&l!=="prep")) return "prep"; if(l!=="?") return l; const k=stayOf(it); return (k>=0&&major[k])||l; };
  /* part of stay k: by its date (or its town), and in the stay's country */
  const inStay=(it,k)=> stayOf(it)===k && (!!it.town || !major[k] || effLoc(it)===major[k]);
  return {stays,own,major,effLoc,inStay,stayOf};
}
function journeyLegs(mode){
  const stays=tripStops(), own=stayDays(stays), all=dayItems(mode), today=todayStr();
  /* an expense marked with a town goes to that town (a hotel in Pai booked from Chiang Mai is Pai's) */
  const items=all.filter(it=>!it.town), tagged=all.filter(it=>it.town);
  const legOf=it=>{ let k=-1; stays.forEach((x,i)=>{ if(x.n===it.town&&(k<0||x.d<=(it.date||""))) k=i; }); return k; };
  const PC=placeCtx();
  const legs=stays.map((x,i)=>{ const days=[...own].filter(([,k])=>k===i).map(([d])=>d).sort();
    const its=items.filter(it=>PC.inStay(it,i)).concat(tagged.filter(it=>legOf(it)===i));
    return {name:x.n,lat:x.lat,lng:x.lng,from:x.d,to:x.e||(stays[i+1]?stays[i+1].d:null),left:x.e||null,last:i===stays.length-1&&!x.e,est:!!x.est,
      days:days.length,dates:days,items:its,spent:its.reduce((a,it)=>a+spend(it),0),
      alone:its.filter(it=>it._alone).reduce((a,it)=>a+spend(it),0)}; });   /* a town passed through the same day stays on the route, with 0 days */
  /* towns paid for but not (yet) on the route: on the globe with their money and no days */
  const ex=new Map(); for(const it of tagged){ if(legOf(it)>=0) continue; const e=ex.get(it.town)||{name:it.town,items:[]}; e.items.push(it); ex.set(it.town,e); }
  legs.extra=[...ex.values()].map(e=>{ const ll=townLL(e.name,locOf(e.items[0]))||[0,0]; const sum=f=>e.items.filter(f).reduce((a,it)=>a+spend(it),0);
    return {name:e.name,lat:ll[0],lng:ll[1],items:e.items,spent:sum(()=>true),alone:sum(it=>it._alone),ahead:true}; });
  return legs;
}
/* towns: going back to the same place adds to its days and money */
function journeyTowns(legs){ const m=new Map();
  for(const e of legs.extra||[]) m.set(e.name,{name:e.name,lat:e.lat,lng:e.lng,days:0,spent:e.spent,alone:e.alone,visits:[],items:[...e.items],ahead:true});
  for(const l of legs){ const t=m.get(l.name)||{name:l.name,lat:l.lat,lng:l.lng,days:0,spent:0,alone:0,visits:[],items:[]}; delete t.ahead; t.days+=l.days; t.spent+=l.spent; t.alone+=l.alone||0; t.visits.push([l.from,l.left||(l.last?null:l.to)]); if(l.est) t.est=true; t.items.push(...l.items); m.set(l.name,t); }
  return [...m.values()]; }
let stopBusy=false;
async function recordStop(lat,lng){ const t=nearTown(lat,lng); if(t) return recordTown(t); }
async function recordTown(t,fix){
  if(!loaded||!canWrite||stopBusy||navigator.onLine===false||!t) return;
  const all=tripStops(), last=all[all.length-1]; if(last&&last.n===t.name&&!last.e) return;   /* still in the same town */
  const st=tripStart(); if(st&&todayStr()<st) return;   /* not before the flight */
  stopBusy=true; let added=false;
  /* through updateTrips: it also builds the trip list for older spaces that never had one */
  try{ await updateTrips(list=>{ const T=list.find(x=>x.id===curTrip); if(!T) return;
      const cur=mergeStays((T.stops||[]).map(x=>({...x})).sort((a,b)=>a.d.localeCompare(b.d)||(a.at||0)-(b.at||0))); const l=cur[cur.length-1]; if(l&&l.n===t.name&&!l.e) return;
      const today=todayStr();
      /* picking the place by hand (or asking the phone again after that) corrects today's place rather than adding another */
      if(l&&!l.m&&l.d===today&&!l.e&&(fix||l.h)){ cur.pop(); const p=cur[cur.length-1]; if(p&&p.e===today){ if(p.n===t.name){ p.e=null; T.stops=cur; added=true; return; } } }
      const L2=cur[cur.length-1]; if(L2&&L2.n===t.name&&!L2.e){ T.stops=cur; added=true; return; }
      if(L2&&!L2.e) L2.e=today;   /* the last place was left today */
      T.stops=[...cur,{n:t.name,lat:t.lat,lng:t.lng,d:today,e:null,at:Date.now(),by:me||null,...(fix?{h:1}:{})}]; added=true; });
    if(!added) return;
    toast("📍 יעד חדש במסע: "+t.name); renderJourneys(); }catch(e){} finally{ stopBusy=false; }
}
function moveOldStops(){ if(!STOPS.length||!canWrite) return; const T=tripById(curTrip)||{}; const have=T.stops||[];
  const add=STOPS.filter(x=>!have.some(y=>y.n===x.name&&y.d===x.date)); if(!add.length) return;
  patchTrip(curTrip,{stops:[...have,...add.map(x=>({n:x.name,lat:x.lat,lng:x.lng,d:x.date,e:null,at:x.createdAt||0,by:me||null}))].sort((a,b)=>a.d.localeCompare(b.d))}).catch(()=>{}); }
/* ================= the journey as a globe =================
   A real globe (land from world.js, loaded only when the graphs screen opens), turned with a finger,
   pinched to zoom. It flies in from the whole earth to where you have been; the route is drawn between the stops. */
let GLOBE=null, GLOBE_ME=null, worldP=null, RINGS=null;
function loadWorld(){ if(window.WORLD) return Promise.resolve(); if(worldP) return worldP;
  worldP=new Promise(res=>{ const s=document.createElement("script"); s.src="world.js?v=2"; s.onload=res; s.onerror=res; document.head.appendChild(s); }); return worldP; }
function worldRings(){
  if(RINGS) return RINGS; const Q=window.WORLD_Q||20, out=[];
  for(const part of String(window.WORLD||"").split(";")){ const n=part.split(",").map(Number); let x=0,y=0; const lon=new Float32Array(n.length/2), lat=new Float32Array(n.length/2);
    let mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;
    for(let i=0;i<n.length;i+=2){ x+=n[i]; y+=n[i+1]; const a=x/Q,b=y/Q; lon[i/2]=a; lat[i/2]=b; if(a<mnx)mnx=a; if(a>mxx)mxx=a; if(b<mny)mny=b; if(b>mxy)mxy=b; }
    /* the same outline without the jump at the 180° line (Russia, Antarctica); a piece that goes right round
       the pole is closed through the pole, so "inside" can be tested on the flat map */
    const m=lon.length, ul=new Float32Array(m); let off=0; ul[0]=lon[0]; for(let i=1;i<m;i++){ let d=lon[i]-lon[i-1]; if(d>180) off-=360; else if(d<-180) off+=360; ul[i]=lon[i]+off; }
    let cd=lon[0]-lon[m-1]; if(cd>180) cd-=360; else if(cd<-180) cd+=360; const wrap=Math.round((ul[m-1]-ul[0]+cd)/360)*360;
    const cl=(mnx+mxx)/2, cb=(mny+mxy)/2; out.push({lon,lat,ul,wrap,pole:mny+mxy<0?-90:90,c:[cl,cb],r:Math.max(mxx-mnx,mxy-mny)*0.75}); }
  if(out.length>1) RINGS=out; return out;
}
const D2R=Math.PI/180;
/* country borders (lines between neighbours) and where each country's name goes */
let BLINES=null;
function borderLines(){ if(BLINES) return BLINES; const Q=window.WORLD_Q||20, out=[];
  for(const part of String(window.BORDERS||"").split(";")){ if(!part) continue; const n=part.split(",").map(Number); let x=0,y=0; const lon=new Float32Array(n.length/2), lat=new Float32Array(n.length/2); let sx=0,sy=0;
    for(let i=0;i<n.length;i+=2){ x+=n[i]; y+=n[i+1]; lon[i/2]=x/Q; lat[i/2]=y/Q; sx+=x/Q; sy+=y/Q; }
    const c=[sx/lon.length,sy/lon.length]; let r=0; for(let i=0;i<lon.length;i++) r=Math.max(r,Math.hypot(lon[i]-c[0],lat[i]-c[1])); out.push({lon,lat,c,r}); }
  if(out.length) BLINES=out; return out; }
function gproj(g,lon,lat){ const l=(lon-g.lon)*D2R, p=lat*D2R, p0=g.lat*D2R, cp=Math.cos(p);
  const cosc=Math.sin(p0)*Math.sin(p)+Math.cos(p0)*cp*Math.cos(l);
  let x=cp*Math.sin(l), y=Math.cos(p0)*Math.sin(p)-Math.sin(p0)*cp*Math.cos(l);
  if(cosc<0){ const m=Math.hypot(x,y)||1; x/=m; y/=m; }   /* behind the earth: pinned to the rim */
  return [g.cx+x*g.R, g.cy-y*g.R, cosc>=0]; }
function angDist(a,b,c,d){ return Math.acos(Math.min(1,Math.sin(b*D2R)*Math.sin(d*D2R)+Math.cos(b*D2R)*Math.cos(d*D2R)*Math.cos((a-c)*D2R)))/D2R; }
function roundRect(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
/* a point a share t of the way along the great circle from a to b */
function gc(a,b,t){ const f1=a.lat*D2R,l1=a.lng*D2R,f2=b.lat*D2R,l2=b.lng*D2R; const d=angDist(a.lng,a.lat,b.lng,b.lat)*D2R; if(d<1e-6) return [a.lng,a.lat];
  const A=Math.sin((1-t)*d)/Math.sin(d), B=Math.sin(t*d)/Math.sin(d); const x=A*Math.cos(f1)*Math.cos(l1)+B*Math.cos(f2)*Math.cos(l2), y=A*Math.cos(f1)*Math.sin(l1)+B*Math.cos(f2)*Math.sin(l2), z=A*Math.sin(f1)+B*Math.sin(f2);
  return [Math.atan2(y,x)/D2R, Math.atan2(z,Math.hypot(x,y))/D2R]; }
function globeFit(legs,W,H){
  if(!legs.length){ const h=hereNow&&hereNow(); return {lon:h?h.lng:100.5,lat:h?h.lat:13.7,R:Math.min(W,H)*.42}; }
  const mean=legs.reduce((a,l)=>[a[0]+l.lng,a[1]+l.lat],[0,0]).map(v=>v/legs.length);
  /* room around the towns for their labels; never closer than ~7 degrees, so one town still shows its country and coast */
  const span=Math.max(7,Math.max(1.2,...legs.map(l=>angDist(mean[0],mean[1],l.lng,l.lat)))*1.7);
  return {lon:mean[0],lat:mean[1],R:Math.min(9000,Math.max(Math.min(W,H)*.42,Math.min(W,H)*.36/Math.sin(Math.min(80,span)*D2R)))};
}
/* where the sun is overhead now (declination by the day of the year, longitude by the UTC hour) */
function subsolar(){ const d=new Date(), y0=Date.UTC(d.getUTCFullYear(),0,1), n=(d-y0)/864e5, h=d.getUTCHours()+d.getUTCMinutes()/60;
  const B=2*Math.PI*(n-81)/364, eot=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B);   /* minutes */
  return {lat:-23.44*Math.cos(2*Math.PI*(n+10)/365), lng:((-15*(h-12)-eot/4)+540)%360-180}; }
/* the night side, darkened with a soft dusk line: drawn small and stretched, so it costs little */
function nightShade(g,c){
  const sc=3, w=Math.ceil(g.W/sc), h=Math.ceil(g.H/sc); let o=g.nightCv; if(!o||o.width!==w||o.height!==h){ o=g.nightCv=document.createElement("canvas"); o.width=w; o.height=h; }
  const ox=o.getContext("2d"), img=ox.createImageData(w,h), dt=img.data, sun=subsolar(), sl=sun.lat*D2R, sg=sun.lng, p0=g.lat*D2R, sp0=Math.sin(p0), cp0=Math.cos(p0);
  for(let j=0;j<h;j++) for(let i=0;i<w;i++){ const x=(i*sc+sc/2-g.cx)/g.R, y=(g.cy-(j*sc+sc/2))/g.R, rho=Math.hypot(x,y); if(rho>1) continue;
    const cc=Math.asin(Math.min(1,rho)), sc2=Math.sin(cc), cc2=Math.cos(cc);
    const lat=rho<1e-9?p0:Math.asin(cc2*sp0+y*sc2*cp0/rho), lon=g.lon+Math.atan2(x*sc2,rho*cc2*cp0-y*sc2*sp0)/D2R;
    const cz=Math.sin(lat)*Math.sin(sl)+Math.cos(lat)*Math.cos(sl)*Math.cos((lon-sg)*D2R);
    const a= cz>0.08 ? 0 : cz<-0.12 ? 0.62 : (0.08-cz)/0.2*0.62, k=(j*w+i)*4; dt[k]=8; dt[k+1]=6; dt[k+2]=40; dt[k+3]=a*255; }
  ox.putImageData(img,0,0); c.save(); c.imageSmoothingEnabled=true; c.drawImage(o,0,0,g.W,g.H); c.restore();
}
/* one piece of land, cut where it goes behind the earth. The cut ends are joined along the rim in the
   direction that runs over land (checked against the outline itself), so a big coast half behind the
   horizon never floods the sea. Returns false when nothing of it faces us. */
function inRing(r,lon,lat){
  const X=r.ul||r.lon, Y=r.lat, n=X.length;
  if(r.wrap){ /* round the pole: shift the point into the outline's 360° and close it through the pole */
    const a=Math.min(X[0],X[n-1]); let L=lon; while(L<a) L+=360; while(L>=a+360) L-=360; let ins=false;
    const px=i=> i<n ? X[i] : i===n ? X[n-1] : X[0], py=i=> i<n ? Y[i] : r.pole, N=n+2;
    for(let i=0,j=N-1;i<N;j=i++){ const yi=py(i), yj=py(j), xi=px(i), xj=px(j); if((yi>lat)!==(yj>lat)&&L<(xj-xi)*(lat-yi)/(yj-yi)+xi) ins=!ins; } return ins; }
  for(const L of [lon,lon-360,lon+360]){ let ins=false;
    for(let i=0,j=n-1;i<n;j=i++){ if((Y[i]>lat)!==(Y[j]>lat)&&L<(X[j]-X[i])*(lat-Y[i])/(Y[j]-Y[i])+X[i]) ins=!ins; } if(ins) return true; }
  return false; }
function rimLonLat(g,a){ const x=Math.cos(a), y=-Math.sin(a), p0=g.lat*D2R;
  let lon=g.lon+Math.atan2(x,-y*Math.sin(p0))/D2R; lon=((lon+540)%360)-180; return [lon,Math.asin(y*Math.cos(p0))/D2R]; }
function landPath(c,g,r){
  const n=r.lon.length, stp=g.R<500&&n>60?2:1, p0=g.lat*D2R, sp0=Math.sin(p0), cp0=Math.cos(p0);
  const U=r.ul||r.lon, cz=i=>{ const p=r.lat[i]*D2R; return sp0*Math.sin(p)+cp0*Math.cos(p)*Math.cos((U[i]-g.lon)*D2R); };
  const idx=[]; for(let i=0;i<n;i+=stp) idx.push(i); const m=idx.length, z=idx.map(cz);
  let vis=0; for(const v of z) if(v>=0) vis++;
  if(!vis) return false;
  if(vis===m){ for(let k=0;k<m;k++){ const [x,y]=gproj(g,r.lon[idx[k]],r.lat[idx[k]]); k?c.lineTo(x,y):c.moveTo(x,y); } c.closePath(); return true; }
  /* where the outline crosses the horizon, as an angle on the rim */
  const cross=(a,b)=>{ const t=z[a]/(z[a]-z[b]), i=idx[a], j=idx[b]; const [x,y]=gproj(g,U[i]+(U[j]-U[i])*t,r.lat[i]+(r.lat[j]-r.lat[i])*t); return Math.atan2(y-g.cy,x-g.cx); };
  /* the parts that face us, each from the rim back to the rim */
  let k0=0; while(z[k0]>=0) k0++;
  const segs=[]; let cur=null;
  for(let s=1;s<=m;s++){ const a=(k0+s-1)%m, b=(k0+s)%m;
    if(z[a]<0&&z[b]>=0){ cur={a0:cross(a,b),pts:[b]}; }
    else if(z[a]>=0&&z[b]>=0&&cur){ cur.pts.push(b); }
    else if(z[a]>=0&&z[b]<0&&cur){ cur.a1=cross(a,b); segs.push(cur); cur=null; } }
  if(!segs.length) return false;
  const TAU=2*Math.PI, fwd=(a,b)=>((b-a)%TAU+TAU)%TAU;
  /* every cut on the rim, in order round it; for each exit, the land runs along the rim on one side of it
     (checked half way to the neighbouring cut), and that is the way to the next entry */
  const cuts=[]; segs.forEach((s,k)=>{ cuts.push({a:fwd(0,s.a0),k,in:true},{a:fwd(0,s.a1),k,in:false}); }); cuts.sort((x,y)=>x.a-y.a);
  const L=cuts.length, landAt=(a0,a1)=>{ const d=fwd(a0,a1); if(d<1e-6) return null; const [lo,la]=rimLonLat(g,a0+d/2); return inRing(r,lo,la); };
  const nextIn=(a,dir)=>{ let best=-1, bd=Infinity; segs.forEach((t,j)=>{ const d= dir>0 ? fwd(a,t.a0) : fwd(t.a0,a); if(d<bd){ bd=d; best=j; } }); return [best,bd]; };
  /* one outline always keeps land on the same side, so the clear cuts vote for the way round, and all follow it */
  let vote=0;
  for(let i=0;i<L;i++){ const x=cuts[i]; if(x.in) continue;
    const f=landAt(x.a,cuts[(i+1)%L].a), bk=landAt(cuts[(i-1+L)%L].a,x.a);
    if(f===true&&bk===false) vote++; else if(bk===true&&f===false) vote--; }
  const dir= vote>0 ? 1 : vote<0 ? -1 : 0;
  for(const s of segs){ let d=dir; if(!d){ const F=nextIn(s.a1,1), B=nextIn(s.a1,-1); d= F[1]<=B[1] ? 1 : -1; }
    const [to,bd]=nextIn(s.a1,d); s.dir=d; s.to=to; s.bd=bd; }
  const used=new Set();
  for(let st=0;st<segs.length;st++){ if(used.has(st)) continue; let k=st, first=true;
    while(k>=0&&!used.has(k)){ used.add(k); const s=segs[k];
      const x0=g.cx+Math.cos(s.a0)*g.R, y0=g.cy+Math.sin(s.a0)*g.R; first?c.moveTo(x0,y0):c.lineTo(x0,y0); first=false;
      for(const q of s.pts){ const [x,y]=gproj(g,r.lon[idx[q]],r.lat[idx[q]]); c.lineTo(x,y); }
      c.arc(g.cx,g.cy,g.R,s.a1,s.a1+s.dir*s.bd,s.dir<0); k=s.to; }
    c.closePath(); }
  return true;
}
/* marking a place with a finger: the globe flies to it, the next tap on it sets the spot */
function gunproj(g,x,y){ const X=(x-g.cx)/g.R, Y=(g.cy-y)/g.R, rho=Math.hypot(X,Y); if(rho>1) return null; const c=Math.asin(rho), sc=Math.sin(c), cc=Math.cos(c), p0=g.lat*D2R;
  const lat= rho<1e-9 ? g.lat : Math.asin(cc*Math.sin(p0)+Y*sc*Math.cos(p0)/rho)/D2R; let lon=g.lon+Math.atan2(X*sc,rho*cc*Math.cos(p0)-Y*sc*Math.sin(p0))/D2R; lon=((lon+540)%360)-180; return [lon,lat]; }
function pickOnGlobe(name,at,cb){ const g=GLOBE; if(!g){ toast("🌍 הגלובוס עוד נטען, רגע"); return; }
  townCard(null,g); g.cv.parentNode.scrollIntoView({behavior:calm()?"auto":"smooth",block:"center"});
  g.pin=[at[1],at[0]]; flyGlobe({lon:at[1],lat:at[0],R:Math.min(9000,Math.min(g.W,g.H)*.36/Math.sin(5*D2R))},g);
  g.pick=(lon,lat)=>{ g.pick=null; g.pin=[lon,lat]; g.pinShow=true; setTimeout(()=>{ g.pinShow=false; drawGlobe(g); },4000); drawGlobe(g); cb(Math.round(lat*100)/100,Math.round(lon*100)/100); toast("📍 "+name+" סומנה · לא לשכוח \"שמירה\""); };
  g.cv.parentNode.classList.add("picking"); toast("👆 נוגעים בגלובוס במקום של "+name+" (אפשר לסובב ולהגדיל קודם)"); }
function drawCountryNames(g,c){ const W=g.W, H=g.H;
  /* country names: the big ones first; a name shows only where its country is wide enough on screen */
  if(window.CTRS){ c.textAlign="center";
    /* room kept free: the town pins with their labels, the zoom buttons, the totals box */
    const boxes=[{x0:0,x1:50,y0:0,y1:142},{x0:W*.44,x1:W,y0:0,y1:80}];
    for(const h of g.hits||[]) boxes.push(h.r>=24&&h.t ? {x0:h.x-h.r,x1:h.x+h.r,y0:h.y-17,y1:h.y+17} : {x0:h.x-h.r,x1:h.x+h.r,y0:h.y-h.r,y1:h.y+h.r}); c.direction="rtl"; c.textBaseline="middle";
    /* the countries of this trip come first and always get their name */
    const been=new Set([...S.items,...P].map(it=>CTRY[locOf(it)]).filter(Boolean).map(v=>v.split(" ").slice(1).join(" ")).map(n=>n==="פיליפינים"?"הפיליפינים":n==="אמירויות"?"איחוד האמירויות":n==="קוריאה"?"דרום קוריאה":n));
    const list=[...window.CTRS].sort((a,b)=>(been.has(b[0])?1:0)-(been.has(a[0])?1:0));
    for(const [nm,lo,la,ar] of list){ const [x,y,v]=gproj(g,lo,la); if(!v||x<0||x>W||y<0||y>H) continue; const mine=been.has(nm);
      const span=Math.sqrt(ar)*D2R*g.R*.75; const fs=Math.max(mine?11:9.5,Math.min(15,span/7)); c.font="700 "+fs.toFixed(1)+"px Assistant, system-ui, sans-serif";
      const w=c.measureText(nm).width; if(!mine&&span<w*.9) continue;
      /* a country of the trip may move a little to get out from under a pin */
      const tries= mine ? [[0,0],[0,22],[0,-22],[w*.6+16,0],[-w*.6-16,0],[0,40]] : [[0,0]];
      for(const [dx,dy] of tries){ const X=x+dx, Y=y+dy, bx={x0:X-w/2-3,x1:X+w/2+3,y0:Y-fs/2-2,y1:Y+fs/2+2};
        if(bx.x0<2||bx.x1>W-2||bx.y0<2||bx.y1>H-2||Math.hypot(Math.max(Math.abs(bx.x0-g.cx),Math.abs(bx.x1-g.cx)),Math.abs(Y-g.cy))>g.R*.97) continue;
        if(boxes.some(o=>!(bx.x1<o.x0||bx.x0>o.x1||bx.y1<o.y0||bx.y0>o.y1))) continue; boxes.push(bx);
        c.lineWidth=3; c.strokeStyle="rgba(235,255,245,.75)"; c.strokeText(nm,X,Y); c.fillStyle= mine ? "rgba(120,20,70,.8)" : "rgba(25,55,85,.72)"; c.fillText(nm,X,Y); break; } }
    c.textBaseline="alphabetic"; }
}
function drawGlobe(g){
  g=g||GLOBE; if(!g||!g.cv.isConnected) return; const c=g.ctx, W=g.W, H=g.H; c.clearRect(0,0,W,H);
  const hot=g.mode==="mine"?"#14C9A5":"#FF4D8D", gold="#FFC93C";
  const bg=c.createLinearGradient(0,0,0,H); bg.addColorStop(0,"#120B33"); bg.addColorStop(1,"#241455"); c.fillStyle=bg; c.fillRect(0,0,W,H);
  if(!g.stars){ g.stars=[]; for(let i=0;i<70;i++) g.stars.push([Math.random()*W,Math.random()*H,Math.random()*1.3+.2,Math.random()*.6+.2]); }
  for(const [x,y,r,a] of g.stars){ c.globalAlpha=a; c.fillStyle="#fff"; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); } c.globalAlpha=1;
  const glow=c.createRadialGradient(g.cx,g.cy,g.R*.95,g.cx,g.cy,g.R*1.16); glow.addColorStop(0,"rgba(120,160,255,.55)"); glow.addColorStop(1,"rgba(120,160,255,0)");
  c.fillStyle=glow; c.beginPath(); c.arc(g.cx,g.cy,Math.min(g.R*1.16,Math.hypot(W,H)),0,7); c.fill();
  const sea=c.createRadialGradient(g.cx-g.R*.35,g.cy-g.R*.45,g.R*.05,g.cx,g.cy,g.R); sea.addColorStop(0,"#3E7BE0"); sea.addColorStop(.6,"#1F4FB8"); sea.addColorStop(1,"#122E7A");
  c.save(); c.beginPath(); c.arc(g.cx,g.cy,g.R,0,7); c.fillStyle=sea; c.fill(); c.clip();
  c.strokeStyle="rgba(255,255,255,.10)"; c.lineWidth=1; const step=g.R>2500?2:g.R>900?5:15;
  for(let lon=-180;lon<180;lon+=step){ c.beginPath(); let on=false; for(let lat=-85;lat<=85;lat+=2.5){ const [x,y,v]=gproj(g,lon,lat); if(v){ on?c.lineTo(x,y):c.moveTo(x,y); on=true; } else on=false; } c.stroke(); }
  for(let lat=-75;lat<=75;lat+=step){ c.beginPath(); let on=false; for(let lon=-180;lon<=180;lon+=2.5){ const [x,y,v]=gproj(g,lon,lat); if(v){ on?c.lineTo(x,y):c.moveTo(x,y); on=true; } else on=false; } c.stroke(); }
  const view=Math.min(90,Math.asin(Math.min(1,Math.hypot(W,H)/2/g.R))/D2R+2);
  const land=c.createLinearGradient(0,g.cy-g.R,0,g.cy+g.R); land.addColorStop(0,"#B9F0D2"); land.addColorStop(1,"#7DD8B0");
  c.fillStyle=land; c.strokeStyle="rgba(255,255,255,.45)"; c.lineWidth=.8;
  for(const r of g.rings){ if(angDist(g.lon,g.lat,r.c[0],r.c[1])-r.r>view) continue;
    c.beginPath(); if(landPath(c,g,r)){ c.fill(); c.stroke(); } }
  /* borders: thin lines between countries */
  c.strokeStyle="rgba(40,70,110,.42)"; c.lineWidth=g.R>2000?1.1:.8; c.setLineDash(g.R>1500?[]:[3,2]); c.beginPath();
  for(const b of borderLines()){ if(angDist(g.lon,g.lat,b.c[0],b.c[1])-b.r>view) continue; let on=false;
    for(let i=0;i<b.lon.length;i++){ const [x,y,v]=gproj(g,b.lon[i],b.lat[i]); if(v){ on?c.lineTo(x,y):c.moveTo(x,y); on=true; } else on=false; } }
  c.stroke(); c.setLineDash([]);
  nightShade(g,c);
  const sh=c.createRadialGradient(g.cx-g.R*.45,g.cy-g.R*.5,g.R*.05,g.cx,g.cy,g.R*1.02); sh.addColorStop(0,"rgba(255,255,255,.22)"); sh.addColorStop(.65,"rgba(255,255,255,0)"); sh.addColorStop(1,"rgba(5,0,40,.45)");
  c.fillStyle=sh; c.fillRect(0,0,W,H); c.restore();
  const L=g.legs; c.lineCap="round"; c.lineJoin="round";
  if(L.length>1){ let drawn=g.draw*(L.length-1);
    for(let i=1;i<L.length&&drawn>0;i++,drawn--){ const a=L[i-1], b=L[i], part=Math.min(1,drawn), pts=[]; for(let k=0;k<=24;k++) pts.push(gc({lat:a.lat,lng:a.lng},{lat:b.lat,lng:b.lng},k/24));
      const A0=gproj(g,pts[0][0],pts[0][1]), B0=gproj(g,pts[24][0],pts[24][1]), hmax=Math.min(30,Math.hypot(A0[0]-B0[0],A0[1]-B0[1])*.2), m=Math.max(1,Math.round(part*24));
      c.beginPath(); for(let k=0;k<=m;k++){ const [x,y]=gproj(g,pts[k][0],pts[k][1]); const lift=Math.sin(k/24*Math.PI)*hmax; k?c.lineTo(x,y-lift):c.moveTo(x,y-lift); }
      c.strokeStyle=g.mode==="mine"?"rgba(20,201,165,.35)":"rgba(255,77,141,.35)"; c.lineWidth=9; c.stroke(); c.strokeStyle=hot; c.lineWidth=3; c.stroke(); } }
  const T=g.towns, maxS=Math.max(1,...T.map(t=>t.spent)); g.hits=[];
  const nowName=(L.find(l=>l.last)||{}).name;
  const P2=[]; for(const t of T){ const [x,y,v]=gproj(g,t.lng,t.lat); if(!v) continue; P2.push({t,x,y,r:7+Math.sqrt(t.spent/maxS)*9,now:t.name===nowName}); }
  if(g.draw<1) P2.forEach(p=>{ const i=L.findIndex(l=>l.name===p.t.name); if(i>0&&g.draw<i/(L.length-1)-0.001) p.hide=true; });
  for(const p of P2){ if(p.hide) continue; const pulse=c.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2.2); pulse.addColorStop(0,p.now?"rgba(255,201,60,.55)":"rgba(255,77,141,.45)"); pulse.addColorStop(1,"rgba(255,77,141,0)");
    c.fillStyle=pulse; c.beginPath(); c.arc(p.x,p.y,p.r*2.2,0,7); c.fill();
    c.beginPath(); c.arc(p.x,p.y,p.r,0,7); c.fillStyle=p.now?gold:hot; c.fill(); c.lineWidth=3; c.strokeStyle="#fff"; c.stroke();
    g.hits.push({x:p.x,y:p.y,r:Math.max(22,p.r+10),t:p.t}); }
  const taken=P2.filter(p=>!p.hide).map(p=>({x0:p.x-p.r,x1:p.x+p.r,y0:p.y-p.r,y1:p.y+p.r})); c.textAlign="center"; c.direction="rtl";
  for(const p of P2.filter(p=>!p.hide).sort((a,b)=>b.t.spent-a.t.spent)){ const t=p.t, amt=fmt(t.spent,showCur);
    c.font="800 12.5px Assistant, system-ui, sans-serif"; const w=Math.max(c.measureText(t.name).width,c.measureText(amt).width)+18;
    for(const [lx,ly] of [[p.x,p.y-p.r-38],[p.x,p.y+p.r+6],[p.x+p.r+w/2+6,p.y-16],[p.x-p.r-w/2-6,p.y-16]]){ const b={x0:lx-w/2,x1:lx+w/2,y0:ly,y1:ly+32};
      if(b.x0<2||b.x1>W-2||b.y0<44||b.y1>H-2||taken.some(o=>!(b.x1<o.x0||b.x0>o.x1||b.y1<o.y0||b.y0>o.y1))) continue; taken.push(b);
      c.fillStyle="rgba(255,255,255,.95)"; roundRect(c,b.x0,b.y0,w,32,11); c.fill();
      c.fillStyle="#1E1640"; c.font="800 12.5px Assistant, system-ui, sans-serif"; c.fillText(t.name,lx,ly+14);
      c.fillStyle=g.mode==="mine"?"#0E9F7E":hot; c.font="800 11.5px Assistant, system-ui, sans-serif"; c.fillText(amt,lx,ly+27);
      g.hits.push({x:lx,y:ly+16,r:Math.max(24,w/2),t}); break; } }
  c.save(); c.beginPath(); c.arc(g.cx,g.cy,g.R,0,7); c.clip(); drawCountryNames(g,c); c.restore();
  if(g.pin&&(g.pick||g.pinShow)){ const [x,y,v]=gproj(g,g.pin[0],g.pin[1]); if(v){ c.strokeStyle="#FFC93C"; c.lineWidth=2.5; c.beginPath(); c.arc(x,y,11,0,7); c.moveTo(x-17,y); c.lineTo(x+17,y); c.moveTo(x,y-17); c.lineTo(x,y+17); c.stroke(); } }
}
/* both globes: the couple's (graphs) and mine (personal) */
function renderJourneys(){ if(view==="stats") renderJourney("shared"); if(view==="personal") renderJourney("mine"); }
function renderJourney(mode){
  mode=mode||"shared"; const mine=mode==="mine";
  const box=$(mine?"jMapMe":"jMap"); if(!box||!box.offsetParent&&box.closest("[hidden]")) { if(!mine) renderStopsEditor(); return; }
  const note=$(mine?"jNoteMe":"jNote");
  if(mine&&!(acct&&acctFor===me)){ note.textContent="פותחים את האישי כדי לראות כמה הוצאת בכל יעד"; box.innerHTML=""; return; }
  const legs=journeyLegs(mode), towns=journeyTowns(legs);
  const total=[...legs,...(legs.extra||[])].reduce((a,l)=>a+l.spent,0), days=legs.reduce((a,l)=>a+l.days,0);
  note.textContent= !legs.length ? (mine?"היעדים משותפים · מוסיפים אותם במסך הגרפים":"עוד אין יעדים · \"📍 איפה אנחנו?\" או \"✏️ היעדים שלנו\"") : legs.some(l=>l.est) ? "היעד הראשון נספר מתחילת הטיול · ✏️ לתקן תאריכים" : mine ? "שלך: אישי + החלק שלך במשותף · נגיעה ביעד לפרטים" : "נגיעה ביעד לפרטים · מסובבים באצבע";
  loadWorld().then(()=>{
    let cv=box.querySelector("canvas.globe"), head=box.querySelector(".gl-head");
    const full=box.classList.contains("gl-full");
    const W= full ? box.clientWidth||innerWidth : box.clientWidth||340, H= full ? box.clientHeight||innerHeight : Math.round(Math.min(440,Math.max(320,W*1.02))), dpr=Math.min(3,window.devicePixelRatio||1);
    if(!cv){ box.innerHTML=""; cv=document.createElement("canvas"); cv.className="globe"; cv.setAttribute("role","img"); box.appendChild(cv);
      head=document.createElement("div"); head.className="gl-head"; box.appendChild(head); }
    if(!box.querySelector(".gl-zoom")){ const z=document.createElement("div"); z.className="gl-zoom";
      for(const [t,l,f] of [["＋","קירוב",1.6],["－","התרחקות",1/1.6],["🌍","כל כדור הארץ",0],["⛶","מסך מלא","full"]]){ const b=document.createElement("button"); b.type="button"; b.textContent=t; b.setAttribute("aria-label",l);
        if(f==="full"){ b.className="gl-fs"; b.onclick=()=>globeFull(box,mode); z.appendChild(b); continue; }
        b.onclick=()=>{ const g=cv.__g; if(!g) return; if(!f){ const out=g.R>Math.min(g.W,g.H)*.6; flyGlobe(out?{lon:g.lon,lat:g.lat*.3,R:Math.min(g.W,g.H)*.4}:g.fit,g); } else flyGlobe({lon:g.lon,lat:g.lat,R:Math.max(Math.min(g.W,g.H)*.3,Math.min(12000,g.R*f))},g); }; z.appendChild(b); }
      box.appendChild(z); }
    head.innerHTML=""; if(legs.length){ const b=document.createElement("b"); b.className="num"; b.textContent=fmt(total,showCur); const sm=document.createElement("small"); sm.textContent=(days===1?"יום אחד":days+" ימים")+" · "+(towns.length===1?"יעד אחד":towns.length+" יעדים")+" · "+fmt(total/Math.max(1,days),showCur)+" ליום"; head.append(b,sm);
      if(mine){ const al=[...legs,...(legs.extra||[])].reduce((a,l)=>a+(l.alone||0),0), sp=document.createElement("div"); sp.className="gl-split"; const x1=document.createElement("span"); x1.textContent="🙋 אישי "+fmt(al,showCur); const x2=document.createElement("span"); x2.textContent="👫 משותף "+fmt(total-al,showCur); sp.append(x1,x2); head.appendChild(sp); } }
    cv.width=W*dpr; cv.height=H*dpr; cv.style.width=W+"px"; cv.style.height=H+"px"; cv.setAttribute("aria-label",(mine?"הגלובוס שלי: ":"גלובוס המסע: ")+(towns.map(t=>t.name+" "+fmt(t.spent,showCur)).join(", ")||"עוד אין יעדים"));
    const ctx=cv.getContext("2d"); ctx.setTransform(dpr,0,0,dpr,0,0);
    const fit=globeFit(legs,W,H), prev0=cv.__g, prev=prev0&&{...prev0};
    /* the window changed size (full screen and back): the globe keeps its look, scaled to the new room */
    if(prev&&(prev.W!==W||prev.H!==H)){ prev.R*=Math.min(W,H)/Math.min(prev.W,prev.H); prev.stars=null; }
    const g={cv,ctx,W,H,cx:W/2,cy:H/2+12,legs,towns,mode,rings:worldRings(),lon:prev?prev.lon:fit.lon-70,lat:prev?prev.lat:fit.lat*0.3,R:prev?prev.R:Math.min(W,H)*.40,draw:prev?prev.draw:0,fit,flown:prev?prev.flown:false,stars:prev?prev.stars:null};
    /* a fly-in cut short (full screen tapped while it flew) ends where it was going, with the route drawn */
    if(prev&&prev.flown&&g.draw<1) Object.assign(g,{draw:1,lon:fit.lon,lat:fit.lat,R:Math.max(g.R,fit.R*Math.min(W,H)/Math.min(prev0.W,prev0.H))});
    cv.__g=g; if(mine) GLOBE_ME=g; else GLOBE=g;
    drawGlobe(g); globeInput(cv);
    if(!g.flown) globeWhenSeen(box,g);
  });
  if(!mine) renderStopsEditor();
}
/* the globe as the whole window: tap ⛶, everything else steps aside; ✕ (or Esc) brings it back */
function globeFull(box,mode,force){ const on= force!=null ? force : !box.classList.contains("gl-full");
  if(on===box.classList.contains("gl-full")) return;
  /* lifted out to the page itself while full (a moving card around it would otherwise hold it in) */
  if(on){ box.__home=document.createComment("globe"); box.parentNode.insertBefore(box.__home,box); document.body.appendChild(box); }
  else if(box.__home&&box.__home.parentNode){ box.__home.parentNode.insertBefore(box,box.__home); box.__home.remove(); box.__home=null; }
  box.classList.toggle("gl-full",on); document.body.classList.toggle("globe-open",on); buzz(6);
  const cv=box.querySelector("canvas.globe"); if(cv) cv.style.touchAction= on ? "none" : "pan-y";
  const b=box.querySelector(".gl-fs"); if(b){ b.textContent= on ? "✕" : "⛶"; b.setAttribute("aria-label",on?"יציאה ממסך מלא":"מסך מלא"); }
  townCard(null,cv&&cv.__g);
  if(on) box.__back=()=>globeFull(box,mode,false); else box.__back=null;
  renderJourney(mode); if(!on) setTimeout(()=>box.scrollIntoView({block:"center"}),30); }
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ const b=document.querySelector(".jmap.gl-full"); if(b&&b.__back) b.__back(); } });
addEventListener("resize",()=>{ const b=document.querySelector(".jmap.gl-full"); if(b) renderJourney(b.id==="jMapMe"?"mine":"shared"); });
/* a card for one place: total, days, per day, the visits, what the money went on */
function townCard(t,g){
  g=g||GLOBE; const box=g&&g.cv.parentNode; if(!box) return; let o=box.querySelector(".gl-card"); if(o) o.remove(); if(!t) return;
  o=document.createElement("div"); o.className="gl-card"; o.setAttribute("role","dialog"); o.setAttribute("aria-label",t.name);
  const sd=s=>{ const [y,m,d]=s.split("-").map(Number); return d+"."+m; };
  const cats={}; for(const it of t.items){ const k=catKey(it); cats[k]=(cats[k]||0)+spend(it); }
  const top=Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const rows=[["💰",g.mode==="mine"?"הוצאות":"הוצאנו",fmt(t.spent,showCur)],["📅","ימים",String(t.days)],["📊","ממוצע ליום",t.days?fmt(t.spent/t.days,showCur):"—"],["🧾","הוצאות",String(t.items.filter(i=>i.kind!=="transfer").length)]];
  const h=document.createElement("div"); h.className="glc-h"; const n=document.createElement("b"); n.textContent="📍 "+t.name; const x=document.createElement("button"); x.type="button"; x.className="glc-x"; x.textContent="✕"; x.setAttribute("aria-label","סגירה"); x.onclick=()=>townCard(null,g); h.append(n,x); o.appendChild(h);
  const gr=document.createElement("div"); gr.className="glc-g"; for(const [ic,l,v] of rows){ const d=document.createElement("div"); const s1=document.createElement("small"); s1.textContent=ic+" "+l; const s2=document.createElement("b"); s2.className="num"; s2.textContent=v; d.append(s2,s1); gr.appendChild(d); } o.appendChild(gr);
  if(g.mode==="mine"){ const sp=document.createElement("div"); sp.className="glc-split"; for(const [ic,l,v] of [["🙋","אישי",t.alone||0],["👫","משותף (החלק שלך)",t.spent-(t.alone||0)]]){ const d=document.createElement("div"); const a=document.createElement("b"); a.className="num"; a.textContent=fmt(v,showCur); const b=document.createElement("small"); b.textContent=ic+" "+l; d.append(a,b); sp.appendChild(d); } o.appendChild(sp); }
  const vs=document.createElement("div"); vs.className="glc-v"; vs.textContent= !t.visits.length ? "🧳 שולם מראש · עוד לא הגענו לכאן" : (t.visits.length>1?"🔁 "+t.visits.length+" ביקורים: ":"🗓️ ")+t.visits.map(([a,b])=>sd(a)+(b?"–"+sd(b):" ← עכשיו")).join(" · ")+(t.est?" · ההגעה משוערת (מתחילת הטיול)":""); o.appendChild(vs);
  if(top.length){ const c=document.createElement("div"); c.className="glc-c"; c.textContent=top.map(([k,v])=>catName(k).split(" ")[0]+" "+Math.round(v/Math.max(1,t.spent)*100)+"%").join("  "); o.appendChild(c); }
  box.appendChild(o); buzz(8); sound("tick");
  if(!calm()) o.animate([{opacity:0,transform:"translateY(14px) scale(.96)"},{opacity:1,transform:"none"}],{duration:320,easing:"cubic-bezier(.2,.9,.3,1.2)"});
}
/* the places by hand: town, arrival, departure (or "still here"), and what that covers in the expenses */
let stopsEdit=false;
function renderStopsEditor(){
  const card=$("journey"); if(!card) return; let bar=$("jBar"), ed=$("jEdit");
  if(!bar){ bar=document.createElement("div"); bar.id="jBar"; bar.className="j-bar"; card.appendChild(bar); ed=document.createElement("div"); ed.id="jEdit"; ed.className="j-edit"; card.appendChild(ed); }
  bar.innerHTML="";
  const here=document.createElement("button"); here.type="button"; here.className="btn small"; here.textContent="📍 איפה אנחנו?"; here.onclick=()=>{ buzz(6); askHere(true); };
  const edb=document.createElement("button"); edb.type="button"; edb.className="btn small"; edb.textContent=stopsEdit?"סגירה":"✏️ היעדים שלנו"; edb.onclick=()=>{ stopsEdit=!stopsEdit; buzz(5); renderStopsEditor(); };
  bar.append(here); if(canWrite) bar.append(edb);
  ed.hidden=!stopsEdit; if(!stopsEdit){ ed.innerHTML=""; return; }
  ed.innerHTML="";
  const st=tripStart()||todayStr(), today=todayStr();
  const rows=tripStops().map(x=>({n:x.n,lat:x.lat,lng:x.lng,d:x.d0||x.d,e:x.e||"",at:x.at||0,by:x.by||null,pinned:!!x.pin,ctry:x.c||null}));
  /* first time with an automatic first stop: suggest the start of the trip as its arrival */
  if(rows.length&&rows[0].d>st&&!tripStops()[0].m) rows[0].d=st;
  const names=[...TOWNS.map(t=>t[0])].sort((a,b)=>a.localeCompare(b,"he"));
  const ex=S.items.filter(it=>it.kind!=="transfer");
  const sd=s=>{ const [y,m,d]=s.split("-").map(Number); return d+"."+m; };
  const list=document.createElement("div"); list.className="j-rows"; ed.appendChild(list);
  const draw=()=>{ list.innerHTML="";
    /* the same day-by-day split the globe uses, on the rows as they are now */
    const ord=rows.slice().sort((a,b)=>a.d.localeCompare(b.d)||a.at-b.at), own0=stayDays(ord.map(r=>({...r,e:r.e||null,m:1}))), own=new Map([...own0].map(([d,k])=>[d,ord[k]]));
    rows.forEach((r,i)=>{ const card=document.createElement("div"); card.className="j-stay";
      const top=document.createElement("div"); top.className="j-top";
      const num=document.createElement("span"); num.className="j-num"; num.textContent=String(i+1);
      const sel=document.createElement("select"); sel.setAttribute("aria-label","יעד"); for(const n of names){ const o=document.createElement("option"); o.value=n; o.textContent=n; if(n===r.n) o.selected=true; sel.appendChild(o); }
      if(!names.includes(r.n)){ const o=document.createElement("option"); o.value=r.n; o.textContent=r.n; o.selected=true; sel.prepend(o); }
      { const o=document.createElement("option"); o.value="__other"; o.textContent="✏️ עיר אחרת…"; sel.appendChild(o); }
      sel.onchange=()=>{ if(sel.value==="__other"){ const nm=(prompt("איך קוראים לעיר?","")||"").trim().slice(0,40); if(!nm){ sel.value=r.n; return; }
          /* a city not in the list: at the place picked in "📍 איפה אנחנו" if it is the same name, else the country's main city
             until it is marked on the globe */
          const h=HERE&&HERE.name===nm?HERE:null, P=PLACE[S.localCur]||[r.lat,r.lng]; r.n=nm; r.lat=h?h.lat:P[0]; r.lng=h?h.lng:P[1]; r.ctry=S.localCur; r.pinned=!!h; draw(); return; }
        r.n=sel.value; const t=TOWNS.find(x=>x[0]===sel.value); if(t){ r.lat=t[1]; r.lng=t[2]; } };
      const x=document.createElement("button"); x.type="button"; x.className="j-x"; x.textContent="✕"; x.setAttribute("aria-label","הסרת יעד"); x.onclick=()=>{ rows.splice(i,1); draw(); };
      top.append(num,sel,x); card.appendChild(top);
      /* a city of our own: its country, and its exact spot marked with a finger on the globe */
      if(!TOWNS.some(t=>t[0]===r.n)){ const row=document.createElement("div"); row.className="j-own";
        const cs=document.createElement("select"); cs.setAttribute("aria-label","מדינה"); const near=Object.keys(PLACE).map(k=>[k,kmBetween(r.lat,r.lng,PLACE[k][0],PLACE[k][1])]).sort((a,b)=>a[1]-b[1])[0];
        if(!r.ctry) r.ctry=near?near[0]:S.localCur;
        for(const k of Object.keys(PLACE).filter(k=>CTRY[k]).sort((a,b)=>CTRY[a].split(" ").slice(1).join(" ").localeCompare(CTRY[b].split(" ").slice(1).join(" "),"he"))){ const o=document.createElement("option"); o.value=k; o.textContent=CTRY[k]; if(k===r.ctry) o.selected=true; cs.appendChild(o); }
        cs.onchange=()=>{ r.ctry=cs.value; const P=PLACE[cs.value]; if(P&&!r.pinned){ r.lat=P[0]; r.lng=P[1]; } else if(P&&kmBetween(r.lat,r.lng,P[0],P[1])>2500){ r.lat=P[0]; r.lng=P[1]; r.pinned=false; } draw(); };
        const pin=document.createElement("button"); pin.type="button"; pin.className="btn small j-pin"; pin.textContent= r.pinned ? "🎯 סומן · לסמן שוב" : "🎯 לסמן על הגלובוס";
        pin.onclick=()=>pickOnGlobe(r.n,[r.lat,r.lng],(lat,lng)=>{ r.lat=lat; r.lng=lng; r.pinned=true; draw(); });
        const st=document.createElement("small"); st.className="j-own-st"; st.textContent= r.pinned ? "📍 במקום שסימנתם" : "📍 בינתיים על העיר הראשית של המדינה";
        row.append(cs,pin,st); card.appendChild(row); }
      const dates=document.createElement("div"); dates.className="j-dates";
      const lab=(t,inp)=>{ const l=document.createElement("label"); l.className="j-lab"; const s=document.createElement("span"); s.textContent=t; l.append(s,inp); return l; };
      const a=document.createElement("input"); a.type="date"; a.value=r.d; a.min=st; a.max=today; a.onchange=()=>{ r.d=a.value; draw(); };
      dates.appendChild(lab("🛬 הגעה",a));
      if(r.e){ const b=document.createElement("input"); b.type="date"; b.value=r.e; b.min=r.d; b.max=today; b.onchange=()=>{ r.e=b.value; draw(); };
        const l=lab("🛫 עזיבה",b); const still=document.createElement("button"); still.type="button"; still.className="j-still"; still.textContent="עוד כאן"; still.onclick=()=>{ r.e=""; draw(); }; l.appendChild(still); dates.appendChild(l); }
      else { const l=document.createElement("div"); l.className="j-lab"; const s=document.createElement("span"); s.textContent="🛫 עזיבה"; const b=document.createElement("button"); b.type="button"; b.className="j-here"; b.textContent="✓ עוד לא עזבנו · לחיצה כשעוזבים";
        b.onclick=()=>{ const nx=rows[i+1]; r.e=nx?nx.d:today; draw(); }; l.append(s,b); dates.appendChild(l); }
      card.appendChild(dates);
      /* what these dates cover in the expenses (counted exactly as the globe will), so a wrong date shows at once */
      const mine=[...own].filter(([,k])=>k===r).map(([d])=>d).sort(), set=new Set(mine), its=ex.filter(it=>it.town ? it.town===r.n&&rows.filter(q=>q.n===r.n).sort((a,b)=>a.d.localeCompare(b.d)).filter((q,j)=>j===0||q.d<=(it.date||"")).pop()===r : set.has(it.date)), span=mine.length, sum=its.reduce((s,it)=>s+spend(it),0);
      const info=document.createElement("div"); info.className="j-info"; info.textContent= r.e&&r.e<r.d ? "⚠️ תאריך העזיבה לפני ההגעה" : span>0 ? "לפי ההוצאות: "+(span===1?"יום אחד":span+" ימים")+" ("+sd(mine[0])+(span>1?"–"+sd(mine[span-1]):"")+") · "+its.length+" הוצאות · "+fmt(sum,showCur) : "אין ימים ליעד הזה (יעד אחר מכסה את התאריכים)";
      card.appendChild(info);
      list.appendChild(card); }); };
  draw();
  const add=document.createElement("button"); add.type="button"; add.className="btn small"; add.textContent="➕ יעד נוסף";
  add.onclick=()=>{ const last=rows[rows.length-1];
    /* arrival: the day the last place was left, or the next day with expenses after its arrival (dates can be changed) */
    let d= !last ? st : last.e ? last.e : (ex.map(i=>i.date).filter(x=>x>last.d).sort()[0]||today); if(d>today) d=today;
    const t=TOWNS.find(x=>x[0]==="בנגקוק"); rows.push({n:t[0],lat:t[1],lng:t[2],d,e:"",at:Date.now(),by:me||null}); draw(); setTimeout(()=>{ const s=list.querySelectorAll("select"); s[s.length-1]&&s[s.length-1].focus(); },60); };
  const save=document.createElement("button"); save.type="button"; save.className="btn primary small"; save.textContent="שמירה";
  save.onclick=async()=>{ const clean=rows.filter(r=>r.n&&/^\d{4}-\d{2}-\d{2}$/.test(r.d)).map(r=>({n:r.n,lat:r.lat,lng:r.lng,d:r.d,e:/^\d{4}-\d{2}-\d{2}$/.test(r.e)?r.e:null,m:1,at:r.at||Date.now(),by:r.by||me||null,...(r.pinned?{pin:1}:{}),...(r.ctry&&!TOWNS.some(t=>t[0]===r.n)?{c:r.ctry}:{})})).sort((a,b)=>a.d.localeCompare(b.d)||a.at-b.at);
    const ok=await patchTrip(curTrip,{stops:clean}); if(ok){ STOPS=[]; stopsEdit=false; const T=tripById(curTrip); if(T) T.stops=clean; for(const id of ["jMap","jMapMe"]){ const b=$(id); if(b) b.innerHTML=""; } GLOBE=null; GLOBE_ME=null; renderJourneys(); toast("🧭 היעדים עודכנו"); } };
  const f=document.createElement("div"); f.className="actions"; f.append(add,save); ed.appendChild(f);
}
/* when it first comes into view: from the whole earth to where you have been, then the route draws itself */
function globeWhenSeen(box,g){ if(box.__io) box.__io.disconnect(); if(!("IntersectionObserver" in window)||calm()){ Object.assign(g,{lon:g.fit.lon,lat:g.fit.lat,R:g.fit.R,draw:1,flown:true}); drawGlobe(g); return; }
  const io=new IntersectionObserver(es=>{ if(!es.some(e=>e.isIntersecting)) return; io.disconnect(); g.flown=true;
    const from={lon:g.lon,lat:g.lat,R:g.R}, to=g.fit, t0=performance.now(), T1=1900, T2=1300;
    const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    const step=n=>{ if(g.cv.__g!==g) return; const t=Math.min(1,(n-t0)/T1), e=ease(t);
      g.lon=from.lon+(to.lon-from.lon)*e; g.lat=from.lat+(to.lat-from.lat)*e; g.R=Math.exp(Math.log(from.R)+(Math.log(to.R)-Math.log(from.R))*Math.min(1,e*1.15));
      g.draw=Math.max(0,Math.min(1,(n-t0-T1*0.75)/T2)); drawGlobe(g); if(n-t0<T1+T2) requestAnimationFrame(step); else { g.draw=1; drawGlobe(g); } };
    requestAnimationFrame(step); },{threshold:.4}); box.__io=io; io.observe(box); }
/* sideways turns the globe (up/down still scrolls the page), a double tap flies out and back, a tap on a place opens its card */
function globeInput(cv){
  if(cv.__wired) return; cv.__wired=true; const pts=new Map(); let lastTap=0, d0=0, R0=0, tapAt=null;
  cv.style.touchAction="pan-y";
  cv.addEventListener("pointerdown",e=>{ cv.setPointerCapture(e.pointerId); pts.set(e.pointerId,[e.clientX,e.clientY]); tapAt=[e.clientX,e.clientY,Date.now()]; const g=cv.__g; if(!g) return; g.drag=true;
    if(pts.size===2){ const [a,b]=[...pts.values()]; d0=Math.hypot(a[0]-b[0],a[1]-b[1]); R0=g.R; }
    const now=Date.now(); if(pts.size===1&&now-lastTap<300){ const out=g.R>Math.min(g.W,g.H)*.6; flyGlobe(out?{lon:g.lon,lat:g.lat*.3,R:Math.min(g.W,g.H)*.42}:g.fit,g); } lastTap=now; });
  cv.addEventListener("pointermove",e=>{ const p=pts.get(e.pointerId); if(!p) return; const g=cv.__g; if(!g) return;
    if(pts.size===1){ const k=57.3/g.R; g.lon-=(e.clientX-p[0])*k; g.lat=Math.max(-80,Math.min(80,g.lat+(e.clientY-p[1])*k)); }
    pts.set(e.pointerId,[e.clientX,e.clientY]);
    if(pts.size===2){ const [a,b]=[...pts.values()]; const d=Math.hypot(a[0]-b[0],a[1]-b[1]); if(d0) g.R=Math.max(Math.min(g.W,g.H)*.3,Math.min(12000,R0*d/d0)); }
    if(!g.raf) g.raf=requestAnimationFrame(()=>{ g.raf=0; drawGlobe(g); }); });
  cv.addEventListener("pointerup",e=>{ const g=cv.__g; if(g&&tapAt&&Math.hypot(e.clientX-tapAt[0],e.clientY-tapAt[1])<8&&Date.now()-tapAt[2]<500){ const r=cv.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top;
      if(g.pick){ const ll=gunproj(g,x,y); if(ll){ cv.parentNode.classList.remove("picking"); g.pick(ll[0],ll[1]); } tapAt=null; return; }
      const h=(g.hits||[]).map(h=>[h,Math.hypot(h.x-x,h.y-y)]).filter(([h,d])=>d<=h.r).sort((a,b)=>a[1]-b[1])[0]; townCard(h?h[0].t:null,g); } tapAt=null; });
  const up=e=>{ pts.delete(e.pointerId); if(pts.size<2) d0=0; if(!pts.size&&cv.__g) cv.__g.drag=false; };
  cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
}
function flyGlobe(to,g){ g=g||GLOBE; if(!g) return; const from={lon:g.lon,lat:g.lat,R:g.R}, t0=performance.now(), T=1100; buzz(6);
  const step=n=>{ const t=Math.min(1,(n-t0)/T), e=1-Math.pow(1-t,3); g.lon=from.lon+(to.lon-from.lon)*e; g.lat=from.lat+(to.lat-from.lat)*e; g.R=Math.exp(Math.log(from.R)+(Math.log(to.R)-Math.log(from.R))*e); drawGlobe(g); if(t<1) requestAnimationFrame(step); };
  requestAnimationFrame(step); }
function drawJourney(){}

/* ================= good morning: a short card the first time the app opens each day ================= */
/* celebrations wait while a sheet is open (adding an expense, the account…) so they never cover what you are doing */
const sheetOpen=()=>!!document.querySelector(".sheet-bg:not([hidden])");
function morning(){
  const k="trip-morning-"+(me||""), t=todayStr(); if(!loaded||!me||load(k)===t||document.documentElement.dataset.quick) return;
  /* it is a hello, not an interruption: if you were busy in the first seconds, skip it for today */
  if(sheetOpen()||performance.now()>12000){ store(k,t); return; } store(k,t);
  if(calm()) return;
  const h=new Date().getHours(), hi= h<5?"לילה טוב":h<12?"בוקר טוב":h<17?"צהריים טובים":h<21?"ערב טוב":"לילה טוב";
  const st=tripStart(), day= st&&st<=t ? daysBetween(st,t)+1 : null;
  const here=hereNow&&hereNow(); const town= here? (nearTown(here.lat,here.lng)||{}).name : null;
  const y=new Date(); y.setDate(y.getDate()-1); const ys=y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0");
  const yday=spreadAll(S.items.filter(it=>it.kind!=="transfer")).filter(it=>it.date===ys).reduce((a,it)=>a+spend(it),0);
  const sky=($("hero")&&$("hero").dataset.sky)||"day";
  const o=document.createElement("div"); o.className="morning"; o.dataset.sky=sky; o.setAttribute("role","dialog"); o.setAttribute("aria-label",hi);
  const ic= sky==="night"?"🌙":sky==="dusk"?"🌅":"☀️";
  o.innerHTML='<div class="mn-orb"></div><div class="mn-in"><div class="mn-ic"></div><h2></h2><p class="mn-day"></p><p class="mn-y"></p><small>נגיעה כדי להמשיך</small></div>';
  o.querySelector(".mn-ic").textContent=ic; o.querySelector("h2").textContent=hi+", "+nm(me);
  const dayLine=tw=>[day?"יום "+day+" בטיול":null,tw].filter(Boolean).join(" · ")||(S.trip||"");
  o.querySelector(".mn-day").textContent=dayLine(town);
  /* the place may arrive a moment after the card opens */
  if(!town) window.__mnTown=tw=>{ const e=o.querySelector(".mn-day"); if(o.isConnected&&e) e.textContent=dayLine(tw); };
  o.querySelector(".mn-y").textContent= yday>0 ? "אתמול הוצאתם ביחד "+fmt(yday,showCur) : "אתמול לא נרשמו הוצאות משותפות";
  document.body.appendChild(o); buzz(8);
  const bye=()=>{ if(!o.isConnected) return; o.classList.add("out"); setTimeout(()=>o.remove(),520); };
  o.addEventListener("click",bye); setTimeout(bye,3200);
}

/* ================= medals: little milestones along the way ================= */
const MEDALS=[
  ["first","🧾","ההוצאה הראשונה","רשמתם את ההוצאה הראשונה",d=>d.n>=1],
  ["n50","🎯","50 הוצאות","50 הוצאות משותפות",d=>d.n>=50],
  ["n100","💯","100 הוצאות","100 הוצאות משותפות",d=>d.n>=100],
  ["n250","🏆","250 הוצאות","250 הוצאות משותפות",d=>d.n>=250],
  ["week","🎒","שבוע בדרכים","7 ימים בטיול",d=>d.day>=7],
  ["month","🗺️","חודש בדרכים","30 ימים בטיול",d=>d.day>=30],
  ["d100","🌏","100 ימים","100 ימים בטיול",d=>d.day>=100],
  ["c2","🛂","מדינה חדשה","הוצאות בשתי מדינות",d=>d.countries>=2],
  ["c4","✈️","ארבע מדינות","הוצאות בארבע מדינות",d=>d.countries>=4],
  ["streak7","🔥","שבוע ברצף","7 ימים ברצף עם רישום",d=>d.streak>=7],
  ["settle","🤝","חשבון נקי","סגרתם חשבון בפעם הראשונה",d=>d.transfers>=1],
  ["thrift","🌱","שבוע חסכוני","7 ימים אחרונים מתחת לממוצע",d=>d.thrift],
  ["owl","🦉","ינשוף לילה","הוצאה שנרשמה אחרי חצות",d=>d.owl],
  ["towns3","📍","שלוש ערים","שלוש עצירות במסע",d=>d.towns>=3],
  ["towns10","🧭","עשר ערים","עשר עצירות במסע",d=>d.towns>=10]];
/* an action can be undone for ~10 seconds: medals only count what stayed */
let UNDO_MS=12000;
function medalData(){
  const cut=Date.now()-UNDO_MS, kept=S.items.filter(it=>!(it.createdAt>cut));
  const ex=kept.filter(it=>it.kind!=="transfer"), t=todayStr(), st=tripStart();
  const day= st&&st<=t ? daysBetween(st,t)+1 : 0;
  const countries=new Set(ex.map(it=>locOf(it)).filter(k=>k&&k!=="prep"&&k!=="?")).size;
  const onTrip=ex.filter(it=>st&&it.date>=st&&locOf(it)!=="prep"), tot=onTrip.reduce((a,it)=>a+ils(it),0), avg=day>0?tot/day:0;
  const w=new Date(); w.setDate(w.getDate()-7); const ws=w.getFullYear()+"-"+String(w.getMonth()+1).padStart(2,"0")+"-"+String(w.getDate()).padStart(2,"0");
  const last7=onTrip.filter(it=>it.date>ws&&it.date<t).reduce((a,it)=>a+ils(it),0);
  const owl=ex.some(it=>{ try{ const h=+new Date(it.createdAt).toLocaleTimeString("en-GB",{hour:"2-digit",hour12:false,...(it.tz?{timeZone:it.tz}:{})}).slice(0,2); return h>=0&&h<4; }catch(e){ return false; } });
  return {n:ex.length,day,countries,streak:streak(),transfers:kept.filter(it=>it.kind==="transfer").length,thrift:day>=14&&avg>0&&last7<avg*7*0.9,owl,towns:journeyLegs().length};
}
function medalsNow(){ const d=medalData(); return MEDALS.filter(m=>{ try{ return m[4](d); }catch(e){ return false; } }).map(m=>m[0]); }
let medalQ=[], medalBusy=false;
function checkMedals(){
  if(!loaded||!me) return; if(sheetOpen()){ clearTimeout(window.__mdT); window.__mdT=setTimeout(checkMedals,4000); return; } const k="trip-medals-"+me; const seen=new Set((load(k)||"").split(",").filter(Boolean)); const first=!load(k);
  /* something new may still be undone: look again once the undo time is over */
  if(S.items.some(it=>it.createdAt>Date.now()-UNDO_MS)){ clearTimeout(window.__mdU); window.__mdU=setTimeout(checkMedals,UNDO_MS+800); }
  const now=medalsNow(), fresh=now.filter(id=>!seen.has(id));
  /* a medal whose reason was undone (a test settle-up, a deleted expense) is taken back */
  const keep=[...seen].filter(id=>now.includes(id)); if(!first&&keep.length!==seen.size&&!fresh.length){ store(k,keep.join(",")||","); return; }
  if(!fresh.length) return;
  store(k,[...new Set([...keep,...now])].join(","));
  /* the first time: no parade of old ones, one note with how many there are */
  if(first){ if(now.length>1) setTimeout(()=>!sheetOpen()&&toast("🏅 כבר יש לכם "+now.length+" מדליות","לאוסף",()=>{ fillAcct(); openSheet("acctSheet"); setTimeout(()=>$("medalBox")&&$("medalBox").scrollIntoView({behavior:"smooth",block:"center"}),300); }),4200); else if(now.length===1){ medalQ.push(now[0]); showMedal(); } return; }
  medalQ.push(...fresh); showMedal();
}
function showMedal(){
  if(medalBusy||!medalQ.length) return; if(sheetOpen()){ setTimeout(showMedal,3000); return; } const id=medalQ.shift(), m=MEDALS.find(x=>x[0]===id); if(!m) return showMedal();
  if(calm()){ toast(m[1]+" מדליה חדשה: "+m[2]); return showMedal(); }
  medalBusy=true; const o=document.createElement("div"); o.className="medal-o"; o.setAttribute("role","dialog"); o.setAttribute("aria-label","מדליה חדשה: "+m[2]);
  o.innerHTML='<div class="medal"><div class="medal-f"><span></span></div><div class="medal-b"></div></div><div class="medal-t"><small>מדליה חדשה</small><b></b><span></span></div>';
  o.querySelector(".medal-f span").textContent=m[1]; o.querySelector(".medal-t b").textContent=m[2]; o.querySelector(".medal-t span").textContent=m[3];
  document.body.appendChild(o); buzz([10,40,10,40,24]); sound("chime"); setTimeout(confetti,700);
  const bye=()=>{ if(!o.isConnected) return; o.classList.add("out"); setTimeout(()=>{ o.remove(); medalBusy=false; setTimeout(showMedal,300); },450); };
  o.addEventListener("click",bye); setTimeout(bye,3600);
}
function renderMedals(){
  const box=$("medalGrid"); if(!box) return; box.innerHTML=""; const have=new Set(loaded?medalsNow():[]);
  for(const m of MEDALS){ const d=document.createElement("div"); d.className="mdl"+(have.has(m[0])?" on":""); d.title=m[3];
    const i=document.createElement("span"); i.className="mdl-i"; i.textContent=have.has(m[0])?m[1]:"🔒"; const t=document.createElement("b"); t.textContent=m[2]; const s=document.createElement("small"); s.textContent=m[3];
    d.append(i,t,s); box.appendChild(d); }
  $("medalCount").textContent=have.size+" מתוך "+MEDALS.length;
}

function renderStats(){
  try{ renderRecords(); }catch(e){}
  const mineOk=!!me;
  if(!mineOk) stScope="trip";
  try{ renderJourney("shared"); }catch(e){}
  seg($("stScope"),mineOk?[["trip","כל הטיול"],["mine","שלי"]]:[["trip","כל הטיול"]],v=>v===stScope,v=>{stScope=v;renderStats();});
  const items=statItems();
  const byMonth={}; let all=0;
  for(const it of items){ const m=monthOf(it); if(!m) continue; const v=spend(it); byMonth[m]=(byMonth[m]||0)+v; all+=v; }
  const months=Object.keys(byMonth).sort();
  if(!stMonth||(stMonth!=="all"&&!byMonth[stMonth])) stMonth= byMonth[thisMonth()]?thisMonth():(months[months.length-1]||thisMonth());
  const ALL=stMonth==="all", inMon=it=> ALL || monthOf(it)===stMonth, mLabel= ALL ? "כל הטיול" : monthName(stMonth,true);
  /* monthly bars: one series, one hue; the chosen month is emphasized */
  const M=$("stMonths"); M.innerHTML="";
  const max=Math.max(1,...months.map(m=>byMonth[m]));
  if(!months.length){ M.innerHTML='<div class="hint" style="align-self:center">עוד אין הוצאות.</div>'; }
  /* "everything so far": one more choice before the months */
  if(months.length>1){ const b=document.createElement("button"); b.type="button"; b.className="mbar mall"; b.setAttribute("role","listitem"); b.setAttribute("aria-pressed",String(ALL)); b.setAttribute("aria-label","כל הטיול עד עכשיו: "+fmt(all,showCur));
    const v=document.createElement("span"); v.className="v num"; v.textContent=fmt(all,showCur); const c=document.createElement("span"); c.className="col"; c.textContent="∑"; const l=document.createElement("span"); l.className="l"; l.textContent="עד עכשיו";
    b.append(v,c,l); b.onclick=()=>{ stMonth="all"; renderStats(); }; M.appendChild(b); }
  for(const m of months){
    const b=document.createElement("button"); b.type="button"; b.className="mbar"; b.setAttribute("role","listitem"); b.setAttribute("aria-pressed",String(m===stMonth));
    b.setAttribute("aria-label",monthName(m,true)+": "+fmt(byMonth[m],showCur)); b.title=monthName(m,true)+": "+fmt(byMonth[m],showCur);
    const v=document.createElement("span"); v.className="v num"; v.textContent=fmt(byMonth[m],showCur);
    const c=document.createElement("span"); c.className="col"; c.style.height=Math.max(3,Math.round(byMonth[m]/max*120))+"px";
    const l=document.createElement("span"); l.className="l"; l.textContent=monthName(m,false);
    b.append(v,c,l); b.onclick=()=>{ stMonth=m; renderStats(); }; M.appendChild(b);
  }
  const inM=items.filter(inMon);
  const tot=inM.reduce((s,it)=>s+spend(it),0);
  /* per day = calendar days, as everywhere else: from the month's first expense to today (this month) or to its last one */
  const md=inM.map(it=>it.date).filter(Boolean).sort(), mEnd= (ALL||stMonth===thisMonth()) ? todayStr() : md[md.length-1];
  const days= md.length&&mEnd>=md[0] ? daysBetween(md[0],mEnd)+1 : 1;
  $("stLbl").textContent= stScope==="mine" ? "ההוצאות של "+nm(me) : "ההוצאות של כל הטיול";
  $("stMonthName").textContent=mLabel;
  money($("stMonthTotal"),tot,showCur,"stm:"+stScope);
  if(stScope==="mine"){
    /* summary split: alone (personal) vs. my part of what we shared */
    const sum=list=>list.filter(inMon).reduce((s,it)=>s+spend(it),0);
    const own= acct&&acctFor===me ? sum(P) : 0, shared=sum(myShareItems());
    const others=active().filter(p=>p.id!==me).map(p=>p.name);
    $("stCount").textContent=fmt(own,showCur); $("stL1").textContent="🙋 לבד (אישי)";
    $("stPerDay").textContent=fmt(shared,showCur); $("stL2").textContent="👫 "+(others.length===1?"עם "+others[0]:"משותף")+" (החלק שלך)";
    $("stAllTime").textContent=fmt(own+shared,showCur); $("stL3").textContent= ALL ? "💜 ביחד בטיול" : "💜 ביחד החודש";
  }else{
    $("stCount").textContent=nUniq(inM); $("stL1").textContent="הוצאות";
    $("stPerDay").textContent=fmt(tot/days,showCur); $("stL2").textContent="ממוצע ליום";
    $("stAllTime").textContent=fmt(all,showCur); $("stL3").textContent="כל הטיול";
  }
  showinRow($("stShowin"));
  const lock=$("stLock"); lock.hidden=!(stScope==="mine"&&!(acct&&acctFor===me));
  lock.textContent="כרגע מוצג רק החלק שלך בהוצאות המשותפות. כדי לכלול גם את ההוצאות האישיות, נכנסים פעם אחת ל\"האישי שלי\" עם הסיסמה.";
  /* by category, with amount and share */
  const cats={}; for(const it of inM){ const k=catKey(it); cats[k]=(cats[k]||0)+spend(it); }
  $("stCatTitle").textContent="📊 על מה הלך הכסף "+(ALL?"בכל הטיול":"ב"+monthName(stMonth,true).split(" ")[0]);
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
  const mineP= acct&&acctFor===me ? PT() : [];
  /* both: my own expenses plus my part of the shared ones */
  const locItems=spreadAll( locScope==="mine" ? mineP : locScope==="both" ? [...myShareItems(),...mineP] : S.items.filter(it=>it.kind!=="transfer") );
  $("stLocNote").hidden=!((locScope==="mine"||locScope==="both")&&!(acct&&acctFor===me));
  /* one rule everywhere: anything dated before the trip started counts as "before the trip", and a country's days are
     the calendar days from the first to the last day there (days without expenses count too, as in the daily average) */
  const stC=tripStart(), tdC=todayStr();
  $("stLocTitle").textContent="🌏 לפי מדינה · "+(ALL?"כל הטיול":monthName(stMonth,true).split(" ")[0]);
  const PCc=placeCtx(); const byC={}; for(const it of locItems.filter(inMon)){ const k=PCc.effLoc(it); const o=byC[k]||(byC[k]={v:0,days:new Set(),min:null,max:null}); o.v+=spend(it); if(it.date){ o.days.add(it.date); if(!o.min||it.date<o.min) o.min=it.date; if(!o.max||it.date>o.max) o.max=it.date; } }
  /* days in a country: from the first day there (not before the trip) to the last, or to today while you're there; within the chosen month */
  const mFrom= ALL ? null : stMonth+"-01";
  for(const [k,o] of Object.entries(byC)){ if(k==="prep"||k==="?"||!o.min) continue; let from=o.min; if(stC&&from<stC) from=stC; if(mFrom&&from<mFrom) from=mFrom;
    const end= k===S.localCur&&!S.home&&(ALL||stMonth===thisMonth()) ? tdC : o.max; o.span= end>=from ? daysBetween(from,end)+1 : 0; }
  const ce=Object.entries(byC).sort((x,y)=>y[1].v-x[1].v); const cm=ce[0]?.[1].v||1; const CC=$("stCountries"); CC.innerHTML="";
  if(!ce.length) CC.innerHTML='<div class="hint">עוד אין הוצאות.</div>';
  for(const [k,o] of ce){
    const r=document.createElement("div"); r.className="cat";
    r.innerHTML='<span></span><div class="bar"><i></i></div><span class="amtpct"><b class="num"></b><small></small></span>';
    r.children[0].textContent=locName(k); r.querySelector("i").style.width=(o.v/cm*100).toFixed(1)+"%"; if(k!=="?"){ r.classList.add("tap"); r.title="סיכום של "+locName(k); r.onclick=()=>openRecap(k); }
    r.querySelector("b").textContent=fmt(o.v,showCur);
    const n=o.span||o.days.size; { const sm=r.querySelector("small"); sm.textContent=""; if(!(k==="prep"||k==="?")&&o.span!==0){ const pd=document.createElement("b"); pd.className="num pd"; pd.textContent=fmt(o.v/(n||1),showCur); sm.append(pd," ליום · "+(n===1?"יום אחד":n+" ימים")); } }
    CC.appendChild(r);
  }
  /* who paid (whole trip only) */
  $("stPayersCard").hidden= stScope!=="trip";
  if(stScope==="trip"){
    const pay={}; for(const it of inM){ if(it.payer===EACH){ const sh=sharesOf(it); for(const k in sh) pay[k]=(pay[k]||0)+spend(it)*sh[k]; } else pay[it.payer]=(pay[it.payer]||0)+spend(it); }
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
  s=String(s);
  /* a decimal comma ("1,5", "12,50", or one just typed) when there is no dot and only one comma */
  if(!s.includes(".")&&(s.match(/,/g)||[]).length===1&&/,\d{0,2}$/.test(s)&&!/^\d{1,3}(,\d{3})+$/.test(s)) s=s.replace(",",".");
  s=s.replace(/,/g,"").replace(/[^\d.]/g,"");
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
for(const id of ["fAmt","pAmt","cA","cB","cwAmt","cwFee","caAmt","cxAmt","cxGot","budAmt","budSAmt"]) liveGroup($(id));
/* ================= sound: tiny sounds made on the fly (no files), with a switch in settings =================
   On iPhone the "ambient" audio session means the silent switch also silences these. */
const SND={ctx:null,on:()=>load("trip-sound")!=="off"};
function sndCtx(){ if(SND.ctx) return SND.ctx; try{ try{ if(navigator.audioSession) navigator.audioSession.type="ambient"; }catch(e){}
  const C=window.AudioContext||window.webkitAudioContext; if(!C) return null; SND.ctx=new C(); }catch(e){ return null; } return SND.ctx; }
document.addEventListener("pointerdown",()=>{ const c=SND.ctx; if(c&&c.state==="suspended") c.resume().catch(()=>{}); },{passive:true});
function tone(c,f,t0,dur,vol,type,glide){ const o=c.createOscillator(), g=c.createGain(); o.type=type||"sine"; o.frequency.setValueAtTime(f,t0); if(glide) o.frequency.exponentialRampToValueAtTime(glide,t0+dur);
  g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(vol,t0+0.008); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur); o.connect(g).connect(c.destination); o.start(t0); o.stop(t0+dur+0.02); }
function sound(kind){
  if(!SND.on()||calm()) return; const c=sndCtx(); if(!c) return; if(c.state==="suspended") c.resume().catch(()=>{});
  const t=c.currentTime+0.01;
  if(kind==="coin"){ tone(c,1568,t,.16,.07,"triangle"); tone(c,2093,t+.07,.28,.06,"triangle"); }
  else if(kind==="tick"){ tone(c,900,t,.035,.025,"square"); }
  else if(kind==="swoosh"){ tone(c,620,t,.22,.045,"sine",160); }
  else if(kind==="chime"){ [1046,1318,1568,2093].forEach((f,i)=>tone(c,f,t+i*.09,.5,.045,"sine")); }
  else if(kind==="coins"){ for(let i=0;i<5;i++) tone(c,1500+Math.random()*700,t+i*.06,.12,.035,"triangle"); }
}

/* ================= our own amount keypad (phones): big keys, a tap of haptics, quick amounts ================= */
const touchy=(()=>{ try{ return matchMedia("(pointer:coarse)").matches; }catch(e){ return false; } })();
function niceAmt(v){ if(!(v>0)) return 0; const p=Math.pow(10,Math.floor(Math.log10(v))), m=v/p; return (m<1.5?1:m<3.5?2:m<7.5?5:10)*p; }
function keypad(inputId,curOf,nextId){
  const inp=$(inputId); if(!inp||!touchy) return;
  inp.setAttribute("inputmode","none");   /* our keys instead of the phone keyboard */
  const box=document.createElement("div"); box.className="kpad"; box.hidden=true; box.setAttribute("role","group"); box.setAttribute("aria-label","מקשי סכום");
  const quick=document.createElement("div"); quick.className="kp-quick"; box.appendChild(quick);
  const grid=document.createElement("div"); grid.className="kp-grid"; box.appendChild(grid);
  const keys=["1","2","3","4","5","6","7","8","9",".","0","⌫"];
  const set=v=>{ inp.value=v; inp.dispatchEvent(new Event("input",{bubbles:true})); };
  const raw=()=>String(inp.value||"").replace(/,/g,"");
  /* A key acts the moment it is touched. On iPhone a tap is "touch" first and "click" ~later; in between
     the phone moved focus around and the click landed on whatever was under the finger (the name field),
     which closed the keys. Cancelling the touch keeps focus where it is and there is no stray click at all. */
  const tap=(b,fn)=>{ let t=null;
    b.addEventListener("touchstart",e=>{ e.preventDefault(); t=e.changedTouches[0]; b.classList.add("down"); },{passive:false});
    b.addEventListener("touchmove",e=>{ const m=e.changedTouches[0]; if(t&&(Math.abs(m.clientX-t.clientX)>14||Math.abs(m.clientY-t.clientY)>14)){ t=null; b.classList.remove("down"); } },{passive:true});
    b.addEventListener("touchend",e=>{ e.preventDefault(); b.classList.remove("down"); if(t){ t=null; fn(); } },{passive:false});
    b.addEventListener("touchcancel",()=>{ t=null; b.classList.remove("down"); });
    b.addEventListener("mousedown",e=>e.preventDefault());
    b.addEventListener("click",fn);   /* mouse, keyboard, assistive tech */ };
  for(const k of keys){ const b=document.createElement("button"); b.type="button"; b.className="kp-k"+(k==="⌫"?" kp-del":""); b.textContent=k; if(k==="⌫") b.setAttribute("aria-label","מחיקה");
    tap(b,()=>{ buzz(5); let r=raw();
      if(k==="⌫") r=r.slice(0,-1); else if(k==="."){ if(!r.includes(".")) r=(r||"0")+"."; } else { if(r==="0") r=""; if(/\.\d\d$/.test(r)) return; if(r.replace(".","").length>=9) return; r+=k; }
      set(r); });
    grid.appendChild(b); }
  const paintQuick=()=>{ quick.innerHTML=""; const c=curOf();
    for(const ils of [10,30,100]){ const v=niceAmt(conv(ils,"ILS",c)); const b=document.createElement("button"); b.type="button"; b.className="kp-q"; b.dir="ltr"; b.textContent="+"+fmt(v,c);
      tap(b,()=>{ buzz(6); const n=(parseFloat(raw())||0)+v; set(String(Math.round(n*100)/100)); if(window.Motion) Motion.pop(inp); }); quick.appendChild(b); }
    const nx=document.createElement("button"); nx.type="button"; nx.className="kp-next"; nx.textContent="שם ←"; nx.onclick=()=>{ buzz(5); box.hidden=true; try{ $(nextId).focus(); }catch(e){} }; quick.appendChild(nx); };
  inp.closest(".amount").after(box);
  /* the keys open when the amount is touched and close only when another field is touched (or "שם ←");
     they never follow focus, which the phone moves around on its own */
  const show=()=>{ if(box.hidden){ paintQuick(); box.hidden=false; } };
  inp.addEventListener("focus",show); inp.addEventListener("click",show); inp.addEventListener("touchstart",show,{passive:true});
  document.addEventListener("pointerdown",e=>{ if(box.hidden) return; const t=e.target; if(t===inp||box.contains(t)) return; if(t.closest&&t.closest("input,textarea,select,.mic")) box.hidden=true; },{capture:true,passive:true});
}
keypad("fAmt",()=>cur.fCur||S.localCur,"fDesc");
keypad("pAmt",()=>cur.pCur||S.localCur,"pDesc");

/* ================= long press on an expense: a menu over a blurred page, like the iPhone ================= */
(()=>{
  let timer=0, x0=0, y0=0, row=null, fired=false;
  const cancel=()=>{ clearTimeout(timer); timer=0; if(row) row.classList.remove("pressing"); row=null; };
  document.addEventListener("pointerdown",e=>{
    const r=e.target.closest("#ledger .row[data-id], #pLedger .row[data-id]"); if(!r||e.target.closest("button")||!canWrite) return;
    row=r; x0=e.clientX; y0=e.clientY; fired=false; r.classList.add("pressing");
    timer=setTimeout(()=>{ timer=0; if(!row) return; fired=true; const rr=row; cancel(); peek(rr); },430);
  },{passive:true});
  document.addEventListener("pointermove",e=>{ if(timer&&(Math.abs(e.clientX-x0)>8||Math.abs(e.clientY-y0)>8)) cancel(); },{passive:true});
  document.addEventListener("pointerup",cancel,{passive:true}); document.addEventListener("pointercancel",cancel,{passive:true});
  document.addEventListener("scroll",cancel,{passive:true});
  /* the click that ends a long press must not also open the row */
  document.addEventListener("click",e=>{ if(fired){ fired=false; e.stopPropagation(); e.preventDefault(); } },true);
  document.addEventListener("contextmenu",e=>{ if(e.target.closest("#ledger .row, #pLedger .row")) e.preventDefault(); });
})();
/* ================= versions: what each edit replaced =================
   Kept inside the expense itself (for a personal one, inside its encryption). Restoring is itself kept,
   so a restore can be undone too. */
const HIST_KEEP=10;
function histPush(h,old){ return [...(Array.isArray(h)?h:[]),{at:Date.now(),by:me||null,old}].slice(-HIST_KEEP); }
const HIST_LBL={desc:"שם",amount:"סכום",cur:"מטבע",payer:"מי שילם",among:"מי מתחלק",pcts:"אחוזים",cat:"קטגוריה",catLabel:"תיאור",date:"תאריך",loc:"מדינה",town:"עיר",pm:"תשלום",spread:"פריסה",offTrip:"של הטיול",recur:"חוזר"};
function histVal(k,v,it){ if(v==null||v==="") return "—"; if(k==="amount") return fmt(+v,(it&&it.cur)||"ILS"); if(k==="payer") return v===EACH?"כל אחד על עצמו":nm(v); if(k==="among") return (v||[]).map(nm).join(", ");
  if(k==="pcts") return Object.entries(v||{}).map(([a,b])=>nm(a)+" "+b+"%").join(", "); if(k==="cat") return catName(v); if(k==="date"){ const [y,m,d]=String(v).split("-"); return +d+"."+(+m); } if(k==="loc") return locName(v); if(k==="pm") return v==="card"?"כרטיס":"מזומן"; if(k==="spread") return v&&v.n>1?v.n+" ימים":"בלי"; if(k==="offTrip") return v?"לא קשור לטיול":"של הטיול"; if(k==="recur") return v==="month"?"כל חודש":"פעם אחת"; return String(v); }
async function restoreVersion(id,personal,old){
  const it=(personal?P:S.items).find(x=>x.id===id); if(!it){ toast("ההוצאה לא נמצאה"); return; }
  const now={}; for(const k of Object.keys(old)) now[k]=it[k]??null;   /* what is there now, so this restore can be undone */
  let ok;
  if(personal){ const c=await loadAcct(); if(!c) return; const {id:_i,_mine,_alone,...rest}=it; const next={...rest,...old,hist:histPush(it.hist,now)}; for(const k of Object.keys(next)) if(next[k]===null&&k!=="town") delete next[k];
    ok=await run(async()=>EXP().doc(id).set(await encFor(c,next))); }
  else { const patch={...old,hist:histPush(it.hist,now)}; ok=await run(()=>EXP().doc(id).update(patch)); }
  if(ok){ buzz(8); toast("↩️ שוחזר: "+(old.desc||it.desc||"הוצאה"),"ביטול",()=>restoreVersion(id,personal,now),10000); }
}
function showHistory(it,personal){
  const h=(Array.isArray(it.hist)?it.hist:[]).slice().reverse(); const o=document.createElement("div"); o.className="hist-bg"; o.setAttribute("role","dialog"); o.setAttribute("aria-label","גרסאות קודמות");
  const box=document.createElement("div"); box.className="hist"; o.appendChild(box);
  const head=document.createElement("div"); head.className="hist-h"; const t=document.createElement("b"); t.textContent="🕘 גרסאות קודמות · "+(it.desc||"הוצאה"); const x=document.createElement("button"); x.type="button"; x.className="btn small"; x.textContent="סגירה"; head.append(t,x); box.appendChild(head);
  const close=()=>o.remove(); x.onclick=close; o.addEventListener("click",e=>{ if(e.target===o) close(); });
  if(!h.length){ const e=document.createElement("p"); e.className="hint"; e.textContent="עוד לא נערכה. מעכשיו כל עריכה נשמרת כאן ואפשר לחזור אליה."; box.appendChild(e); }
  for(const v of h){ const row=document.createElement("div"); row.className="hist-r";
    const when=document.createElement("small"); const d=new Date(v.at||0); when.textContent=(v.by?nm(v.by)+(fem(v.by)?" ערכה":" ערך")+" · ":"")+d.getDate()+"."+(d.getMonth()+1)+" "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
    const ch=document.createElement("div"); ch.className="hist-c";
    for(const [k,ov] of Object.entries(v.old||{})){ if(k==="rIls"||k==="hist"||((ov==null||ov==="")&&(it[k]==null||it[k]===""))) continue; const l=document.createElement("div"); l.textContent=(HIST_LBL[k]||k)+": היה "+histVal(k,ov,{...it,...v.old}); ch.appendChild(l); }
    const b=document.createElement("button"); b.type="button"; b.className="btn small primary"; b.textContent="↩️ להחזיר לזה"; b.onclick=()=>{ close(); restoreVersion(it.id,personal,v.old); };
    row.append(when,ch,b); box.appendChild(row); }
  document.body.appendChild(o);
}
/* ================= notes on an expense: "what was this?" =================
   A short thread kept on the shared expense itself; both of you see it. A note from the other one is
   "new" until you open it (remembered on this phone). */
function notesOf(it){ return Array.isArray(it&&it.notes)?it.notes:[]; }
function noteUnseen(it){ const n=notesOf(it); if(!n.length||!me) return false; const last=n[n.length-1]; if(last.by===me) return false; return (+load("trip-note-"+it.id)||0)<(last.at||0); }
function showNotes(it){
  const o=document.createElement("div"); o.className="hist-bg"; o.setAttribute("role","dialog"); o.setAttribute("aria-label","הערות");
  const box=document.createElement("div"); box.className="hist"; o.appendChild(box); const close=()=>{ o.remove(); renderLedger(); }; o.addEventListener("click",e=>{ if(e.target===o) close(); });
  const draw=()=>{ const cur=S.items.find(x=>x.id===it.id)||it, list=notesOf(cur); box.innerHTML="";
    const h=document.createElement("div"); h.className="hist-h"; const t=document.createElement("b"); t.textContent="💬 "+(cur.desc||"הוצאה")+" · "+fmt(+cur.amount,cur.cur); const x=document.createElement("button"); x.type="button"; x.className="btn small"; x.textContent="סגירה"; x.onclick=close; h.append(t,x); box.appendChild(h);
    if(!list.length){ const e=document.createElement("p"); e.className="hint"; e.textContent="עוד אין הערות. אפשר לשאול \"מה זה היה?\" או להוסיף פרט שכדאי לזכור."; box.appendChild(e); }
    for(const n of list){ const r=document.createElement("div"); r.className="note"+(n.by===me?" mine":""); const w=document.createElement("small"); const d=new Date(n.at||0);
      w.textContent=nm(n.by)+" · "+d.getDate()+"."+(d.getMonth()+1)+" "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); const p=document.createElement("div"); p.textContent=n.t; r.append(w,p); box.appendChild(r); }
    if(canWrite&&me){ const row=document.createElement("div"); row.className="note-new"; const inp=document.createElement("input"); inp.type="text"; inp.maxLength=200; inp.placeholder="כתיבת הערה…"; inp.setAttribute("enterkeyhint","send");
      const b=document.createElement("button"); b.type="button"; b.className="btn primary small"; b.textContent="שליחה";
      const send=async()=>{ const v=inp.value.trim(); if(!v) return; b.disabled=true; const note={id:uid("n"),by:me,at:Date.now(),t:v};
        const ok=await run(()=>EXP().doc(it.id).update({notes:[...notesOf(S.items.find(x=>x.id===it.id)||it),note].slice(-50)}));
        if(ok){ store("trip-note-"+it.id,String(note.at)); notifyOthers("💬 "+nm(me)+" על \""+(it.desc||"הוצאה")+"\": "+v); buzz(6); const c=S.items.find(x=>x.id===it.id); if(c&&!notesOf(c).some(n=>n.id===note.id)) c.notes=[...notesOf(c),note]; draw(); } else b.disabled=false; };
      b.onclick=send; inp.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); send(); } }); row.append(inp,b); box.appendChild(row); setTimeout(()=>{ try{ inp.focus(); }catch(e){} },60); }
    const last=list[list.length-1]; if(last) store("trip-note-"+it.id,String(last.at||0)); };
  draw(); document.body.appendChild(o);
}
function peek(r){
  const id=r.dataset.id, personal=!!r.closest("#pLedger"); const it=(personal?P:S.items).find(x=>x.id===id); if(!it||it._fee) return;
  buzz([8,20,10]); sound("tick");
  const o=document.createElement("div"); o.className="peek"; o.setAttribute("role","dialog"); o.setAttribute("aria-label","פעולות על "+(it.desc||"הוצאה"));
  const rect=r.getBoundingClientRect(); const card=r.cloneNode(true); card.classList.remove("open","pressing","enter","fresh"); card.classList.add("peek-row");
  card.querySelectorAll(".acts").forEach(a=>a.remove());
  const menu=document.createElement("div"); menu.className="peek-menu";
  const close=()=>{ o.classList.add("out"); setTimeout(()=>o.remove(),220); };
  const item=(ic,label,fn,danger)=>{ const b=document.createElement("button"); b.type="button"; b.className="peek-i"+(danger?" danger":""); const t=document.createElement("span"); t.textContent=label; const i=document.createElement("span"); i.textContent=ic; b.append(t,i); b.onclick=()=>{ close(); setTimeout(fn,120); }; menu.appendChild(b); };
  if(it.kind!=="transfer"){ item("✏️","עריכה",()=>personal?pStartEdit(it):startEdit(it)); item("🔁","שוב להיום",()=>again(it,personal)); item("🕘","גרסאות קודמות"+(it.hist&&it.hist.length?" ("+it.hist.length+")":""),()=>showHistory(it,personal)); if(!personal) item("💬","הערות"+(notesOf(it).length?" ("+notesOf(it).length+")":""),()=>showNotes(it)); }
  item("📤","שיתוף",()=>{ const txt=(it.kind==="transfer"?"💸 "+nm(it.payer)+" ← "+nm(it.to):catEmoji(it)+" "+(it.desc||"הוצאה"))+" · "+fmt(+it.amount,it.cur)+" · "+dayLabel(it.date); if(navigator.share) navigator.share({text:txt}).catch(()=>{}); else { try{ navigator.clipboard.writeText(txt); toast("📋 הועתק"); }catch(e){} } });
  item("🗑","מחיקה",()=>delItem(it,personal),true);
  o.append(card,menu); document.body.appendChild(o);
  /* the row lifts from where it was; the menu opens under it (or above, if there is no room) */
  const top=Math.min(Math.max(rect.top,70),innerHeight-rect.height-250);
  card.style.top=top+"px"; card.style.left=rect.left+"px"; card.style.width=rect.width+"px";
  menu.style.top=(top+rect.height+10)+"px";
  if(!calm()){ card.animate([{transform:`translateY(${rect.top-top}px) scale(1)`},{transform:"scale(1.03)"}],{duration:380,easing:"cubic-bezier(.2,.9,.3,1.25)",fill:"forwards"});
    menu.animate([{opacity:0,transform:"scale(.85) translateY(-10px)"},{opacity:1,transform:"none"}],{duration:300,delay:60,easing:"cubic-bezier(.2,.9,.3,1.2)",fill:"backwards"}); }
  o.addEventListener("click",e=>{ if(e.target===o) close(); });
}

/* ================= swipe between screens: shared ↔ personal ↔ graphs ================= */
(()=>{
  const ORDER=["shared","personal","stats"];
  let x0=0,y0=0,t0=0,ok=false;
  document.addEventListener("touchstart",e=>{
    const t=e.touches[0]; ok=false; if(e.touches.length!==1) return;
    if(!loaded||!me||document.querySelector(".sheet-bg:not([hidden]), .peek, .recap:not([hidden]), .morning, .medal-o")) return;
    /* not from the screen edges (the phone's own back gesture), not on things that swipe or scroll sideways */
    if(t.clientX<24||t.clientX>innerWidth-24) return;
    if(e.target.closest(".swipe, .row, .seg, .showin, input, textarea, .kpad, .recent, .jmap, .tablewrap, #tabbar, .ticket")) return;
    x0=t.clientX; y0=t.clientY; t0=Date.now(); ok=true;
  },{passive:true});
  document.addEventListener("touchend",e=>{
    if(!ok) return; ok=false; const t=e.changedTouches[0], dx=t.clientX-x0, dy=t.clientY-y0, dt=Date.now()-t0;
    if(Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*2.2||dt>650) return;
    const i=ORDER.indexOf(view); if(i<0) return;
    /* right-to-left: a swipe to the left moves on to the next tab (they sit from right to left) */
    const j= dx<0 ? i+1 : i-1; if(j<0||j>=ORDER.length) { if(window.Motion&&!calm()) document.getElementById("app").animate([{transform:"translateX(0)"},{transform:`translateX(${dx<0?-14:14}px)`},{transform:"none"}],{duration:300,easing:"ease-out"}); return; }
    buzz(6); lastTap={x:dx<0?innerWidth*0.15:innerWidth*0.85,y:innerHeight*0.5,t:Date.now()}; goView(ORDER[j]);
  },{passive:true});
})();

/* ================= add by voice: "ארוחת ערב 450 באט, גלי שילמה בכרטיס" fills the form ================= */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function voiceParse(text){
  let t=" "+String(text||"").replace(/[,،]/g," ").replace(/\s+/g," ").trim()+" "; const out={};
  const num=t.match(/(\d[\d.]*)/); if(num){ out.amount=parseFloat(num[1]); t=t.replace(num[1]," "); }
  const curs=[[/\s(ב?בה?א?ט|באטים|baht|bht)\s/i,"THB"],[/\s(ש[״"]?ח|שקל(ים)?)\s/,"ILS"],[/\s(דולר(ים)?|\$)\s/,"USD"],[/\s(יורו|אירו)\s/,"EUR"],[/\s(דונג)\s/,"VND"],[/\s(קיפ)\s/,"LAK"],[/\s(רינגיט)\s/,"MYR"]];
  for(const [re,c] of curs){ const m=t.match(re); if(m){ out.cur=c; t=t.replace(m[0]," "); break; } }
  if(/\s(ש?ב?מזומן)\s/.test(t)){ out.pm="cash"; t=t.replace(/\s(ש?ב?מזומן)\s/," "); }
  else if(/\s(ב?כרטיס|ב?אשראי|ב?ויזה)\s/.test(t)){ out.pm="card"; t=t.replace(/\s(ב?כרטיס|ב?אשראי|ב?ויזה)\s/," "); }
  if(/\s(אני\s)?שילמתי\s/.test(t)){ out.payer=me; t=t.replace(/\s(אני\s)?שילמתי\s/," "); }
  else for(const p of active()){ const re=new RegExp("\\s"+p.name+"\\s(שילמה|שילם)\\s"); if(re.test(t)){ out.payer=p.id; t=t.replace(re," "); break; } }
  out.desc=t.replace(/\s(על|ב|של|ו)\s*$/,"").replace(/\s+/g," ").trim().replace(/^[\-–:.]+|[\-–:.]+$/g,"").trim();
  return out;
}
function voiceFill(kind,text){
  const v=voiceParse(text), f=kind==="me"?"p":"f";
  if(v.cur) cur[f+"Cur"]=v.cur;
  if(v.amount>0){ $(f+"Amt").value=String(v.amount); $(f+"Amt").dispatchEvent(new Event("input",{bubbles:true})); }
  if(v.desc){ $(f+"Desc").value=v.desc; $(f+"Desc").dispatchEvent(new Event("input",{bubbles:true})); }
  if(kind==="me"){ if(v.pm) pform.pm=v.pm; renderPForm(); }
  else { if(v.payer) form.payer=v.payer; if(v.pm) form.pm=v.pm; renderForm(); }
  toast("🎤 "+text); buzz([6,30,8]); sound("tick");
  return v;
}
function micFor(kind){
  const inp=$(kind==="me"?"pAmt":"fAmt"); if(!SR||!inp||inp.closest(".amount").querySelector(".mic")) return;
  const b=document.createElement("button"); b.type="button"; b.className="mic"; b.textContent="🎤"; b.setAttribute("aria-label","רישום בקול");
  b.addEventListener("pointerdown",e=>e.preventDefault());
  b.onclick=()=>{
    if(b.classList.contains("on")){ try{ b.__r&&b.__r.stop(); }catch(e){} return; }
    let r; try{ r=new SR(); }catch(e){ toast("🎤 הטלפון לא מאפשר הקלטה כאן"); return; }
    r.lang="he-IL"; r.interimResults=false; r.maxAlternatives=1; b.__r=r;
    r.onresult=e=>{ const t=e.results[0]&&e.results[0][0]&&e.results[0][0].transcript; if(t) voiceFill(kind,t); };
    r.onerror=e=>{ if(e.error==="not-allowed"||e.error==="service-not-allowed") toast("🎤 צריך לאשר מיקרופון וזיהוי דיבור בהגדרות ספארי"); else if(e.error!=="no-speech"&&e.error!=="aborted") toast("🎤 לא הצלחתי לשמוע. נסו שוב"); };
    r.onend=()=>b.classList.remove("on");
    try{ r.start(); b.classList.add("on"); buzz(8); toast("🎤 מדברים: למשל \"ארוחת ערב 450 באט, גלי שילמה בכרטיס\""); }catch(e){ b.classList.remove("on"); }
  };
  inp.closest(".amount").appendChild(b);
}
micFor("shared"); micFor("me");

/* ================= split a restaurant bill by dishes ================= */
let DISH=null;
function dishOpen(){
  const ppl=active(); DISH=DISH||{rows:[{a:"",w:"all"},{a:"",w:"all"}],extra:""};
  let box=$("fDish"); if(!box){ box=document.createElement("div"); box.id="fDish"; box.className="dish"; $("fPcts").after(box); }
  box.hidden=false; box.innerHTML="";
  const h=document.createElement("div"); h.className="dish-h"; h.textContent="🧾 מכניסים כל מנה ומסמנים של מי היא"; box.appendChild(h);
  const list=document.createElement("div"); list.className="dish-list"; box.appendChild(list);
  const sum=document.createElement("div"); sum.className="dish-sum"; 
  const calc=()=>{ const base={}; let tot=0; for(const p of ppl) base[p.id]=0;
    for(const r of DISH.rows){ const a=parseFloat(String(r.a).replace(/,/g,""))||0; if(!a) continue; tot+=a; if(r.w==="all") for(const p of ppl) base[p.id]+=a/ppl.length; else base[r.w]=(base[r.w]||0)+a; }
    const x=1+(parseFloat(DISH.extra)||0)/100; return {tot:tot*x,each:Object.fromEntries(Object.entries(base).map(([k,v])=>[k,v*x]))}; };
  const paint=()=>{ const c=calc(), cu=cur.fCur||S.localCur; sum.textContent= c.tot>0 ? "סה״כ "+fmt(c.tot,cu)+" · "+ppl.map(p=>p.name+" "+fmt(c.each[p.id]||0,cu)).join(" · ") : "עוד אין מנות"; };
  DISH.rows.forEach((r,i)=>{ const row=document.createElement("div"); row.className="dish-r";
    const a=document.createElement("input"); a.className="num"; a.inputMode="decimal"; a.placeholder="מחיר"; a.value=r.a; a.setAttribute("aria-label","מחיר מנה "+(i+1)); a.oninput=()=>{ r.a=a.value; paint(); };
    const s=document.createElement("div"); s.className="seg dish-w"; row.append(a,s); list.appendChild(row);
    seg(s,[...ppl.map(p=>[p.id,p.name]),["all","ביחד"]],v=>v===r.w,v=>{ r.w=v; dishOpen(); });
    if(DISH.rows.length>1){ const x=document.createElement("button"); x.type="button"; x.className="dish-x"; x.textContent="✕"; x.setAttribute("aria-label","הסרת מנה"); x.onclick=()=>{ DISH.rows.splice(i,1); dishOpen(); }; row.appendChild(x); } });
  const add=document.createElement("button"); add.type="button"; add.className="btn small"; add.textContent="➕ עוד מנה"; add.onclick=()=>{ DISH.rows.push({a:"",w:"all"}); dishOpen(); setTimeout(()=>{ const ins=box.querySelectorAll(".dish-r input"); ins[ins.length-1]&&ins[ins.length-1].focus(); },50); };
  const ex=document.createElement("label"); ex.className="dish-ex"; ex.textContent="טיפ / שירות / מס %"; const ei=document.createElement("input"); ei.className="num"; ei.inputMode="decimal"; ei.placeholder="0"; ei.value=DISH.extra; ei.oninput=()=>{ DISH.extra=ei.value; paint(); }; ex.appendChild(ei);
  const go=document.createElement("button"); go.type="button"; go.className="btn primary"; go.textContent="✓ להחיל על ההוצאה";
  go.onclick=()=>{ const c=calc(); if(!(c.tot>0)){ toast("קודם מכניסים מחיר למנה"); return; }
    const ids=ppl.map(p=>p.id).filter(id=>(c.each[id]||0)>0); let pc={}, acc=0;
    ids.forEach((id,i)=>{ const v= i===ids.length-1 ? Math.round((100-acc)*100)/100 : Math.round(c.each[id]/c.tot*10000)/100; pc[id]=v; acc+=v; });
    $("fAmt").value=String(Math.round(c.tot*100)/100); $("fAmt").dispatchEvent(new Event("input",{bubbles:true}));
    form.among=ids; form.mode=ids.length>1?"pct":"equal"; form.pcts=pc; box.hidden=true; DISH=null; renderForm(); buzz(10); sound("coin");
    toast("🧾 חולק לפי מנות: "+ids.map(id=>nm(id)+" "+pc[id]+"%").join(" · ")); };
  const foot=document.createElement("div"); foot.className="dish-f"; foot.append(add,ex); box.append(foot,sum,go);
  const cl=document.createElement("button"); cl.type="button"; cl.className="link dish-close"; cl.textContent="סגירה"; cl.onclick=()=>{ box.hidden=true; }; box.appendChild(cl);
  paint();
}
(()=>{ const m=$("fMode"); if(!m) return; const b=document.createElement("button"); b.type="button"; b.className="btn small dish-open"; b.id="fDishBtn"; b.textContent="🧾 לפי מנות (מסעדה)"; b.onclick=()=>{ buzz(6); dishOpen(); }; $("fPcts").after(b); })();

/* ================= the week that was: a short story on Sunday ================= */
function weekRange(){ const d=new Date(); const end=new Date(d.getFullYear(),d.getMonth(),d.getDate()-1), st=new Date(end); st.setDate(end.getDate()-6);
  const f=x=>x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0"); return {from:f(st),to:f(end)}; }
function weekly(force){
  if(!loaded||!me) return; const w=weekRange(), k="trip-week-"+me;
  if(!force&&(new Date().getDay()!==0||load(k)===w.to)) return;
  const n=S.items.filter(it=>it.kind!=="transfer"&&it.date>=w.from&&it.date<=w.to).length; if(!force&&n<3) return;
  store(k,w.to); if(force) return openRecap(null,w);
  setTimeout(()=>{ if(sheetOpen()||document.querySelector(".morning,.medal-o")) return toast("🎬 השבוע שלכם מוכן","לצפייה",()=>openRecap(null,w),10000); openRecap(null,w); },600);
}

/* ================= shake to undo ================= */
(()=>{
  let peaks=[];
  /* iPhone allows the motion sensor only from a finished tap (click), not from the start of a touch.
     Ask on a tap until it is allowed; remember the answer. */
  const need=()=>window.DeviceMotionEvent&&typeof DeviceMotionEvent.requestPermission==="function";
  window.askMotion=async(loud)=>{ if(!need()){ if(loud) toast(window.DeviceMotionEvent?"🫨 ניעור לביטול פעיל":"🫨 הטלפון הזה לא מאפשר ניעור"); return true; }
    /* both asked in the same tap, together: iPhone accepts a request only while it still counts as coming from the tap
       (asking for the tilt after the first answer came back was silently refused) */
    try{ const po= window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function" ? DeviceOrientationEvent.requestPermission().catch(()=>"denied") : Promise.resolve("granted");
      const [r,o]=await Promise.all([DeviceMotionEvent.requestPermission().catch(()=>"denied"),po]);
      store("trip-motion",r); store("trip-orient",o); if(loud) toast(r==="granted"&&o==="granted"?"🫨 החיישן פעיל: ניעור לביטול והטיית הכרטיס":r==="granted"?"🫨 ניעור פעיל · הטיית הכרטיס לא אושרה":"🫨 חיישן התנועה לא אושר. אם סירבת פעם, האייפון לא שואל שוב: מוחקים את האפליקציה מהמסך הראשי ומוסיפים מחדש, או בהגדרות ← ספארי ← מתקדם ← נתוני אתרים"); return r==="granted"; }catch(e){ return false; } };
  let askedNow=false;
  document.addEventListener("click",e=>{ if(askedNow||e.target.closest&&e.target.closest(".kpad,.amount")) return; if(need()&&!((load("trip-motion")==="granted"&&load("trip-orient")==="granted")||load("trip-motion")==="denied")){ askedNow=true; window.askMotion(false); } },{capture:true,passive:true});
  addEventListener("devicemotion",e=>{ const a=e.accelerationIncludingGravity||e.acceleration; if(!a) return;
    const m=Math.sqrt((a.x||0)**2+(a.y||0)**2+(a.z||0)**2); const now=Date.now();
    if(m<17) return; peaks=peaks.filter(t=>now-t<1100); if(peaks.length&&now-peaks[peaks.length-1]<120) return; peaks.push(now);
    if(peaks.length>=3){ peaks=[]; shook(); } },{passive:true});
})();
function shook(){
  if(document.querySelector(".shake-ask")) return;
  const u=lastUndo&&Date.now()<lastUndo.until?lastUndo:null; buzz([12,40,12]);
  if(!u){ toast("🤷 אין כרגע משהו לבטל"); return; }
  toast("↩️ לבטל את הפעולה האחרונה? "+u.msg.replace(/^\S+\s/,""),"כן, לבטל",()=>{ lastUndo=null; u.act(); sound("swoosh"); },8000);
  const T=$("toast"); T.classList.add("shake-ask"); setTimeout(()=>T.classList.remove("shake-ask"),8000);
}


/* ---- floating buttons: back to top, quick add ---- */
let addHome=null;
function openAdd(kind){
  if(view==="stats"&&!kind) goView("shared");
  const id= kind==="me"||(!kind&&view==="personal"&&me) ? "pForm" : "form";
  if(id==="pForm"&&!(acct&&acctFor===me)){ window.scrollTo({top:0,behavior:"smooth"}); $("lockPw").focus(); return; }
  const f=$(id); addHome={f,parent:f.parentNode,next:f.nextSibling};
  for(const k of ["fMore","pMore"]) if($(k)) $(k).open=false;
  $("addSlot").appendChild(f); f.hidden=false; openSheet("addSheet");
  if(id==="pForm") renderPForm(); else renderForm();
  renderAddKind(id==="pForm"?"me":"shared");
  try{ fDateChips(); pDateChips(); }catch(e){}
  setTimeout(()=>{ try{ $(id==="pForm"?"pAmt":"fAmt").focus(); }catch(e){} },80);
}
/* shared / personal switch at the top of the add sheet: what was typed comes along */
function renderAddKind(k){ const el=$("addKind"); el.hidden=!(me&&person(me)&&canWrite); if(el.hidden) return;
  seg(el,[["shared","👫 משותפת"],["me","🔐 אישית"]],v=>v===k,v=>{ if(v!==k) switchAddKind(v); }); }
function switchAddKind(kind){
  const toMe=kind==="me";
  if(toMe&&!(acct&&acctFor===me)){ toast("🔒 קודם פותחים את האישי עם הסיסמה","לאישי",()=>{ closeSheet("addSheet"); goView("personal"); }); renderAddKind("shared"); return; }
  const [a,b]= toMe ? [["fAmt","fDesc","fDate"],["pAmt","pDesc","pDate"]] : [["pAmt","pDesc","pDate"],["fAmt","fDesc","fDate"]];
  a.forEach((id,i)=>{ if($(id).value) $(b[i]).value=$(id).value; });
  if(toMe){ cur.pCur=cur.fCur||cur.pCur; pform.cat=form.cat||pform.cat; pform.catSet=form.catSet; pform.pm=form.pm||pform.pm; }
  else { cur.fCur=cur.pCur||cur.fCur; form.cat=pform.cat||form.cat; form.catSet=pform.catSet; form.pm=pform.pm||form.pm; }
  restoreAdd(); openAdd(toMe?"me":"shared"); buzz(6);
}
/* the save button says what it will add, so it can be checked without scrolling */
function saveLabel(){
  const one=(btn,amtId,c,editing)=>{ const v=parseFloat(String($(amtId).value).replace(/,/g,"")); btn.textContent=(editing?"שמירת שינויים":"הוספה")+(v>0?" · "+fmt(v,c):""); };
  one($("saveBtn"),"fAmt",cur.fCur||S.localCur,!!editingId); one($("pSave"),"pAmt",cur.pCur||S.localCur,!!pEditingId);
}
$("fAmt").addEventListener("input",saveLabel); $("pAmt").addEventListener("input",saveLabel);
$("fAmt").addEventListener("input",()=>{ if(form.spread) renderSpread("f",form); }); $("pAmt").addEventListener("input",()=>{ if(pform.spread) renderSpread("p",pform); });
let cxHome=null;
function sheetExchange(on){
  const X=$("cashX"), f=$("addSlot").querySelector("#form,#pForm");
  if(on){
    if(!(me&&acct&&acctFor===me)){ toast("🔒 החלפה נשמרת בארנק האישי. פותחים קודם את האישי עם הסיסמה","לאישי",()=>{ closeSheet("addSheet"); goView("personal"); }); return; }
    if(!cxHome) cxHome={parent:X.parentNode,next:X.nextSibling};
    if(f) f.hidden=true; $("addSlot").appendChild(X); X.hidden=false; $("addXBtn").textContent="🧾 חזרה להוצאה";
    if(!cur.cxF||cur.cxF===cur.cxT){ cur.cxF="ILS"; cur.cxT=S.localCur!=="ILS"?S.localCur:(S.dest||"THB"); }
    setCurBtn("cxFrom",cur.cxF); setCurBtn("cxTo",cur.cxT); cxLossShow(); setTimeout(()=>{ try{ $("cxAmt").focus(); }catch(e){} },60);
  } else { if(cxHome){ cxHome.parent.insertBefore(X,cxHome.next); X.hidden=cashForm!=="x"; cxHome=null; } if(f) f.hidden=false; $("addXBtn").textContent="💱 צ׳יינג׳"; }
}
$("addXBtn").onclick=()=>{ buzz(6); sheetExchange(!$("addSlot").contains($("cashX"))); };
function restoreAdd(){ if($("addSlot").contains($("cashX"))) sheetExchange(false); if(!addHome) return; addHome.parent.insertBefore(addHome.f,addHome.next); addHome.f.hidden=true; addHome=null; }
$("fabAdd").onclick=openAdd;
$("addCtaBtn").onclick=()=>{ buzz(8); openAdd(); };
$("pAddCtaBtn").onclick=()=>{ buzz(8); openAdd(); };
$("sfBud").onclick=()=>{ buzz(6); fillAcct(); openSheet("acctSheet"); setTimeout(()=>$("budgetBox").scrollIntoView({behavior:"smooth",block:"center"}),250); };
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
    $("fDesc").value=it.desc||""; $("fAmt").value=group(String(it.amount)); cur.fCur=it.cur||cur.fCur; form.cat=it.cat||"other"; form.catSet=true; $("fCatLabel").value=it.catLabel||""; form.pm=it.pm||form.pm;
    $("fDate").value=todayStr(); renderForm(); openAdd(); setTimeout(()=>{ try{ $("fAmt").select(); }catch(e){} },120); });
  if(view==="personal"&&acct&&acctFor===me) chipsFor($("pRecentChips"),P,it=>{
    $("pDesc").value=it.desc||""; $("pAmt").value=group(String(it.amount)); cur.pCur=it.cur||cur.pCur; pform.cat=it.cat||"other"; pform.catSet=true; $("pCatLabel").value=it.catLabel||""; pform.pm=it.pm||pform.pm;
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
for(const k of ["fDate","pDate"]) if($(k)){ $(k).addEventListener("change",moreSum); $(k).addEventListener("input",moreSum); }
const pDateChips=$("pDate")&&$("pDateChips")?dateChips($("pDate"),$("pDateChips")):()=>{};
/* bottom tab bar */
function renderTabs(){
  const on=loaded&&!!me&&!!person(me)&&canWrite; $("tabbar").hidden=!on; document.body.classList.toggle("has-tabs",on);
  let onBtn=null;
  const acctOpen=!$("acctSheet").hidden;
  for(const b of $("tabbar").querySelectorAll("[data-v]")){ const v=b.dataset.v; const act= v==="acct" ? acctOpen : (!acctOpen&&v===view); b.classList.toggle("on",act); b.setAttribute("aria-current",act?"page":"false"); if(act) onBtn=b; }
  tabInd(onBtn);
}
/* a soft pill behind the active tab that glides to the next one (motion.js) */
function tabInd(btn){
  const bar=$("tabbar"); let i=bar.querySelector(".tab-ind");
  if(!btn||bar.hidden){ if(i) i.style.opacity="0"; return; }
  if(!i){ i=document.createElement("i"); i.className="tab-ind"; i.setAttribute("aria-hidden","true"); bar.prepend(i); }
  const R=bar.getBoundingClientRect(), b=btn.getBoundingClientRect(), w=Math.min(64,b.width-8), x=b.left-R.left+(b.width-w)/2;
  const prev=i.dataset.x!==undefined&&i.style.opacity!=="0" ? +i.dataset.x : null; if(prev===x) return;
  i.dataset.x=x; i.style.opacity="1"; i.style.width=w+"px"; i.style.transform="translateX("+x+"px)";
  if(M&&prev!==null&&!calm()) M.animate(i,[{transform:"translateX("+prev+"px) scaleX(1)"},{transform:"translateX("+((prev+x)/2)+"px) scaleX(1.35)",offset:.45},{transform:"translateX("+x+"px) scaleX(1)"}],{spring:"smooth"});
}
$("tabbar").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; buzz(6);
  if(b.id==="tabAdd") return openAdd();
  const v=b.dataset.v; if(v==="acct") return $("acctBtn").click();
  if(v===view){ window.scrollTo({top:0,behavior:"smooth"}); return; }
  if(v==="personal"&&!me) return; goView(v); });
$("addClose").onclick=()=>closeSheet("addSheet");
$("fabUp").onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
window.addEventListener("scroll",()=>{ $("fabUp").hidden= window.scrollY<400; },{passive:true});
{ let tl=0, tp=0;
  $("lSearch").addEventListener("input",()=>{ clearTimeout(tl); tl=setTimeout(()=>{ listLim.shared=LIST_STEP; renderLedger(); },140); });
  $("pSearch").addEventListener("input",()=>{ clearTimeout(tp); tp=setTimeout(()=>{ listLim.mine=LIST_STEP; renderPersonal(); },140); }); }

/* ---- daily summary in the personal view: alone / together / combined, in shekels unless chosen otherwise ---- */
function renderDaily(){
  $("dShowin").hidden=true; dayCur=showCur;   /* one currency choice for the whole page: the card above */
  const share=spreadAll(myShareItems()); const days=new Map();
  const add=(it,k,v)=>{ if(!it.date) return; const o=days.get(it.date)||{alone:0,tog:0}; o[k]+=v; days.set(it.date,o); };
  for(const it of spreadAll(PT())) add(it,"alone",spend(it,dayCur));
  for(const it of share) add(it,"tog",spend(it,dayCur));
  const T=$("dTable"); T.innerHTML="";
  const list=[...days.entries()].sort((x,y)=>y[0].localeCompare(x[0]));
  if(!list.length){ T.innerHTML='<tr><td colspan="4" class="hint">עוד אין הוצאות.</td></tr>'; return; }
  for(const [d,o] of list.slice(0,dayLimit)){
    const tr=document.createElement("tr");
    const c=(txt,cls)=>{ const td=document.createElement("td"); td.textContent=txt; if(cls) td.className=cls; tr.appendChild(td); };
    c(shortDay(d)); c(o.alone>0.004?fmt(o.alone,dayCur):"—","num"); c(o.tog>0.004?fmt(o.tog,dayCur):"—","num"); c(fmt(o.alone+o.tog,dayCur),"num strong");
    T.appendChild(tr);
  }
  $("dMore").hidden=list.length<=dayLimit;
}
let dayLimit=7;
function shortDay(s){ if(s===todayStr()) return "היום"; const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString("he-IL",{weekday:"short"}).replace("יום ","")+" "+d+"."+m; }

/* ---- cash wallet (personal): withdrawals in, cash payments out ---- */
function cashPaidByMe(){
  const out=[];
  for(const it of S.items){ if(it.kind==="transfer"||it.pm!=="cash") continue; const f=paidShare(it,me); if(!f) continue; out.push(f===1?it:{...it,amount:(+it.amount||0)*f}); }
  for(const it of expandRecur(P)){ if(it.pm==="cash") out.push(it); }
  return out;
}
/* settle-ups paid in cash between me and someone else */
function cashTransfers(){ return me ? S.items.filter(it=>it.kind==="transfer"&&it.pm==="cash"&&(it.payer===me||it.to===me)&&tripOf(it)===curTrip) : []; }
/* Max "Backpacker" (מוצ'ילר) terms: one 1% conversion fee on every foreign-currency charge, card payments and
   ATM withdrawals alike (not 1% + 1%). The charge is in shekels at the Bank of Israel representative rate, immediately.
   The ATM's own fee is part of the amount the card is charged, so the 1% applies to it too.
   Cash brought from home and anything in shekels have no such fee.
   Worked out from each entry, so it also covers what was recorded before this rule. */
const CARD_FEE=0.01;
const r2=v=>Math.round(v*100)/100;
function cardFee(x){ if(!feeOn()||!x||x.sub!=="withdraw"||x.cur==="ILS") return 0; const atm=(x.feeCur||x.cur)===x.cur?(+x.fee||0):0; return r2(((+x.amount||0)+atm)*feeR()); }
function payFee(it){ return feeOn()&&it&&it.pm==="card"&&!it._fee&&it.kind!=="transfer"&&it.cur&&it.cur!=="ILS" ? r2((+it.amount||0)*feeR()) : 0; }
/* one line a day in the personal list for the 1% on card payments (mine, and shared ones I paid) */
function syncCardFees(){
  if(!pLoaded||!me) return; const days=new Map();
  const add=(it,v)=>{ if(!(v>0)||!it.date) return; const k=it.date+"|"+it.cur; const o=days.get(k)||{date:it.date,cur:it.cur,v:0,n:0,loc:it.loc,tz:it.tz,createdAt:0}; o.v+=v; o.n++; o.createdAt=Math.max(o.createdAt,(it.createdAt||0)+1); days.set(k,o); };
  for(const it of P) if(!it._pfx&&!it.offTrip) add(it,payFee(it));
  /* shared: my share of the 1%, whoever paid (the fee is split with the expense) */
  for(const it of S.items) if(!it.deleted){ const sh=sharesOf(it)[me]||0; if(sh>0) add(it,payFee(it)*sh); }
  const out=[...days.values()].map(o=>({id:"pfee-"+o.date+"-"+o.cur,_fee:true,_pfx:true,desc:"עמלת כרטיס "+feePct()+(o.n>1?" · "+o.n+" תשלומים":""),amount:r2(o.v),cur:o.cur,cat:"other",catLabel:"עמלות כרטיס",pm:"fee",date:o.date,createdAt:o.createdAt,tz:o.tz,loc:o.loc}));
  P=[...P.filter(x=>!x._pfx),...out];
}
function cashBalances(){
  const since=Math.min(...CASH.map(x=>x.createdAt||Infinity));
  const bal={};
  const add=(c,v)=>{ bal[c]=(bal[c]||0)+v; };
  for(const x of CASH){
    if(x.sub==="withdraw"||x.sub==="adjust"||x.sub==="reset"||x.sub==="bring"||x.sub==="gift") add(x.cur,+x.amount||0);
    if(x.sub==="exchange"){ add(x.cur,-(+x.amount||0)); add(x.toCur,+x.toAmount||0); }
  }
  /* cash payments count from the first wallet entry on */
  for(const it of cashPaidByMe()){ if((it.createdAt||0)<since) continue; add(it.cur,-(+it.amount||0)); }
  for(const it of cashTransfers()){ add(it.cur,(it.to===me?1:-1)*(+it.amount||0)); }
  for(const c in bal) bal[c]=Math.round(bal[c]*100)/100;
  return bal;
}
function renderCash(){ return flipList($("cashList"),renderCash_); }
function renderCash_(){
  const bal=cashBalances(); CASHBAL=bal;
  const fees=CASH.filter(x=>(x.sub==="withdraw"||x.sub==="exchange")&&+x.fee>0).reduce((s,x)=>s+conv(+x.fee,x.feeCur||x.cur,"ILS"),0)+CASH.reduce((s,x)=>s+conv(cardFee(x),x.cur,"ILS"),0);
  const B=$("cashBal"); B.innerHTML="";
  const curs=Object.keys(bal).filter(c=>Math.abs(bal[c])>0.004);
  if(!CASH.length&&!cashTransfers().length){ B.innerHTML='<div class="hint">עוד לא נרשמו משיכות. כשמושכים מזומן מכספומט, לוחצים "משיכה מכספומט", ומאז היתרה מתעדכנת לבד בכל תשלום במזומן.</div>'; }
  else if(!curs.length){ B.innerHTML='<div class="cashline main"><b class="num">0</b><small class="hint">הארנק ריק</small></div>'; }
  else for(const c of curs.sort((x,y)=>(y===S.localCur)-(x===S.localCur))){
    const d=document.createElement("div"); d.className="cashline"+(c===curs[0]?" main":"");
    const n=document.createElement("b"); n.className="num"; n.textContent=fmt(bal[c],c); if(bal[c]<0) n.classList.add("neg");
    const s=document.createElement("small"); s.className="hint num"; s.textContent= c!=="ILS" ? "≈ "+fmt(conv(bal[c],c,"ILS"),"ILS") : "";
    d.append(n,s); B.appendChild(d);
  }
  if(curs.length>1){ const tc=BUDGET?.cur||"ILS", tot=curs.reduce((a,c)=>a+conv(bal[c],c,tc),0);
    const d=document.createElement("div"); d.className="cash-total"; const l=document.createElement("span"); l.textContent="סה״כ מזומן בארנק";
    const v=document.createElement("b"); v.className="num"; v.textContent="≈ "+fmt(tot,tc); d.append(l,v); B.appendChild(d); }
  $("cashFees").textContent= fees>0 ? "עמלות והפרשי שער: "+fmt(fees,"ILS") : "";
  /* history: every change shows as + / − */
  const L=$("cashList"); L.innerHTML="";
  const label={withdraw:"🏧 משיכה מכספומט",adjust:"± עדכון ידני",reset:"🔄 איפוס ארנק",exchange:"💱 החלפת מטבע",bring:"💼 מזומן מהבית",gift:"🎁 התקבל במזומן"};
  const hist=[...CASH,...cashTransfers().map(it=>({...it,_tr:true}))];
  for(const x of hist.sort((p,q)=>(q.createdAt||0)-(p.createdAt||0))){
    if(x._tr){ const r=document.createElement("div"); r.className="row"; const got=x.to===me;
      const dot=document.createElement("div"); dot.className="dot c2"; dot.textContent="💸";
      const main=document.createElement("div"); main.className="main"; const t=document.createElement("div"); t.className="t"; t.textContent= got ? (fem(x.payer)?"קיבלתי מ":"קיבלתי מ")+nm(x.payer)+" במזומן" : "נתתי ל"+nm(x.to)+" במזומן";
      const m=document.createElement("div"); m.className="m"; m.textContent=withTime(x,dayLabel(x.date)+" · סגירת חשבון"); main.append(t,m);
      const right=document.createElement("div"); right.className="r"; const b=document.createElement("b"); b.className="num "+(got?"pos":"neg"); b.textContent=(got?"+":"−")+fmt(+x.amount,x.cur); right.appendChild(b);
      r.append(dot,main,right); L.appendChild(r); continue; }
    const r=document.createElement("div"); r.className="row"; r.dataset.id=x.id;
    const dot=document.createElement("div"); dot.className="dot c2"; dot.textContent=(label[x.sub]||"·").split(" ")[0];
    const main=document.createElement("div"); main.className="main";
    const t=document.createElement("div"); t.className="t"; t.textContent=(label[x.sub]||"").replace(/^\S+ /,"")+(x.note?" · "+x.note:"");
    const m=document.createElement("div"); m.className="m"; m.textContent=withTime(x,dayLabel(x.date)+(x.sub==="withdraw" ? " · עמלות "+(+x.fee>0?fmt(+x.fee,x.feeCur||x.cur)+" כספומט + ":"")+fmt(cardFee(x),x.cur)+" כרטיס (1%)" : (+x.fee>0?" · עמלה "+fmt(+x.fee,x.feeCur||x.cur)+" (נרשמה כהוצאה)":"")));
    main.append(t,m);
    const right=document.createElement("div"); right.className="r";
    const sign=v=>(v>0?"+":v<0?"−":"")+fmt(Math.abs(v),"X").replace(/ X$/,"");
    const line=(v,c)=>{ const b=document.createElement("b"); b.className="num "+(v<0?"neg":"pos"); b.textContent=(v>0?"+":v<0?"−":"")+fmt(Math.abs(v),c); right.appendChild(b); };
    if(x.sub==="exchange"){ line(-(+x.amount),x.cur); line(+x.toAmount,x.toCur); } else line(+x.amount,x.cur);
    const rep1= x.sub==="withdraw"||x.sub==="exchange"||x.sub==="adjust"||x.sub==="gift";
    const acts=document.createElement("div"); acts.className="acts";
    if(rep1){ const ag=document.createElement("button"); ag.className="link"; ag.type="button"; ag.textContent="🔁 שוב"; ag.onclick=()=>againCash(x); acts.appendChild(ag); }
    acts.appendChild(delBtn(()=>delItem({id:x.id,desc:label[x.sub]||"ארנק"},true))); r.appendChild(acts);
    r.append(dot,main,right); tapRow(r);
    L.appendChild(swipeWrap(r,{id:x.id},true,{again:rep1?()=>againCash(x):null,againLabel:x.sub==="withdraw"?"🔁 עוד משיכה כזו":"🔁 שוב להיום",del:()=>delItem({id:x.id,desc:(label[x.sub]||"ארנק").replace(/^\S+ /,"")},true)}));
  }
  /* panels */
  for(const [k,id] of [["b","cashB"],["w","cashW"],["a","cashA"],["x","cashX"],["r","cashR"]]) if(!$("addSlot").contains($(id))) $(id).hidden=cashForm!==k;
  for(const [k,id] of [["b","cashBBtn"],["w","cashWBtn"],["a","cashABtn"],["x","cashXBtn"],["r","cashRBtn"]]) $(id).setAttribute("aria-pressed",String(cashForm===k));
  if(cashForm==="a"||cashForm==="r") $("cashMoreBox").hidden=false;
  setCurBtn("cwCur",cur.cw||S.localCur); cwCardHint(); setCurBtn("cwFeeCur",cur.cwFee||S.localCur); setCurBtn("caCur",cur.ca||S.localCur);
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
let cbList=[];
function renderCB(){ const R=$("cbRows"); R.innerHTML="";
  cbList.forEach((row,i)=>{ const d=document.createElement("div"); d.className="amount cb-row";
    const inp=document.createElement("input"); inp.className="num"; inp.inputMode="decimal"; inp.placeholder="כמה"; inp.value=row.v||""; inp.setAttribute("aria-label","סכום");
    inp.oninput=()=>{ const g=group(inp.value); if(g!==inp.value) inp.value=g; row.v=inp.value; };
    const b=document.createElement("button"); b.type="button"; b.className="curbtn"; b.textContent=curText(row.c);
    b.onclick=()=>openCurPicker("איזה מטבע?",row.c,c=>{ row.c=c; renderCB(); });
    d.append(inp,b); R.appendChild(d); }); }
$("cashBBtn").onclick=()=>{ if(!cbList.length) cbList=[{c:"USD",v:""},{c:S.dest&&S.dest!=="USD"?S.dest:(S.localCur!=="USD"?S.localCur:"THB"),v:""}]; openCash("b"); renderCB(); setTimeout(()=>{ const f=$("cbRows").querySelector("input"); if(f) f.focus(); },60); };
$("cbAdd").onclick=()=>{ const used=new Set(cbList.map(r=>r.c)); const next=["USD","THB","ILS","EUR","VND","LAK","KHR","IDR","PHP","MYR"].find(c=>!used.has(c))||"USD"; cbList.push({c:next,v:""}); renderCB(); };
$("cbSave").onclick=async()=>{
  showErr("cbErr"); const rows=cbList.map(r=>({c:r.c,v:parseFloat(String(r.v||"").replace(/,/g,""))})).filter(r=>r.v>0);
  if(!rows.length) return showErr("cbErr","כמה מזומן לוקחים?");
  const bank=$("cbBank").checked; let n=0;
  for(const r of rows){ if(await cashSave({sub:"bring",amount:r.v,cur:r.c,bank,desc:"מזומן מהבית"})) n++; }
  if(n===rows.length){ cbList=[]; cashForm=null; renderCash(); toast("💼 נוסף לארנק: "+rows.map(r=>fmt(r.v,r.c)).join(" + ")); }
  else showErr("cbErr","חלק לא נשמר. בדקו את הרשימה ונסו שוב.");
};
$("cashMore").onclick=()=>{ const b=$("cashMoreBox"); b.hidden=!b.hidden; $("cashMore").setAttribute("aria-expanded",String(!b.hidden)); buzz(5); };
$("cashWBtn").onclick=()=>openCash("w","cwAmt");
$("cashABtn").onclick=()=>openCash("a","caAmt");
$("cashXBtn").onclick=()=>{ openCash("x","cxAmt"); cxFill(); };
$("cashRBtn").onclick=()=>openCash("r");
$("cwCur").onclick=()=>openCurPicker("באיזה מטבע משכת?",cur.cw||S.localCur,c=>{ cur.cw=c; renderCash(); });
/* live: what the card adds on top */
function cwCardHint(){ const a=num("cwAmt"), el=$("cwCard"); if(!el) return; const c=cur.cw||S.localCur;
  const fee=num("cwFee")>0?num("cwFee"):0, fc=cur.cwFee||S.localCur, x={sub:"withdraw",amount:a,cur:c,fee,feeCur:fc}, k=cardFee(x);
  el.textContent= !(a>0) ? (feeOn()?"💳 הכרטיס לוקח "+feePct()+" על כל משיכה במט״ח, גם על עמלת הכספומט. נרשם לבד כהוצאה":"")
    : c==="ILS" ? (feeOn()?"💳 משיכה בשקלים: בלי עמלת "+feePct():"")
    : !feeOn() ? "" : "💳 עמלת כרטיס "+feePct()+(fee>0&&fc===c?" (על המשיכה + עמלת הכספומט)":"")+": "+fmt(k,c)+" · יורד מהבנק בסך הכול "+fmt(a+(fc===c?fee:0)+k,c)+(fee>0&&fc!==c?" + "+fmt(fee,fc):""); }
for(const id of ["cwAmt","cwFee"]) $(id).addEventListener("input",cwCardHint);
$("cwFeeCur").onclick=()=>openCurPicker("באיזה מטבע העמלה?",cur.cwFee||S.localCur,c=>{ cur.cwFee=c; renderCash(); });
$("caCur").onclick=()=>openCurPicker("איזה מטבע?",cur.ca||S.localCur,c=>{ cur.ca=c; renderCash(); });
$("cxFrom").onclick=()=>openCurPicker("נתתי…",cur.cxF||S.localCur,c=>{ cur.cxF=c; renderCash(); cxFill(); cxLossShow(); });
$("cxTo").onclick=()=>openCurPicker("קיבלתי…",cur.cxT||"USD",c=>{ cur.cxT=c; renderCash(); cxFill(); cxLossShow(); });
/* how much the exchange cost compared with the market rate, in the received currency */
function cxAsk(shortBy,f){
  const box=$("cxShort"); box.hidden=false; box.textContent="";
  const p=document.createElement("b"); p.textContent="יש בארנק פחות "+CUR[f].name+" ממה שנתת (חסרים "+fmt(shortBy,f)+")."; box.appendChild(p);
  const q=document.createElement("span"); q.textContent="זה כסף שהבאתם מהבית?"; box.appendChild(q);
  const r=document.createElement("div"); r.className="row2";
  const yes=document.createElement("button"); yes.type="button"; yes.className="btn primary small"; yes.textContent="💼 כן, מזומן מהבית";
  yes.onclick=async()=>{ yes.disabled=true; const ok=await cashSave({sub:"bring",amount:shortBy,cur:f,bank:false,desc:"מזומן מהבית"}); if(ok){ window.__cxGo=true; $("cxSave").click(); } else yes.disabled=false; };
  const no=document.createElement("button"); no.type="button"; no.className="btn small"; no.textContent="להמשיך במינוס";
  no.onclick=()=>{ window.__cxGo=true; $("cxSave").click(); };
  r.append(yes,no); box.appendChild(r); buzz([8,30,8]);
}
function cxLossOf(a,f,b,t){ return Math.max(0,conv(a,f,t)-b); }
function cxLossShow(){ const a=num("cxAmt"), b=num("cxGot"); const f=cur.cxF||S.localCur, t=cur.cxT||(S.localCur==="USD"?"ILS":"USD"); const L=$("cxLoss");
  if(!(a>0&&b>0)||f===t){ L.hidden=true; return; }
  const fair=conv(a,f,t), loss=fair-b; L.hidden=false; L.textContent="";
  const pct=Math.abs(loss)/fair*100;
  if(loss>0.004){ L.append("📉 לפי השער היום היית אמור לקבל "+fmt(fair,t)+". ", Object.assign(document.createElement("b"),{textContent:"הפרשי שער: "+fmt(loss,t)+" ("+pct.toFixed(1)+"%)"}), " · נרשם כהוצאה"+(t!=="ILS"?" (≈ "+fmt(conv(loss,t,"ILS"),"ILS")+")":"")); }
  else L.append("🎉 קיבלת שער טוב מהשער היום. אין הפרשי שער."); }
function cxFill(){ const a=num("cxAmt"); const f=cur.cxF||S.localCur, t=cur.cxT||(S.localCur==="USD"?"ILS":"USD"); if(a>0&&!$("cxTo").dataset.touched) $("cxGot").value=group(String(Math.round(conv(a,f,t)*100)/100)); }
$("cxAmt").addEventListener("input",()=>{ delete $("cxTo").dataset.touched; cxFill(); cxLossShow(); $("cxShort").hidden=true; });
$("cxGot").addEventListener("input",()=>{ $("cxTo").dataset.touched="1"; cxLossShow(); });
$("cwSave").onclick=async()=>{
  showErr("cwErr"); const amt=num("cwAmt"), fee=num("cwFee")||0;
  if(!(amt>0)) return showErr("cwErr","כמה משכת?");
  const ok=await cashSave({sub:"withdraw",amount:amt,cur:cur.cw||S.localCur,fee,feeCur:cur.cwFee||S.localCur,desc:"משיכה מכספומט"});
  if(ok){ $("cwAmt").value=""; $("cwFee").value=""; cashForm=null; toast("🏧 נרשמה משיכה של "+fmt(amt,cur.cw||S.localCur)+" · עמלות "+(fee>0?fmt(fee,cur.cwFee||S.localCur)+" + ":"")+fmt(cardFee({sub:"withdraw",amount:amt,cur:cur.cw||S.localCur,fee,feeCur:cur.cwFee||S.localCur}),cur.cw||S.localCur)+" (1% כרטיס) נרשמו כהוצאה"); }
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
  const have=(cashBalances()[f]||0), shortBy=Math.round((a-Math.max(0,have))*100)/100;
  if(shortBy>0.004&&!window.__cxGo){ cxAsk(shortBy,f); return; }
  window.__cxGo=false; $("cxShort").hidden=true;
  const loss=cxLossOf(a,f,b,t);
  const ok=await cashSave({sub:"exchange",amount:a,cur:f,toAmount:b,toCur:t,desc:"החלפת מטבע",...(loss>0.004?{fee:Math.round(loss*100)/100,feeCur:t,rate:S.fx.live?"live":"saved"}:{})});
  if(ok){ $("cxAmt").value=""; $("cxGot").value=""; delete $("cxTo").dataset.touched; $("cxLoss").hidden=true; cashForm=null;
    if($("addSlot").contains($("cashX"))) closeSheet("addSheet");
    toast("💱 הוחלפו "+fmt(a,f)+" ב-"+fmt(b,t)+(loss>0.004?" · הפרשי שער "+fmt(loss,t)+" נרשמו כהוצאה":"")); }
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
  if(!personal) base.rIls=rateNow(base.cur||"ILS"); else delete base.rIls;
  let ok;
  if(personal){ const c=await loadAcct(); if(!c) return; const doc=await encFor(c,base); ok=await run(()=>EXP().doc(id).set(doc)); }
  else { base.by=me||null; delete base.source; ok=await run(()=>EXP().doc(id).set(base)); if(ok) notifyOthers("🧾 "+nm(me||it.payer)+" "+(fem(me||it.payer)?"הוסיפה":"הוסיף")+": "+(base.desc||"הוצאה")+" "+fmt(+base.amount,base.cur)); }
  if(ok) toast("🔁 נוסף שוב להיום: "+(it.desc||"הוצאה"),"ביטול",()=>run(()=>personal?EXP().doc(id).update({deleted:true,deletedAt:Date.now(),deletedBy:me||null}):EXP().doc(id).delete()));
}
/* deleting moves an expense to the recycle bin for 30 days */
const BIN_DAYS=30;
async function delItem(it,personal){
  const r0=document.querySelector('.row[data-id="'+CSS.escape(it.id)+'"]'); const row=r0&&r0.closest(".swipe")||r0;
  if(row&&!calm()){ buzz(12);
    if(M){ const h=row.offsetHeight, inner=row.querySelector(".row")||row, slid=/translateX\(-1/.test(getComputedStyle(inner).transform)||inner.getAnimations().some(a=>a.playState!=="finished");
      if(!slid) await M.animate(row,[{opacity:1,transform:"none"},{opacity:0,transform:"translateX(-24px) scale(.97)"}],{spring:"snappy",keep:true});
      row.style.overflow="hidden"; await M.animate(row,[{height:h+"px",opacity:0},{height:"0px",opacity:0,marginTop:"-7px"}],{spring:"smooth",keep:true}); }
    else { row.classList.add("leave"); await new Promise(r=>setTimeout(r,240)); } }
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
$("fDesc").addEventListener("input",()=>{ if(form.catSet) return; const g=guessCat($("fDesc").value,S.items); if(g!==form.cat){ form.cat=g; renderForm(); } });
$("pDesc").addEventListener("input",()=>{ if(pform.catSet) return; const g=guessCat($("pDesc").value,[...P,...S.items]); if(g!==pform.cat){ pform.cat=g; renderPForm(); } });
$("fDesc").addEventListener("input",()=>suggest("fDesc","fSuggest",S.items.filter(x=>x.kind!=="transfer"),it=>{
  $("fDesc").value=it.desc; form.cat=it.cat||"other"; form.catSet=true; $("fCatLabel").value=it.catLabel||"";
  if(!$("fAmt").value){ $("fAmt").value=group(String(it.amount)); cur.fCur=it.cur||cur.fCur; }
  renderForm(); }));
$("pDesc").addEventListener("input",()=>suggest("pDesc","pSuggest",P,it=>{
  $("pDesc").value=it.desc; pform.cat=it.cat||"other"; pform.catSet=true; $("pCatLabel").value=it.catLabel||"";
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
  /* phone notifications are shown only to someone who already turned them on, so they can turn them off */
  if(!me||!person(me)?.ntfy){ $("notifSec").hidden=true; return; } $("notifSec").hidden=false;
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
  for(const it of [...S.items].sort((x,y)=>(x.date||"").localeCompare(y.date||""))) line(it.kind==="transfer"?"העברה":"משותף",it,payName(it),it.kind==="transfer"?"":splitText(it));
  if(me&&acct&&acctFor===me) for(const it of [...P].sort((x,y)=>(x.date||"").localeCompare(y.date||""))) line("אישי של "+nm(me),it,nm(me),"");
  if(me&&acct&&acctFor===me){
    const lab={withdraw:"משיכה מכספומט",adjust:"עדכון ידני",reset:"איפוס ארנק",exchange:"החלפת מטבע",bring:"מזומן מהבית",gift:"התקבל במזומן"};
    for(const x of [...CASH].sort((a,b)=>(a.createdAt||0)-(b.createdAt||0))){
      rows.push(["ארנק של "+nm(me),x.date||"",timeOf(x),(lab[x.sub]||"ארנק")+(x.note?" · "+x.note:""),"",x.amount,x.cur,Math.round(conv(+x.amount||0,x.cur,"ILS")*100)/100,"","",locName(locOf(x))]);
      if(x.sub==="exchange") rows.push(["ארנק של "+nm(me),x.date||"",timeOf(x),"התקבל בהחלפה","",x.toAmount,x.toCur,Math.round(conv(+x.toAmount||0,x.toCur,"ILS")*100)/100,"","",locName(locOf(x))]); }
    if(BUDGET) rows.push(["תקציב",new Date(BUDGET.createdAt||Date.now()).toISOString().slice(0,10),"","תקציב התחלתי"+(BUDGET.adj?" (עדכון לפי הבנק: "+fmt(BUDGET.adjTo||0,BUDGET.cur)+")":""),"",BUDGET.amount,BUDGET.cur,Math.round(conv(+BUDGET.amount,BUDGET.cur,"ILS")*100)/100,"","",""]);
    for(const x of INCOME) rows.push(["תקציב",x.date||"","","כסף שנכנס · "+(x.note||""),"",x.amount,x.cur,Math.round(conv(+x.amount,x.cur,"ILS")*100)/100,"","",""]);
  }
  const csv="\ufeff"+rows.map(r=>r.map(esc).join(",")).join("\r\n");
  const name=(S.trip||"trip").replace(/[^\w\u0590-\u05FF]+/g,"-").replace(/^-|-$/g,"")+"-"+todayStr()+".csv";
  const file=new File([csv],name,{type:"text/csv"});
  const done=()=>{ store("trip-backup",String(Date.now())); renderBackup(); toast("💾 הגיבוי מוכן. שמרו אותו בקבצים או שלחו לעצמכם"); };
  try{ if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:name}); done(); return; } }catch(e){ if(e&&e.name==="AbortError") return; }
  setTimeout(done,300);
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
  /* the card fee on foreign charges, for this space */
  { const now=feeR(); seg($("feeSeg"),[[0,"בלי"],[0.005,"0.5%"],[0.01,"1%"],[0.015,"1.5%"],[0.02,"2%"],[0.025,"2.5%"],[0.03,"3%"]].map(([v,t])=>[String(v),t]),v=>Math.abs(+v-now)<1e-9,async v=>{ if(!canWrite) return; const ok=await run(()=>metaRef().update({cardFee:+v})); if(ok){ if(META) META.cardFee=+v; renderAll(); toast(+v?"💳 עמלת כרטיס: "+feePct():"💳 בלי עמלת כרטיס"); } }); }
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
    $("acctText").textContent= !p?.vk ? "עוד לא נוצר חשבון אישי. נכנסים אליו דרך הכפתור \"האישי שלי\"." : inNow ? (fem(me)?"את מחוברת":"אתה מחובר")+" לחשבון האישי של "+nm(me)+" במכשיר הזה." : "החשבון קיים, אבל במכשיר הזה עוד לא נכנסת אליו.";
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
$("settingsBtn").onclick=()=>{ renderBackup(); delAsk=null; $("pwChange").hidden=true; renderSettings(); openSheet("setSheet"); };
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
/* ---- personal trip budget: what is left in the bank ----
   Money leaves the bank on ATM withdrawals (with the fee) and on card payments, personal or shared ones I paid.
   Cash payments are not counted again: that money already left with the withdrawal. Settle-up transfers count both ways. */
/* bank + every note in the wallet, valued at today's rate, in the budget currency */
function worthCalc(r){
  const cur=r?r.cur:"ILS", bal=cashBalances(), cash=[];
  for(const c of Object.keys(bal)) if(Math.abs(bal[c])>0.004) cash.push({c,v:bal[c],w:conv(bal[c],c,cur)});
  cash.sort((a,b)=>b.w-a.w);
  const cashW=cash.reduce((a,x)=>a+x.w,0), bank=r?r.left:0;
  return {cur,bank,cash,cashW,total:bank+cashW};
}
function budgetCalc(){
  const B=BUDGET; if(!B||!(+B.amount>0)) return null;
  const cur=B.cur||"ILS", st=tripStart(), td=todayStr();
  const onTrip=it=> !it.offTrip && locOf(it)!=="prep" && (!st||(it.date||"")>=st);
  const inc=it=> B.prep!==false || onTrip(it) || it.offTrip;
  const C=(a,c)=>conv(+a||0,c||cur,cur);
  const parts={atm:0,home:0,cardP:0,cardS:0,fx:0,tr:0,gift:0,off:0}; let usedTrip=0;
  const add=(k,v,it)=>{ parts[k]+=v; if(onTrip(it)) usedTrip+=v; };
  for(const x of CASH) if(x.sub==="withdraw"&&inc(x)) add("atm",C(x.amount,x.cur)+C(x.fee||0,x.feeCur||x.cur)+C(cardFee(x),x.cur),x);
  /* cash bought from the bank counts only if bought after the budget was set: a budget is "what is in the bank now" */
  const since=+B.since||+B.createdAt||0;
  for(const x of CASH) if(x.sub==="bring"&&x.bank&&(x.createdAt||0)>since) add("home",C(x.amount,x.cur),x);
  for(const x of INCOME) add("gift",-C(x.amount,x.cur),x);
  for(const it of expandRecur(P)){ if(it._fee||!inc(it)) continue;
    if(it.offTrip){ if(it.pm!=="cash") add("off",C(it.amount,it.cur)+C(payFee(it),it.cur),it); continue; }   /* subscriptions and bills at home, from the bank */
    if(it.pm==="card"||it.pm==="bank"){ add("cardP",C(it.amount,it.cur),it); if(payFee(it)) add("fx",C(payFee(it),it.cur),it); } }
  for(const it of S.items){ if(!inc(it)) continue;
    if(it.kind==="transfer"){ if(it.pm==="cash") continue; if(it.payer===me) add("tr",C(it.amount,it.cur),it); else if(it.to===me) add("tr",-C(it.amount,it.cur),it); }
    else if(it.pm==="card"&&paidShare(it,me)>0){ const f=paidShare(it,me); add("cardS",C(it.amount,it.cur)*f,it); if(payFee(it)) add("fx",C(payFee(it),it.cur)*f,it); } }
  const adj=+B.adj||0;
  const used=parts.atm+parts.home+parts.cardP+parts.cardS+parts.fx+parts.tr+parts.off-adj, gifts=-parts.gift, amount=+B.amount, left=amount+gifts-used;
  let pace=null, perDay=null;
  if(st&&st<=td){ const days=Math.round((new Date(td+"T12:00")-new Date(st+"T12:00"))/864e5)+1; perDay=usedTrip/days; if(perDay>0) pace=Math.floor(left/perDay); }
  return {cur,amount,gifts,used,left,parts,adj,adjAt:B.adjAt||null,pace,perDay,pct:Math.max(0,Math.min(1,used/(amount+gifts))),prep:B.prep!==false};
}
/* how long the money lasts: everything I have (bank left + cash in the wallet, at plain rates)
   divided by what I actually spend a day on the trip (my own + my share of the shared) */
function runwayCalc(r){
  if(!r) return null; const st=tripStart(), td=todayStr(); if(!st||st>td) return null;
  const W=worthCalc(r), days=Math.round((new Date(td+"T12:00")-new Date(st+"T12:00"))/864e5)+1;
  const onTrip=it=> locOf(it)!=="prep" && (it.date||"")>=st && (it.date||"")<=td;
  const spent=spreadAll(PT()).filter(onTrip).reduce((a,it)=>a+spend(it,r.cur),0)+spreadAll(myShareItems()).filter(onTrip).reduce((a,it)=>a+spend(it,r.cur),0);   /* the share is already in the amount */
  const perDay=spent/days; if(!(perDay>0)||!(W.total>0)) return {total:W.total,perDay,days:null,cur:r.cur};
  const left=Math.floor(W.total/perDay), end=new Date(Date.now()+left*864e5);
  return {total:W.total,perDay,days:left,cur:r.cur,until:end.getDate()+"."+(end.getMonth()+1)+(end.getFullYear()!==new Date().getFullYear()?"."+String(end.getFullYear()).slice(2):"")};
}
function runwayText(rw){ if(!rw||rw.days==null) return ""; return "⏳ בקצב של "+fmt(rw.perDay,rw.cur)+" ליום, כל הכסף ("+fmt(rw.total,rw.cur)+", בבנק ובמזומן) מספיק לעוד כ-"+rw.days.toLocaleString("en-US")+" ימים"+runwayLong(rw.days)+" · עד "+rw.until; }
/* a long stretch also in months and years, so 632 days reads as "about a year and 9 months" */
function runwayLong(d){ if(d<60) return ""; const m=Math.round(d/30.44), y=Math.floor(m/12), r=m%12;
  const ms=r===0?"":r===1?"חודש":r===2?"חודשיים":r+" חודשים", ys=y===0?"":y===1?"שנה":y===2?"שנתיים":y+" שנים";
  return " (בערך "+(ys&&ms?ys+(/^\d/.test(ms)?" ו-":" ו")+ms:ys||ms)+")"; }
let budEditing=false, budSyncing=false;
function renderBudget(){
  const open=!!(acct&&acctFor===me);
  $("budLock").hidden=open; const r=open?budgetCalc():null;
  $("budEmpty").hidden=!open||!!r||budEditing; $("budMain").hidden=!open||!r||budEditing; $("budForm").hidden=!open||!budEditing;
  $("budEdit").hidden=!open||!r||budEditing;
  $("budSyncF").hidden=!open||!r||!budSyncing||budEditing; $("budSyncBtn").hidden=!open||!r||budSyncing||budEditing; $("budInBtn").hidden=!open||!r||budEditing;
  if(!r) return;
  const arc=$("budArc"), L=2*Math.PI*50; arc.style.strokeDasharray=L; arc.style.strokeDashoffset=L*(1-(1-r.pct));
  const box=$("budgetBox"); box.classList.toggle("warn",r.left>=0&&r.left<r.amount*0.15); box.classList.toggle("over",r.left<0);
  $("budPct").textContent=Math.round((1-r.pct)*100)+"%";
  money($("budLeft"),r.left,r.cur,"budLeft");
  { const W=worthCalc(r), box=$("budWorth"); box.hidden=!W.cash.length; 
    if(W.cash.length){ money($("wTotal"),W.total,W.cur,"wTotal");
      const COL=["#14B8A6","#F59E0B","#EC4899","#3B82F6","#8B5CF6"], pos=[["🏦 בבנק",Math.max(0,W.bank),"#6C4BFF"],...W.cash.filter(x=>x.w>0).map((x,i)=>["💵 "+CUR[x.c].name,x.w,COL[i%COL.length]])];
      const sum=pos.reduce((a,x)=>a+x[1],0)||1, bar=$("wBar"); bar.innerHTML="";
      for(const [,v,col] of pos){ const i=document.createElement("i"); i.style.width=(v/sum*100)+"%"; i.style.background=col; bar.appendChild(i); }
      const P=$("wParts"); P.innerHTML="";
      const line=(label,col,val,sub)=>{ const d=document.createElement("div"); const a=document.createElement("span"); const sw=document.createElement("i"); sw.className="sw"; sw.style.background=col; a.append(sw,label);
        const b=document.createElement("b"); b.className="num"; b.textContent=val; if(sub){ const sm=document.createElement("small"); sm.textContent=sub; b.appendChild(sm); } d.append(a,b); P.appendChild(d); };
      line("🏦 בבנק","#6C4BFF",fmt(W.bank,W.cur));
      W.cash.forEach((x,i)=>line("💵 מזומן · "+CUR[x.c].name,x.w>0?COL[i%COL.length]:"var(--bad)",fmt(x.v,x.c), x.c!==W.cur?"≈ "+fmt(x.w,W.cur):""));
      $("wNote").textContent="המזומן לפי הארנק, בשער של היום"+(S.fx.at?" ("+new Date(S.fx.at).toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"})+")":"")+". השווי משתנה עם השער."; } }
  $("budOf").textContent="מתוך "+fmt(r.amount,r.cur)+(r.gifts>0.004?" + "+fmt(r.gifts,r.cur)+" שנכנסו":"")+" · ירדו "+fmt(r.used,r.cur);
  const IL=$("budInList"); IL.innerHTML="";
  for(const x of [...INCOME].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))){
    const d=document.createElement("div"); d.className="bud-row"; const a=document.createElement("span"); const nt=x.note||"כסף שנכנס"; a.textContent=(/^\p{Extended_Pictographic}/u.test(nt)?"":"🎁 ")+nt+" · "+dayLabel(x.date);
    const b=document.createElement("b"); b.className="num"; b.textContent="+"+fmt(+x.amount,x.cur);
    const del=document.createElement("button"); del.type="button"; del.className="x"; del.textContent="✕"; del.setAttribute("aria-label","מחיקה");
    del.onclick=async()=>{ if(!del.dataset.sure){ del.dataset.sure="1"; del.textContent="למחוק?"; setTimeout(()=>{ if(del.isConnected){ delete del.dataset.sure; del.textContent="✕"; } },3000); return; }
      const ok=await run(()=>EXP().doc(x.id).update({deleted:true,deletedAt:Date.now(),deletedBy:me||null})); if(ok){ INCOME=INCOME.filter(y=>y.id!==x.id); renderBudget(); renderSofar(); toast("🗑 הועבר לסל המחזור"); } };
    const right=document.createElement("span"); right.style.display="flex"; right.style.alignItems="center"; right.append(b,del);
    d.append(a,right); IL.appendChild(d); }
  { const f=$("budFold"), open=!!window.__budOpen; $("budRows").hidden=!open; f.setAttribute("aria-expanded",String(open));
    f.textContent=(open?"▴ ":"▾ ")+"מה ירד מהתקציב · "+fmt(r.used,r.cur); f.onclick=()=>{ window.__budOpen=!window.__budOpen; buzz(5); renderBudget(); }; }
  const R=$("budRows"); R.innerHTML="";
  const row=(ic,t,v)=>{ if(Math.abs(v)<0.005) return; const d=document.createElement("div"); d.className="bud-row"; const a=document.createElement("span"); a.textContent=ic+" "+t; const b=document.createElement("b"); b.className="num"; b.textContent=(v>0?"−":v<0?"+":"")+fmt(Math.abs(v),r.cur); d.append(a,b); R.appendChild(d); };
  row("🏧","משיכות מכספומט ועמלות",r.parts.atm);
  if(r.parts.home>0.004) row("💼","מזומן שנקנה מהבית",r.parts.home);
  row("💳","כרטיס · אישי",r.parts.cardP);
  row("🏠","לא מהטיול: מנויים וחשבונות בבית",r.parts.off);
  row("💳","כרטיס · משותף ששילמת",r.parts.cardS);
  row("💳","עמלת כרטיס "+feePct()+" על תשלומים במט״ח",r.parts.fx);
  if(Math.abs(r.parts.tr)>0.004) row("💸","העברות בהתחשבנות (בנק)",r.parts.tr);
  if(Math.abs(r.adj)>0.004) row("🏦","עדכון לפי הבנק"+(r.adjAt?" · "+new Date(r.adjAt).toLocaleDateString("he-IL",{day:"numeric",month:"numeric"}):""),-r.adj);
  $("budPace").textContent= r.left<0 ? "⚠️ עברת את התקציב ב-"+fmt(-r.left,r.cur)
    : runwayText(runwayCalc(r)) ? runwayText(runwayCalc(r)) : (r.prep?"כולל ההוצאות לפני הטיול":"מתחיל לספור מיום הטיסה");
}
function budgetForm(){ budEditing=true; const B=BUDGET; $("budAmt").value=B?group(String(B.amount)):""; cur.bud=B?.cur||"ILS"; setCurBtn("budCur",cur.bud); $("budPrep").checked=B?B.prep!==false:true; showErr("budErr"); renderBudget(); setTimeout(()=>$("budAmt").focus(),60); }
$("budStart").onclick=budgetForm; $("budEdit").onclick=budgetForm;
$("budCancel").onclick=()=>{ budEditing=false; renderBudget(); };
$("budCur").onclick=()=>openCurPicker("באיזה מטבע התקציב?",cur.bud||"ILS",c=>{ cur.bud=c; setCurBtn("budCur",c); });
$("budOpen").onclick=()=>{ closeSheet("acctSheet"); goView("personal"); };
async function saveBudget(data){
  const c=await loadAcct(); if(!c) return false;
  const id=BUDGET?.id||uid("b"); const ok=await run(async()=>EXP().doc(id).set(await encFor(c,data)));
  if(ok){ BUDGET={...data,id}; renderBudget(); renderSofar(); }
  return ok;
}
let budInTo="bank";
/* one-tap notes: common reasons, then the ones you used before */
function renderBudInChips(){ const box=$("budInChips"); box.innerHTML="";
  const base=["🎁 מתנה מההורים","🎁 מתנה מסבתא","💸 החזר חוב","💼 משכורת","↩️ החזר כספי"];
  const past=[...new Set(INCOME.map(x=>x.note).filter(Boolean).reverse())].filter(n=>!base.includes(n)).slice(0,4);
  for(const n of [...past,...base]){ const b=document.createElement("button"); b.type="button"; b.textContent=n;
    b.onclick=()=>{ const inp=$("budInNote"); inp.value= n==="💸 החזר חוב" ? "💸 החזר חוב מ" : n; inp.focus(); inp.setSelectionRange(inp.value.length,inp.value.length); buzz(5); }; box.appendChild(b); } }
function renderBudIn(){ renderBudInChips(); seg($("budInTo"),[["bank","🏦 נכנס לחשבון"],["cash","💵 קיבלתי במזומן"]],v=>v===budInTo,v=>{ budInTo=v; renderBudIn(); }); setCurBtn("budInCur",cur.bin||BUDGET?.cur||"ILS"); }
$("budInBtn").onclick=()=>{ const f=$("budInF"); f.hidden=!f.hidden; showErr("budInErr"); renderBudIn(); if(!f.hidden) setTimeout(()=>$("budInAmt").focus(),60); };
$("budInCancel").onclick=()=>{ $("budInF").hidden=true; };
$("budInCur").onclick=()=>openCurPicker("באיזה מטבע?",cur.bin||BUDGET?.cur||"ILS",c=>{ cur.bin=c; renderBudIn(); });
$("budInSave").onclick=async()=>{
  const v=parseFloat(String($("budInAmt").value).replace(/,/g,"")); if(!(v>0)) return showErr("budInErr","כמה נכנס?");
  const c=cur.bin||BUDGET?.cur||"ILS", note=$("budInNote").value.trim()||"כסף שנכנס";
  let ok;
  if(budInTo==="cash") ok=await cashSave({sub:"gift",amount:v,cur:c,note,desc:note});
  else { const k=await loadAcct(); if(!k) return showErr("budInErr","פותחים קודם את האישי עם הסיסמה");
    const data={type:"budget-in",amount:v,cur:c,note,date:todayStr(),createdAt:Date.now(),trip:curTrip}; const id=uid("i");
    ok=await run(async()=>EXP().doc(id).set(await encFor(k,data))); if(ok) INCOME=[...INCOME,{...data,id}]; }
  if(!ok) return showErr("budInErr","לא נשמר. נסו שוב.");
  $("budInAmt").value=""; $("budInNote").value=""; $("budInF").hidden=true; renderBudget(); renderSofar(); buzz(10);
  toast("🎁 "+note+": +"+fmt(v,c)+(budInTo==="cash"?" נכנס לארנק":" נוסף לתקציב"));
};
$("budSyncBtn").onclick=()=>{ budSyncing=true; showErr("budSErr"); const r=budgetCalc(); $("budSAmt").value=r?group(String(Math.round(r.left))):""; $("budSCur").textContent=r?curText(r.cur):""; $("budSClear").hidden=!(r&&Math.abs(r.adj)>0.004); renderBudget(); setTimeout(()=>{ $("budSAmt").focus(); $("budSAmt").select(); },60); };
$("budSCancel").onclick=()=>{ budSyncing=false; renderBudget(); };
$("budSSave").onclick=async()=>{
  const v=parseFloat(String($("budSAmt").value).replace(/,/g,"")); if(!(v>=0)) return showErr("budSErr","צריך לכתוב כמה יש בבנק עכשיו");
  const r=budgetCalc(); if(!r) return;
  const base=r.left-r.adj;   /* what the app would say without any earlier sync */
  const {id,...rest}=BUDGET; const ok=await saveBudget({...rest,adj:v-base,adjAt:Date.now(),adjTo:v});
  if(!ok) return showErr("budSErr","לא נשמר. נסו שוב.");
  budSyncing=false; renderBudget(); buzz(10); toast("🏦 היתרה עודכנה ל-"+fmt(v,r.cur)+". התקציב ההתחלתי נשאר "+fmt(r.amount,r.cur));
};
$("budSClear").onclick=async()=>{ const {id,adj,adjAt,adjTo,...rest}=BUDGET; const ok=await saveBudget(rest); if(ok){ budSyncing=false; renderBudget(); toast("העדכון הידני בוטל"); } };
$("budSave").onclick=async()=>{
  const amount=parseFloat(String($("budAmt").value).replace(/,/g,"")); if(!(amount>0)) return showErr("budErr","צריך סכום גדול מאפס");
  const c=await loadAcct(); if(!c) return showErr("budErr","פותחים קודם את האישי עם הסיסמה");
  const data={type:"budget",amount,cur:cur.bud||"ILS",prep:$("budPrep").checked,createdAt:Date.now(),since:+BUDGET?.since||+BUDGET?.createdAt||Date.now(),trip:curTrip};
  if(BUDGET&&BUDGET.adj&&(BUDGET.cur||"ILS")===data.cur){ data.adj=BUDGET.adj; data.adjAt=BUDGET.adjAt; data.adjTo=BUDGET.adjTo; }
  const id=BUDGET?.id||uid("b"); const ok=await run(async()=>EXP().doc(id).set(await encFor(c,data)));
  if(!ok) return showErr("budErr","לא נשמר. נסו שוב.");
  BUDGET={...data,id}; budEditing=false; renderBudget(); renderSofar(); buzz(10); toast("💰 התקציב נשמר");
};
function backupAge(){ const t=+load("trip-backup")||0; return t? Math.floor((Date.now()-t)/864e5) : null; }
function backupText(){ const d=backupAge(); return d===null ? "עוד לא נעשה" : d===0 ? "היום ✓" : d===1 ? "אתמול" : "לפני "+d+" ימים"; }
function renderBackup(){ const d=backupAge(), due= d===null||d>=7, el=$("backupState");
  if(el){ el.textContent=(due?"⚠️ ":"✓ ")+"גיבוי אחרון: "+backupText()+(due?". מומלץ פעם בשבוע.":""); el.classList.toggle("due",due); }
  if($("acctBackup")){ $("acctBackup").textContent=backupText(); $("acctBackup").style.color= due?"#b45309":""; } }
function quickUrl(kind){ return PAGE_URL+"?u="+encodeURIComponent(me)+"&add="+(kind==="me"?"me":"1")+keyHash(); }
function fillAcct(){ try{ renderMedals(); }catch(e){}
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
  $("acctNew").hidden=!canWrite; $("acctQuickBox").hidden=!canWrite; $("acctCount").textContent=active().length+" משתתפים";
  $("acctLockBtn").hidden=!open;
  renderBudget(); renderBackup();
  $("acctMine").textContent= view==="personal" ? "🤝 לחשבון המשותף" : "👤 להוצאות האישיות שלי";
  $("acctMine").hidden=!canWrite;
}
$("acctBtn").onclick=()=>{ buzz(6);
  if(!me||!person(me)){ const pk=$("picker"); if(!pk.hidden){ pk.scrollIntoView({behavior:"smooth",block:"center"}); } return; }
  fillAcct(); openSheet("acctSheet"); };
$("acctClose").onclick=()=>closeSheet("acctSheet");
$("acctBackupBtn").onclick=()=>$("exportBtn").click();
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
  if(a.length<8) return showErr("pwErr","סיסמה חדשה צריכה להיות לפחות 8 תווים");
  if(weakPw(a)) return showErr("pwErr","הסיסמה קלה לניחוש. בחרו משהו שלא דומה לשם ולא רק מספרים");
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
for(const k of ["f","p"]){ $(k+"Desc").addEventListener("input",()=>priceHint(k)); $(k+"Amt").addEventListener("input",()=>priceHint(k)); }
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
/* ================= welcome: for someone who opens the app without a trip link =================
   Two ways in: paste the link you got, or start a new trip of your own (a fresh private space, nobody else's).
   Yair & Gali's trip is never touched: it has its own key, and their links and home-screen icons carry it. */
/* the steps for a Siri Shortcut, with the link to paste into it */
/* ================= language for newcomers: the home page, opening a trip and the tour =================
   Hebrew by default; English when the phone is not in Hebrew, or when picked on the home page.
   (The app itself is in Hebrew.) */
function lang(){ const v=load("trip-lang"); if(v==="he"||v==="en") return v;
  /* many Israelis keep the phone in English: Hebrew if it is among the phone's languages, or the phone is on Israel time */
  try{ const ls=[...(navigator.languages||[]),navigator.language||""]; if(ls.some(l=>/^(he|iw)/i.test(l))) return "he"; if(/Jerusalem|Tel_Aviv/.test(Intl.DateTimeFormat().resolvedOptions().timeZone||"")) return "he"; return ls.length&&ls[0]?"en":"he"; }catch(e){ return "he"; } }
const TOUR={
  he:[["➕","רושמים הוצאה בשנייה","הכפתור הסגול למטה: סכום, שם, מי שילם. כל מטבע, וגם בקול. בלי קליטה? נשמר ועולה אחר כך."],
      ["🤝","מי חייב למי","כרטיס המאזן במסך \"משותף\" מראה בכל רגע מי חייב למי. כשמתאים, סוגרים חשבון בלחיצה."],
      ["🔐","הצד האישי שלך","לשונית \"אישי\": הוצאות שרק את/ה רואה, ארנק מזומן ותקציב. נעול בסיסמה שרק את/ה יודע/ת."],
      ["🔗","מזמינים את מי שטס איתך","לכל אחד קישור משלו. וכדי שזה ייראה כמו אפליקציה: בספארי ← שיתוף ← \"הוספה למסך הבית\"."]],
  en:[["➕","Add an expense in a second","The purple button at the bottom: amount, name, who paid. Any currency, even by voice. No signal? It's saved and syncs later."],
      ["🤝","Who owes whom","The balance card on the shared screen always shows who owes whom. Settle up with one tap."],
      ["🔐","Your private side","The personal tab: expenses only you see, a cash wallet and a budget, locked with your own password."],
      ["🔗","Invite your travel mates","Everyone gets their own link. To make it feel like an app: Safari → Share → “Add to Home Screen”. (The app itself is in Hebrew for now.)"]]};
function tour(first){
  /* inside the app (which is in Hebrew) the tour is Hebrew, unless English was picked on the home page */
  const L=load("trip-lang")==="en"?"en":"he", slides=TOUR[L], en=L==="en"; let i=0;
  const o=document.createElement("div"); o.className="tour"; o.setAttribute("role","dialog"); o.setAttribute("aria-label",en?"Quick tour":"סיור קצר"); o.dir=en?"ltr":"rtl";
  const draw=()=>{ const [ic,t,d]=slides[i], last=i===slides.length-1;
    o.innerHTML='<div class="tour-card"><div class="tour-dots">'+slides.map((_,k)=>'<i'+(k===i?' class="on"':'')+'></i>').join("")+'</div><div class="tour-ic">'+ic+'</div><b></b><p></p><div class="tour-act"><button type="button" class="btn small" data-a="skip"></button><button type="button" class="btn primary" data-a="next"></button></div></div>';
    o.querySelector("b").textContent=t; o.querySelector("p").textContent=d;
    const sk=o.querySelector('[data-a="skip"]'), nx=o.querySelector('[data-a="next"]');
    sk.textContent= last&&active().length>1 ? (en?"Send links":"🔗 שליחת קישורים") : (en?"Skip":"דילוג");
    nx.textContent= last ? (en?"Let's go ✈️":"יוצאים לדרך ✈️") : (en?"Next":"הבא");
    sk.onclick=()=>{ done(); if(last&&active().length>1) inviteSheet(); };
    nx.onclick=()=>{ if(last){ done(); if(first&&active().length>1) inviteSheet(); } else { i++; buzz(5); draw(); } }; };
  const done=()=>{ store("trip-tour","1"); o.remove(); };
  draw(); document.body.appendChild(o);
}
/* ================= inviting: a link for each of the others ================= */
function inviteSheet(){
  const o=document.createElement("div"); o.className="hist-bg"; o.setAttribute("role","dialog"); o.setAttribute("aria-label","הזמנה");
  const box=document.createElement("div"); box.className="hist"; o.appendChild(box); const close=()=>o.remove(); o.addEventListener("click",e=>{ if(e.target===o) close(); });
  const h=document.createElement("div"); h.className="hist-h"; const t=document.createElement("b"); t.textContent="🔗 מזמינים את מי שטס איתך"; const x=document.createElement("button"); x.type="button"; x.className="btn small"; x.textContent="סגירה"; x.onclick=close; h.append(t,x); box.appendChild(h);
  const q=document.createElement("p"); q.className="hint"; q.textContent="לכל אחד קישור משלו: נכנס ישר בתור עצמו, בלי הרשמה. שולחים בוואטסאפ."; box.appendChild(q);
  const others=active().filter(p=>p.id!==me);
  for(const p of others){ const r=document.createElement("div"); r.className="prow"; const n=document.createElement("b"); n.textContent=p.name; const sp=document.createElement("span"); const b=document.createElement("button"); b.type="button"; b.className="btn small primary"; b.textContent="שליחה ל"+p.name;
    b.onclick=()=>{ const u=personalUrl(p.id), tx="היי "+p.name+"! הטיול \""+(S.trip||"")+"\" באפליקציה, הקישור שלך: "+u; if(navigator.share) navigator.share({text:tx}).catch(()=>{}); else { try{ navigator.clipboard.writeText(u); toast("🔗 הקישור של "+p.name+" הועתק"); }catch(e){} } };
    r.append(n,sp,b); box.appendChild(r); }
  if(!others.length){ const e=document.createElement("p"); e.className="hint"; e.textContent="עוד אין שותפים. אפשר לשלוח את הקישור הכללי (בהגדרות), ומי שנכנס בו מוסיף את עצמו."; box.appendChild(e); }
  document.body.appendChild(o);
}
/* ================= backup to a file, and deleting a trip ================= */
function backupJson(){
  const mine= acct&&acctFor===me;
  const data={app:"trip-split",kind:"full-backup",at:new Date().toISOString(),version:(document.querySelector('meta[name="app-v"]')||{}).content||"",
    meta:META,items:ALL.map(({_mine,_alone,...x})=>x),
    ...(mine?{personal:{who:me,expenses:P.filter(x=>!x._pfx&&!x._fee),cash:CASH,budget:BUDGET||null,income:typeof INCOME!=="undefined"?INCOME:[]}}:{})};
  const blob=new Blob([JSON.stringify(data,null,1)],{type:"application/json"}), name="trip-backup-"+todayStr()+".json";
  try{ const f=new File([blob],name,{type:"application/json"}); if(navigator.canShare&&navigator.canShare({files:[f]})){ navigator.share({files:[f],title:name}).catch(()=>{}); return; } }catch(e){}
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1500);
  toast("💾 הגיבוי נשמר: "+name);
}
async function deleteTrip(){
  if(!canWrite) return; const T=tripById(curTrip)||{}, name=(T.name||S.trip||"").trim(), all=tripsList(), only=all.length<=1;
  const typed=prompt("כדי למחוק את \""+name+"\" וכל ההוצאות שלו אצל כולם, כותבים כאן את שם הטיול בדיוק:","");
  if(typed===null) return; if(typed.trim()!==name){ toast("השם לא תאם · לא נמחק כלום"); return; }
  if(isOurs()&&!confirm("זה הטיול של יאיר וגלי. בטוח למחוק אותו לתמיד?")) return;
  const mine=[...ALL.filter(x=>tripOf(x)===curTrip).map(x=>x.id),...P.filter(x=>!x._pfx&&!x._fee&&tripOf(x)===curTrip).map(x=>x.id),...CASH.filter(x=>tripOf(x)===curTrip).map(x=>x.id)];
  /* the expenses first, then the trip off the list (one save at a time: run() does not nest) */
  let ok=await run(async()=>{ let batch=db.batch(), n=0; const commits=[];
    for(const id of [...new Set(mine)]){ batch.delete(EXP().doc(id)); if(++n%400===0){ commits.push(batch.commit()); batch=db.batch(); } }
    if(only) batch.delete(metaRef());
    commits.push(batch.commit()); await Promise.all(commits); });
  if(ok&&!only) ok=await updateTrips(list=>{ const i=list.findIndex(x=>x.id===curTrip); if(i>=0) list.splice(i,1); });
  if(!ok){ toast("המחיקה לא הצליחה · בדקו את החיבור"); return; }
  if(only){ try{ localStorage.removeItem("trip-space"); localStorage.removeItem("trip-me"); }catch(e){} location.replace(PAGE_URL+"?welcome"); location.reload(); return; }
  const next=tripsList().find(x=>x.id!==curTrip); toast("🗑 \""+name+"\" נמחק"); if(next&&typeof switchTrip==="function") switchTrip(next.id); else location.reload();
}
function siriHelp(){
  const o=document.createElement("div"); o.className="hist-bg"; o.setAttribute("role","dialog"); o.setAttribute("aria-label","הוספה עם סירי");
  const box=document.createElement("div"); box.className="hist"; o.appendChild(box); const close=()=>o.remove(); o.addEventListener("click",e=>{ if(e.target===o) close(); });
  const h=document.createElement("div"); h.className="hist-h"; const t=document.createElement("b"); t.textContent="🎙️ \"היי סירי, הוצאה\""; const x=document.createElement("button"); x.type="button"; x.className="btn small"; x.textContent="סגירה"; x.onclick=close; h.append(t,x); box.appendChild(h);
  const kinds=[["shared","👫 הוצאה משותפת"],["me","🔐 הוצאה אישית"]]; let kind="shared";
  const sg=document.createElement("div"); sg.className="seg"; box.appendChild(sg);
  const steps=document.createElement("ol"); steps.className="siri-steps"; box.appendChild(steps);
  const link=document.createElement("input"); link.readOnly=true; link.className="siri-link"; link.setAttribute("aria-label","הקישור לקיצור"); box.appendChild(link);
  const cp=document.createElement("button"); cp.type="button"; cp.className="btn primary small"; cp.textContent="📋 העתקת הקישור"; box.appendChild(cp);
  const ex=document.createElement("small"); ex.className="here-tip"; ex.textContent="אחר כך: \"היי סירי, הוצאה\" ← \"קפה 60 באט, גלי שילמה בכרטיס\" ← האפליקציה נפתחת עם הכול ממולא, בודקים ושומרים. מה שאומרים נשאר בטלפון."; box.appendChild(ex);
  const draw=()=>{ seg(sg,kinds,v=>v===kind,v=>{ kind=v; draw(); });
    const u=quickUrl(kind)+"&say="; link.value=u;
    steps.innerHTML="";
    for(const s of ["פותחים את האפליקציה \"קיצורים\" (Shortcuts) ← ＋ קיצור חדש","מוסיפים פעולה \"הכתבת טקסט\" (Dictate Text), שפה: עברית","מוסיפים \"קידוד URL\" (URL Encode) על הטקסט שהוכתב","מוסיפים \"טקסט\": מדביקים את הקישור שלמטה, ומיד אחריו בוחרים את המשתנה \"טקסט מקודד\"","מוסיפים \"פתיחת כתובות URL\" (Open URLs) על הטקסט הזה","קוראים לקיצור \"הוצאה\" ושומרים"]){ const li=document.createElement("li"); li.textContent=s; steps.appendChild(li); } };
  cp.onclick=async()=>{ try{ await navigator.clipboard.writeText(link.value); toast("📋 הקישור הועתק · מדביקים בשלב 4"); }catch(e){ link.select(); toast("מסמנים ומעתיקים את הקישור"); } };
  draw(); document.body.appendChild(o);
}
/* ================= the home page: what this is, for someone who has no trip yet =================
   A real page (not a pop-up): what it does, how it works, privacy, questions, and the two ways in.
   Open it any time with ?welcome — on a phone that already has a trip, a button leads back to it. */
const LP={
 he:{dir:"rtl",title:"יומן הטיול · כל הכסף של הטיול במקום אחד",switch:"English",back:"↩️ חזרה לטיול שלנו",h1:"כל הכסף של הטיול,<br>במקום אחד.",sub:"אפליקציה לזוגות וחברים שמטיילים ביחד: רושמים הוצאה בשנייה, בכל מטבע, ויודעים בכל רגע כמה הוצאתם, מי שילם, ומי חייב למי.",
   new:"✨ פותחים טיול חדש",have:"🔗 קיבלתי קישור מחבר",have2:"🔗 קיבלתי קישור",mini:"חינם · בלי הרשמה ובלי סיסמה · עובד גם בלי קליטה",inside:"מה יש בפנים",how:"איך זה עובד",priv:"🔒 פרטי באמת",faq:"שאלות",end:"יוצאים לדרך?",
   feats:[["🤝","מי חייב למי","כל הוצאה משותפת נכנסת לחשבון. בכל רגע רואים \"גלי חייבת לך ₪320\", וסוגרים בלחיצה."],["➗","חלוקה איך שנוח","חצי־חצי, באחוזים, לפי מנות, או \"כל אחד שילם על עצמו\". הכול נספר נכון."],["💱","כל מטבע","באט, דונג, דולר ושקלים. כל הוצאה נשמרת בשער של אותו יום, ורואים הכול בשקלים או במטבע המקומי."],["📊","כמה הוצאנו","היום, החודש, בכל עיר ובכל מדינה. ממוצע יומי, ואפשר לפרוס מלון לשבוע כדי שלא יקפיץ את הממוצע."],["🌍","המסע על גלובוס","כל היעדים על כדור הארץ עם יום ולילה, ולכל עיר כמה עלתה וכמה ימים הייתם בה."],["🔐","אישי ומוצפן","לכל אחד יש צד אישי עם סיסמה: הוצאות שלו, ארנק מזומן, תקציב, ו\"מספיק לעוד X ימים\". אף אחד אחר לא רואה."],["🛂","ויזה ותזכורות","כמה ימים נשארו בכל מדינה, ותזכורת שבוע לפני. לפני מעבר גבול: \"כדאי לסגור חשבון\"."],["💬","\"מה זה היה?\"","הערות על כל הוצאה, גרסאות קודמות לכל עריכה, וחיפוש לפי עיר, מדינה, תאריך או סכום."],["🎙️","בקול","\"היי סירי, הוצאה: קפה 60 באט\". או מקריאים לטלפון, והטופס מתמלא לבד."]],
   steps:[["פותחים טיול.","השם שלך, עם מי טסים, לאן ומתי. לוקח חצי דקה."],["שולחים קישור למי שטס איתך.","הוא נכנס ישר, בלי הרשמה."],["רושמים הוצאות.","כל אחד מהטלפון שלו. הכול מתעדכן אצל כולם מיד."]],
   privText:"כל טיול נשמר מאחורי מפתח אקראי ארוך שנמצא רק בקישור שלכם. בלי הקישור אי אפשר לראות או לשנות כלום, ואין רשימה של טיולים. הצד האישי מוצפן בסיסמה שרק אתם יודעים, והמיקום נשמר רק בטלפון.",
   qs:[["זה עולה כסף?","לא. אין תשלום, אין פרסומות, ואין צורך להוריד משהו מהחנות."],["צריך להירשם?","לא. אין משתמש, מייל או סיסמה כדי להיכנס. הקישור הוא הכניסה. סיסמה יש רק לצד האישי, אם רוצים אותו."],["מה רואה מי שטס איתי?","את ההוצאות המשותפות ואת החשבון ביניכם. את ההוצאות האישיות שלך הוא לא רואה."],["ומה אם אין קליטה?","רושמים כרגיל. ההוצאה נשמרת בטלפון ועולה לבד כשחוזרת קליטה."],["איך זה נראה כמו אפליקציה?","באייפון: פותחים בספארי ← כפתור השיתוף ← \"הוספה למסך הבית\". מקבלים אייקון שנפתח במסך מלא."],["איבדתי את הקישור","מבקשים אותו ממי שטס איתך: אצלו בהגדרות יש קישור לכל אחד."]]},
 en:{dir:"ltr",title:"Trip Journal · all the trip's money in one place",switch:"עברית",back:"↩️ Back to our trip",h1:"All the trip's money,<br>in one place.",sub:"For couples and friends travelling together: add an expense in a second, in any currency, and always know how much you've spent, who paid, and who owes whom.",
   new:"✨ Start a new trip",have:"🔗 I got a link from a friend",have2:"🔗 I have a link",mini:"Free · no sign-up, no password · works offline",inside:"What's inside",how:"How it works",priv:"🔒 Private, for real",faq:"Questions",end:"Ready to go?",
   feats:[["🤝","Who owes whom","Every shared expense goes into the account. See “Dana owes you ₪320” at any moment and settle up with one tap."],["➗","Split your way","Half-half, by percentages, by dishes, or “everyone paid their own”. It all adds up."],["💱","Any currency","Baht, dong, dollars and shekels. Each expense keeps the rate of its day; see everything in your currency or the local one."],["📊","How much we spent","Today, this month, per town and per country. A daily average, and you can spread a week's hotel so it doesn't skew it."],["🌍","Your trip on a globe","Every stop on a real globe with day and night, and for each town what it cost and how long you stayed."],["🔐","Private and encrypted","Everyone has a personal side with a password: own expenses, a cash wallet, a budget and “enough for N more days”. Nobody else sees it."],["🛂","Visa and reminders","Days left in each country and a reminder a week before. Before a border: “time to settle up”."],["💬","“What was this?”","Notes on any expense, earlier versions of every edit, and search by town, country, date or amount."],["🎙️","By voice","“Hey Siri, expense: coffee 60 baht”, or just speak and the form fills itself."]],
   steps:[["Start a trip.","Your name, who's coming, where and when. Half a minute."],["Send a link to your travel mates.","They're in right away, no sign-up."],["Add expenses.","Everyone from their own phone; it updates for everyone instantly."]],
   privText:"Every trip sits behind a long random key that exists only in your link. Without it nobody can see or change anything, and there is no list of trips. The personal side is encrypted with a password only you know, and your location stays on your phone.",
   qs:[["Does it cost anything?","No. No payment, no ads, nothing to download from a store."],["Do I need to sign up?","No. No user, email or password to get in: the link is the way in. A password exists only for the personal side, if you want it."],["What do my travel mates see?","The shared expenses and the account between you. Not your personal ones."],["What if there's no signal?","Add as usual. It's saved on the phone and uploads by itself when you're back online."],["How do I make it look like an app?","On iPhone: open in Safari → Share → “Add to Home Screen”. You get an icon that opens full screen."],["I lost the link","Ask a travel mate: in their settings there's a link for everyone."],["Is the app in English?","The home page, opening a trip and the tour are. Inside, the app is in Hebrew for now."]]}};
function landing(back){
  const T=LP[lang()];
  document.title=T.title;
  const old=document.getElementById("landing"); if(old) old.remove();
  const L=document.createElement("div"); L.id="landing"; L.setAttribute("dir",T.dir); L.lang=lang();
  const esc=t=>String(t).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  const F=([ic,t,d])=>'<div class="lp-f"><span class="lp-ic">'+ic+'</span><b>'+esc(t)+'</b><p>'+esc(d)+'</p></div>';
  const Q=([q,a])=>'<details class="lp-q"><summary>'+esc(q)+'</summary><p>'+esc(a)+'</p></details>';
  L.innerHTML=
   '<header class="lp-hero">'+
    '<div class="lp-top">'+(back?'<button class="lp-back" id="lpBack" type="button">'+T.back+'</button>':'<span></span>')+'<div class="lp-lang" id="lpLang" role="group" aria-label="שפה · Language"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg><button type="button" id="lpHe" data-l="he" lang="he" aria-pressed="'+(lang()!=="en")+'">עב</button><button type="button" id="lpEn" data-l="en" lang="en" aria-pressed="'+(lang()==="en")+'">EN</button></div></div>'+
    '<div class="lp-logo">🧳</div><h1>'+T.h1+'</h1><p class="lp-sub">'+esc(T.sub)+'</p>'+
    '<div class="lp-cta"><button class="lp-btn main" id="lpNew" type="button">'+T.new+'</button><button class="lp-btn" id="lpHave" type="button">'+T.have+'</button></div>'+
    '<p class="lp-mini">'+T.mini+'</p></header>'+
   '<section class="lp-sec"><h2>'+T.inside+'</h2><div class="lp-grid">'+T.feats.map(F).join("")+'</div></section>'+
   '<section class="lp-sec"><h2>'+T.how+'</h2><ol class="lp-steps">'+T.steps.map(([a,b])=>'<li><b>'+esc(a)+'</b> '+esc(b)+'</li>').join("")+'</ol></section>'+
   '<section class="lp-sec lp-priv"><h2>'+T.priv+'</h2><p>'+esc(T.privText)+'</p></section>'+
   '<section class="lp-sec"><h2>'+T.faq+'</h2>'+T.qs.map(Q).join("")+'</section>'+
   '<footer class="lp-end"><h2>'+T.end+'</h2><div class="lp-cta"><button class="lp-btn main" id="lpNew2" type="button">'+T.new+'</button><button class="lp-btn" id="lpHave2" type="button">'+T.have2+'</button></div></footer>';
  document.body.appendChild(L); document.body.style.overflow="hidden";
  for(const id of ["lpNew","lpNew2"]) L.querySelector("#"+id).onclick=()=>newTripForm(true);
  for(const id of ["lpHave","lpHave2"]) L.querySelector("#"+id).onclick=()=>askForLink(lang()==="en"?"Your trip link":"הקישור של הטיול");
  L.querySelectorAll("#lpLang button").forEach(b=>b.onclick=()=>{ if(b.dataset.l===lang()) return; store("trip-lang",b.dataset.l); landing(back); });
  const b=L.querySelector("#lpBack"); if(b) b.onclick=()=>{ location.replace(PAGE_URL); };
}
function welcome(){
  document.title="יומן הטיול";
  const inp='style="font:inherit;font-size:16px;padding:12px;border:1.5px solid #ddd6f5;border-radius:12px;width:100%;box-sizing:border-box"';
  const btn=(id,t,main)=>'<button id="'+id+'" type="button" style="font:inherit;font-size:16px;font-weight:700;padding:13px;border-radius:14px;border:'+(main?'0;background:linear-gradient(135deg,#6C4BFF,#FF4D8D);color:#fff':'1.5px solid #ddd6f5;background:#fff;color:#1d1630')+';cursor:pointer">'+t+'</button>';
  const g=gate('<div style="font-size:44px">🧳</div><b style="font-size:22px">כל הכסף של הטיול, במקום אחד</b><div style="color:#6a6378;font-size:15px">מי שילם, כמה הוצאתם, מי חייב למי, ואיפה הייתם. פרטי לגמרי: רק מי שמקבל מכם קישור רואה את הטיול.</div>'+btn("wNew","✨ פתיחת טיול חדש",true)+btn("wHave","🔗 קיבלתי קישור מחבר",false));
  g.querySelector("#wHave").onclick=()=>askForLink("הקישור של הטיול");
  g.querySelector("#wNew").onclick=()=>newTripForm();
}
const NT={he:{dir:"rtl",m:"זכר",f:"נקבה",title:"✨ טיול חדש",me:"השם שלך",meP:"למשל: נועה",mates:"עם מי טסים? (אפשר להשאיר ריק, עד 5 חברים)",mate1:"למשל: איתי",mateN:"עוד חבר/ה",more:"➕ עוד מישהו",trip:"שם הטיול",tripP:"למשל: המזרח 2027",where:"לאן טסים קודם?",date:"תאריך הטיסה",go:"יוצאים לדרך ✈️",going:"פותחים את הטיול…",back:"חזרה",eName:"צריך את השם שלך",eSame:"יש שני שמות זהים · כדאי להוסיף אות כדי להבדיל",eDate:"צריך תאריך טיסה",eFail:"לא הצלחנו לפתוח את הטיול",eNet:"בדקו את החיבור ונסו שוב.",def:(a,o)=>"הטיול של "+a+(o.length===1?" ו"+o[0].name:o.length?" והחברים":"")},
 en:{dir:"ltr",m:"male",f:"female",title:"✨ A new trip",me:"Your name",meP:"e.g. Noa",mates:"Who's coming? (optional, up to 5 friends)",mate1:"e.g. Itai",mateN:"another friend",more:"➕ Someone else",trip:"Trip name",tripP:"e.g. Asia 2027",where:"Where do you fly first?",date:"Flight date",go:"Let's go ✈️",going:"Opening the trip…",back:"Back",eName:"Your name, please",eSame:"Two names are the same · add a letter to tell them apart",eDate:"A flight date, please",eFail:"Couldn't open the trip",eNet:"Check the connection and try again.",def:(a,o)=>a+(o.length===1?" & "+o[0].name:o.length?" & friends":"")+"'s trip"}};
function newTripForm(){
  const N=NT[lang()];
  const inp='style="font:inherit;font-size:16px;padding:11px;border:1.5px solid #ddd6f5;border-radius:12px;width:100%;box-sizing:border-box;background:#fff;color:#1d1630;-webkit-appearance:none;appearance:none"';
  const ctry=Object.keys(CTRY).filter(k=>k!=="ILS").sort((a,b)=>CTRY[a].split(" ").slice(1).join(" ").localeCompare(CTRY[b].split(" ").slice(1).join(" "),"he")).map(k=>'<option value="'+k+'"'+(k==="THB"?" selected":"")+'>'+CTRY[k]+'</option>').join("");
  const gsel=id=>'<select id="'+id+'" '+inp.replace('width:100%','width:auto')+'><option value="m">'+N.m+'</option><option value="f">'+N.f+'</option></select>';
  const g=gate('<b style="font-size:20px">'+N.title+'</b><style>#spaceGate label{color:#4a4360;font-size:14px}</style>'+
    '<label style="display:flex;flex-direction:column;gap:6px">'+N.me+'<span style="display:flex;gap:8px"><input id="nMe" maxlength="20" '+inp+' placeholder="'+N.meP+'">'+gsel("nMeG")+'</span></label>'+
    '<div style="display:flex;flex-direction:column;gap:6px"><span style="color:#4a4360;font-size:14px">'+N.mates+'</span><div id="nMates" style="display:flex;flex-direction:column;gap:8px"></div><button id="nMore" type="button" style="align-self:flex-start;font:inherit;font-size:14px;background:none;border:1.5px dashed #c9c0ee;border-radius:12px;padding:8px 12px;color:#4a4360;cursor:pointer">'+N.more+'</button></div>'+
    '<label style="display:flex;flex-direction:column;gap:6px">'+N.trip+'<input id="nTrip" maxlength="40" '+inp+' placeholder="'+N.tripP+'"></label>'+
    '<label style="display:flex;flex-direction:column;gap:6px">'+N.where+'<select id="nCtry" '+inp+'>'+ctry+'</select></label>'+
    '<label style="display:flex;flex-direction:column;gap:6px">'+N.date+'<input id="nDate" type="date" '+inp+'></label>'+
    '<div id="nErr" style="color:#c0392b;font-size:14px"></div>'+
    '<button id="nGo" type="button" style="font:inherit;font-size:16px;font-weight:700;padding:13px;border-radius:14px;border:0;background:linear-gradient(135deg,#6C4BFF,#FF4D8D);color:#fff;cursor:pointer">'+N.go+'</button>'+
    '<button id="nBack" type="button" style="font:inherit;background:none;border:0;color:#6a6378;cursor:pointer">'+N.back+'</button>');
  { const c=g.querySelector("#spaceGate > div")||g.firstElementChild; if(c){ c.dir=N.dir; c.style.textAlign=N.dir==="ltr"?"left":"right"; } }
  g.querySelector("#nDate").value=todayStr();
  const mates=g.querySelector("#nMates"), addMate=()=>{ const n=mates.children.length; if(n>=5) return; const row=document.createElement("span"); row.style.cssText="display:flex;gap:8px"; row.innerHTML='<input class="nMate" maxlength="20" '+inp+' placeholder="'+(n?N.mateN:N.mate1)+'">'+gsel("nMateG"+n).replace('id="nMateG'+n+'"','class="nMateG"'); mates.appendChild(row); g.querySelector("#nMore").hidden=mates.children.length>=5; if(n) row.querySelector("input").focus(); };
  addMate(); g.querySelector("#nMore").onclick=addMate;
  g.querySelector("#nBack").onclick=()=>{ const x=document.getElementById("spaceGate"); if(document.getElementById("landing")&&x) x.remove(); else welcome(); };
  g.querySelector("#nGo").onclick=async()=>{
    const v=id=>g.querySelector("#"+id).value.trim(), err=t=>{ g.querySelector("#nErr").textContent=t; };
    const a=v("nMe"), date=v("nDate"), cur=v("nCtry"); if(!a) return err(N.eName);
    const others=[...g.querySelectorAll("#nMates > span")].map(r=>({name:r.querySelector(".nMate").value.trim(),g:r.querySelector(".nMateG").value})).filter(x=>x.name);
    if(new Set([a,...others.map(x=>x.name)]).size<others.length+1) return err(N.eSame);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) return err(N.eDate);
    const people=[{id:"p1",name:a,g:v("nMeG")},...others.map((x,i)=>({id:"p"+(i+2),name:x.name,g:x.g}))];
    const name=v("nTrip")||N.def(a,others), k=newKey();
    const go=g.querySelector("#nGo"); go.disabled=true; go.textContent=N.going;
    try{ await db.collection("spaces").doc(k).collection("trip").doc("meta").set({trip:name,localCur:cur,startDate:date,people,trips:[{id:"t1",name,localCur:cur,startDate:date}],createdAt:Date.now(),fresh:true});
      store("trip-space",k); store("trip-me","p1"); store("trip-invite","1");
      location.replace(PAGE_URL+"?u=p1#k="+k); location.reload(); }
    catch(e){ console.error(e); go.disabled=false; go.textContent=N.go; err(N.eFail+" ("+(e.code||e.message||"error")+"). "+N.eNet); }
  };
}
function askForLink(msg){
  const EN=lang()==="en";
  const g=gate('<div style="font-size:40px">🔒</div><b style="font-size:20px">'+msg+'</b><div style="color:#6a6378;font-size:15px">'+(EN?"Paste the link you got on WhatsApp and you're in. Only once on this phone.":"הדביקו כאן את הקישור שקיבלתם בוואטסאפ, ותיכנסו. צריך לעשות את זה רק פעם אחת בטלפון הזה.")+'</div><input id="gateIn" type="url" inputmode="url" placeholder="'+(EN?"Paste the link here":"הדביקו כאן את הקישור")+'" style="font:inherit;font-size:16px;padding:12px 14px;border-radius:12px;border:2px solid #e3dcf2;direction:ltr"><div id="gateErr" style="color:#c2185b;font-size:14px;min-height:1em"></div><button id="gateGo" type="button" class="btn">'+(EN?"Let me in":"כניסה")+'</button>');
  { const c=g.firstElementChild; if(c&&EN){ c.dir="ltr"; c.style.textAlign="left"; } }
  g.querySelector("#gateGo").onclick=()=>{
    const v=g.querySelector("#gateIn").value.trim(); const m=/[#&]k=([a-z0-9]{32,64})/.exec(v);
    if(!m){ g.querySelector("#gateErr").textContent=(EN?"That doesn't look like a trip link. Copy the whole link and try again.":"זה לא נראה כמו הקישור של הטיול. העתיקו את כל הקישור ונסו שוב."); return; }
    store("trip-space",m[1]); const u=/[?&]u=([^&#]+)/.exec(v);
    location.replace(PAGE_URL+(u?"?u="+u[1]:"")+"#k="+m[1]); location.reload(); /* a hash-only change does not reload by itself */
  };
}
async function noSpace(){
  const legacyMeta=db.collection("trip").doc("meta");
  let snap=null; try{ snap=await legacyMeta.get(); }catch(e){}
  if(!snap||!snap.exists||snap.data().migrated){ landing(false); return; }
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
/* transactions (people, trips, usernames, passwords) cannot wait offline the way plain saves can */
{ const rt=db.runTransaction.bind(db); db.runTransaction=f=> navigator.onLine===false ? Promise.reject(Object.assign(new Error("offline"),{code:"needs-network"})) : rt(f); }
/* ?welcome shows the home page (on a phone with a trip, with a way back to it) */
if(readParam("welcome")!==null){ landing(!!SPACE); return; }
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
    if(load("trip-invite")==="1"){ try{ localStorage.removeItem("trip-invite"); }catch(e){} setTimeout(()=>tour(true),900); }
    /* opened from the quick-add icon or shortcut: straight to a new expense */
    if(QUICK&&canWrite&&me){
      view= QUICK==="me"&&me ? "personal" : "shared";
      if(me) syncUrl();
      setTimeout(()=>{ renderAll(); openAdd(); if(SAY) setTimeout(()=>{ voiceFill(QUICK==="me"?"me":"shared",SAY); toast("🎙️ מסירי: "+SAY+" · בודקים ושומרים"); },350); },350);
    }
  }
  renderAll();
};
const timer=setTimeout(()=>{ if(!loaded) $("status").textContent="הנתונים עדיין לא נטענו. בדקו את החיבור לאינטרנט."; },10000);
metaRef().onSnapshot(async s=>{
  if(!s.exists){
    /* a link to a trip that has nothing in it: offer to start one (never fill it with someone else's trip) */
    if(!["yair","gali"].includes(readParam("u")||load("trip-me")||"")){ newTripForm(); return; }
    try{ await db.runTransaction(async tx=>{ const c=await tx.get(metaRef()); if(c.exists) return; tx.set(metaRef(),SEED_META); for(const it of SEED_ITEMS){ const {id,...rest}=it; tx.set(EXP().doc(id),rest); } }); }
    catch(e){ console.error(e); $("status").textContent="לא הצלחנו ליצור את הטיול במסד הנתונים."; }
    return;
  }
  const d=s.data(); const prevLocal=S.localCur;
  setTimeout(freezeOld,4000);
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
