const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');
const MENU_FILE = path.join(__dirname, 'data', 'menu.json');
const FEEDBACK_FILE = path.join(__dirname, 'data', 'feedback.json');

function readOrders(){
  try{ return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')||'[]'); }catch(e){ return []; }
}
function writeOrders(arr){ fs.writeFileSync(ORDERS_FILE, JSON.stringify(arr, null, 2), 'utf8'); }
function readMenu(){
  try{ return JSON.parse(fs.readFileSync(MENU_FILE, 'utf8')||'{}'); }catch(e){ return { items: [] }; }
}
function writeMenu(obj){ fs.writeFileSync(MENU_FILE, JSON.stringify(obj, null, 2), 'utf8'); }
function readFeedback(){ try{ return JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8')||'[]'); }catch(e){ return []; } }
function writeFeedback(arr){ fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(arr, null, 2), 'utf8'); }

app.get('/api/orders', (req, res) => {
  const orders = readOrders();
  res.json({ orders });
});

// return a single order by id
app.get('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  const orders = readOrders();
  const found = orders.find(o => o.id === id);
  if(!found) return res.status(404).json({ error: 'not found' });
  res.json({ order: found });
});

app.post('/api/orders', (req, res) => {
  const orders = readOrders();
  const payload = req.body || {};
  payload.id = 'order-' + Date.now();
  payload.created = new Date().toISOString();
  orders.push(payload);
  writeOrders(orders);
  res.json({ ok: true, id: payload.id });
});

// feedback endpoints
app.post('/api/feedback', (req, res) => {
  const body = req.body || {};
  const arr = readFeedback();
  const fb = { id: 'fb-' + Date.now(), name: body.name || '', rating: body.rating || 0, comments: body.comments || '', created: new Date().toISOString() };
  arr.push(fb);
  writeFeedback(arr);
  res.json({ ok: true });
});

app.get('/api/feedback', (req, res) => {
  res.json({ feedback: readFeedback() });
});

// Menu endpoints for admin UI
app.get('/api/menu', (req, res) => {
  const menu = readMenu();
  res.json(menu);
});

app.post('/api/menu', (req, res) => {
  const body = req.body || {};
  if(!body.title || !body.price){
    return res.status(400).json({ error: 'title and price required' });
  }
  const menu = readMenu();
  menu.items = menu.items || [];
  const id = 'item-' + Date.now();
  const item = {
    id,
    title: body.title,
    desc: body.desc || '',
    img: body.img || 'images/G1.jpg',
    cat: Array.isArray(body.cat) ? body.cat : (typeof body.cat === 'string' ? body.cat.split(',').map(s=>s.trim()).filter(Boolean) : []),
    price: Number(body.price)
  };
  menu.items.push(item);
  writeMenu(menu);
  res.json({ ok: true, item });
});

app.listen(PORT, () => console.log('Server listening on port', PORT));
