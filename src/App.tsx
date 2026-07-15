import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import CareersPage from './pages/CareersPage';
import InternshipsPage from './pages/InternshipsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import JobSeekerProfilePage from './pages/JobSeekerProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import JobMarketplacePage from './pages/JobMarketplacePage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import Chatbot from './components/chatbot';
import Resume from './components/resume';
import Records from './components/records';
import InterviewPage from './components/InterviewPage';
import ResumeBuilder from './components/resumebuilder/ResumeBuilder';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
          <Navigation />
          <main className="flex-grow pt-16">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

const AppRoutes = () => {
  const location = useLocation();

  return (
    <ErrorBoundary key={location.pathname}>
      <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/" element={<ProtectedRoute allowedRoles={['job_seeker']}><HomePage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute allowedRoles={['job_seeker', 'recruiter', 'admin']}><JobSeekerProfilePage /></ProtectedRoute>} />
                <Route path="/careers" element={<ProtectedRoute allowedRoles={['job_seeker']}><CareersPage /></ProtectedRoute>} />
                <Route path="/jobs" element={<ProtectedRoute allowedRoles={['job_seeker']}><JobMarketplacePage /></ProtectedRoute>} />
                <Route path="/applications" element={<ProtectedRoute allowedRoles={['job_seeker']}><MyApplicationsPage /></ProtectedRoute>} />
                <Route path="/internships" element={<ProtectedRoute allowedRoles={['job_seeker']}><InternshipsPage /></ProtectedRoute>} />
                <Route path="/chatbot" element={<ProtectedRoute allowedRoles={['job_seeker']}><Chatbot /></ProtectedRoute>} />
                <Route path="/resume" element={<ProtectedRoute allowedRoles={['job_seeker']}><Resume /></ProtectedRoute>} />
                <Route path="/resumebuilder" element={<ProtectedRoute allowedRoles={['job_seeker']}><ResumeBuilder /></ProtectedRoute>} />
                <Route path="/records" element={<ProtectedRoute allowedRoles={['job_seeker']}><Records /></ProtectedRoute>} />
                <Route path="/interview" element={<ProtectedRoute allowedRoles={['job_seeker']}><InterviewPage /></ProtectedRoute>} />

                <Route path="/recruiter" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
