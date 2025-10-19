// Ensure images with data-src are assigned a src so they actually load.
(function(){
  function assignSrcIfEmpty(img){
    try{
      var src = img.getAttribute('src') || '';
      if(!src.trim()){
        var data = img.getAttribute('data-src');
        if(data){ img.src = data; }
      }
    }catch(e){ /* ignore */ }
  }

  function fixImages(){
    document.querySelectorAll('img[data-src]').forEach(assignSrcIfEmpty);
  }

  // Watch for images added later (menu loaded asynchronously)
  var mo = new MutationObserver(function(muts){
    muts.forEach(function(m){
      if(m.type === 'childList'){
        m.addedNodes && m.addedNodes.forEach(function(node){
          if(node && node.querySelectorAll){
            node.querySelectorAll('img[data-src]').forEach(assignSrcIfEmpty);
          }
          // if the added node itself is an img
          if(node && node.tagName === 'IMG' && node.hasAttribute('data-src')) assignSrcIfEmpty(node);
        });
      }
      if(m.type === 'attributes' && m.target && m.target.tagName === 'IMG' && m.target.hasAttribute('data-src')){
        assignSrcIfEmpty(m.target);
      }
    });
  });

  function startObserver(){
    try{
      mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-src'] });
    }catch(e){ /* ignore */ }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ fixImages(); startObserver(); });
  } else { fixImages(); startObserver(); }

  // fallback: if menu renders after some delay, run fix again shortly
  setTimeout(fixImages, 800);
})();
