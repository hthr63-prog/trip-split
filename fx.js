/* Editorial layer: the page changes colour as you scroll from chapter to chapter,
   and the travel stack in the hero comes apart into its layers as the page moves. */
(function(){
  const root=document.documentElement;
  const calm=()=>{ try{ return matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){ return false; } };

  /* chapter colours: whichever chapter is nearest the upper third of the screen sets the tone */
  let tone="";
  function pickTone(){
    const marks=[...document.querySelectorAll("[data-tone]")].filter(el=>el.offsetParent!==null);
    const line=innerHeight*0.38; let best=null;
    for(const el of marks){ const r=el.getBoundingClientRect(); if(r.top<=line) best=el; }
    const t=(best&&best.dataset.tone)||"base";
    if(t!==tone){ tone=t; root.dataset.tone=t; }
  }

  /* hero: 0 when the hero is fully on screen, 1 once it has scrolled away */
  function stack(){
    const h=document.getElementById("hero"); if(!h||h.hidden) return;
    const r=h.getBoundingClientRect(); const p=Math.min(1,Math.max(0,-r.top/(r.height*0.9)));
    h.style.setProperty("--p",calm()?0:p.toFixed(3));
  }

  let queued=false;
  function frame(){ queued=false; pickTone(); stack(); }
  function ask(){ if(!queued){ queued=true; requestAnimationFrame(frame); } }
  addEventListener("scroll",ask,{passive:true});
  addEventListener("resize",ask);
  /* the app re-renders often; re-check after its paints */
  new MutationObserver(ask).observe(document.body,{subtree:true,attributes:true,attributeFilter:["hidden"],childList:false});
  setInterval(ask,1200);
  ask();
})();
