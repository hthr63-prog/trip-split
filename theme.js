/* apply the saved theme before first paint */
try{ const t=localStorage.getItem("trip-theme"); if(t==="light"||t==="dark") document.documentElement.dataset.theme=t; }catch(e){}
/* opened as the quick-add shortcut: its own icon and name when added to the home screen */
try{ const qa=new URLSearchParams(location.search).get("add"); if(qa==="1"||qa==="me"){ const me=qa==="me";
  const set=(sel,attr,val)=>{ const el=document.querySelector(sel); if(el) el.setAttribute(attr,val); };
  set('link[rel="apple-touch-icon"]',"href",me?"icon-me-180.png":"icon-add-180.png");
  set('link[rel="icon"]',"href",me?"icon-me-192.png":"icon-add-192.png");
  set('link[rel="manifest"]',"href",me?"manifest-me.json":"manifest-add.json");
  let m=document.querySelector('meta[name="apple-mobile-web-app-title"]'); if(!m){ m=document.createElement("meta"); m.name="apple-mobile-web-app-title"; document.head.appendChild(m); } m.content=me?"➕ אישי":"➕ הוצאה";
  set('meta[name="theme-color"]',"content",me?"#14B8A6":"#FF8F4F");
  document.documentElement.dataset.quick=me?"me":"1";
} }catch(e){}
