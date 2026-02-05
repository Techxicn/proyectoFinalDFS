import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import '../index.css'
import { data } from "react-router";

export default function Booking() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('reservations')
                .select('*, guests(id, full_name, phone, id_document), rooms(room_number)')
                .order('check_in', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // DELETE info guests
    const handleDeleteGuest = async (id: string, full_name: string) => {
        const confirmDelete = window.confirm(`¿Estás seguro de eliminar a ${full_name}? Esto podría afectar sus reservaciones.`);

        if (confirmDelete) {
            // .select() al final nos permite ver qué se borró
            const { data, error, count } = await supabase
                .from('guests')
                .delete()
                .eq('id', id)
                .select();

            if (error) {
                console.error("Error de Supabase:", error.message);
                alert("Error: " + error.message);
            } else if (data.length === 0) {
                alert("No se borró nada. Revisa las políticas RLS o si el usuario tiene reservas activas.");
            } else {
                // Dentro de handleDeleteGuest, tras confirmar el borrado exitoso:
                alert("Huésped eliminado con éxito");
                setBookings(prev => prev.filter(b => b.guests?.id !== id));
                fetchBookings(); // Refrescar tabla
            }
        }
    };

    // --- UPDATE info guests
    const handleEditGuest = async (guest: any) => {
        const newName = prompt("Editar nombre completo:", guest.full_name);
        const newPhone = prompt("Editar teléfono:", guest.phone);
        if (newName && newName !== guest.full_name || newPhone && newPhone !== guest.phone) {
            const { error } = await supabase
                .from('guests')
                .update({ full_name: newName, phone: newPhone })
                .eq('id', guest.id);

            if (error) {
                console.error("Error al actualizar:", error.message);
                alert("No se pudo actualizar: " + error.message);
            } else if (data && data.length > 0) {
                alert("Huésped actualizado correctamente");
                fetchBookings(); // Recarga la tabla para ver el cambio
            } else {
                alert("La base de datos no registró cambios. Revisa las políticas RLS.");
            }
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
                    className="search-input"
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
                                        <td>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleEditGuest(booking.guests)}
                                                    style={{ color: '#b19171', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDeleteGuest(booking.guests?.id, booking.guests?.full_name)
                                                    }}
                                                    style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
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
