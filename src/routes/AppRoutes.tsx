import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import RootLayout from "./RootLayout";
import RouteFallbackSkeleton from "../components/RouteFallbackSkeleton";
import ProtectedRoute from "../auth/ProtectedRoute";

const Home = lazy(() => import("../pages/Home"));
const Search = lazy(() => import("../pages/Search"));
const Chat = lazy(() => import("../pages/Chat"));
const My = lazy(() => import("../pages/My"));
const Login = lazy(() => import("../pages/Login"));
const Step1 = lazy(() => import("../pages/new/Step1"));
const Step2 = lazy(() => import("../pages/new/Step2"));
const FeedbackResult = lazy(() => import("../pages/FeedbackResult"));
const ChatRoom = lazy(() => import("../pages/chat/ChatRoom"));
const Settings = lazy(() => import("../pages/my/Settings"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallbackSkeleton />}>
        <Routes>
          <Route element={<RootLayout />}>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Search */}
            <Route path="/search" element={<Search />} />

            {/* Map with nested example */}
            <Route path="/map">
              <Route index element={<div>MAP PAGE</div>} />
            </Route>

            {/* New Post flow */}
            <Route path="/new">
              <Route index element={<div>NEW POST</div>} />
              <Route path="step1" element={<Step1 />} />
              <Route path="step2" element={<Step2 />} />
            </Route>

            {/* Feedback Result */}
            <Route path="/feedback-result" element={<FeedbackResult />} />

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
