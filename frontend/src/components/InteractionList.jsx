import React, { useState } from 'react';
import { Calendar, MapPin, Tag, FileText, Trash2, Edit3, Eye, ArrowRight } from 'lucide-react';

const InteractionList = ({ interactions = [], loading = false, onEdit, onDelete }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          margin: '0 auto 16px',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading interactions from CRM database...</p>
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🗃️</span>
        <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No CRM Interactions Found</h4>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
          Try clearing your search query, or use the Structured Form or AI Chat Assistant to log a new meeting with a doctor.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Table List Layout */}
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '16px 24px' }}>HCP Doctor / Clinic</th>
              <th style={{ padding: '16px 24px' }}>Date</th>
              <th style={{ padding: '16px 24px' }}>Product</th>
              <th style={{ padding: '16px 24px' }}>Summary Preview</th>
              <th style={{ padding: '16px 24px' }}>Follow-up</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interactions.map((item) => {
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="table-row">
                  {/* Doctor Info */}
                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px', color: '#ffffff' }}>Dr. {item.doctor_name}</span>
                      {item.hospital && (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} />
                          {item.hospital}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Interaction Date */}
                  <td style={{ padding: '18px 24px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={12} />
                      {item.interaction_date}
                    </span>
                  </td>

                  {/* Product */}
                  <td style={{ padding: '18px 24px' }}>
                    {item.product ? (
                      <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={10} />
                        {item.product}
                      </span>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px' }}>—</span>
                    )}
                  </td>

                  {/* AI Summary */}
                  <td style={{ padding: '18px 24px', fontSize: '13px', maxWidth: '300px' }}>
                    <p style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: 'var(--color-text-muted)'
                    }} title={item.ai_summary}>
                      {item.ai_summary || item.discussion_notes || 'No summary available.'}
                    </p>
                  </td>

                  {/* Follow-up and Next Action */}
                  <td style={{ padding: '18px 24px' }}>
                    {item.follow_up_date ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="badge badge-success" style={{ alignSelf: 'flex-start' }}>{item.follow_up_date}</span>
                        {item.next_action && (
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }} title={item.next_action}>
                            {item.next_action}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px' }}>—</span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="btn btn-secondary"
                        style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        onClick={() => onEdit(item)}
                        className="btn btn-secondary"
                        style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
                        title="Edit Record"
                      >
                        <Edit3 size={14} style={{ color: 'var(--color-primary)' }} />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete interaction for Dr. ${item.doctor_name}?`)) {
                            onDelete(item.id);
                          }
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
                        title="Delete Record"
                      >
                        <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal Overlay */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '650px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.8)',
            animation: 'slideIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '8px' }}>CRM Interaction Details</span>
                <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Dr. {selectedItem.doctor_name}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <MapPin size={12} /> {selectedItem.hospital || 'Hospital not specified'}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="btn btn-secondary"
                style={{ padding: '6px', borderRadius: '50%' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              {/* Grid Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                <div>
                  <span style={{ display: 'block', color: 'var(--color-text-muted)', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}>Meeting Date</span>
                  <span style={{ color: '#fff', fontWeight: '500' }}>{selectedItem.interaction_date}</span>
                </div>
                <div>
                  <span style={{ display: 'block', color: 'var(--color-text-muted)', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}>Discussed Product</span>
                  <span style={{ color: 'var(--color-secondary)', fontWeight: '500' }}>{selectedItem.product || 'N/A'}</span>
                </div>
              </div>

              {/* Discussion Notes */}
              <div>
                <span style={{ display: 'block', color: 'var(--color-text-muted)', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', fontSize: '10px' }}>Discussion Notes</span>
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--color-text-muted)'
                }}>
                  {selectedItem.discussion_notes || 'No detailed meeting notes were written.'}
                </div>
              </div>

              {/* AI Generated Summary */}
              <div>
                <span style={{ display: 'block', color: 'var(--color-accent)', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', fontSize: '10px' }}>AI Summary</span>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px',
                  lineHeight: '1.6',
                  color: '#e2e8f0',
                  fontWeight: '500'
                }}>
                  {selectedItem.ai_summary || 'No AI summary generated.'}
                </div>
              </div>

              {/* Follow-up Panel */}
              {selectedItem.follow_up_date && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.15)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div>
                    <span style={{ display: 'block', color: 'var(--color-warning)', fontWeight: '600', fontSize: '10px', textTransform: 'uppercase' }}>Next Follow-up</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{selectedItem.follow_up_date}</span>
                  </div>
                  <div style={{ borderLeft: '1px solid rgba(245,158,11,0.2)', paddingLeft: '16px', flex: 1 }}>
                    <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Next Action Item</span>
                    <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{selectedItem.next_action || 'None'}</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setSelectedItem(null)} className="btn btn-primary">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InteractionList;
