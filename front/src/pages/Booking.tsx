import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import '../index.css'
import { data } from "react-router-dom";

export default function Booking() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('reservations')
                .select(`*, room_id, guests(full_name, phone, id_document), rooms(id, room_number)
`)

                .order('check_in', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cambio de estado de reservacion
    const handleStatusChange = async (
        reservationId: string,
        roomId: string,
        newStatus: string
    ) => {
        if (!roomId) return;
        try {
            const { error } = await supabase
                .from('reservations')
                .update({ status: newStatus })
                .eq('id', reservationId);

            if (error) throw error;

            if (newStatus === 'checked_out' || newStatus === 'cancelled') {
                await supabase
                    .from('rooms')
                    .update({ status: 'maintenance' })
                    .eq('id', roomId);
            }

            if (newStatus === 'checked_in') {
                await supabase
                    .from('rooms')
                    .update({ status: 'occupied' })
                    .eq('id', roomId);
            }

            fetchBookings();
        } catch (error: any) {
            alert('Error al actualizar: ' + error.message);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Filtrado en tiempo 
    const filteredGuests = bookings.filter(booking =>
        booking.guests?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guests?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.rooms?.room_number?.toString().includes(searchTerm) ||
        booking.check_in?.toString().includes(searchTerm.toLowerCase()) ||
        booking.check_out?.toString().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="main-content">
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontFamily: 'serif', fontSize: '32px', color: 'var(--text-dark)', margin: 0 }}>
                        Reservaciones
                    </h1>
                    <p style={{ color: '#666' }}>Gestión de entradas y salidas de huéspedes.</p>
                </div>

                <input
                    type="text"
                    placeholder="Buscar por nombre, teléfono, check in, check out o numero de habitación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '10px 15px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        width: '300px',
                        outline: 'none'
                    }}
                />
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
                            {filteredGuests.length > 0 ? (
                                filteredGuests.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>{booking.guests?.full_name || 'No registrado'}</td>
                                        <td>{booking.guests?.id_document || 'No registrado'}</td>
                                        <td>{booking.guests?.phone || 'No registrado'}</td>
                                        <td>{booking.rooms?.room_number || 'No registrado'}</td>
                                        <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                                        <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                                        <td>
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleStatusChange(booking.id, booking.room_id, e.target.value)}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '20px',
                                                    border: 'none',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    backgroundColor:
                                                        booking.status === 'confirmed' ? '#e8f5e9' :
                                                            booking.status === 'checked_in' ? '#e3f2fd' :
                                                                booking.status === 'checked_out' ? '#f5f5f5' : '#ffebee',
                                                    color:
                                                        booking.status === 'confirmed' ? '#2e7d32' :
                                                            booking.status === 'checked_in' ? '#1976d2' :
                                                                booking.status === 'checked_out' ? '#616161' : '#c62828'
                                                }}
                                            >
                                                <option value="confirmed">Confirmada</option>
                                                <option value="checked_in">Checked in</option>
                                                <option value="checked_out">Checked out</option>
                                                <option value="cancelled">Cancelada</option>
                                            </select>

                                            {/* <span className="status-badge" style={{
                                                backgroundColor: booking.status === 'confirmed' ? '#e8f5e9' : '#fff3e0',
                                                color: booking.status === 'confirmed' ? '#2e7d32' : '#ef6c00'
                                            }}>
                                                {booking.status}
                                            </span> */}

                                        </td>
                                        <td>${booking.total_amount}</td>
                                    </tr>
                                ))
                            )
                                : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                            No se encontraron huéspedes con ese criterio.
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
