import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { supabase } from './lib/supabaseClient';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Booking';
import Guest from './pages/Guest';
import Login from './pages/Login';
import Room from './pages/rooms';
import './index.css';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <Routes>
      < Route path="/login" element={!session ? <Login /> : <Navigate to="/" />
      } />

      {/* Rutas Protegidas */}
      <Route path="/*" element={
        session ? (
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path='/' element={<Dashboard />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/rooms' element={<Room />} />
                <Route path='/bookings' element={<Bookings />} />
                <Route path='/guests' element={<Guest />} />
              </Routes>
            </main>
          </div>
        ) : (
          <Navigate to="/login" />
        )
      } />
    </Routes >
  );
}

export default App;