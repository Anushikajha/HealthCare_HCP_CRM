import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import LogForm from './components/LogForm';
import ChatPanel from './components/ChatPanel';
import InteractionList from './components/InteractionList';
import {
  fetchInteractions,
  createInteraction,
  updateInteraction,
  deleteInteraction,
  sendChatMessage,
  clearChatHistory,
  clearToast
} from './redux/interactionsSlice';

const App = () => {
  const dispatch = useDispatch();
  
  // Local active tab: 'dashboard' or 'log'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Local state for search queries in navbar
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for interaction currently being edited
  const [editingInteraction, setEditingInteraction] = useState(null);

  // Redux states
  const { items: interactions, loading, chatHistory, chatLoading, currentToast } = useSelector(
    (state) => state.interactions
  );

  // Fetch interactions on mount or search query change
  useEffect(() => {
    // Basic debounce
    const delayDebounce = setTimeout(() => {
      dispatch(fetchInteractions(searchQuery));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, dispatch]);

  // Handle toast timeout
  useEffect(() => {
    if (currentToast) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentToast, dispatch]);

  // Form Save
  const handleSaveInteraction = (payload) => {
    if (editingInteraction) {
      dispatch(updateInteraction({ id: editingInteraction.id, payload }));
      setEditingInteraction(null);
    } else {
      dispatch(createInteraction(payload));
    }
    // Go to dashboard after save
    setActiveTab('dashboard');
  };

  // Trigger Edit Mode
  const handleEditTrigger = (item) => {
    setEditingInteraction(item);
    setActiveTab('log');
  };

  // Trigger Delete
  const handleDeleteTrigger = (id) => {
    dispatch(deleteInteraction(id));
  };

  // AI Chat Submit
  const handleSendChatMessage = (message) => {
    dispatch(sendChatMessage(message));
  };

  // Clear Chat History
  const handleClearChatHistory = () => {
    dispatch(clearChatHistory());
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel */}
      <div className="main-content">
        <Navbar activeTab={activeTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Content Body */}
        <main className="content-body">
          {activeTab === 'dashboard' ? (
            <div className="animate-fade">
              {/* Analytics metrics overview */}
              <DashboardStats interactions={interactions} />

              {/* Interaction list header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700' }}>HCP Visit History</h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    A detailed audit trail of healthcare professional engagements
                  </p>
                </div>

                <button onClick={() => {
                  setEditingInteraction(null);
                  setActiveTab('log');
                }} className="btn btn-primary">
                  Log New Interaction
                </button>
              </div>

              {/* Dynamic list rendering */}
              <InteractionList
                interactions={interactions}
                loading={loading}
                onEdit={handleEditTrigger}
                onDelete={handleDeleteTrigger}
              />
            </div>
          ) : (
            // Tab 'log': Structured Form and Conversational Chat side-by-side
            <div className="animate-fade" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px',
              alignItems: 'start'
            }}>
              {/* Left Column: Manual Structured Form */}
              <LogForm
                initialData={editingInteraction}
                onSave={handleSaveInteraction}
                onCancelEdit={() => {
                  setEditingInteraction(null);
                  setActiveTab('dashboard');
                }}
              />

              {/* Right Column: AI Conversational Chat Panel */}
              <ChatPanel
                chatHistory={chatHistory}
                chatLoading={chatLoading}
                onSendMessage={handleSendChatMessage}
                onClearHistory={handleClearChatHistory}
              />
            </div>
          )}
        </main>
      </div>

      {/* Global Alert Notification Toast */}
      {currentToast && (
        <div className="toast-container">
          <div className={`toast ${currentToast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            {currentToast.type === 'success' ? (
              <CheckCircle2 size={18} style={{ color: 'var(--color-accent)' }} />
            ) : (
              <AlertCircle size={18} style={{ color: 'var(--color-danger)' }} />
            )}
            <span style={{ fontWeight: '500' }}>{currentToast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
