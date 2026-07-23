import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { seedJune2026Reports, type DayReport } from '../mocks/reports';

interface ReportsState {
  reports: Record<string, DayReport>;
  saveReport: (date: string, report: DayReport, editedByPM?: string) => void;
}

const ReportsContext = createContext<ReportsState | null>(null);

export const ReportsProvider = ({ projectCode: _projectCode, children }: { projectCode: string; children: ReactNode }) => {
  const [reports, setReports] = useState<Record<string, DayReport>>(() => seedJune2026Reports());

  useEffect(() => {
    setReports(seedJune2026Reports());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_projectCode]);

  const value: ReportsState = {
    reports,
    saveReport: (date, report, editedByPM) =>
      setReports((prev) => ({ ...prev, [date]: { ...report, date, editedByPM: editedByPM ?? prev[date]?.editedByPM } })),
  };

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
};

export const useReports = () => {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used within ReportsProvider');
  return ctx;
};
