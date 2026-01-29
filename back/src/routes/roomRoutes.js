const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET para obtener los datos de las habitaciones desde supabase
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('rooms')
        .select('id, room_number, status, room_type_id(name)')
        .order('room_number', { ascending: true });

    if (error) { return res.status(400).json({ error: error.message }); }
    res.json(data);
})

router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { newStatus } = req.body;

    const { data, error } = await supabase
        .from('rooms')
        .update({ status: newStatus })
        .eq('id', id)
        .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Sincronizando con Supabase", data });
});

module.exports = router;