import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Booking() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('reservations')
                .select('*, guests(full_name, phone, id_document), rooms(room_number)')
                .order('check_in', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <div className="main-content">
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontFamily: 'serif', fontSize: '32px', color: 'var(--text-dark)', margin: 0 }}>
                    Reservaciones
                </h1>
                <p style={{ color: '#666' }}>Gestión de entradas y salidas de huéspedes.</p>
            </header>

            <div className="table-container">
                {loading ? (
                    <p style={{ padding: '20px' }}>Cargando datos...</p>
                ) : (
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Huésped</th>
                                <th>Identificación</th>
                                <th>Teléfono</th>
                                <th>Habitación</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Estado</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>{booking.guests?.full_name || 'No registrado'}</td>
                                    <td>{booking.guests?.id_document || 'No registrado'}</td>
                                    <td>{booking.guests?.phone || 'No registrado'}</td>
                                    <td>{booking.rooms?.room_number || 'No registrado'}</td>
                                    <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                                    <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                                    <td>
                                        <span className="status-badge" style={{
                                            backgroundColor: booking.status === 'confirmed' ? '#e8f5e9' : '#fff3e0',
                                            color: booking.status === 'confirmed' ? '#2e7d32' : '#ef6c00'
                                        }}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td>${booking.total_amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
