import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Booking';
import Guest from './pages/Guest';

function App() {
  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/bookings' element={<Bookings />} />
          <Route path='/guests' element={<Guest />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;