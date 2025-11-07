import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './lib/auth-context';
import { Toaster } from './components/ui/sonner';
import { Landing } from './components/pages/landing';
import { Login } from './components/pages/login';
import { Dashboard } from './components/pages/dashboard';
import { Profile } from './components/pages/profile';
import { Settings } from './components/pages/settings';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="scloud-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}
