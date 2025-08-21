import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import RootLayout from "./RootLayout";
import RouteFallbackSkeleton from "../components/RouteFallbackSkeleton";
import ProtectedRoute from "../auth/ProtectedRoute";

const Home = lazy(() => import("../pages/Home"));
const Map = lazy(() => import("../pages/Map"));
const NewPost = lazy(() => import("../pages/NewPost"));
const Chat = lazy(() => import("../pages/Chat"));
const My = lazy(() => import("../pages/My"));
const Login = lazy(() => import("../pages/Login"));
const PostDetail = lazy(() => import("../pages/home/PostDetail"));
const PlaceDetail = lazy(() => import("../pages/map/PlaceDetail"));
const Step1 = lazy(() => import("../pages/new/Step1"));
const Step2 = lazy(() => import("../pages/new/Step2"));
const ChatRoom = lazy(() => import("../pages/chat/ChatRoom"));
const Settings = lazy(() => import("../pages/my/Settings"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallbackSkeleton />}>
        <Routes>
          <Route element={<RootLayout />}>
            {/* Home */}
            <Route path="/">
              <Route index element={<Home />} />
              <Route path="post/:postId" element={<PostDetail />} />
            </Route>

            {/* Map with nested example */}
            <Route path="/map">
              <Route index element={<Map />} />
              <Route path="place/:placeId" element={<PlaceDetail />} />
            </Route>

            {/* New Post flow (could have steps) */}
            <Route path="/new">
              <Route index element={<NewPost />} />
              <Route path="step/1" element={<Step1 />} />
              <Route path="step/2" element={<Step2 />} />
            </Route>

            {/* Chat requires auth */}
            <Route path="/chat">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="room/:roomId"
                element={
                  <ProtectedRoute>
                    <ChatRoom />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* My page requires auth */}
            <Route path="/my">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <My />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
