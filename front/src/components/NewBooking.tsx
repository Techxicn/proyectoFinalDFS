import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface NewBookingProps {
    onSuccess: () => void;
}

export default function NewReservation({ onSuccess }: NewBookingProps) {
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [guestData, setGuestData] = useState({
        full_name: '',
        phone: '',
        id_document: ''
    });
    const [reservationData, setReservationData] = useState({
        room_id: '',
        check_in: '',
        check_out: '',
        status: 'confirmed'
    });

    // Cargar habitaciones disponibles al abrir el formulario
    useEffect(() => {
        const fetchAvailableRooms = async () => {
            const { data } = await supabase
                .from('rooms')
                .select('*')
                .eq('status', 'available');
            setRooms(data || []);
        };
        fetchAvailableRooms();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Insertar el Huésped
            const { data: guest, error: guestError } = await supabase
                .from('guests')
                .insert([guestData])
                .select()
                .single();

            if (guestError) throw guestError;
            
            // Insertar la reservación
            const { error: resError } = await supabase
                .from('reservations')
                .insert([{
                    guest_id: guest.id,
                    room_id: reservationData.room_id,
                    check_in: reservationData.check_in,
                    check_out: reservationData.check_out,
                    status: reservationData.status
                }]);

            if (resError) throw resError;

            // Actualizar el estado de la habitación
            await supabase
                .from('rooms')
                .update({ status: 'occupied' })
                .eq('id', reservationData.room_id);

            alert("¡Registro y Reservación exitosos!");
        } catch (error: any) {
            alert("Error en el proceso: " + error.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="form-container" style={{ background: 'white', padding: '30px', borderRadius: '12px' }}>
            <h2 style={{ fontFamily: 'serif' }}>Nueva Entrada de Huésped</h2>
            <form onSubmit={handleSubmit}>
                {/* Datos del Huésped */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input
                        placeholder="Nombre Completo"
                        onChange={e => setGuestData({ ...guestData, full_name: e.target.value })}
                        required
                        style={inputStyle}
                        />
                    <input
                        placeholder="Teléfono"
                        onChange={e => setGuestData({ ...guestData, phone: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                {/* Asignación de Habitación */}
                <div style={{ marginTop: '20px' }}>
                    <label>Asignar Habitación:</label>
                    <select
                        onChange={e => setReservationData({ ...reservationData, room_id: e.target.value })}
                        required
                        style={inputStyle}
                    >
                        <option value="">Selecciona una habitación...</option>
                        {rooms.map(room => (
                            <option key={room.id} value={room.id}>
                                Habitación {room.room_number} ({room.status})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Fechas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Check-In</label>
                    <input
                        type="date"
                        onChange={e => setReservationData({ ...reservationData, check_in: e.target.value })}
                        required
                        style={inputStyle}
                    />
                    <input
                        type="date"
                        onChange={e => setReservationData({ ...reservationData, check_out: e.target.value })}
                        required
                        style={inputStyle}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: '30px', width: '100%', padding: '12px',
                        backgroundColor: 'var(--sidebar-primary)', color: 'white',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Procesando...' : 'Confirmar Registro'}
                </button>
            </form>
        </div>
    );
}

const inputStyle = {
    width: '100%', padding: '12px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box'
};

const labelStyle = { fontSize: '12px', fontWeight: 'bold', color: '#555' };
const groupStyle = { display: 'flex', flexDirection: 'column' as 'column' };
