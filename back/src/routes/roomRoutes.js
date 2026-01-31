const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET para obtener los datos de las habitaciones desde supabase
router.get('/', async (req, res) => {
    try {
        console.log('Solicitando todas las habitaciones...');

        const { data, error } = await supabase
            .from('rooms')
            .select('*, room_types(name, base_nightly_rate)')
            .order('room_number', { ascending: true });
        if (error) {
            console.error('Error al obtener habitaciones:', error);
            return res.status(400).json({ error: error.message });
        }
        console.log(`Se obtuvieron ${data.length} habitaciones`);
        res.json(data);
    } catch (err) {
        console.error('Error inesperado:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// actualizar estado de habitacion
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { newStatus } = req.body;

        console.log(`Recibida petición para habitación ID: ${id}\nNuevo estado: ${newStatus}`);

        // validacion
        const validStatuses = ['available', 'occupied', 'maintenance', 'reserved', 'out_of_service'];
        if (!validStatuses.includes(newStatus)) {
            console.log(`Estado inválido: ${newStatus}`);
            return res.status(400).json({
                error: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`
            });
        }

        const { data, error } = await supabase
            .from('rooms')
            .update({ status: newStatus })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error de Supabase:', error);
            return res.status(400).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            console.log(`No se encontró la habitación con ID: ${id}`);
            return res.status(404).json({ error: 'Habitación no encontrada' });
        }

        console.log(`Actualización exitosa en Supabase`);
        console.log(`   - Habitación: ${data[0].room_number}`);
        console.log(`   - Nuevo estado confirmado: ${data[0].status}`);

        res.json({
            message: "Estado actualizado correctamente",
            data: data
        });

    } catch (err) {
        console.error('Error inesperado en PATCH:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


module.exports = router;