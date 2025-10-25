// userSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios.js";

interface User {
  _id: string;
  fullname: string;
  username: string;
  email: string;
  profileimagelink?: string;
  coverimglink?: string;
  profilefileid?: string;
  coverfileid?: string;
  bio?: string;
  location?: string;
  followers: string[];
  following: string[];
  connections: string[];
  // add other fields as needed
}

interface UserState {
  value: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  value: null,
  loading: false,
  error: null,
};

export const fetchUser = createAsyncThunk<User | null>(
  "user/fetchUser",
  async () => {
    const { data } = await API.get("/user/data");

    if (data.success && data.user) {
      return data.user;
    } else {
      throw new Error(data.message || "Failed to fetch user data");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.value = null;
    },
    updateUser: (state, action) => {
      if (state.value) {
        state.value = { ...state.value, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.value = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch user";
      });
  },
});

export const { clearUser, updateUser } = userSlice.actions;
export default userSlice.reducer;
