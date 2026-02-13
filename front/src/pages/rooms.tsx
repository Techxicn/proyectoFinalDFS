import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient';
import { RoomCard } from '../components/RoomCard'
import '../index.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Room {
    id: number;
    room_number: string;
    status: string;
    room_types?: {
        name: string
    }
}

function App() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const getInitialData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/rooms`);
            if (!response.ok) throw new Error('Error al conectar con el servidor');

            const data = await response.json();
            setRooms(data);
        } catch (error) {
            console.error("Error cargando habitaciones:", error);
        } finally {
            setLoading(false);
        }
    };
    
useEffect(() => {
    getInitialData();

    const channel = supabase
        .channel('rooms-all-changes')
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'rooms' },
            (payload) => {
                console.log('Cambios detectados: ', payload);
                setRooms((prevRooms) =>
                    prevRooms.map((room) =>
                        room.id === payload.new.id
                            ? { ...room, status: payload.new.status } : room
                    ));
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}, []);

/**
  * Filtrado
  */
const filteredRoom = rooms.filter((room) => {
    const term = searchTerm.toLowerCase();

    const id = String(room.id ?? "").toLowerCase();
    const room_number = String(room.room_number ?? "").toLowerCase();
    const status = String(room.status ?? "").toLowerCase();
    const room_types = String(room.room_types?.name ?? "").toLowerCase();

    return (
        id.includes(term) ||
        room_number.includes(term) ||
        status.includes(term) ||
        room_types.includes(term)
    );
});

return (
    <div className="app-container">

        <main className="main-content">
            <header
                style={{
                    marginBottom: "32px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                }}
            >
                <div>
                    <h1 style={{ fontFamily: "serif", fontSize: "32px", color: "var(--text-dark)", margin: 0 }}>
                        Habitaciones
                    </h1>
                    <p style={{ color: "#666" }}>Gestión y manejo de habitaciones.</p>
                </div>

                <input
                    type="text"
                    placeholder="Buscar por nombre, teléfono, check in, check out o número de habitación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: "10px 15px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        width: "300px",
                        outline: "none",
                    }}
                />
            </header>

            {/* Sección de Cuadrícula de Habitaciones */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px',
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'border-color 0.3s ease'
            }}>
                {loading ? (
                    <p>Cargando habitaciones...</p>
                ) : (
                    filteredRoom.map((room) => (
                        <RoomCard
                            key={room.id}
                            id={room.id}
                            number={room.room_number}
                            initialStatus={room.status}
                            type={room.room_types?.name || "Estándar"}
                        />
                    ))
                )}
            </section>
        </main>
    </div>
);
}

export default App;