import { useState } from "react";

export const RoomCard = ({ id, number, initialStatus, type }: any) => {
    const [status, setStatus] = useState(initialStatus);
    const [isUpdating, SetIsUpdating] = useState(false);
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
        const previousStatus = status;
        setStatus(nextStatus);
        SetIsUpdating(true);

        try {
            const response = await fetch(`http://localhost:3000/api/rooms/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus: nextStatus })
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error al actualizar el estado: ", errorData);
                // revertir estado en caso de error
                setStatus(previousStatus);
                alert(`Falla al actualizar el estado de la habitación ${number}: ${errorData.error || 'Error desconocido'}`);
            } else {
                const result = await response.json();
                console.log("Estado actualizado correctamente:", result);
                if (result.data && result.data[0]) {
                    setStatus(result.data[0].status);
                }
            }
        } catch (error) {
            console.error("Error de red al actualizar:", error);

            // revertir al estado anterior en caso de error de red
            setStatus(previousStatus);
            alert(`Error de conexión al actualizar la habitación ${number}. Intenta de nuevo.`);
        } finally {
            SetIsUpdating(false);
        }
    };


    return (
        <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            borderLeft: `8px solid ${getStatusColor(status)}`,
            transition: 'border-color 0.3s ease',
            opacity: isUpdating ? 0.7 : 1
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

            <select value={status} onChange={handleStatusChange} disabled={isUpdating} style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                cursor: isUpdating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                backgroundColor: isUpdating ? '#f5f5f5' : 'white'
            }}>
                <option value="available">Disponible</option>
                <option value="occupied">Ocupada</option>
                <option value="maintenance">En Limpieza</option>
                <option value="reserved">Reservada</option>
                <option value="out_of_service">Fuera de Servicio</option>
            </select>

            {isUpdating && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    Actualizando...
                </p>
            )}
        </div>
    );
};