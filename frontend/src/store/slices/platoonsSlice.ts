import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { platoonsApi, Platoon, PlatoonMessage } from '../../services/api/platoonsApi';

interface PlatoonsState {
  myPlatoons: Platoon[];
  selectedPlatoon: Platoon | null;
  messages: PlatoonMessage[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  selectedPlatoonStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  messagesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PlatoonsState = {
  myPlatoons: [],
  selectedPlatoon: null,
  messages: [],
  status: 'idle',
  selectedPlatoonStatus: 'idle',
  messagesStatus: 'idle',
  error: null,
};

// Thunks
export const fetchMyPlatoons = createAsyncThunk<
  Platoon[],
  void,
  { rejectValue: string }
>(
  'platoons/fetchMyPlatoons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await platoonsApi.getMyPlatoons();
      return response.platoons;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch your platoons');
    }
  }
);

export const fetchPlatoonById = createAsyncThunk<
  Platoon,
  string,
  { rejectValue: string }
>(
  'platoons/fetchPlatoonById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await platoonsApi.getPlatoonById(id);
      return response.platoon;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch platoon details');
    }
  }
);

export const createPlatoonThunk = createAsyncThunk<
  Platoon,
  string,
  { rejectValue: string }
>(
  'platoons/createPlatoon',
  async (trip_id, { rejectWithValue }) => {
    try {
      const response = await platoonsApi.createPlatoon(trip_id);
      return response.platoon;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create platoon');
    }
  }
);

export const joinPlatoonThunk = createAsyncThunk<
  { status: string; message: string },
  string,
  { rejectValue: string }
>(
  'platoons/joinPlatoon',
  async (id, { rejectWithValue }) => {
    try {
      const response = await platoonsApi.joinPlatoon(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to join platoon');
    }
  }
);

export const approveRequestThunk = createAsyncThunk<
  { status: string; message: string; userId: string; action: 'approve' | 'reject' },
  { id: string; userId: string; action: 'approve' | 'reject' },
  { rejectValue: string }
>(
  'platoons/approveRequest',
  async ({ id, userId, action }, { rejectWithValue }) => {
    try {
      const response = await platoonsApi.approveRequest(id, userId, action);
      return { ...response, userId, action };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to process join request');
    }
  }
);

export const fetchMessages = createAsyncThunk<
  PlatoonMessage[],
  { id: string; limit?: number; offset?: number },
  { rejectValue: string }
>(
  'platoons/fetchMessages',
  async ({ id, limit, offset }, { rejectWithValue }) => {
    try {
      const response = await platoonsApi.getMessages(id, limit, offset);
      return response.messages;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch messages');
    }
  }
);

const platoonsSlice = createSlice({
  name: 'platoons',
  initialState,
  reducers: {
    clearSelectedPlatoon: (state) => {
      state.selectedPlatoon = null;
      state.selectedPlatoonStatus = 'idle';
      state.messages = [];
      state.messagesStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    // fetchMyPlatoons
    builder.addCase(fetchMyPlatoons.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchMyPlatoons.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.myPlatoons = action.payload;
    });
    builder.addCase(fetchMyPlatoons.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // fetchPlatoonById
    builder.addCase(fetchPlatoonById.pending, (state) => {
      state.selectedPlatoonStatus = 'loading';
    });
    builder.addCase(fetchPlatoonById.fulfilled, (state, action) => {
      state.selectedPlatoonStatus = 'succeeded';
      state.selectedPlatoon = action.payload;
    });
    builder.addCase(fetchPlatoonById.rejected, (state, action) => {
      state.selectedPlatoonStatus = 'failed';
      state.error = action.payload as string;
    });

    // createPlatoon
    builder.addCase(createPlatoonThunk.fulfilled, (state, action) => {
      state.myPlatoons.unshift(action.payload); // Add to beginning of the list
    });

    // approveRequest
    builder.addCase(approveRequestThunk.fulfilled, (state, action) => {
      const { userId, action: requestAction } = action.payload;
      if (state.selectedPlatoon) {
        // Remove from pending_requests
        state.selectedPlatoon.pending_requests = state.selectedPlatoon.pending_requests.filter(
          (id) => id !== userId
        );
        // If approved, add to members
        if (requestAction === 'approve') {
          state.selectedPlatoon.members.push(userId);
        }
      }
    });

    // fetchMessages
    builder.addCase(fetchMessages.pending, (state) => {
      state.messagesStatus = 'loading';
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.messagesStatus = 'succeeded';
      // If we are paginating, we might want to prepend. For now, replace or assume simple fetch.
      state.messages = action.payload;
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.messagesStatus = 'failed';
    });
  },
});

export const { clearSelectedPlatoon } = platoonsSlice.actions;
export default platoonsSlice.reducer;
