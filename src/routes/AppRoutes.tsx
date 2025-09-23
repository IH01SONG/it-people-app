import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import RootLayout from "./RootLayout";
import RouteFallbackSkeleton from "../components/RouteFallbackSkeleton";
import ProtectedRoute from "../auth/ProtectedRoute";

const Home = lazy(() => import("../pages/Home"));
const Search = lazy(() => import("../pages/Search"));
const SearchResults = lazy(() => import("../pages/SearchResults"));
const Chat = lazy(() => import("../pages/Chat"));
const My = lazy(() => import("../pages/My"));
const Login = lazy(() => import("../pages/Login"));
const Map = lazy(() => import("../pages/Map"));
const NewPost = lazy(() => import("../pages/NewPost"));
const Step1 = lazy(() => import("../pages/new/Step1"));
const Step2 = lazy(() => import("../pages/new/Step2"));
const EditPost = lazy(() => import("../pages/EditPost"));
const FeedbackResult = lazy(() => import("../pages/FeedbackResult"));
const ChatRoom = lazy(() => import("../pages/chat/ChatRoom"));
const Settings = lazy(() => import("../pages/my/Settings"));
const SignUp = lazy(() => import("../pages/SignUp"));
const MyActivity = lazy(() => import("../pages/my/MyActivity"));
const Inquiry = lazy(() => import("../pages/Inquiry"));
const TermsAndConditions = lazy(() => import("../pages/my/TermsAndConditions"));
const AccountManagement = lazy(() => import("../pages/my/AccountManagement"));
const PersonalInformationEdit = lazy(() => import("../pages/my/PersonalInformationEdit"));
const LocationPermissionSettings = lazy(() => import("../pages/my/LocationPermissionSettings"));
const NotificationSettings = lazy(() => import("../pages/my/NotificationSettings"));
const FindCredentials = lazy(() => import("../pages/FindCredentials"));
const PlaceDetail = lazy(() => import("../pages/map/PlaceDetail"));
const ForgotPasswordRequest = lazy(() => import("../pages/ForgotPasswordRequest"));
const ForgotPasswordVerify = lazy(() => import("../pages/ForgotPasswordVerify"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const GoogleCallback = lazy(() => import("../pages/GoogleCallback"));


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallbackSkeleton />}>
        <Routes>
          {/* Google OAuth Callback - RootLayout 밖에 배치 */}
          <Route path="/auth/callback/google" element={<GoogleCallback />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          
          {/* Pages without bottom navigation */}
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/new" element={
            <ProtectedRoute>
              <NewPost />
            </ProtectedRoute>
          } />
          <Route path="/new/step1" element={
            <ProtectedRoute>
              <Step1 />
            </ProtectedRoute>
          } />
          <Route path="/new/step2" element={
            <ProtectedRoute>
              <Step2 />
            </ProtectedRoute>
          } />
          <Route path="/edit/:postId" element={
            <ProtectedRoute>
              <EditPost />
            </ProtectedRoute>
          } />

          <Route element={<RootLayout />}>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Search */}
            <Route path="/search" element={<Search />} />

            {/* Map with nested example */}
            <Route path="/map">
              <Route
                index
                element={<Map />}
              />
              <Route
                path="place/:placeId"
                element={<PlaceDetail />}
              />
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

            {/* My page - requires auth */}
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
              <Route
                path="activity"
                element={
                  <ProtectedRoute>
                    <MyActivity />
                  </ProtectedRoute>
                }
              />
              <Route
                path="terms"
                element={
                  <ProtectedRoute>
                    <TermsAndConditions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account-management"
                element={
                  <ProtectedRoute>
                    <AccountManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="personal-info-edit"
                element={
                  <ProtectedRoute>
                    <PersonalInformationEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="location-permission-settings"
                element={
                  <ProtectedRoute>
                    <LocationPermissionSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="notification-settings"
                element={
                  <ProtectedRoute>
                    <NotificationSettings />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Inquiry page - no auth required */}
            <Route path="/inquiry">
              <Route
                index
                element={<Inquiry />}
              />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          
          {/* Find Credentials page (not protected) */}
          <Route path="/find-credentials" element={<FindCredentials />} />
          
          {/* Password Reset Flow (not protected) */}
          <Route path="/forgot-password" element={<ForgotPasswordRequest />} />
          <Route path="/forgot-password/verify" element={<ForgotPasswordVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
