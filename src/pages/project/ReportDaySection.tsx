import { useAuth } from '../../auth/AuthContext';
import { ReportDayPage } from './ReportDayPage';
import { ReportDayMobilePage } from './ReportDayMobilePage';

export const ReportDaySection = () => {
  const { user } = useAuth();
  if (user?.role === 'site_manager') return <ReportDayMobilePage />;
  return <ReportDayPage />;
};
