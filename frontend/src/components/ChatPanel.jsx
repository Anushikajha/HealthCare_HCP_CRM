import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, RefreshCw, Trash2, ArrowRight } from 'lucide-react';

const ChatPanel = ({ chatHistory = [], chatLoading = false, onSendMessage, onClearHistory }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const suggestions = [
    "I met Dr. Sharma today at Mayo Clinic. We discussed Glycomet. He requested samples and wants follow-up next Monday.",
    "Search for doctor Sharma",
    "Summarize previous meetings for Dr. Sharma",
    "Schedule follow-up for Dr. Sharma next Friday regarding new medicine release"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, chatLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleSuggestionClick = (suggestion) => {
    if (chatLoading) return;
    setInput(suggestion);
  };

  return (
    <div className="glass-card" style={{
      padding: '28px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '640px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'var(--gradient-primary)',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--accent-shadow)'
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>AI Assistant Chat</h3>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Powered by LangGraph Agent</span>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="btn btn-secondary"
          style={{ padding: '8px 12px', fontSize: '12px' }}
          title="Clear Chat History"
        >
          <Trash2 size={14} />
          Clear
        </button>
      </div>

      {/* Message Area */}
      <div className="chat-messages-container" style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingRight: '6px'
      }}>
        {chatHistory.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '12px',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isUser ? 'rgba(255,255,255,0.1)' : 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isUser ? 'none' : '0 0 8px rgba(99, 102, 241, 0.3)',
                flexShrink: 0
              }}>
                {isUser ? <User size={14} /> : <Sparkles size={14} color="#fff" />}
              </div>

              {/* Chat Bubble */}
              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '80%', gap: '6px' }}>
                <div style={{
                  background: isUser ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: isUser ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-color)',
                  padding: '12px 16px',
                  borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--color-text-main)'
                }}>
                  {msg.content}
                </div>

                {/* If AI extracted entities and logged them, show a summary card */}
                {msg.extractedData && msg.extractedData.action_type === 'log' && (
                  <div className="glass-card" style={{
                    padding: '14px',
                    fontSize: '12px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderColor: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginTop: '4px'
                  }}>
                    <div style={{ fontWeight: '700', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px' }}>✅</span>
                      Logged to Database
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Doctor:</span>
                      <span style={{ fontWeight: '500' }}>{msg.extractedData.doctor_name}</span>

                      <span style={{ color: 'var(--color-text-muted)' }}>Hospital:</span>
                      <span>{msg.extractedData.hospital || 'N/A'}</span>

                      <span style={{ color: 'var(--color-text-muted)' }}>Date:</span>
                      <span>{msg.extractedData.interaction_date}</span>

                      <span style={{ color: 'var(--color-text-muted)' }}>Product:</span>
                      <span>{msg.extractedData.product || 'N/A'}</span>

                      <span style={{ color: 'var(--color-text-muted)' }}>Follow-up:</span>
                      <span style={{ fontWeight: '500', color: 'var(--color-warning)' }}>
                        {msg.extractedData.follow_up_date || 'None'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {chatLoading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'spin 1.5s linear infinite'
            }}>
              <RefreshCw size={14} color="#fff" />
            </div>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              AI Agent is thinking and processing tools...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Prompts */}
      <div className="suggestions-container" style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
          💡 SUGGESTED ACTIONS:
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(s)}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: 'var(--color-text-muted)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--color-text-muted)';
              }}
            >
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '92%' }}>
                {s}
              </span>
              <ArrowRight size={12} style={{ opacity: 0.6 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '16px'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI to log, search, edit, or summarize interactions..."
          className="form-input"
          style={{ flex: 1 }}
          disabled={chatLoading}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '12px', borderRadius: 'var(--radius-md)' }} disabled={chatLoading}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
