const express = require('express');
const router = express.Router();

// Datos test
const mockRooms = [
    { id: 1, room_number: "101", status: "disponible", type: "Sencilla" },
    { id: 2, room_number: "102", status: "ocupada", type: "Doble" },
    { id: 3, room_number: "201", status: "limpieza", type: "Suite" }
];

// Ruta GET para obtener todas las habitaciones
router.get('/', (req, res) => {
    res.json(mockRooms);
});

module.exports = router;