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

  /* day / sunrise-sunset / night in the hero, by the clock on this phone */
  /* sunrise and sunset for a place and day (the standard sunrise equation), as UTC milliseconds */
  function sunTimes(ms,lat,lng){
    const rad=Math.PI/180, JD=ms/864e5+2440587.5, n=Math.ceil(JD-2451545+0.0008);
    const Js=n-lng/360, M=(357.5291+0.98560028*Js)%360;   /* mean solar time, mean anomaly */
    const C=1.9148*Math.sin(M*rad)+0.02*Math.sin(2*M*rad)+0.0003*Math.sin(3*M*rad);
    const lam=(M+C+180+102.9372)%360, Jt=2451545+Js+0.0053*Math.sin(M*rad)-0.0069*Math.sin(2*lam*rad);
    const dec=Math.asin(Math.sin(lam*rad)*Math.sin(23.44*rad));
    const cw=(Math.sin(-0.833*rad)-Math.sin(lat*rad)*Math.sin(dec))/(Math.cos(lat*rad)*Math.cos(dec));
    if(cw>1) return null; if(cw<-1) return {rise:-Infinity,set:Infinity};
    const w=Math.acos(cw)/rad/360, toMs=J=>(J-2440587.5)*864e5;
    return {rise:toMs(Jt-w),set:toMs(Jt+w)};
  }
  let skyKey="", skyVal="day";
  function sky(){
    const h=document.getElementById("hero"); if(!h) return;
    const now=Date.now(), lat=+h.dataset.lat, lng=+h.dataset.lng;
    const key=Math.floor(now/60000)+"|"+lat+"|"+lng;
    if(key!==skyKey){ skyKey=key;
      if(isFinite(lat)&&isFinite(lng)&&h.dataset.lat){
        const t=sunTimes(now,lat,lng), M=60000;
        /* golden light from 50 minutes before sunset to 20 after; from 20 before sunrise to 40 after */
        skyVal= !t ? "night" : (now>=t.rise+40*M&&now<t.set-50*M) ? "day" : ((now>=t.set-50*M&&now<t.set+20*M)||(now>=t.rise-20*M&&now<t.rise+40*M)) ? "dusk" : "night";
      } else { const hr=new Date().getHours(); skyVal=(hr>=20||hr<5)?"night":(hr<7||hr>=17)?"dusk":"day"; }
    }
    if(h.dataset.sky!==skyVal) h.dataset.sky=skyVal;
  }


  let queued=false;
  function frame(){ queued=false; pickTone(); stack(); sky(); }
  function ask(){ if(!queued){ queued=true; requestAnimationFrame(frame); } }
  addEventListener("scroll",ask,{passive:true});
  addEventListener("resize",ask);
  /* the app re-renders often; re-check after its paints */
  new MutationObserver(ask).observe(document.body,{subtree:true,attributes:true,attributeFilter:["hidden"],childList:false});
  setInterval(ask,1200);
  ask();
})();
