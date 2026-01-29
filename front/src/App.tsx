import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient';
import './App.css'
import { RoomCard } from './components/RoomCard'
//import { Sidebar } from './components/Slidebar'

interface Room {
  id: number;
  room_number: string;
  status: string;
  room_types?: {
    name: string
    price: number
  }
}

const StatCard = ({ title, value, color, icon }: any) => (
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
  const [rooms, setRooms] = useState<any[]>([]);

  const getInitialData = async () => {
    // Petición al backend para obtener las habitaciones
    try {
      const response = await fetch('http://localhost:3000/api/rooms');
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
          // Actualizacion de datos locales
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
    <div className="Dashboard-container">
      {/* <Sidebar /> */}
      <main style={{ flex: 1, padding: '40px' }}>
        <header style={{ marginBottom: '30px' }}>
          <h1>Dashboard</h1>
          <p>Bienvenido, aquí tienes el estado actual del hotel.</p>
        </header>

        {/* Sección de Estadísticas */}
        <section style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <StatCard title="Total" value={rooms.length} color="#b19171" />
          <StatCard
            title="Disponibles"
            value={rooms.filter(r => r.status === 'disponible').length}
            color="#4caf50"
          />
        </section>

        {/* Sección de Cuadrícula de Habitaciones */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              number={room.room_number}
              initialStatus={room.status}
              type={room.room_types?.name || "Cargando..."}
            />
          ))}
        </section>

      </main>
    </div>
  );
}

export default App