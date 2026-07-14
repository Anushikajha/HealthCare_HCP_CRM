import React from 'react';
import { Search, Bell, User, Sparkles } from 'lucide-react';

const Navbar = ({ activeTab, searchQuery, setSearchQuery }) => {
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'CRM Dashboard';
      case 'log':
        return 'Log HCP Interaction';
      default:
        return 'HCP CRM';
    }
  };

  return (
    <header className="navbar glass-card" style={{
      width: '100%',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '0',
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: 'none',
      zIndex: '10'
    }}>
      {/* Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }}>
          {getHeaderTitle()}
        </h2>
        {activeTab === 'log' && (
          <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={10} />
            AI Enabled
          </span>
        )}
      </div>

      {/* Center Search - only relevant for dashboard list filter */}
      {activeTab === 'dashboard' ? (
        <div className="search-container" style={{ position: 'relative', width: '380px' }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)'
          }} />
          <input
            type="text"
            placeholder="Search by doctor, hospital, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: '38px',
              borderRadius: '9999px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          />
        </div>
      ) : (
        <div />
      )}

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn btn-secondary" style={{ padding: '8px', borderRadius: '50%' }}>
          <Bell size={16} />
        </button>

        <div className="profile-container" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderLeft: '1px solid var(--border-color)',
          paddingLeft: '16px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)'
          }}>
            <User size={16} color="#fff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Anushika</span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Medical Representative</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
