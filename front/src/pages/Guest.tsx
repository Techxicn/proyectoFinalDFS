import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import '../index.css'

export default function Booking() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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

    // Filtrado en tiempo 
    const filteredGuests = bookings.filter(booking => 
        booking.guests?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guests?.phone?.toLowerCase().includes(searchTerm.toLowerCase())||
        booking.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.rooms?.room_number?.toString().includes(searchTerm)
    );

    return (
        <div className="main-content">
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontFamily: 'serif', fontSize: '32px', color: 'var(--text-dark)', margin: 0 }}>
                        Huéspedes
                    </h1>
                    <p style={{ color: '#666' }}>Directorio de clientes registrados en el hotel.</p>
                </div>

                <input
                    type="text"
                    placeholder="Buscar por nombre, teléfono o habitación..."
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
                                <th>Nombre Completo</th>
                                <th>Teléfono</th>
                                <th>Identificación</th>
                                <th>Habitación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGuests.length > 0 ? (
                                filteredGuests.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>{booking.guests?.full_name || 'No registrado'}</td>
                                        <td>{booking.guests?.phone || 'No registrado'}</td>
                                        <td>{booking.guests?.id_document || 'No registrado'}</td>
                                        <td>{booking.rooms?.room_number || 'No registrado'}</td>
                                    </tr>
                                ))
                            ) : (
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
