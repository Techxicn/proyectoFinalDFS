import { CalendarCheck2, LayoutDashboard, UserStar, Bed } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";


const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: '/bookings', icon: CalendarCheck2 },
    { name: 'Rooms', href: '/rooms', icon: Bed },
    { name: 'Guests', href: '/guests', icon: UserStar },
];

export function Sidebar() {
    const { pathname } = useLocation();

    return (
        <aside className="sidebar">
            <div style={{ padding: '24px', borderBottom: '1px solid #2a2420' }}>
                <h1 style={{ color: 'white', margin: 0, fontFamily: 'serif' }}>Nova June</h1>
                <h2><p style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '1px' }}>STAFF PORTAL</p></h2>
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
                <button style={{
                    background: 'none', border: 'none', color: '#f44336',
                    cursor: 'pointer', padding: '10px 0', fontSize: '17px'
                }}
                onClick={async () => {
                    await supabase.auth.signOut();
                }}
                >
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}