import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Host-relative URL helper (using Vite proxy configuration)
const API_BASE = '/api/interactions';

// Async Thunks
export const fetchInteractions = createAsyncThunk(
  'interactions/fetchInteractions',
  async (search = '', { rejectWithValue }) => {
    try {
      const url = search ? `${API_BASE}?search=${encodeURIComponent(search)}` : API_BASE;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch interactions');
      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createInteraction = createAsyncThunk(
  'interactions/createInteraction',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create interaction');
      }
      const data = await response.json();
      dispatch(fetchInteractions()); // Reload list
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateInteraction = createAsyncThunk(
  'interactions/updateInteraction',
  async ({ id, payload }, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update interaction');
      const data = await response.json();
      dispatch(fetchInteractions()); // Reload list
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteInteraction = createAsyncThunk(
  'interactions/deleteInteraction',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete interaction');
      dispatch(fetchInteractions()); // Reload list
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'interactions/sendChatMessage',
  async (message, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to communicate with AI');
      }
      const data = await response.json();
      
      // If AI successfully ran log_interaction_tool or edit_interaction_tool under the hood,
      // refresh database state in UI.
      if (data.extracted_data && Object.keys(data.extracted_data).length > 0) {
        dispatch(fetchInteractions());
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Slice Definition
const interactionsSlice = createSlice({
  name: 'interactions',
  initialState: {
    items: [
      {
        id: 101,
        doctor_name: 'Shampa Jha',
        hospital: 'Mother Land Hospital',
        interaction_date: '2026-07-13',
        product: 'Glycomet',
        discussion_notes: 'Discussed Glycomet benefits and requested samples.',
        ai_summary: 'Interaction summary: Discussed Glycomet with Dr. Shampa Jha. Explained product benefits and usage. Doctor showed positive interest.',
        follow_up_date: '2026-07-20',
        next_action: 'Deliver samples',
        created_at: '2026-07-13T08:00:00'
      },
      {
        id: 102,
        doctor_name: 'Ravi Kumar',
        hospital: 'City General',
        interaction_date: '2026-07-12',
        product: 'CardioX',
        discussion_notes: 'Introduced CardioX and patient case studies.',
        ai_summary: 'Shared CardioX efficacy and upcoming studies.',
        follow_up_date: null,
        next_action: null,
        created_at: '2026-07-12T10:30:00'
      }
    ],
    loading: false,
    error: null,
    chatHistory: [
      {
        role: 'assistant',
        content: 'Hello! I am your AI CRM Assistant. You can describe your meeting with a doctor, and I will extract the details, summarize it, and log it automatically. For example: "I met Dr. Sarah Jenkins at City General today. We discussed cardio booster efficacy. She wants a follow up on Friday."'
      }
    ],
    chatLoading: false,
    lastExtractedInteraction: null,
    currentToast: null, // toast messages
  },
  reducers: {
    clearToast: (state) => {
      state.currentToast = null;
    },
    setToast: (state, action) => {
      state.currentToast = action.payload;
    },
    addChatMessage: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    clearChatHistory: (state) => {
      state.chatHistory = [
        {
          role: 'assistant',
          content: 'Chat history cleared. How can I help you manage HCP interactions today?'
        }
      ];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchInteractions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createInteraction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createInteraction.fulfilled, (state) => {
        state.loading = false;
        state.currentToast = { type: 'success', message: 'Interaction logged successfully!' };
      })
      .addCase(createInteraction.rejected, (state, action) => {
        state.loading = false;
        state.currentToast = { type: 'error', message: `Create failed: ${action.payload}` };
      })
      // Update
      .addCase(updateInteraction.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateInteraction.fulfilled, (state) => {
        state.loading = false;
        state.currentToast = { type: 'success', message: 'Interaction updated successfully!' };
      })
      .addCase(updateInteraction.rejected, (state, action) => {
        state.loading = false;
        state.currentToast = { type: 'error', message: `Update failed: ${action.payload}` };
      })
      // Delete
      .addCase(deleteInteraction.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteInteraction.fulfilled, (state) => {
        state.loading = false;
        state.currentToast = { type: 'success', message: 'Interaction deleted successfully.' };
      })
      .addCase(deleteInteraction.rejected, (state, action) => {
        state.loading = false;
        state.currentToast = { type: 'error', message: `Delete failed: ${action.payload}` };
      })
      // Chat
      .addCase(sendChatMessage.pending, (state) => {
        state.chatLoading = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.chatLoading = false;
        const responseData = action.payload;
        state.chatHistory.push({
          role: 'assistant',
          content: responseData.response,
          extractedData: responseData.extracted_data
        });
        
        // Show success alert toast if tool logs data
        if (responseData.extracted_data && responseData.extracted_data.action_type === 'log') {
          state.lastExtractedInteraction = responseData.extracted_data;
          state.currentToast = {
            type: 'success',
            message: `AI agent logged meeting for Dr. ${responseData.extracted_data.doctor_name}!`
          };
        } else if (responseData.extracted_data && responseData.extracted_data.action_type === 'edit') {
          state.currentToast = {
            type: 'success',
            message: 'AI agent edited interaction successfully!'
          };
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.chatLoading = false;
        state.chatHistory.push({
          role: 'assistant',
          content: `Sorry, I encountered an error: ${action.payload}`
        });
        state.currentToast = { type: 'error', message: 'Chat agent request failed' };
      });
  },
});

export const { clearToast, setToast, addChatMessage, clearChatHistory } = interactionsSlice.actions;
export default interactionsSlice.reducer;
