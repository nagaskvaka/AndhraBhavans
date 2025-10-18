// Simple client-side include for the navigation partial
(async function(){
  const includes = document.querySelectorAll('[data-include="nav"]');
  if(!includes.length) return;
  try{
    const res = await fetch('/partials/nav.html');
    if(!res.ok) return;
    const html = await res.text();
    includes.forEach(el => el.innerHTML = html);
    // mark active link
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-nav a[data-nav]').forEach(a=>{
      if(a.getAttribute('href') === path) a.classList.add('active');
    });
  }catch(e){ console.warn('nav include failed', e) }
})();