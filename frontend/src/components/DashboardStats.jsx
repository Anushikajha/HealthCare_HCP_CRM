import React from 'react';
import { CalendarRange, Users, Layers, TrendingUp } from 'lucide-react';

const DashboardStats = ({ interactions = [] }) => {
  // Compute analytics from interaction items
  const totalVisits = interactions.length;
  
  const uniqueDoctors = new Set(interactions.map(item => item.doctor_name.toLowerCase().trim())).size;
  
  const products = new Set(
    interactions
      .map(item => item.product)
      .filter(p => p)
      .map(p => p.toLowerCase().trim())
  ).size;

  const today = new Date().toISOString().split('T')[0];
  const upcomingFollowups = interactions.filter(item => {
    return item.follow_up_date && item.follow_up_date >= today;
  }).length;

  const stats = [
    {
      title: 'Total Logged Interactions',
      value: totalVisits,
      icon: TrendingUp,
      color: 'var(--color-primary)',
      bg: 'rgba(99, 102, 241, 0.1)'
    },
    {
      title: 'HCPs Visited',
      value: uniqueDoctors,
      icon: Users,
      color: 'var(--color-secondary)',
      bg: 'rgba(6, 182, 212, 0.1)'
    },
    {
      title: 'Products Discussed',
      value: products,
      icon: Layers,
      color: 'var(--color-accent)',
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Upcoming Follow-ups',
      value: upcomingFollowups,
      icon: CalendarRange,
      color: 'var(--color-warning)',
      bg: 'rgba(245, 158, 11, 0.1)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    }}>
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="glass-card animate-fade" style={{
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animationDelay: `${idx * 0.05}s`
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                {stat.title}
              </span>
              <span style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em' }}>
                {stat.value}
              </span>
            </div>
            
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: stat.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stat.color
            }}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
