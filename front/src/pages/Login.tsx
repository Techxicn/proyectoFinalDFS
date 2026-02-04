import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
        } else {
            navigate('/'); // Redirigir al Dashboard tras éxito
        }
        setLoading(false);
    };

    return (
        <div style={{ 
            height: '100vh', display: 'flex', justifyContent: 'center', 
            alignItems: 'center', backgroundColor: '#1a1614' 
        }}>
            <form onSubmit={handleLogin} style={{ 
                background: 'white', padding: '40px', borderRadius: '15px', 
                width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' 
            }}>
                <h1 style={{ fontFamily: 'serif', textAlign: 'center', color: '#1a1614', fontSize: '40px' }}>Nova June</h1>
                <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>Panel de Administración</p>
                
                <div style={{ marginTop: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>EMAIL</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
                        required
                    />
                </div>

                <div style={{ marginTop: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>CONTRASEÑA</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
                        required
                    />
                </div>

                <button 
                    disabled={loading}
                    type="submit" 
                    style={{ 
                        width: '100%', padding: '12px', marginTop: '30px', 
                        backgroundColor: '#b19171', color: 'white', border: 'none', 
                        borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' 
                    }}
                >
                    {loading ? 'Entrando...' : 'INICIAR SESIÓN'}
                </button>
            </form>
        </div>
    );
}