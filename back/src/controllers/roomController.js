const supabase = require('../config/supabase');

const getAllRooms = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .select(`
                id,
                room_number,
                status,
                room_types (
                    name,
                    description,
                    base_nightly_rate
                )
            `)
            .order('room_number', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};