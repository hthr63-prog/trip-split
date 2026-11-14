/* motion.js: one place for every animation in the app, so movement feels the same everywhere.
   No libraries: real spring physics are simulated once and turned into a CSS linear() easing,
   then played with the Web Animations API (smooth, off the main thread, works offline).
   Everything respects "reduce motion" in the phone's accessibility settings. */
(function(){
  const calm=()=>{ try{ return matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){ return false; } };
  const hasLinear=(()=>{ try{ return CSS.supports("animation-timing-function","linear(0, 1)"); }catch(e){ return false; } })();

  /* spring presets: stiffness / damping / mass, like iOS and Linear */
  const SPRINGS={
    snappy:{stiffness:520,damping:36,mass:1},   /* taps, toggles, small UI */
    smooth:{stiffness:260,damping:30,mass:1},   /* sheets, cards, page parts */
    bouncy:{stiffness:380,damping:18,mass:1},   /* rewards: saved, added, settled */
    gentle:{stiffness:140,damping:22,mass:1}    /* large surfaces, number counters */
  };

  /* simulate the spring once, sample it, and cache the result as {easing, duration} */
  const cache={};
  function spring(name){
    if(cache[name]) return cache[name];
    const s=SPRINGS[name]||SPRINGS.smooth, dt=1/240;
    let x=0, v=0, t=0; const pts=[0];
    while(t<3){
      const a=(-s.stiffness*(x-1)-s.damping*v)/s.mass; v+=a*dt; x+=v*dt; t+=dt;
      if(Math.round(t*240)%4===0) pts.push(x);
      if(Math.abs(x-1)<0.0008&&Math.abs(v)<0.01) break;
    }
    pts.push(1);
    const duration=Math.round(t*1000);
    const easing= hasLinear ? "linear("+pts.map(p=>+p.toFixed(4)).join(", ")+")"
      : (name==="bouncy" ? "cubic-bezier(.34,1.56,.64,1)" : "cubic-bezier(.2,.8,.2,1)");
    return cache[name]={easing,duration};
  }

  /* play keyframes on an element with a spring; resolves when done */
  function animate(el,keyframes,opt){
    opt=opt||{}; if(!el||!el.animate) return Promise.resolve();
    const sp=spring(opt.spring||"smooth");
    const a=el.animate(keyframes,{duration:calm()?1:sp.duration,easing:sp.easing,delay:calm()?0:(opt.delay||0),fill:opt.fill||"both"});
    return a.finished.then(()=>{ if(!opt.keep) try{ a.commitStyles&&opt.commit&&a.commitStyles(); a.cancel(); }catch(e){} }).catch(()=>{});
  }

  /* items appear one after another: blur and drop in, then sharp and in place */
  const ENTER=[{opacity:0,transform:"translateY(10px) scale(.985)",filter:"blur(6px)"},{opacity:1,transform:"none",filter:"blur(0)"}];
  function enter(els,opt){
    opt=opt||{}; const list=[...(els||[])].filter(Boolean), step=opt.stagger==null?38:opt.stagger, max=opt.max||10;
    return Promise.all(list.map((el,i)=>animate(el,ENTER,{spring:opt.spring||"smooth",delay:(opt.delay||0)+Math.min(i,max)*step})));
  }

  /* FLIP: measure, change the page, then slide everything that moved from where it was */
  function flip(els,change,opt){
    const list=[...(els||[])].filter(Boolean), before=new Map(list.map(el=>[el,el.getBoundingClientRect()]));
    change&&change();
    if(calm()) return Promise.resolve();
    return Promise.all(list.map(el=>{ const a=before.get(el), b=el.getBoundingClientRect(); if(!b.width&&!b.height) return null;
      const dx=a.left-b.left, dy=a.top-b.top, sx=a.width/(b.width||1), sy=a.height/(b.height||1);
      if(Math.abs(dx)<.5&&Math.abs(dy)<.5&&Math.abs(sx-1)<.01&&Math.abs(sy-1)<.01) return null;
      return animate(el,[{transformOrigin:"top left",transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`},{transformOrigin:"top left",transform:"none"}],{spring:(opt&&opt.spring)||"smooth"}); }));
  }

  /* press feedback: shrink a touch on press, spring back on release (one listener for the whole app) */
  const PRESS=".btn,.chip,.seg button,.pill,.curbtn,.fab,.tabbar button,.add-cta,.acct-chip,.qbtn,.recent button,.row.tappable,.tswitch";
  let pressed=null;
  function down(e){ const el=e.target.closest(PRESS); if(!el||el.disabled||calm()) return; pressed=el;
    animate(el,[{transform:"scale(1)"},{transform:"scale(.955)"}],{spring:"snappy",keep:true}); }
  function up(){ const el=pressed; pressed=null; if(!el) return;
    el.getAnimations().forEach(a=>a.cancel());
    animate(el,[{transform:"scale(.955)"},{transform:"scale(1)"}],{spring:"bouncy"}); }
  addEventListener("pointerdown",down,{passive:true});
  addEventListener("pointerup",up,{passive:true}); addEventListener("pointercancel",up,{passive:true});

  /* a quick "done" pulse for things that just saved */
  function pop(el){ return animate(el,[{transform:"scale(.92)"},{transform:"scale(1)"}],{spring:"bouncy"}); }

  window.Motion={SPRINGS,spring,animate,enter,flip,pop,calm};
})();
