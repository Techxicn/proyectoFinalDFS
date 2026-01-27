// Carga variables de entorno
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { supabase } = require("./supabaseClient");



const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());



app.get("/api/test-supabase", async (req, res) => {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .limit(1);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, data });
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