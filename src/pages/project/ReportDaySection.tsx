import { useObjectRole } from '../../state/ObjectRoleContext';
import { ReportDayPage } from './ReportDayPage';
import { ReportDayMobilePage } from './ReportDayMobilePage';

export const ReportDaySection = () => {
  const role = useObjectRole();
  if (role === 'site_manager') return <ReportDayMobilePage />;
  return <ReportDayPage />;
};
