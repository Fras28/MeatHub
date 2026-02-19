import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// La URL base es un placeholder aquí. En tu proyecto real, esto debe provenir del entorno.
const API_BASE = "https://padelproback-ranking.onrender.com/"; 
const GLOBAL_RANKING_CATEGORIES_URL = `${API_BASE}api/ranking-global-categorias`;

// Definición del orden de categorías (Mantenido de la lógica anterior)
const CATEGORY_ORDER = [
  "3RA LIBRE", "4TA LIBRE", "5TA LIBRE", "6TA LIBRE", "7MA LIBRE","8VA LIBRE",
  "4TA DAMAS", "5TA DAMAS", "6TA DAMAS", "7MA DAMAS",
  "AJPP"
];

// Función auxiliar para obtener el índice de orden
const getCategoryOrderIndex = (categoryName) => {
  const index = CATEGORY_ORDER.findIndex(name => name === categoryName?.toUpperCase());
  return index !== -1 ? index : CATEGORY_ORDER.length + 1; 
};


// Thunk para cargar el ranking global y categorizado
export const fetchCategorizedRanking = createAsyncThunk(
  'ranking/fetchCategorizedRanking',
  async (_, { rejectWithValue }) => {
    try {
      // 1. Obtener la lista de todos los rankings globales (categorías)
      const response = await fetch(`${GLOBAL_RANKING_CATEGORIES_URL}?populate=categoria`);
      if (!response.ok) {
        throw new Error('Error al obtener la lista de categorías de ranking.');
      }
      const categoriesData = await response.json();

      const tempCategorizedRanking = {};

      // Almacenar todas las promesas de detalle para ejecutar en paralelo
      const detailFetches = categoriesData.data.map(async (item) => {
        const categoryDocumentId = item?.documentId;
        const categoryName = item?.categoria?.nombre; 

        if (!categoryDocumentId || !categoryName) return null;

        // URL para obtener los detalles de una categoría específica con jugadores
        const DETAIL_URL = `${GLOBAL_RANKING_CATEGORIES_URL}/${categoryDocumentId}?populate=entradasRankingGlobal.jugador.club.logo&populate=entradasRankingGlobal.jugador.estadisticas`;

        const detailResponse = await fetch(DETAIL_URL);
        if (!detailResponse.ok) {
          console.error(`Error al obtener detalle del ranking para ${categoryName}: Estado ${detailResponse.status}`);
          return null;
        }
        const detailData = await detailResponse.json();

        // 3. Procesar los datos de la categoría detallada
        const rankingEntries = detailData.data?.entradasRankingGlobal || [];

        const sortedPlayers = rankingEntries
          .map(entry => ({
            rankingEntryId: entry.id, 
            posicionGlobal: entry.posicionGlobal,
            puntosGlobales: entry.puntosGlobales || 0,
            
            // Mapeo de datos
            ...entry.jugador,
            rankingGeneral: entry.puntosGlobales || 0, 
            id: entry.jugador?.id, 
            nombre: entry.jugador?.nombre,
            apellido: entry.jugador?.apellido,
            historialRanking: entry.jugador?.historialRanking || [],
            estadisticas: entry.jugador?.estadisticas,
            club: entry.jugador?.club,
          }))
          .sort((a, b) => b.rankingGeneral - a.rankingGeneral);

        return {
          id: item.id,
          name: categoryName,
          players: sortedPlayers,
        };
      });

      // Ejecutar todas las peticiones en paralelo y esperar los resultados
      const results = await Promise.all(detailFetches);

      // Mapear los resultados válidos al objeto final y aplicar el orden
      const orderedCategories = {};
      results.filter(r => r !== null)
             .sort((a, b) => getCategoryOrderIndex(a.name) - getCategoryOrderIndex(b.name))
             .forEach(category => {
                orderedCategories[category.id] = category;
             });

      return orderedCategories;

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// El slice define cómo el estado cambia en respuesta a las acciones.
const rankingSlice = createSlice({
  name: 'ranking',
  initialState: {
    data: {},
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    resetRankingState: (state) => {
        state.data = {};
        state.loading = 'idle';
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategorizedRanking.pending, (state) => {
        // Solo cambiar a 'pending' si el estado no es 'succeeded' (para no perder datos mientras se carga en segundo plano)
        if (state.loading === 'idle' || state.loading === 'failed') {
            state.loading = 'pending';
        }
      })
      .addCase(fetchCategorizedRanking.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchCategorizedRanking.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default rankingSlice.reducer;
