// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import rankingReducer from '../features/ranking/rankingSlice';
import playersReducer from '../features/players/playersSlice';
import clubsReducer from '../features/clubs/clubsSlice';
import categoriesReducer from '../features/categories/categoriesSlice'; // <-- Importa el nuevo reducer

export const store = configureStore({
  reducer: {
    ranking: rankingReducer,
    players: playersReducer,
    clubs: clubsReducer,
    categories: categoriesReducer, // <-- Añade el reducer de categorías aquí
  },
});
