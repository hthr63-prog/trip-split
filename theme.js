/* apply the saved theme before first paint */
try{ const t=localStorage.getItem("trip-theme"); if(t==="light"||t==="dark") document.documentElement.dataset.theme=t; }catch(e){}
