import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tripsApi } from '../../services/api/tripsApi';

// Define the Trip Type
export interface Trip {
  id: string;
  title: string;
  location: string;
  price: number;
  duration: number;
  slots_total: number;
  slots_left: number;
  category: string;
  image_url: string;
  is_featured: boolean;
  created_at: string;
  provider: {
    id: string;
    name: string;
    avatar_url: string;
  };
  itinerary?: any[]; // Only populated in getTripById
}

interface TripsState {
  items: Trip[];
  selectedTrip: Trip | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  selectedTripStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TripsState = {
  items: [],
  selectedTrip: null,
  status: 'idle',
  selectedTripStatus: 'idle',
  error: null,
};

// Thunks
export const fetchTrips = createAsyncThunk<
  Trip[],
  { search?: string; category?: string; featured?: boolean } | undefined,
  { rejectValue: string }
>(
  'trips/fetchTrips',
  async (params, { rejectWithValue }) => {
    try {
      const response = await tripsApi.getAllTrips(params);
      return response.trips;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch trips');
    }
  }
);

export const fetchTripById = createAsyncThunk<
  Trip,
  string,
  { rejectValue: string }
>(
  'trips/fetchTripById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tripsApi.getTripById(id);
      return response.trip;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch trip details');
    }
  }
);

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    clearSelectedTrip: (state) => {
      state.selectedTrip = null;
      state.selectedTripStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    // fetchTrips
    builder.addCase(fetchTrips.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchTrips.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload;
    });
    builder.addCase(fetchTrips.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // fetchTripById
    builder.addCase(fetchTripById.pending, (state) => {
      state.selectedTripStatus = 'loading';
    });
    builder.addCase(fetchTripById.fulfilled, (state, action) => {
      state.selectedTripStatus = 'succeeded';
      state.selectedTrip = action.payload;
    });
    builder.addCase(fetchTripById.rejected, (state, action) => {
      state.selectedTripStatus = 'failed';
      // Do not overwrite general trips error, keep it separate if needed, 
      // but for simplicity we can just log it or handle in UI.
    });
  },
});

export const { clearSelectedTrip } = tripsSlice.actions;
export default tripsSlice.reducer;
