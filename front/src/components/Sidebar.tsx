import { Navigation } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Navigation },
    { name: 'Bookings', href: '/bookings', icon: Navigation },
    { name: 'Guests', href: '/guests', icon: Navigation },
];

export function Sidebar() {
    const { pathname } = useLocation();

    return (
        <aside className="sidebar">
            <div style={{ padding: '24px', borderBottom: '1px solid #2a2420' }}>
                <h2 style={{ color: 'white', margin: 0, fontFamily: 'serif' }}>Luxe Haven</h2>
                <p style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '1px' }}>STAFF PORTAL</p>
            </div>

            <nav style={{ flex: 1, paddingTop: '20px' }}>
                {navigationItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.href}
                        className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div style={{ padding: '20px', borderTop: '1px solid #2a2420' }}>
                <p style={{ fontSize: '14px', margin: 0 }}>Sarah Robinson</p>
                <button style={{
                    background: 'none', border: 'none', color: '#f44336',
                    cursor: 'pointer', padding: '10px 0'
                }}>
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}