import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../services/api/authApi';
import { supabase } from '../../config/supabase';

// Helper to save token to AsyncStorage
const persistToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('jwt_token', token);
  } catch (error) {
    console.error('Failed to save token to AsyncStorage:', error);
  }
};

const clearToken = async () => {
  try {
    await AsyncStorage.removeItem('jwt_token');
  } catch (error) {
    console.error('Failed to clear token:', error);
  }
};

// Async Thunks
export const requestOtp = createAsyncThunk(
  'auth/requestOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authApi.requestOtp(email);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, code }: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp(email, code);
      // The backend returns a custom JWT in response.token
      await persistToken(response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Invalid OTP');
    }
  }
);

export const syncGoogleProfile = createAsyncThunk(
  'auth/syncGoogleProfile',
  async (supabaseJwt: string, { rejectWithValue }) => {
    try {
      // Temporarily store the supabase JWT so the interceptor can use it for the /sync call
      await persistToken(supabaseJwt);
      const response = await authApi.syncGoogleProfile();
      
      // The backend /sync endpoint returns the user profile, but might not return a new custom JWT
      // If the backend relies on the Supabase JWT going forward, we keep it. 
      // If the backend returns a custom JWT, we would overwrite it here.
      if (response.token) {
        await persistToken(response.token);
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to sync Google profile');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getMe();
      return response.user;
    } catch (_error) {
      // If fetch fails (e.g., 401), clear the invalid token
      await clearToken();
      return rejectWithValue('Session expired');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    await clearToken();
    await supabase.auth.signOut();
    return null;
  }
);

interface AuthState {
  user: any | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  otpStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  otpStatus: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokenFromStorage(state, action) {
      state.token = action.payload;
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // requestOtp
      .addCase(requestOtp.pending, (state) => {
        state.otpStatus = 'loading';
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state) => {
        state.otpStatus = 'succeeded';
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.otpStatus = 'failed';
        state.error = action.payload as string;
      })
      
      // verifyOtp
      .addCase(verifyOtp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // syncGoogleProfile
      .addCase(syncGoogleProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(syncGoogleProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        if (action.payload.token) {
          state.token = action.payload.token;
        }
      })
      .addCase(syncGoogleProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // fetchCurrentUser
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = 'idle';
        state.user = null;
        state.token = null;
      })

      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.otpStatus = 'idle';
        state.error = null;
      });
  },
});

export const { setTokenFromStorage, clearError } = authSlice.actions;

export default authSlice.reducer;
