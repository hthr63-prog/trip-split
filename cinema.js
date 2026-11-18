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

  /* ---- 1. depth: cards rise out of the page ---- */
  const DEPTH="#viewShared > section:not(.hero), #viewShared > .add-cta, #viewPersonal > .stack > section, #viewPersonal > section, #viewPersonal .add-cta, #viewStats > section, #ticket, .insight, #ledger > .monthfold, #pLedger > .monthfold";
  const touched=new Set();
  function depth(){
    const vh=innerHeight;
    for(const el of document.querySelectorAll(DEPTH)){
      if(!el.offsetParent) continue;
      const r=el.getBoundingClientRect();
      if(r.top>vh*0.62&&r.top<vh+40){
        const e=ease(clamp((vh-r.top)/(vh*0.38),0,1)), k=1-e;
        el.style.transform=`perspective(1000px) translate3d(0,${(k*70).toFixed(1)}px,${(-k*160).toFixed(1)}px) rotateX(${(k*16).toFixed(2)}deg)`;
        el.style.opacity=(0.2+0.8*e).toFixed(3); el.style.transformOrigin="50% 0"; touched.add(el);
      }else if(touched.has(el)){ el.style.transform=""; el.style.opacity=""; touched.delete(el); }
    }
  }

  /* ---- 2. kinetic titles: words rise into focus, the title settles from large to its size ---- */
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
  function titles(){
    const vh=innerHeight;
    for(const b of document.querySelectorAll(".bighead")){
      if(!b.offsetParent) continue; const r=b.getBoundingClientRect();
      if(r.bottom<-40||r.top>vh+40) continue;
      const p=clamp((vh*0.95-r.top)/(vh*0.42),0,1);
      const ws=b.querySelectorAll(".kw > span"), n=ws.length||1;
      ws.forEach((w,i)=>{ const l=ease(clamp(p*1.55-i*(0.55/n),0,1)), k=1-l;
        w.style.transform=`translate3d(0,${(k*0.95).toFixed(3)}em,0) rotate(${(k*-7).toFixed(2)}deg)`;
        w.style.opacity=l.toFixed(3); w.style.filter=k>0.02?`blur(${(k*7).toFixed(1)}px)`:""; });
      const h=b.querySelector("h2"); if(h) h.style.transform=`scale(${(1+(1-ease(p))*0.18).toFixed(3)})`;
      const s=b.querySelector("small"); if(s){ s.style.letterSpacing=(0.18+(1-ease(p))*0.5).toFixed(3)+"em"; s.style.opacity=(0.3+0.7*ease(p)).toFixed(3); }
    }
  }

  /* ---- 3. hero camera push: near layers move and grow faster than far ones ---- */
  const LAYERS=[[".hero .stars",.12],[".hero .cloud",.28],[".hero .sc:not([style])",.5],[".hero .waves",.68],[".hero .sc[style]",.85]];
  function camera(){
    const h=document.getElementById("hero"); if(!h||h.hidden) return;
    const r=h.getBoundingClientRect(); if(r.bottom<0) return;
    const y=clamp(scrollY,0,r.bottom+scrollY);   /* the camera moves from the first pixel of scroll */
    for(const [sel,d] of LAYERS) for(const g of h.querySelectorAll(sel)){
      g.style.transform=y>0?`translate(0px,${(-y*d*0.32).toFixed(1)}px) scale(${(1+y/r.height*d*0.55).toFixed(4)})`:"";
    }
  }

  let ticking=false;
  function frame(){ ticking=false; if(calm()) return; depth(); titles(); camera(); }
  const ask=()=>{ if(!ticking){ ticking=true; requestAnimationFrame(frame); } };
  addEventListener("scroll",ask,{passive:true}); addEventListener("resize",ask);
  /* re-renders replace parts of the page: pick up new titles and positions */
  new MutationObserver(()=>{ splitTitles(); ask(); }).observe(document.documentElement,{childList:true,subtree:true});
  splitTitles(); ask(); setTimeout(ask,400);

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
