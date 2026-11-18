/* Cinema layer: the page moves like a film as you scroll.
   - cards come up out of depth (tilted back, small, faint) and settle flat as they reach you
   - the big chapter titles are set word by word, each word rising and coming into focus
   - the hero is a camera push: every layer of the landscape moves at its own depth
   - opening a month or a day deals its cards in from depth, one after another
   Everything is transform/opacity on the compositor; nothing runs when the phone asks for less motion. */
(function(){
  const calm=()=>{ try{ return matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){ return false; } };
  const clamp=(v,a,b)=>v<a?a:v>b?b:v;
  const ease=t=>1-Math.pow(1-t,3);
  window.__cinema=true;

  /* Scroll-linked motion lagged behind the iPhone's own scrolling (the page shook and stalled), so nothing here
     follows the scroll any more: things play ONCE, on the compositor, when they come into view. */

  /* ---- 1. depth: a card rises out of the page the first time it comes into view ---- */
  const DEPTH="#viewShared > section:not(.hero):not(.ticket), #viewShared > .add-cta, #viewPersonal section, #viewPersonal .add-cta, #viewStats > section, .insight, #ledger > .monthfold, #pLedger > .monthfold";
  const seen=new WeakSet();
  const io=("IntersectionObserver" in window) ? new IntersectionObserver(es=>{
    for(const e of es){ if(!e.isIntersecting) continue; const el=e.target; io.unobserve(el); if(calm()||!el.animate) continue;
      if(el.classList.contains("bighead")){ words(el); continue; }
      el.animate([{opacity:0,transform:"perspective(1000px) translate3d(0,56px,-120px) rotateX(14deg)"},{opacity:1,transform:"none"}],
        {duration:720,easing:"cubic-bezier(.2,.85,.25,1)"});
    } },{rootMargin:"0px 0px -8% 0px",threshold:0.01}) : null;
  function watch(){
    if(!io) return; const vh=innerHeight;
    for(const el of document.querySelectorAll(DEPTH+", .bighead")){
      if(seen.has(el)||!el.offsetParent) continue; seen.add(el);
      /* already on screen when the page opens: leave it alone */
      if(el.getBoundingClientRect().top<vh*0.92) continue;
      io.observe(el);
    }
  }

  /* ---- 2. kinetic titles: words rise into focus one after another ---- */
  function splitTitles(){
    for(const h of document.querySelectorAll(".bighead h2:not([data-cut])")){
      h.dataset.cut="1"; const parts=[];
      for(const n of [...h.childNodes]){
        if(n.nodeType===3){ for(const w of n.textContent.split(/(\s+)/)){ if(!w) continue; if(/^\s+$/.test(w)){ parts.push(document.createTextNode(w)); continue; }
            const o=document.createElement("span"); o.className="kw"; const i=document.createElement("span"); i.textContent=w; o.appendChild(i); parts.push(o); } }
        else parts.push(n);
      }
      h.textContent=""; parts.forEach(p=>h.appendChild(p));
      h.setAttribute("aria-label",h.textContent);
    }
  }
  function words(b){
    const ws=[...b.querySelectorAll(".kw > span")];
    ws.forEach((w,i)=>w.animate([{opacity:0,transform:"translate3d(0,.9em,0) rotate(-7deg)",filter:"blur(6px)"},{opacity:1,transform:"none",filter:"blur(0)"}],
      {duration:700,delay:i*110,easing:"cubic-bezier(.2,.9,.25,1.05)",fill:"backwards"}));
    const h=b.querySelector("h2"); if(h) h.animate([{transform:"scale(1.14)"},{transform:"none"}],{duration:900+ws.length*110,easing:"cubic-bezier(.2,.8,.2,1)"});
    const s=b.querySelector("small"); if(s) s.animate([{opacity:0,letterSpacing:".6em"},{opacity:1}],{duration:800,easing:"ease-out"});
  }

  /* re-renders replace parts of the page: look for new titles and cards, at most a few times a second */
  let pend=0;
  const later=()=>{ if(pend) return; pend=setTimeout(()=>{ pend=0; splitTitles(); watch(); },250); };
  new MutationObserver(later).observe(document.getElementById("app")||document.body,{childList:true,subtree:true});
  splitTitles(); setTimeout(watch,300);
  const ask=later;

  /* ---- 5. the balance card is a real card: it leans with the phone (or the finger) and its sheen moves ---- */
  (function tilt(){
    const T=()=>document.getElementById("ticket");
    let gx=0, gy=0, fx=null, asked=false, cur={x:0,y:0}, raf=0;
    const paint=()=>{ raf=0; const t=T(); if(!t||calm()) return; if(!t.querySelector(":scope > .sheen")){ const i=document.createElement("i"); i.className="sheen"; i.setAttribute("aria-hidden","true"); t.appendChild(i); } const tx=fx?fx.x:gx, ty=fx?fx.y:gy;
      cur.x+=(tx-cur.x)*.18; cur.y+=(ty-cur.y)*.18;
      t.style.transform=`perspective(900px) rotateX(${(-cur.y*7).toFixed(2)}deg) rotateY(${(cur.x*9).toFixed(2)}deg)`;
      t.style.setProperty("--sx",(50+cur.x*40).toFixed(1)+"%"); t.style.setProperty("--sy",(30+cur.y*40).toFixed(1)+"%");
      if(Math.abs(tx-cur.x)>.002||Math.abs(ty-cur.y)>.002) raf=requestAnimationFrame(paint); };
    const go=()=>{ if(!raf) raf=requestAnimationFrame(paint); };
    addEventListener("deviceorientation",e=>{ if(e.gamma==null) return; const nx=clamp(e.gamma/30,-1,1), ny=clamp((e.beta-45)/30,-1,1);
      if(Math.abs(nx-gx)<.03&&Math.abs(ny-gy)<.03) return;   /* ignore the sensor's tiny noise: no work while the phone is still */
      const t=T(); if(!t) return; const r=t.getBoundingClientRect(); if(r.bottom<0||r.top>innerHeight) return;   /* only while the card is on screen */
      gx=nx; gy=ny; go(); },{passive:true});
    document.addEventListener("pointerdown",e=>{ const t=T(); if(!t||!t.contains(e.target)) return;
      /* iPhone asks once for permission to use the motion sensor, on the first touch of the card */
      if(!asked&&window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function"){ asked=true; DeviceOrientationEvent.requestPermission().catch(()=>{}); }
      if(e.target.closest("button")) return; const r=t.getBoundingClientRect(); fx={x:(e.clientX-r.left)/r.width*2-1,y:(e.clientY-r.top)/r.height*2-1}; go(); },{passive:true});
    document.addEventListener("pointermove",e=>{ if(!fx) return; const t=T(); if(!t) return; const r=t.getBoundingClientRect(); fx={x:clamp((e.clientX-r.left)/r.width*2-1,-1,1),y:clamp((e.clientY-r.top)/r.height*2-1,-1,1)}; go(); },{passive:true});
    const up=()=>{ if(fx){ fx=null; go(); } }; document.addEventListener("pointerup",up); document.addEventListener("pointercancel",up);
  })();

  /* ---- 4. deal: cards fly in from depth one after another ---- */
  function deal(els){
    if(calm()||!els||!els.length) return;
    els.slice(0,12).forEach((el,i)=>{ if(!el.animate) return;
      const tilt=(i%2?1:-1)*(4+i%3*2);
      el.animate([
        {opacity:0,transform:`perspective(900px) translate3d(0,46px,-260px) rotateX(28deg) rotateZ(${tilt}deg)`,filter:"blur(9px)"},
        {opacity:1,offset:.6,filter:"blur(0px)"},
        {opacity:1,transform:"none",filter:"blur(0px)"}
      ],{duration:640,delay:i*55,easing:"cubic-bezier(.2,.9,.25,1.08)",fill:"backwards"});
    });
  }
  window.Cinema={deal,refresh:ask,
    /* after a month opened: its days; after a day opened: its expenses */
    opened(list,kind,key){ requestAnimationFrame(()=>{ const L=document.getElementById(list); if(!L) return; let els=[];
      if(kind==="m"){ const m=L.querySelector(`.monthfold[data-ym="${key}"]`); let n=m&&m.nextElementSibling; while(n&&!n.classList.contains("monthfold")){ els.push(n); n=n.nextElementSibling; } }
      else { const d=L.querySelector(`.day[data-date="${key}"]`); if(d) els=[...d.querySelectorAll(":scope > .swipe, :scope > .row")]; }
      deal(els); window.__deck=false; }); } };
})();
