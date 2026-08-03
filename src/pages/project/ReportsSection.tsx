import { useObjectRole } from '../../state/ObjectRoleContext';
import { ReportsPage } from './ReportsPage';
import { ReportsMobilePage } from './ReportsMobilePage';

export const ReportsSection = () => {
  const role = useObjectRole();
  if (role === 'site_manager') return <ReportsMobilePage />;
  return <ReportsPage />;
};
