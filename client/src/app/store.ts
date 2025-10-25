// store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice.ts";
import connectionsReducer from "../features/connections/connectionSlice.ts";
import messagesReducer from "../features/messages/messageSlice.ts";

const Store = configureStore({
  reducer: {
    user: userReducer,
    connection: connectionsReducer,
    messages: messagesReducer,
  },
});

// Export the RootState type using type-only export
export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;

export default Store;
