import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient';
import { RoomCard } from './components/RoomCard'
import { Sidebar } from './components/Sidebar';
import './index.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Room {
  id: number;
  room_number: string;
  status: string;
  room_types?: {
    name: string
    price: number
  }
}

const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
  <div style={{
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '15px',
    flex: 1,
    minWidth: '200px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  }}>
    <span style={{ color: '#888', fontSize: '14px' }}>{title}</span>
    <h2 style={{ margin: '10px 0', fontSize: '28px', color: color }}>{value}</h2>
  </div>
);

function App() {
  const [rooms, setRooms] = useState<Room[]>([]);

  const getInitialData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rooms`);
      if (!response.ok) throw new Error('Error al conectar con el servidor');
      
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error cargando habitaciones:", error);
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

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <header className="mb-8">
          <h1 style={{ fontFamily: 'serif', fontSize: '32px', color: '#1a1614', margin: 0 }}>Dashboard</h1>
          <p style={{ color: '#666' }}>Bienvenido de nuevo, aquí tienes el estado del hotel.</p>
        </header>

        {/* Sección de Estadísticas */}
        <section style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <StatCard title="Total" value={rooms.length} color="#b19171" />
          <StatCard
            title="Disponibles"
            value={rooms.filter(r => r.status?.toLowerCase() === 'available').length}
            color="#4caf50"
          />
        </section>

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
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              number={room.room_number}
              initialStatus={room.status}
              type={room.room_types?.name || "Estándar"}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;