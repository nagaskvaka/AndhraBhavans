// Minimal client site JS: load menu, manage simple cart, checkout and feedback
const qs = (s, el=document)=>el.querySelector(s);
const qsa = (s, el=document)=>Array.from(el.querySelectorAll(s));
const API = '/api';
let CART = { items: {}, count: 0 };
function loadMenu(){
  fetch(API + '/menu').then(r=>r.json()).then(data=>{
    const items = data.items || [];
    const out = items.map(it=>`<article class="card">
      <img src="${it.img}" alt="${it.title}">
      <div class="card-body">
        <h3>${it.title}</h3>
        <p>${it.desc}</p>
        <div class="card-foot">
          <strong>₹${it.price.toFixed(2)}</strong>
          <button class="btn add" data-id="${it.id}" data-title="${it.title}" data-price="${it.price}">Add</button>
        </div>
      </div>
    </article>`).join('');
    const target = qs('#menu-list');
    if(target) target.innerHTML = out;
  }).catch(()=>{ if(qs('#menu-list')) qs('#menu-list').innerHTML = '<p>Failed to load menu</p>'; });
}
function addToCart(item){
  const id = item.id;
  CART.items[id] = CART.items[id] || { id, title: item.title, price: Number(item.price), qty: 0 };
  CART.items[id].qty += 1; CART.count = (CART.count||0)+1; saveCart();
}
function saveCart(){ localStorage.setItem('cart', JSON.stringify(CART)); }
function loadCartFromStorage(){ const raw = localStorage.getItem('cart'); if(raw) CART = JSON.parse(raw); }
function renderCartContents(){ const el = qs('#cart-contents'); if(!el) return; const rows = Object.values(CART.items).map(i=>`<div class="cart-row"><b>${i.title}</b> x ${i.qty} — ₹${(i.price*i.qty).toFixed(2)}</div>`).join(''); el.innerHTML = rows + `<p>Total items: ${CART.count||0}</p>`; }
function initSite(){ loadCartFromStorage(); renderCartContents(); loadMenu();
  document.body.addEventListener('click', e=>{
    if(e.target.matches('.btn.add')){
      const btn = e.target; addToCart({ id: btn.dataset.id, title: btn.dataset.title, price: btn.dataset.price }); renderCartContents(); alert('Added to cart');
    }
  });
  const checkoutForm = qs('#checkout-form'); if(checkoutForm){ checkoutForm.addEventListener('submit', e=>{
    e.preventDefault(); const fm = new FormData(checkoutForm); const customer = { name: fm.get('name'), phone: fm.get('phone'), address: fm.get('address') };
    const payload = { cart: CART, customer, meta: { placedAt: new Date().toISOString() } };
    fetch(API + '/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      .then(r=>r.json()).then(j=>{ qs('#checkout-result').textContent = 'Order placed: ' + (j.id||''); CART = { items: {}, count: 0 }; saveCart(); renderCartContents(); })
      .catch(()=>{ qs('#checkout-result').textContent = 'Order failed'; });
  }); }
  const feedbackForm = qs('#feedback-form'); if(feedbackForm){ feedbackForm.addEventListener('submit', e=>{
    e.preventDefault(); const fm = new FormData(feedbackForm); const data = { name: fm.get('name'), rating: fm.get('rating'), comments: fm.get('comments'), created: new Date().toISOString() };
    fetch(API + '/feedback', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(data) }).then(r=>r.json()).then(()=>{ qs('#feedback-result').textContent = 'Thanks for the feedback'; feedbackForm.reset(); }).catch(()=>qs('#feedback-result').textContent='Failed');
  }); }
}
document.addEventListener('DOMContentLoaded', initSite);
// Simple site JS: mobile nav toggle and menu filtering
(function(){
  'use strict';

  function qs(sel, ctx){ return (ctx||document).querySelector(sel); }
  function qsa(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }

  // small helper utilities
  function fadeOut(el, cb){
    if(!el) return cb && cb();
    el.style.transition = 'opacity .24s ease, transform .24s ease';
    el.style.opacity = 0; el.style.transform = 'translateY(6px)';
    setTimeout(function(){ el.style.display = 'none'; if(cb) cb(); }, 260);
  }
  function fadeIn(el){
    if(!el) return;
    el.style.display = '';
    // force layout
    void el.offsetWidth;
    el.style.transition = 'opacity .34s ease, transform .34s ease';
    el.style.opacity = 1; el.style.transform = 'translateY(0)';
  }

  // focus trap helper for a container (basic)
  function trapFocus(container, active){
    var focusableSelector = 'a, button, input, [tabindex]:not([tabindex="-1"])';
    var handlers = container._focusTrapHandlers || {};
    if(active){
      var nodes = Array.from(container.querySelectorAll(focusableSelector)).filter(function(n){ return !n.hasAttribute('disabled'); });
      if(nodes.length === 0) return;
      var first = nodes[0], last = nodes[nodes.length-1];
      handlers.keydown = function(e){
        if(e.key === 'Tab'){
          if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
          else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
        } else if(e.key === 'Escape'){
          // close if escape - trigger close if nav-toggle exists
          var toggle = document.querySelector('.nav-toggle'); if(toggle) toggle.click();
        }
      };
      document.addEventListener('keydown', handlers.keydown);
      container._focusTrapHandlers = handlers;
    } else {
      if(handlers.keydown) document.removeEventListener('keydown', handlers.keydown);
      container._focusTrapHandlers = null;
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    // mobile nav toggle with accessibility
    var toggle = qs('.nav-toggle');
    var navInner = qs('.nav-inner');
    var siteNav = qs('.site-nav');
    if(toggle && navInner){
      toggle.setAttribute('role','button');
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label','Toggle menu');

      // focusable
      toggle.tabIndex = 0;

      function openNav(){
        navInner.classList.add('open');
        toggle.classList.add('open');
        toggle.setAttribute('aria-expanded','true');
        // move focus to first link and enable focus trap
        var firstLink = navInner.querySelector('a');
        if(firstLink) firstLink.focus();
        trapFocus(navInner, true);
      }
      function closeNav(){
        trapFocus(navInner, false);
        navInner.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
        toggle.focus();
      }

      toggle.addEventListener('click', function(e){ e.preventDefault(); navInner.classList.contains('open') ? closeNav() : openNav(); });
      toggle.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); } if(e.key === 'Escape') closeNav(); });

      // close when clicking outside nav on mobile
      document.addEventListener('click', function(e){ if(navInner.classList.contains('open') && !siteNav.contains(e.target) && e.target !== toggle){ closeNav(); } });
    }

    // menu filtering with FLIP animation for smoother layout shifts
    var filters = qsa('.menu-filter button');
    var cards = qsa('.menu-grid .card');
    var grid = qs('.menu-grid');
    function applyFilter(cat){
      var all = Array.from(grid.querySelectorAll('.card'));
      // first: record positions
      var firstRects = all.map(function(el){ return el.getBoundingClientRect(); });

      // show/hide by toggling a class (.will-hide) which keeps element in flow for FLIP
      all.forEach(function(el){
        var cats = (el.getAttribute('data-cat')||'').split(' ');
        var matches = (cat === 'all') || (cats.indexOf(cat) !== -1);
        if(!matches){ el.classList.add('will-hide'); }
        else { el.classList.remove('will-hide'); el.style.display = ''; }
      });

      // force layout then measure
      void grid.offsetWidth;
      var lastRects = all.map(function(el){ return el.getBoundingClientRect(); });

      // invert & play
      all.forEach(function(el, i){
        var dx = firstRects[i].left - lastRects[i].left;
        var dy = firstRects[i].top - lastRects[i].top;
        if(dx || dy){
          el.style.transition = 'transform .36s var(--ease-deco), opacity .28s var(--ease-deco)';
          el.style.transform = 'translate('+dx+'px,'+dy+'px)';
          // trigger reflow
          requestAnimationFrame(function(){ el.style.transform = ''; });
        }
      });

      // after animation, remove hidden elements from flow (display:none) so they don't take space
      setTimeout(function(){
        all.forEach(function(el){
          if(el.classList.contains('will-hide')){ el.style.display = 'none'; }
          el.style.transform = '';
        });
      }, 380);
    }

    if(filters.length){
      filters.forEach(function(btn){
        btn.addEventListener('click', function(){
          var cat = btn.getAttribute('data-cat');
          filters.forEach(function(b){ b.classList.remove('active'); });
          btn.classList.add('active');
          applyFilter(cat);
        });
      });
    }

    // CART: create cart UI elements (floating button + drawer) and aria-live
    var cart = { items: {}, count: 0 };
    function loadCart(){
      try{ var s = localStorage.getItem('ab_cart'); if(s) cart = JSON.parse(s); }catch(e){}
      cart.count = Object.keys(cart.items||{}).reduce(function(sum,k){ return sum + (cart.items[k].qty||0); }, 0);
    }
    function saveCart(){ localStorage.setItem('ab_cart', JSON.stringify(cart)); }

    // create aria-live region
    var live = document.createElement('div'); live.setAttribute('aria-live','polite'); live.setAttribute('aria-atomic','true'); live.className='sr-only'; document.body.appendChild(live);

  // toast element
  var toast = document.createElement('div'); toast.className = 'site-toast'; document.body.appendChild(toast);
  function showToast(msg, timeout){ toast.textContent = msg; toast.classList.add('show'); setTimeout(function(){ toast.classList.remove('show'); }, timeout || 2200); }

    // create cart button + drawer
    var cartBtn = document.createElement('button'); cartBtn.className = 'cart-btn'; cartBtn.setAttribute('aria-label','Open cart'); cartBtn.innerHTML = 'Cart <span class="cart-count">0</span>';
    document.body.appendChild(cartBtn);
    var cartDrawer = document.createElement('aside'); cartDrawer.className = 'cart-drawer'; cartDrawer.setAttribute('aria-hidden','true');
    cartDrawer.innerHTML = '<div class="drawer-inner"><header><h3>Your Cart</h3><button class="close-drawer" aria-label="Close cart">Close</button></header><div class="cart-items"></div><footer><div class="cart-total">Total: <strong class="total-amt">0</strong></div><button class="checkout">Checkout</button></footer></div>';
    document.body.appendChild(cartDrawer);

    loadCart();
    function updateCartUI(){
      var countEl = document.querySelector('.cart-count'); if(countEl) countEl.textContent = cart.count || 0;
      var itemsEl = cartDrawer.querySelector('.cart-items'); itemsEl.innerHTML = '';
      var total = 0;
      Object.keys(cart.items||{}).forEach(function(id){
        var it = cart.items[id];
        total += it.price * it.qty;
        var row = document.createElement('div'); row.className = 'cart-row';
        row.innerHTML = '<div class="cart-row-left"><strong>'+it.title+'</strong><div class="cart-qty">Qty: '+it.qty+'</div></div>'
          + '<div class="cart-row-right"><div class="cart-price">KD '+(it.price.toFixed(2))+'</div>'
          + '<div class="cart-actions">'
          + '<button class="cart-decr" data-id="'+id+'" aria-label="Decrease quantity">-</button>'
          + '<button class="cart-incr" data-id="'+id+'" aria-label="Increase quantity">+</button>'
          + '<button class="cart-remove" data-id="'+id+'" aria-label="Remove item">Remove</button>'
          + '</div></div>';
        itemsEl.appendChild(row);
      });
      cartDrawer.querySelector('.total-amt').textContent = total.toFixed(2);
      saveCart();
    }

    cartBtn.addEventListener('click', function(){ cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden','false'); trapFocus(cartDrawer, true); live.textContent = 'Cart opened'; });
    cartDrawer.querySelector('.close-drawer').addEventListener('click', function(){ cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true'); trapFocus(cartDrawer, false); cartBtn.focus(); live.textContent = 'Cart closed'; });
    cartDrawer.addEventListener('click', function(e){
      // remove
      if(e.target.classList.contains('cart-remove')){
        var id=e.target.getAttribute('data-id'); delete cart.items[id]; cart.count = Object.keys(cart.items||{}).reduce(function(sum,k){ return sum + (cart.items[k].qty||0); }, 0); updateCartUI(); live.textContent = 'Removed item from cart';
      }
      // decrement
      if(e.target.classList.contains('cart-decr')){
        var id = e.target.getAttribute('data-id'); if(!cart.items[id]) return; cart.items[id].qty = Math.max(0, cart.items[id].qty - 1); if(cart.items[id].qty===0) delete cart.items[id]; cart.count = Object.keys(cart.items||{}).reduce(function(sum,k){ return sum + (cart.items[k].qty||0); }, 0); updateCartUI(); live.textContent = 'Quantity updated';
      }
      // increment
      if(e.target.classList.contains('cart-incr')){
        var id = e.target.getAttribute('data-id'); if(!cart.items[id]) return; cart.items[id].qty += 1; cart.count = Object.keys(cart.items||{}).reduce(function(sum,k){ return sum + (cart.items[k].qty||0); }, 0); updateCartUI(); live.textContent = 'Quantity updated';
      }
    });

    updateCartUI();

    // optional: fetch and render menu from data/menu.json if present
    var menuContainer = qs('.menu-grid');
    if(menuContainer && window.fetch){
      fetch('data/menu.json').then(function(res){ if(!res.ok) throw new Error('no menu'); return res.json(); }).then(function(json){
        // clear and render cards
        menuContainer.innerHTML = '';
        json.items.forEach(function(it, idx){
          var card = document.createElement('div');
          card.className = 'card';
          card.setAttribute('data-cat', (it.cat||'').join(' '));
          card.innerHTML = '<img data-src="'+(it.img||'images/m1.jpg')+'" src="" alt="'+(it.title||'')+'" loading="lazy">'
            + '<div class="card-content">'
            + '<h3>'+(it.title||'')+'</h3>'
            + '<p>'+(it.desc||'')+'</p>'
            + '<div class="card-meta"><div class="price">'+(it.price?('KD '+it.price.toFixed(2)): '')+'</div><button class="add-cart" data-id="'+it.id+'">Add to cart</button></div>'
            + '</div>';
          // small stagger using delay
          card.style.opacity = 0; card.style.transform = 'translateY(8px)';
          menuContainer.appendChild(card);
          setTimeout(function(){ fadeIn(card); }, 60 * idx + 80);
        });

  // wire up add-to-cart buttons
        menuContainer.addEventListener('click', function(e){
          if(e.target.classList.contains('add-cart')){
            var id = e.target.getAttribute('data-id');
            var parent = e.target.closest('.card');
            var title = parent.querySelector('h3').textContent;
            var priceText = parent.querySelector('.price').textContent.replace('KD','').trim();
            var price = parseFloat(priceText) || 0;
            if(!cart.items[id]) cart.items[id] = { id:id, title:title, price:price, qty:0 };
            cart.items[id].qty += 1;
            cart.count += 1;
            updateCartUI();
            live.textContent = title + ' added to cart';
            showToast(title + ' added to cart');
          }
        });

        // Lazy-load fallback: if browser doesn't support loading=lazy, use IntersectionObserver
        if(!('loading' in HTMLImageElement.prototype)){
          var io = new IntersectionObserver(function(entries){
            entries.forEach(function(ent){
              if(ent.isIntersecting){ var img = ent.target; img.src = img.getAttribute('data-src') || img.src; io.unobserve(img); }
            });
          }, { rootMargin: '200px' });
          qsa('img[loading="lazy"]').forEach(function(img){ if(!img.src) img.src = img.getAttribute('data-src'); io.observe(img); });
        }

        // Checkout modal (created once)
        var modal = document.createElement('div'); modal.className = 'modal'; modal.setAttribute('role','dialog'); modal.setAttribute('aria-hidden','true');
        modal.innerHTML = '<div class="modal-inner" role="document"><header><h3>Order Summary</h3><button class="modal-close" aria-label="Close">Close</button></header><div class="modal-body"></div><footer><button class="modal-export">Export Order</button><button class="modal-clear">Clear Cart</button></footer></div>';
        document.body.appendChild(modal);

        cartDrawer.querySelector('.checkout').addEventListener('click', function(){
          var body = modal.querySelector('.modal-body'); body.innerHTML = '';
          var total = 0;
          Object.keys(cart.items||{}).forEach(function(id){ var it = cart.items[id]; total += it.price * it.qty; var row = document.createElement('div'); row.textContent = it.title + ' x' + it.qty + ' - KD ' + (it.price*it.qty).toFixed(2); body.appendChild(row); });
          var trow = document.createElement('div'); trow.innerHTML = '<strong>Total: KD '+total.toFixed(2)+'</strong>'; body.appendChild(trow);
          // customer form
          var form = document.createElement('div'); form.className = 'checkout-form';
          form.innerHTML = '<label>Name <input name="cust_name" required></label><label>Phone <input name="cust_phone" required></label><label>Address <textarea name="cust_address" required></textarea></label>';
          body.appendChild(form);
          // show place order button
          var place = document.createElement('button'); place.className = 'modal-place'; place.textContent = 'Place Order';
          trow.appendChild(place);
          modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); trapFocus(modal, true); live.textContent = 'Checkout opened';

          place.addEventListener('click', function(){
            // validate customer fields
            var name = form.querySelector('[name="cust_name"]').value.trim();
            var phone = form.querySelector('[name="cust_phone"]').value.trim();
            var addr = form.querySelector('[name="cust_address"]').value.trim();
            if(!name || !phone || !addr){
              showToast('Please fill name, phone and address');
              return;
            }
            // POST order to backend with customer info
            var payload = { cart: cart, customer: { name: name, phone: phone, address: addr }, meta: { placedAt: new Date().toISOString() } };
            fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(function(res){ return res.json(); }).then(function(resp){
              if(resp && resp.ok){ live.textContent = 'Order placed, id ' + resp.id; modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); trapFocus(modal, false); cart = { items: {}, count: 0 }; updateCartUI(); }
              else { live.textContent = 'Order failed'; }
            }).catch(function(){ live.textContent = 'Order failed (network)'; });
          });
        });

        modal.addEventListener('click', function(e){
          if(e.target.classList.contains('modal-close')){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); trapFocus(modal, false); live.textContent = 'Checkout closed'; }
          if(e.target.classList.contains('modal-clear')){
            cart = { items: {}, count: 0 }; updateCartUI(); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); trapFocus(modal, false); live.textContent = 'Cart cleared';
          }
        });

        // Quick-view modal: create and wire image clicks
        var quick = document.createElement('div'); quick.className='quickview modal'; quick.setAttribute('aria-hidden','true'); quick.innerHTML = '<div class="modal-inner"><button class="modal-close">Close</button><div class="quick-body"></div></div>';
        document.body.appendChild(quick);
        menuContainer.addEventListener('click', function(e){
          var img = e.target.closest('img');
          if(img && img.closest('.card')){
            var card = img.closest('.card');
            var title = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
            var desc = card.querySelector('p') ? card.querySelector('p').textContent : '';
            var price = card.querySelector('.price') ? card.querySelector('.price').textContent : '';
            var qb = quick.querySelector('.quick-body'); qb.innerHTML = '<h3>'+title+'</h3><p>'+desc+'</p><p>'+price+'</p>';
            quick.classList.add('open'); quick.setAttribute('aria-hidden','false'); trapFocus(quick, true); live.textContent = 'Opened quick view for '+title;
          }
        });
        quick.addEventListener('click', function(e){ if(e.target.classList.contains('modal-close')){ quick.classList.remove('open'); quick.setAttribute('aria-hidden','true'); trapFocus(quick, false); live.textContent = 'Quick view closed'; } });
      }).catch(function(){ /* ignore missing menu.json */ });
    }
  });
})();
