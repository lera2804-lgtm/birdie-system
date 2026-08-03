import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { LoginPage } from './pages/auth/LoginPage';
import { InvitePage } from './pages/auth/InvitePage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetSentPage } from './pages/auth/ResetSentPage';
import { CatalogPage } from './pages/catalog/CatalogPage';
import { ProjectShell, ProjectIndexRedirect } from './pages/project/ProjectShell';
import { DashboardPage } from './pages/project/DashboardPage';
import { ReportsSection } from './pages/project/ReportsSection';
import { ReportDaySection } from './pages/project/ReportDaySection';
import { ArchivePage } from './pages/project/ArchivePage';
import { SettingsPage } from './pages/project/SettingsPage';
import { NotFoundPage } from './pages/system/NotFoundPage';
import { currentMonth } from './mocks/reports';
import { ToastProvider } from './state/ToastContext';
import { ToastStack } from './components/ToastStack';

const ReportsIndexRedirect = () => {
  const { projectCode } = useParams();
  return <Navigate to={`/${projectCode}/reports/${currentMonth()}`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/invite/:token" element={<InvitePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-sent" element={<ResetSentPage />} />

          <Route path="/" element={<RequireAuth><CatalogPage /></RequireAuth>} />

          <Route path="/:projectCode" element={<RequireAuth><ProjectShell /></RequireAuth>}>
            <Route index element={<ProjectIndexRedirect />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="reports" element={<ReportsIndexRedirect />} />
            <Route path="reports/:month" element={<ReportsSection />} />
            <Route path="reports/:month/:day" element={<ReportDaySection />} />
            <Route path="archive" element={<ArchivePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastStack />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
