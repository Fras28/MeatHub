// src/features/tournaments/tournamentsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_BASE;

export const fetchTournaments = createAsyncThunk(
  'tournaments/fetchTournaments',
  async ({ page, term }, { rejectWithValue }) => {
    try {
      const populateParams = [
        'club.logo',
        'categoria',
        'parejas_inscritas.drive',
        'parejas_inscritas.revez',
      ];
      const queryParams = new URLSearchParams({
        'pagination[page]': page,
        'pagination[pageSize]': 25,
        'sort': 'fechaInicio:desc'
      });

      populateParams.forEach(param => {
        queryParams.append('populate', param);
      });

      if (term) {
        queryParams.append('filters[nombre][$containsi]', term);
      }

      const TOURNAMENTS_API_URL = `${API_BASE}api/torneos?${queryParams.toString()}`;
      const response = await fetch(TOURNAMENTS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Nuevo thunk para obtener un solo torneo por ID
export const fetchTournamentById = createAsyncThunk(
  'tournaments/fetchTournamentById',
  async (tournamentDocumentId, { rejectWithValue }) => {
    try {
      // Recreamos la petición del componente original, usando populate=*
      const TOURNAMENT_DETAIL_API_URL = `${API_BASE}api/torneos/${tournamentDocumentId}?populate=club.logo&populate=partidos.pareja1.drive&populate=partidos.pareja1.revez&populate=partidos.pareja2.drive&populate=partidos.pareja2.revez&populate=partidos.ganador&populate=parejas_inscritas&populate=categoria`;
      const response = await fetch(TOURNAMENT_DETAIL_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data; // Retornamos el objeto del torneo directamente
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const tournamentsSlice = createSlice({
  name: 'tournaments',
  initialState: {
    tournaments: [],
    selectedTournament: null, // Nuevo estado para el torneo seleccionado
    meta: {
      pagination: {
        page: 1,
        pageSize: 25,
        pageCount: 1,
        total: 0,
      },
    },
    loading: 'idle',
    error: null,
    searchTerm: '',
    currentPage: 1,
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTournaments.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchTournaments.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.tournaments = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || action.error.message;
        state.tournaments = [];
        state.meta.pagination.pageCount = 1;
      })
      // Reducers para el nuevo thunk
      .addCase(fetchTournamentById.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.selectedTournament = null;
      })
      .addCase(fetchTournamentById.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.selectedTournament = action.payload;
      })
      .addCase(fetchTournamentById.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || action.error.message;
        state.selectedTournament = null;
      });
  },
});

export const { setSearchTerm, setCurrentPage } = tournamentsSlice.actions;
export default tournamentsSlice.reducer;