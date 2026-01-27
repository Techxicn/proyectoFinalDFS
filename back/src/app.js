// Carga variables de entorno
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { supabase } = require("./supabaseClient");



const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

function getPagination(req) {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "25", 10), 1), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

app.get("/api/health", (req, res) => res.json({ ok: true }));


app.get("/api/test-supabase", async (req, res) => {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .limit(1);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, data });
});


app.get("/api/guests", async (req, res) => {
  const { from, to } = getPagination(req);

  const { data, error, count } = await supabase
    .from("guests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count });
});

app.get("/api/room-types", async (req, res) => {
  const { from, to } = getPagination(req);

  const { data, error, count } = await supabase
    .from("room_types")
    .select("*", { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count });
});

app.get("/api/rooms", async (req, res) => {
  const { from, to } = getPagination(req);

  const { data, error, count } = await supabase
    .from("rooms")
    .select("*, room_types(*)", { count: "exact" })
    .order("room_number", { ascending: true })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count });
});

app.get("/api/reservations", async (req, res) => {
  const { from, to } = getPagination(req);

  // Filtro opcional: /api/reservations?status=confirmed
  const status = req.query.status;

  let query = supabase
    .from("reservations")
    .select("*, guests(*), rooms(*, room_types(*))", { count: "exact" })
    .order("check_in", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count });
});

app.get("/api/reservations/:id/ledger", async (req, res) => {
  const { from, to } = getPagination(req);
  const { id } = req.params;

  const { data, error, count } = await supabase
    .from("reservation_ledger")
    .select("*", { count: "exact" })
    .eq("reservation_id", id)
    .order("happened_at", { ascending: true })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count });
});


// --- RUTA DE PRUEBA ---
app.get('/status', (req, res) => {
    res.json({ status: "Servidor en línea", date: new Date() });
});

const PORT = process.env.PORT || 3000;

// Gestion de peticiones de habitaciones (rooms) mnanejadas por routes/roomRoutes.js
const roomRoutes = require('./routes/roomRoutes');
app.use('/api/rooms', roomRoutes);

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});