/* apply the saved theme before first paint */
try{ const t=localStorage.getItem("trip-theme"); if(t==="light"||t==="dark") document.documentElement.dataset.theme=t; }catch(e){}
/* opened as the quick-add shortcut: its own icon and name when added to the home screen */
try{ if(new URLSearchParams(location.search).get("add")==="1"){
  const set=(sel,attr,val)=>{ const el=document.querySelector(sel); if(el) el.setAttribute(attr,val); };
  set('link[rel="apple-touch-icon"]',"href","icon-add-180.png");
  set('link[rel="icon"]',"href","icon-add-192.png");
  set('link[rel="manifest"]',"href","manifest-add.json");
  let m=document.querySelector('meta[name="apple-mobile-web-app-title"]'); if(!m){ m=document.createElement("meta"); m.name="apple-mobile-web-app-title"; document.head.appendChild(m); } m.content="➕ הוצאה";
  set('meta[name="theme-color"]',"content","#FF8F4F");
  document.documentElement.dataset.quick="1";
} }catch(e){}
