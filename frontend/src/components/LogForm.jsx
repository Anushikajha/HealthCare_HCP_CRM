import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, AlertCircle, X } from 'lucide-react';

const LogForm = ({ initialData = null, onSave, onCancelEdit }) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const defaultState = {
    doctor_name: '',
    hospital: '',
    interaction_date: getTodayString(),
    product: '',
    discussion_notes: '',
    ai_summary: '',
    follow_up_date: '',
    next_action: '',
  };

  const [formData, setFormData] = useState(defaultState);
  const [error, setError] = useState('');

  // Sync state if initialData is provided for editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        doctor_name: initialData.doctor_name || '',
        hospital: initialData.hospital || '',
        interaction_date: initialData.interaction_date || getTodayString(),
        product: initialData.product || '',
        discussion_notes: initialData.discussion_notes || '',
        ai_summary: initialData.ai_summary || '',
        follow_up_date: initialData.follow_up_date || '',
        next_action: initialData.next_action || '',
      });
    } else {
      setFormData(defaultState);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = (e) => {
    e.preventDefault();
    if (initialData) {
      // Revert to initial editing data
      setFormData(initialData);
    } else {
      setFormData(defaultState);
    }
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (!formData.doctor_name.trim()) {
      setError('Doctor name is required.');
      return;
    }
    if (!formData.interaction_date) {
      setError('Interaction date is required.');
      return;
    }

    // Format fields (empty strings to null or keep blank)
    const payload = {
      doctor_name: formData.doctor_name.trim(),
      hospital: formData.hospital.trim() || null,
      interaction_date: formData.interaction_date,
      product: formData.product.trim() || null,
      discussion_notes: formData.discussion_notes.trim() || null,
      ai_summary: formData.ai_summary.trim() || null,
      follow_up_date: formData.follow_up_date || null,
      next_action: formData.next_action.trim() || null,
    };

    onSave(payload);
    
    // Clear form if not in editing mode
    if (!initialData) {
      setFormData(defaultState);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
          {initialData ? '✍️ Edit Interaction Record' : '📝 Structured Log Entry'}
        </h3>
        {initialData && (
          <button 
            onClick={onCancelEdit}
            className="btn btn-secondary" 
            style={{ padding: '6px', borderRadius: '50%' }}
            title="Cancel Edit"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          color: '#fca5a5',
          marginBottom: '20px',
          fontSize: '13px'
        }}>
          <AlertCircle size={16} style={{ color: 'var(--color-danger)' }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        
        {/* Doctor and Hospital Fields Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Doctor / HCP Name *</label>
            <input
              type="text"
              name="doctor_name"
              placeholder="e.g. Dr. Sharma"
              value={formData.doctor_name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hospital / Clinic</label>
            <input
              type="text"
              name="hospital"
              placeholder="e.g. City General Clinic"
              value={formData.hospital}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Date and Product Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Interaction Date *</label>
            <input
              type="date"
              name="interaction_date"
              value={formData.interaction_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Product Discussed</label>
            <input
              type="text"
              name="product"
              placeholder="e.g. Glycomet-GP"
              value={formData.product}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Discussion Notes */}
        <div className="form-group">
          <label className="form-label">Discussion Notes</label>
          <textarea
            name="discussion_notes"
            placeholder="Summarize key points, physician sentiment, and samples requested..."
            value={formData.discussion_notes}
            onChange={handleChange}
            className="form-input"
            rows="3"
            style={{ resize: 'vertical' }}
          />
        </div>

        {initialData && (
          <div className="form-group">
            <label className="form-label">AI Summary (Generated)</label>
            <textarea
              name="ai_summary"
              value={formData.ai_summary}
              onChange={handleChange}
              className="form-input"
              rows="2"
              style={{ resize: 'vertical' }}
            />
          </div>
        )}

        {/* Follow-up and Next Action */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Follow-up Date</label>
            <input
              type="date"
              name="follow_up_date"
              value={formData.follow_up_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Next Action</label>
            <input
              type="text"
              name="next_action"
              placeholder="e.g. Deliver samples / Schedule follow-up"
              value={formData.next_action}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: 'auto',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button type="button" onClick={handleReset} className="btn btn-secondary">
            <RotateCcw size={16} />
            Reset
          </button>
          
          <button type="submit" className="btn btn-primary">
            <Save size={16} />
            {initialData ? 'Update Record' : 'Save Interaction'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default LogForm;
