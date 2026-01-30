const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/status', (req, res) => {
    res.json({ 
        status: "Servidor en línea", 
        environment: process.env.NODE_ENV || 'development',
        date: new Date() 
    });
});

const roomRoutes = require('./routes/roomRoutes');
app.use('/api/rooms', roomRoutes);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor iniciado localmente en http://localhost:${PORT}`);
    });
}

module.exports = app;