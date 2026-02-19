// src/features/categories/categoriesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_BASE;

export const fetchCategoriesByClub = createAsyncThunk(
  'categories/fetchCategoriesByClub',
  async (clubId, { rejectWithValue }) => {
    try {
      // Realiza ambas llamadas a la API en paralelo
      const [clubResponse, rankingCategoriesResponse] = await Promise.all([
        fetch(`${API_BASE}api/clubs?filters[documentId][$eq]=${clubId}&populate=logo`),
        fetch(`${API_BASE}api/ranking-categorias?populate=categoria&filters[club][documentId][$eq]=${clubId}`)
      ]);

      // Verifica el estado de ambas respuestas
      if (!clubResponse.ok) {
        throw new Error(`HTTP error! status: ${clubResponse.status} fetching club data`);
      }
      if (!rankingCategoriesResponse.ok) {
        throw new Error(`HTTP error! status: ${rankingCategoriesResponse.status} fetching ranking categories`);
      }
      
      const clubDataRes = await clubResponse.json();
      const rankingCategoriesData = await rankingCategoriesResponse.json();

      const clubData = clubDataRes.data && clubDataRes.data.length > 0 ? clubDataRes.data[0] : null;
      
      if (!clubData) {
        throw new Error("Club no encontrado.");
      }

      const uniqueCategories = [];
      const seenCategoryIds = new Set();
      rankingCategoriesData.data.forEach(rc => {
        if (rc.categoria && !seenCategoryIds.has(rc.categoria.id)) {
          uniqueCategories.push({
            id: rc.categoria.id,
            documentId: rc.categoria.documentId,
            nombre: rc.categoria.nombre,
          });
          seenCategoryIds.add(rc.categoria.id);
        }
      });
      uniqueCategories.sort((a, b) => a.nombre.localeCompare(b.nombre));
      
      return { clubData, categories: uniqueCategories };
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    clubData: null,
    categories: [],
    loading: 'idle', 
    error: null,
  },
  reducers: {
    clearCategories: (state) => {
        state.clubData = null;
        state.categories = [];
        state.loading = 'idle';
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriesByClub.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchCategoriesByClub.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.clubData = action.payload.clubData;
        state.categories = action.payload.categories;
      })
      .addCase(fetchCategoriesByClub.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Error al cargar las categorías del club.';
        state.clubData = null;
        state.categories = [];
      });
  },
});

export const { clearCategories } = categoriesSlice.actions;

export default categoriesSlice.reducer;