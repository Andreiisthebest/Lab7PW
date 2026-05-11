import useStore from '../store/useStore';

export default function Sidebar({ filter, setFilter, destinations, isFormOpen, setIsFormOpen, STATUES }) {
  const { logout } = useStore();

  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="brand">
        <div className="logo-mark"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg></div>
        Nexus Travel Base
      </div>
      
      <nav className="nav-menu">
        <div className="nav-label">Overview</div>
        {['All', ...STATUES, 'Leaderboard'].map(f => (
          <button 
            key={f} 
            className={`nav-item ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            <span className={f !== 'Leaderboard' ? `status-dot ${f.toLowerCase()}` : ''}>
              {f === 'Leaderboard' && <span style={{marginRight:'0.5rem'}}>🏆</span>}
            </span>
            {f}
            {f !== 'Leaderboard' && (
              <span className="count">
                {f === 'All' ? destinations.length : destinations.filter(d => d.status === f).length}
              </span>
            )}
          </button>
        ))}
        
        <div className="nav-label mt-4">Regions</div>
        {['Europe', 'Asia', 'Americas', 'Africa', 'Oceania'].map(f => (
          <button 
            key={f} 
            className={`nav-item ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </nav>
      
      <button className="primary-action" onClick={() => setIsFormOpen(!isFormOpen)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Destination
      </button>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button className="nav-item" onClick={logout} style={{ color: 'var(--text-color)', opacity: 0.8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.75rem' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Log Out
        </button>
      </div>
    </div>
  );
}