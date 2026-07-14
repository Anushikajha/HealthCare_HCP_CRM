import React from 'react';
import { LayoutDashboard, PlusCircle, MessageSquare, ShieldAlert, Award, FileText } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'log', name: 'Log Interaction', icon: PlusCircle },
  ];

  return (
    <aside className="sidebar glass-card" style={{
      width: '260px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '0',
      borderLeft: 'none',
      borderTop: 'none',
      borderBottom: 'none',
      padding: '24px 16px',
    }}>
      {/* Brand Header */}
      <div className="brand-header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '40px',
        padding: '0 8px'
      }}>
        <div className="brand-icon" style={{
          background: 'var(--gradient-primary)',
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--accent-shadow)'
        }}>
          <Award size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            HCP Pulse
          </h1>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AI-First CRM
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="btn nav-link"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
                fontWeight: isActive ? '600' : '400',
              }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--color-primary)' : 'inherit' }} />
              <span>{item.name}</span>
              {isActive && (
                <div style={{
                  marginLeft: 'auto',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  boxShadow: '0 0 8px var(--color-primary)'
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="sidebar-footer" style={{
        padding: '16px 8px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', boxShadow: '0 0 8px var(--color-accent)' }} />
          <span style={{ fontSize: '12px', fontWeight: '500' }}>LangGraph Engine</span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Connected to gemma2-9b-it</span>
      </div>
    </aside>
  );
};

export default Sidebar;
