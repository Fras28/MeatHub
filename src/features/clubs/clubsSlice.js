// src/features/clubs/clubsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_BASE;

// Thunk para buscar los clubes
export const fetchClubs = createAsyncThunk(
  'clubs/fetchClubs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}api/clubs?populate=logo`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Ordena los clubes por id de menor a mayor antes de devolverlos
      const sortedClubs = data.data.sort((a, b) => a.id - b.id);
      return sortedClubs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const clubsSlice = createSlice({
  name: 'clubs',
  initialState: {
    data: [],
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClubs.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchClubs.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchClubs.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Error al cargar los clubes.';
      });
  },
});

export default clubsSlice.reducer;