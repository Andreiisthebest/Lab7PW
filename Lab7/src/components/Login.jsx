import { useState } from 'react';
import useStore from '../store/useStore';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('VISITOR');
  const { authenticate } = useStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    await authenticate(selectedRole);
  };

  return (
    <div className="login-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--background-color)',
      color: 'var(--text-color)',
      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
    }}>
      <div className="login-card" style={{
        background: 'var(--surface-color)',
        padding: '3rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div className="logo-mark" style={{
            background: 'var(--primary-color)',
            color: 'white',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
          </div>
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Welcome to Nexus</h1>
        <p style={{ color: 'var(--text-color)', opacity: 0.7, marginBottom: '2rem', fontSize: '0.9rem' }}>Choose your access level to enter the platform.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { id: 'ADMIN', title: 'Administrator', desc: 'Full access to read, write, and delete records.', icon: '🛡️' },
            { id: 'WRITER', title: 'Writer', desc: 'Given permission to read and create new records.', icon: '✍️' },
            { id: 'VISITOR', title: 'Visitor', desc: 'Read-only access to view the travel base.', icon: '👁️' }
          ].map(roleItem => (
            <div 
              key={roleItem.id}
              onClick={() => setSelectedRole(roleItem.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                border: `2px solid ${selectedRole === roleItem.id ? 'var(--primary-color)' : 'var(--border-color)'}`,
                borderRadius: '12px',
                background: selectedRole === roleItem.id ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--background-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginRight: '1rem', opacity: selectedRole === roleItem.id ? 1 : 0.6 }}>
                {roleItem.icon}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: selectedRole === roleItem.id ? 'var(--primary-color)' : 'var(--text-color)' }}>
                  {roleItem.title}
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
                  {roleItem.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <button onClick={handleLogin} style={{
            width: '100%',
            padding: '0.85rem',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }} onMouseOver={e => e.target.style.opacity = 0.9} onMouseOut={e => e.target.style.opacity = 1}>
            Sign In as {selectedRole}
          </button>
      </div>
    </div>
  );
}