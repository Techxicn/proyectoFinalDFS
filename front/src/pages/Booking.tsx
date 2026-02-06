import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../index.css";

/**
 * Tipos y constantes (fuera del componente para no redefinir en cada render)
 */
type ReservationStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show";

const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  checked_in: "Checked in",
  checked_out: "Checked out",
  cancelled: "Cancelada",
  no_show: "No show",
};

// Máquina de estados: transiciones permitidas (sin room swap)
const NEXT_STATUS: Record<ReservationStatus, ReservationStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["checked_in", "no_show", "cancelled"],
  checked_in: ["checked_out"],
  checked_out: [], // terminal
  cancelled: [], // terminal
  no_show: [], // terminal
};

const getAllowedStatusOptions = (current: ReservationStatus): ReservationStatus[] => {
  return [current, ...NEXT_STATUS[current]];
};

const mapStatusChangeError = (msg: string) => {
  if (msg.includes("INVALID_TRANSITION")) return "Transición de estado no permitida.";
  if (msg.includes("ROOM_UNAVAILABLE")) return "La habitación está en mantenimiento o fuera de servicio.";
  if (msg.includes("ROOM_ALREADY_OCCUPIED")) return "La habitación ya está ocupada.";
  if (msg.includes("ROOM_NOT_AVAILABLE_FOR_RESERVATION")) return "La habitación no está disponible para reservar.";
  if (msg.includes("ROOM_NOT_READY_FOR_CHECKIN")) return "La habitación no está lista para hacer check-in.";
  if (msg.includes("CANNOT_RELEASE_OCCUPIED_ROOM")) return "No puedes cancelar/no-show si la habitación está ocupada.";
  if (msg.includes("ROOM_NOT_OCCUPIED_CANNOT_CHECKOUT")) return "No puedes hacer check-out si la habitación no está ocupada.";
  if (msg.includes("RESERVATION_NOT_FOUND")) return "No se encontró la reservación.";
  if (msg.includes("ROOM_NOT_FOUND")) return "No se encontró la habitación asociada.";
  if (msg.includes("ROOM_ID_IMMUTABLE")) return "No se puede cambiar la habitación de una reservación (bloqueado por sistema).";
  return msg || "Error desconocido.";
};

const isReservationStatus = (value: any): value is ReservationStatus => {
  return (
    value === "pending" ||
    value === "confirmed" ||
    value === "checked_in" ||
    value === "checked_out" ||
    value === "cancelled" ||
    value === "no_show"
  );
};

export default function Booking() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Bloqueo por fila mientras se actualiza
  const [updatingReservationId, setUpdatingReservationId] = useState<string | null>(null);

  /**
   * Traer reservaciones (incluye relaciones guests y rooms)
   */
  const fetchBookings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("reservations")
        .select(
          `*,
           guests(full_name, phone, id_document),
           rooms(id, room_number)`
        )
        .order("check_in", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambiar estado (UI validada + RPC atómica)
   */
  const handleStatusChange = async (
    reservationId: string,
    currentStatus: ReservationStatus,
    newStatus: ReservationStatus
  ) => {
    if (newStatus === currentStatus) return;
    if (updatingReservationId === reservationId) return;

    const allowed = new Set(getAllowedStatusOptions(currentStatus));
    if (!allowed.has(newStatus)) {
      alert("Esa transición no está permitida desde el estado actual.");
      await fetchBookings();
      return;
    }

    try {
      setUpdatingReservationId(reservationId);

      const { error } = await supabase.rpc("change_reservation_status", {
        p_reservation_id: reservationId,
        p_new_status: newStatus, // ✅ ahora coincide con tu enum
      });

      if (error) throw new Error(mapStatusChangeError(error.message ?? ""));

      await fetchBookings();
    } catch (err: any) {
      alert(err?.message ?? "No se pudo actualizar el estado.");
      await fetchBookings();
    } finally {
      setUpdatingReservationId(null);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Filtrado
   */
  const filteredGuests = bookings.filter((booking) => {
    const term = searchTerm.toLowerCase();

    const fullName = (booking.guests?.full_name ?? "").toLowerCase();
    const phone = String(booking.guests?.phone ?? "").toLowerCase();
    const status = String(booking.status ?? "").toLowerCase();
    const roomNumber = String(booking.rooms?.room_number ?? "");
    const checkIn = String(booking.check_in ?? "").toLowerCase();
    const checkOut = String(booking.check_out ?? "").toLowerCase();

    return (
      fullName.includes(term) ||
      phone.includes(term) ||
      status.includes(term) ||
      roomNumber.includes(searchTerm) ||
      checkIn.includes(term) ||
      checkOut.includes(term)
    );
  });

  return (
    <div className="main-content">
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
            Reservaciones
          </h1>
          <p style={{ color: "#666" }}>Gestión de entradas y salidas de huéspedes.</p>
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

      <div className="table-container">
        {loading ? (
          <p style={{ padding: "20px" }}>Cargando datos...</p>
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
                filteredGuests.map((booking) => {
                  const rawStatus = booking.status;
                  const currentStatus: ReservationStatus | null = isReservationStatus(rawStatus)
                    ? rawStatus
                    : null;

                  const checkInDate = booking.check_in ? new Date(booking.check_in) : null;
                  const checkOutDate = booking.check_out ? new Date(booking.check_out) : null;

                  return (
                    <tr key={booking.id}>
                      <td>{booking.guests?.full_name || "No registrado"}</td>
                      <td>{booking.guests?.id_document || "No registrado"}</td>
                      <td>{booking.guests?.phone || "No registrado"}</td>
                      <td>{booking.rooms?.room_number ?? "No registrado"}</td>
                      <td>{checkInDate ? checkInDate.toLocaleDateString() : "No registrado"}</td>
                      <td>{checkOutDate ? checkOutDate.toLocaleDateString() : "No registrado"}</td>
                      <td>
                        {currentStatus ? (
                          (() => {
                            const options = getAllowedStatusOptions(currentStatus);
                            const isUpdating = updatingReservationId === booking.id;

                            return (
                              <select
                                value={currentStatus}
                                disabled={isUpdating}
                                onChange={(e) =>
                                  handleStatusChange(
                                    booking.id,
                                    currentStatus,
                                    e.target.value as ReservationStatus
                                  )
                                }
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "20px",
                                  border: "none",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  cursor: isUpdating ? "not-allowed" : "pointer",
                                  opacity: isUpdating ? 0.7 : 1,
                                }}
                              >
                                {options.map((st) => (
                                  <option key={st} value={st}>
                                    {STATUS_LABEL[st]}
                                  </option>
                                ))}
                              </select>
                            );
                          })()
                        ) : (
                          <span style={{ color: "#c62828", fontWeight: 700 }}>
                            Estado inválido ({String(rawStatus)})
                          </span>
                        )}
                      </td>
                      <td>${booking.total_amount}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                    No se encontraron huéspedes con ese criterio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
