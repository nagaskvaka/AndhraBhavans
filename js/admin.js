async function api(path, opts){
  const res = await fetch(path, Object.assign({headers:{'Content-Type':'application/json'}}, opts||{}));
  if(!res.ok) throw new Error('Network error');
  return res.json();
}

function el(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }

async function loadOrders(){
  const wrap = document.getElementById('ordersList');
  try{
    const data = await api('/api/orders');
    wrap.innerHTML = '';
    if(!data.orders.length) wrap.textContent = 'No orders yet';
    data.orders.slice().reverse().forEach(o=>{
      const node = el(`<div class="order-card"><strong>${o.id}</strong><div>${new Date(o.created).toLocaleString()}</div><div>Items: ${o.cart.count}</div><button data-id="${o.id}">View</button></div>`);
      node.querySelector('button').addEventListener('click', ()=> showOrder(o.id));
      wrap.appendChild(node);
    });
  }catch(e){ wrap.textContent = 'Failed to load orders'; console.error(e); }
}

async function showOrder(id){
  const out = document.getElementById('orderDetail');
  out.innerHTML = 'Loading...';
  try{
    const data = await api('/api/orders/'+encodeURIComponent(id));
    const o = data.order;
    out.innerHTML = '';
    const meta = el('<div></div>');
    meta.appendChild(el(`<h4>${o.id}</h4>`));
    meta.appendChild(el(`<div>Placed: ${new Date(o.created).toLocaleString()}</div>`));
    meta.appendChild(el(`<h5>Customer</h5>`));
    meta.appendChild(el(`<div>${o.customer.name}<br>${o.customer.phone}<br>${o.customer.address}</div>`));
    meta.appendChild(el(`<h5>Cart</h5>`));
    const list = document.createElement('div');
    Object.values(o.cart.items||{}).forEach(it=>{
      list.appendChild(el(`<div>${it.title} × ${it.qty} — ₹${(it.price*it.qty).toFixed(2)}</div>`));
    });
    meta.appendChild(list);
    meta.appendChild(el(`<h5>Raw payload</h5><pre class="json">${JSON.stringify(o, null, 2)}</pre>`));
    out.appendChild(meta);
  }catch(e){ out.textContent = 'Failed to load order'; console.error(e); }
}

async function loadMenuPreview(){
  const node = document.getElementById('menuPreview');
  try{
    const m = await api('/api/menu');
    node.innerHTML = '';
    m.items.forEach(it=>{
      const row = el(`<div style="padding:8px;border-bottom:1px solid #efefef"><strong>${it.title}</strong> — ₹${it.price.toFixed(2)}<div style="font-size:12px;color:#666">${it.cat.join(', ')}</div></div>`);
      node.appendChild(row);
    });
  }catch(e){ node.textContent = 'Failed to load menu'; }
}

document.getElementById('menuForm').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const f = ev.target;
  const data = {
    title: f.title.value,
    price: f.price.value,
    cat: f.cat.value,
    img: f.img.value,
    desc: f.desc.value
  };
  try{
    const res = await api('/api/menu', { method: 'POST', body: JSON.stringify(data) });
    alert('Item added: ' + res.item.id);
    f.reset();
    loadMenuPreview();
  }catch(e){ alert('Failed to add item'); console.error(e); }
});

// init
loadOrders();
loadMenuPreview();
