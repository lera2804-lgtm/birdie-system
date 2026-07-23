import { useAuth } from '../../auth/AuthContext';
import { ReportsPage } from './ReportsPage';
import { ReportsMobilePage } from './ReportsMobilePage';

export const ReportsSection = () => {
  const { user } = useAuth();
  if (user?.role === 'site_manager') return <ReportsMobilePage />;
  return <ReportsPage />;
};
