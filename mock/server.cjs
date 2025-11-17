// Lightweight mock API for dev only, no changes to app code required
// Start with: node mock/server.cjs
// Serves endpoints compatible with StaffService under /api/v1/staff

/* eslint-disable no-console */
const path = require('path');
const jsonServer = require('json-server');

const dbFile = path.join(__dirname, 'db.json');
const server = jsonServer.create();
const router = jsonServer.router(dbFile);
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

function getStaffCollection() {
  // lowdb instance
  return router.db.get('staff').value();
}

// Helpers
function matchesSearch(staff, term) {
  if (!term) return true;
  const t = String(term).toLowerCase();
  const fullName = `${staff.prefix || ''} ${staff.firstname || ''} ${staff.lastname || ''}`.toLowerCase();
  return (
    fullName.includes(t) ||
    (staff.email || '').toLowerCase().includes(t) ||
    (staff.phone_number || '').toLowerCase().includes(t)
  );
}

function toNumber(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// List with filters + pagination, returns { success, data, total }
server.get('/api/v1/staff', (req, res) => {
  const { search = '', role, status, page = '1', limit = '10' } = req.query;
  let data = getStaffCollection();

  if (role) data = data.filter((s) => String(s.role) === String(role));
  if (status) data = data.filter((s) => String(s.status) === String(status));
  if (search) data = data.filter((s) => matchesSearch(s, search));

  const total = data.length;
  const pageNum = toNumber(page, 1);
  const limitNum = toNumber(limit, 10);
  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;
  const paged = data.slice(start, end);

  res.json({ success: true, data: paged, total });
});

// Get one -> { success, data }
server.get('/api/v1/staff/:id', (req, res) => {
  const id = Number(req.params.id);
  const staff = getStaffCollection().find((s) => Number(s.id) === id);
  if (!staff) return res.status(404).json({ success: false, message: 'Not found' });
  return res.json({ success: true, data: staff });
});

// Create -> { success, data }
server.post('/api/v1/staff', (req, res) => {
  const body = req.body || {};
  const coll = router.db.get('staff');
  const all = coll.value();
  const nextId = (all.reduce((m, s) => Math.max(m, Number(s.id) || 0), 0) || 0) + 1;
  const now = new Date().toISOString();
  const newItem = {
    id: nextId,
    prefix: body.prefix ?? '',
    firstname: body.firstname ?? '',
    lastname: body.lastname ?? '',
    email: body.email ?? '',
    password: body.password ?? undefined,
    role: body.role ?? 'COLLECTOR',
    status: body.status ?? 'ACTIVE',
    phone_number: body.phone_number ?? '',
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
  coll.push(newItem).write();
  res.status(201).json({ success: true, data: newItem });
});

// Update -> { success, data }
server.put('/api/v1/staff/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const coll = router.db.get('staff');
  const current = coll.find({ id }).value();
  if (!current) return res.status(404).json({ success: false, message: 'Not found' });
  const updated = {
    ...current,
    ...body,
    id, // ensure id not changed
    updated_at: new Date().toISOString(),
  };
  coll.find({ id }).assign(updated).write();
  return res.json({ success: true, data: updated });
});

// Delete -> { success: true }
server.delete('/api/v1/staff/:id', (req, res) => {
  const id = Number(req.params.id);
  const coll = router.db.get('staff');
  const exists = coll.find({ id }).value();
  if (!exists) return res.status(404).json({ success: false, message: 'Not found' });
  coll.remove({ id }).write();
  return res.json({ success: true });
});

// Fallback to json-server router for any other collections if added later
server.use('/_raw', router); // optional: inspect raw endpoints

const PORT = process.env.MOCK_PORT ? Number(process.env.MOCK_PORT) : 4000;
server.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}\n` +
    `- List:   GET  /api/v1/staff?search=&role=&status=&page=&limit=\n` +
    `- Detail: GET  /api/v1/staff/:id\n` +
    `- Create: POST /api/v1/staff\n` +
    `- Update: PUT  /api/v1/staff/:id\n` +
    `- Delete: DEL  /api/v1/staff/:id`);
});




// ---- Vehicle helpers ----
function getVehicleCollection() {
  return router.db.get('vehicle').value();
}

function matchesVehicleSearch(vehicle, term) {
  if (!term) return true;
  const t = String(term).toLowerCase();
  return (
    (vehicle.vehicle_reg_num || '').toLowerCase().includes(t) ||
    (vehicle.vehicle_type || '').toLowerCase().includes(t) ||
    String(vehicle.id).includes(t)
  );
}

// List -> { success, data, total }
server.get('/api/v1/vehicle', (req, res) => {
  const { search = '', status, fuel_category, page = '1', limit = '10' } = req.query;
  let data = getVehicleCollection();

  if (status) data = data.filter((v) => String(v.status) === String(status));
  if (fuel_category) data = data.filter((v) => String(v.fuel_category) === String(fuel_category));
  if (search) data = data.filter((v) => matchesVehicleSearch(v, search));

  const total = data.length;
  const pageNum = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
  const limitNum = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;
  const paged = data.slice(start, end);

  res.json({ success: true, data: paged, total });
});

// Get one -> { success, data }
server.get('/api/v1/vehicle/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = getVehicleCollection().find((v) => Number(v.id) === id);
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  return res.json({ success: true, data: item });
});

// Create -> { success, data }
server.post('/api/v1/vehicle', (req, res) => {
  const body = req.body || {};
  const coll = router.db.get('vehicle');
  const all = coll.value();
  const nextId = (all.reduce((m, v) => Math.max(m, Number(v.id) || 0), 0) || 0) + 1;
  const now = new Date().toISOString();

  const newItem = {
    id: nextId,
    vehicle_reg_num: body.vehicle_reg_num ?? '',
    status: body.status ?? 'AVAILABLE',
    regular_capacity: Number.isFinite(body.regular_capacity) ? body.regular_capacity : 0,
    recycle_capacity: Number.isFinite(body.recycle_capacity) ? body.recycle_capacity : 0,
    current_driver_id: body.current_driver_id ?? null,
    problem_reported: body.problem_reported ?? '',
    fuel_category: body.fuel_category ?? 'GASOLINE',
    depreciation_thb: Number.isFinite(body.depreciation_thb) ? body.depreciation_thb : 0,
    vehicle_type: body.vehicle_type ?? '',
    image_url: body.image_url ?? null,
    created_at: now,
    updated_at: now,
    deleted_at: null
  };

  coll.push(newItem).write();
  res.status(201).json({ success: true, data: newItem });
});

// Update -> { success, data }
server.put('/api/v1/vehicle/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const coll = router.db.get('vehicle');
  const current = coll.find({ id }).value();
  if (!current) return res.status(404).json({ success: false, message: 'Not found' });

  const updated = {
    ...current,
    ...body,
    id,
    updated_at: new Date().toISOString(),
  };
  coll.find({ id }).assign(updated).write();
  return res.json({ success: true, data: updated });
});

// Delete -> { success }
server.delete('/api/v1/vehicle/:id', (req, res) => {
  const id = Number(req.params.id);
  const coll = router.db.get('vehicle');
  const exists = coll.find({ id }).value();
  if (!exists) return res.status(404).json({ success: false, message: 'Not found' });
  coll.remove({ id }).write();
  return res.json({ success: true });
});
