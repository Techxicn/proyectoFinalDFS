import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import '../index.css'
import { data } from "react-router";
import NewBooking from "../components/NewBooking";

export default function Booking() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [selectedGuestName, setSelectedGuestName] = useState("");

    const openHistory = async (guest: any) => {
        setSelectedGuestName(guest.full_name);
        setIsHistoryOpen(true);

        const { data, error } = await supabase
            .from('reservations')
            .select('*, rooms(room_number)')
            .eq('guest_id', guest.id)
            .order('check_in', { ascending: false });

        if (!error) setHistory(data || []);
    }

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
                alert("No se encontró el huésped o no se pudo eliminar.");
            } else {
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
        const newIdDocument = prompt("Editar identificación:", guest.id_document);

        if (newName && newName !== guest.full_name || newPhone && newPhone !== guest.phone || newIdDocument && newIdDocument !== guest.id_document) {
            const { error } = await supabase
                .from('guests')
                .update({ full_name: newName, phone: newPhone, id_document: newIdDocument })
                .eq('id', guest.id)
                .select();

            if (error) {
                console.error("Error al actualizar:", error.message);
                alert("No se pudo actualizar: " + error.message);
            } else if (data && data.length > 0) {
                alert("Huésped actualizado correctamente");
                fetchBookings();
            } else {
                alert("La base de datos no registró cambios.");
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

                <div>
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
                            width: '280px',
                            outline: 'none'
                        }}
                    />
                    <button onClick={() => setIsModalOpen(true)} className="" style={{
                        marginLeft: '16px',
                        marginTop: '15px', width: '26%', padding: '12px',
                        backgroundColor: 'var(--sidebar-primary)', color: 'white',
                        border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold'
                    }}>
                        Nuevo Registro
                    </button>
                </div>
            </header >

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
                                        <td>
                                            <button
                                                onClick={() => openHistory(booking.guests)}
                                                style={{ color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                                Historial
                                            </button>
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
                {
                    isModalOpen && (
                        <div style={modalOverlayStyle}>
                            <div style={modalContentStyle}>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ float: 'right', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}
                                >
                                    &times;
                                </button>
                                <NewBooking onSuccess={() => {
                                    setIsModalOpen(false);
                                    fetchBookings();
                                }} />
                            </div>
                        </div>
                    )
                }
            </div >

            {/* Historial de hospedajes  */}
            {
                isHistoryOpen && (
            <div style={modalOverlayStyle}>
                <div style={{ ...modalContentStyle, maxWidth: '800px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontFamily: 'serif', margin: 0 }}>Historial de {selectedGuestName}</h2>
                        <span style={{
                            backgroundColor: 'var(--sidebar-primary)',
                            color: 'white',
                            padding: '5px 15px',
                            borderRadius: '20px',
                            fontSize: '14px'
                        }}>
                            Estancias totales: {history.length}
                        </span>
                    </div>

                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Habitación</th>
                                <th>Entrada</th>
                                <th>Salida</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h.id}>
                                    <td>Hab. {h.rooms?.room_number}</td>
                                    <td>{new Date(h.check_in).toLocaleDateString()}</td>
                                    <td>{new Date(h.check_out).toLocaleDateString()}</td>
                                    <td>{h.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button
                        onClick={() => setIsHistoryOpen(false)}
                        className="btn-secondary"
                        style={{ marginTop: '20px', width: '100%' }}
                    >
                        Cerrar Historial
                    </button>
                </div>
            </div>
            )
            }
        </div>
    );
}

const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'white', padding: '20px', borderRadius: '12px',
    width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
};