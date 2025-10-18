// Lightweight cart bridge: localStorage-based cart, add-to-cart handlers, checkout POST
(function(){
  const KEY = 'ab_cart';
  function getCart(){ try{ return JSON.parse(localStorage.getItem(KEY)) || { items: {}, count: 0 }; }catch(e){ return { items:{}, count:0 }; } }
  function saveCart(c){ localStorage.setItem(KEY, JSON.stringify(c)); }
  function updateCountUI(){ const els = document.querySelectorAll('.cart-count'); els.forEach(el=>el.textContent = (getCart().count||0)); }

  function addItem(id, title, price){ const cart = getCart(); if(!cart.items[id]) cart.items[id] = { id:id, title:title, price: Number(price)||0, qty:0 }; cart.items[id].qty += 1; cart.count = Object.keys(cart.items).reduce((s,k)=> s + cart.items[k].qty, 0); saveCart(cart); updateCountUI(); showToast(title + ' added to cart'); }

  // toast helper
  let toastEl;
  function showToast(msg, timeout=1800){ if(!toastEl){ toastEl = document.createElement('div'); toastEl.className = 'site-toast'; document.body.appendChild(toastEl); } toastEl.textContent = msg; toastEl.classList.add('show'); setTimeout(()=>toastEl.classList.remove('show'), timeout); }

  // wire add-to-cart buttons (both .add-cart and .btn.add)
  document.addEventListener('click', function(e){
    const add = e.target.closest('.add-cart, .btn.add');
    if(!add) return;
    e.preventDefault();
    const id = add.dataset.id || add.getAttribute('data-id') || add.closest('.card')?.getAttribute('data-id') || add.closest('.card')?.querySelector('[data-id]')?.dataset?.id || ('item-'+Date.now());
    const title = add.dataset.title || add.getAttribute('data-title') || (add.closest('.card')?.querySelector('h3')?.textContent) || 'Item';
    const price = add.dataset.price || add.getAttribute('data-price') || (add.closest('.card')?.querySelector('.price')?.textContent?.replace(/[^0-9.]/g,'')) || 0;
    addItem(id, title, Number(price));
  });

  // checkout form handler: builds payload and POSTs to /api/orders
  document.addEventListener('submit', function(e){
    const form = e.target;
    if(form && form.id === 'checkout-form'){
      e.preventDefault();
      const fm = new FormData(form);
      const customer = { name: fm.get('name')||fm.get('cust_name')||'', phone: fm.get('phone')||fm.get('cust_phone')||'', address: fm.get('address')||fm.get('cust_address')||'' };
      if(!customer.name || !customer.phone || !customer.address){ showToast('Please fill name, phone and address'); return; }
      const cart = getCart();
      if(!cart || !cart.count){ showToast('Cart is empty'); return; }
      const payload = { cart: cart, customer: customer, meta: { placedAt: new Date().toISOString() } };
      fetch('/api/orders', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
        .then(r=>r.json()).then(j=>{
          if(j && j.ok){ showToast('Order placed — ' + j.id); localStorage.removeItem(KEY); updateCountUI(); if(document.querySelector('#checkout-result')) document.querySelector('#checkout-result').textContent = 'Order placed: ' + j.id; form.reset(); }
          else { showToast('Order failed'); if(document.querySelector('#checkout-result')) document.querySelector('#checkout-result').textContent = 'Order failed'; }
        }).catch(()=>{ showToast('Order failed (network)'); if(document.querySelector('#checkout-result')) document.querySelector('#checkout-result').textContent = 'Order failed (network)'; });
    }
  });

  // initialize UI on DOM ready
  document.addEventListener('DOMContentLoaded', function(){ updateCountUI(); });
})();
