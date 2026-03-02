import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { LanguageProvider } from './context/LanguageContext';
import { UserProvider } from './context/UserContext';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';


import DashboardLayout from './components/Layout/DashboardLayout';
import FeedPage from './pages/FeedPage';
import ProviderDashboard from './pages/ProviderDashboard';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import CommunityPage from './pages/CommunityPage';
import CommunitiesListPage from './pages/CommunitiesListPage';
import CreateCommunityPage from './pages/CreateCommunityPage';
import CreatePostPage from './pages/CreatePostPage';
import NotificationsPage from './pages/NotificationsPage';
import ServicePage from './pages/ServicePage';
import GovernmentSchemesPage from './pages/GovernmentSchemesPage';

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  console.error("Missing Clerk Publishable Key in .env.local");
}

function App() {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      localization={{
        formFieldErrors: {
          not_strong_password: "The password is too simple or commonly used.",
          form_password_pwned: "This password is too easily guessed or common. Please choose a stronger one."
        }
      }}
    >
      <LanguageProvider>
        <UserProvider>
          <BrowserRouter>
            <div className="App">
              <Toaster position="bottom-center" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
              <Routes>
                {/* Public Landing Page */}
                <Route path="/" element={<HomePage />} />

                {/* Authentication - Role Selection & Sign In/Up */}
                <Route path="/auth" element={<AuthPage />} />

                {/* Onboarding - Protected Route (Conceptually) */}
                <Route path="/onboarding" element={<OnboardingPage />} />

                {/* Protected Dashboard Routes */}
                <Route element={<DashboardLayout />}>
                  <Route path="/feed" element={<FeedPage />} />
                  <Route path="/provider-dashboard" element={<ProviderDashboard />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/c/communities" element={<CommunitiesListPage />} />
                  <Route path="/c/:communityId" element={<CommunityPage />} />
                  <Route path="/create-community" element={<CreateCommunityPage />} />
                  <Route path="/services" element={<ServicePage />} />
                  <Route path="/submit" element={<CreatePostPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/schemes" element={<GovernmentSchemesPage />} />
                  <Route path="/dashboard" element={<Navigate to="/feed" replace />} />
                </Route>

              </Routes>
            </div>
          </BrowserRouter>
        </UserProvider>
      </LanguageProvider>
    </ClerkProvider>
  );
}

export default App;
