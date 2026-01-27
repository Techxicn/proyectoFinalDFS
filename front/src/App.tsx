import { useEffect, useState } from 'react'
import './App.css'

interface Room {
  id: number;
  room_number: string;
  status: string;
  type: string;
}

function App() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    // Hacemos una petición al backend para obtener las habitaciones
    fetch('http://localhost:3000/api/rooms')
      .then(response => response.json())
      .then(data => setRooms(data))
      .catch(err => console.error("Error cargando habitaciones:", err));
  }, []);

  return (
    <div className="App">
      <h1>Panel de Gestión de Hotel 🏨</h1>
      <div className="room-grid" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {rooms.map(room => (
          <div key={room.id} className="card" style={{ border: '1px solid #ccc', padding: '10px' }}>
            <h3>Habitación {room.room_number}</h3>
            <p>Tipo: {room.type}</p>
            <p>Estado: <strong>{room.status}</strong></p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App