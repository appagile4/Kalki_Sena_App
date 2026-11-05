import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "./slices/bookSlice";
import videoReducer from "./slices/videoSlice";

export const store = configureStore({
  reducer: {
    book: bookReducer,
    video: videoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
