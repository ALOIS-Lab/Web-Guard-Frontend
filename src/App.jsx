import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import SupportChat from './components/SupportChat';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Websites from './pages/Websites';
import Scans from './pages/Scans';
import SeoTesting from './pages/SeoTesting';
import Reports from './pages/Reports';
import Alerts from './pages/Alerts';
import Schedules from './pages/Schedules';
import Groups from './pages/Groups';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import WebsiteDetail from './pages/WebsiteDetail';
import LegalPage from './pages/LegalPage';
import StatusPage from './pages/StatusPage';
import Pricing from './pages/Pricing';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/status/:slug" element={<StatusPage />} />
              <Route path="/terms" element={<LegalPage kind="terms" />} />
              <Route path="/privacy" element={<LegalPage kind="privacy" />} />
              <Route path="/cookies" element={<LegalPage kind="cookies" />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="websites" element={<Websites />} />
                <Route path="websites/:id" element={<WebsiteDetail />} />
                <Route path="scans" element={<Scans />} />
                <Route path="seo" element={<SeoTesting />} />
                <Route path="reports" element={<Reports />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="schedules" element={<Schedules />} />
                <Route path="groups" element={<Groups />} />
                <Route path="integrations" element={<Integrations />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <SupportChat />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
