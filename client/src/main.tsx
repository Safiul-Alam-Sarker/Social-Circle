import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./components/pages/LandingPage";
import Message from "./components/pages/Message";
import Layout from "./components/pages/Layout";
import GlobalFeed from "./components/pages/GlobalFeed";
import Connections from "./components/pages/Connections";
import Discover from "./components/pages/Discover";
import Profile from "./components/pages/MyFeed";
import { Provider } from "react-redux";
import Store from "./app/store.ts";
import { Toaster } from "react-hot-toast";
import CreatePost from "../src/components/pages/CreatePost.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="landing" element={<LandingPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<GlobalFeed />} />
        <Route path="messages" element={<Message />} />
        <Route path="connections" element={<Connections />} />
        <Route path="discover" element={<Discover />} />
        <Route path="profile" element={<Profile />} />
        <Route path="post" element={<CreatePost />} />
      </Route>
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={Store}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </Provider>
  </StrictMode>
);
