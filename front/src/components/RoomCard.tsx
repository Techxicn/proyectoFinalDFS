import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const RoomCard = ({ id, number, initialStatus, type }: any) => {
    const [status, setStatus] = useState(initialStatus);

    const getStatusColor = (currentStatus: string) => {
        switch (currentStatus) {
            case 'available': return '#4caf50';
            case 'occupied': return '#f44336';
            case 'maintenance': return '#ff9800';
            case 'reserved': return '#2196f3';
            case 'out_of_service': return '#9c27b0';
            default: return '#9e9e9e';
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextStatus = e.target.value;
        
        setStatus(nextStatus);

        try {
            const response = await fetch(`${API_URL}/api/rooms/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus: nextStatus })
            });

            if (!response.ok) {
                setStatus(initialStatus);
                alert(`Falla al actualizar el estado de la habitación ${number}`);
            }
        } catch (error) {
            console.error("Error al actualizar:", error);
            setStatus(initialStatus);
        }
    };

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            borderLeft: `8px solid ${getStatusColor(status)}`,
            transition: 'border-color 0.3s ease'
        }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Habitación {number}</h3>
            <p style={{ color: '#888', fontSize: '14px', margin: '5px 0' }}>{type}</p>

            <div style={{ marginBottom: '15px' }}>
                <span style={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: `${getStatusColor(status)}22`,
                    color: getStatusColor(status)
                }}>{status}</span>
            </div>

            <select value={status} onChange={handleStatusChange} style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                cursor: 'pointer',
                fontSize: '14px'
            }}>
                <option value="available">Disponible</option>
                <option value="occupied">Ocupada</option>
                <option value="maintenance">En Limpieza</option>
                <option value="reserved">Reservada</option>
                <option value="out_of_service">Fuera de Servicio</option>
            </select>
        </div>
    );
};