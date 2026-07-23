import { useState } from 'react';
import { SysButton } from '../form';
import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import { formatShort, makeTemplateReport, type DayReport } from '../../mocks/reports';
import { useReports } from '../../state/ReportsContext';
import { useToasts } from '../../state/ToastContext';
import { ReportEditorBody } from './ReportEditorBody';
import { ConfirmModal } from '../ConfirmModal';
import { OfflineBanner } from '../OfflineBanner';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const NewReportMobileView = ({ date, onClose }: { date: string; onClose: () => void }) => {
  const { saveReport } = useReports();
  const { addToast } = useToasts();
  const online = useOnlineStatus();
  const [draft, setDraft] = useState<DayReport>(() => ({ ...makeTemplateReport(date), tasks: [], frontOffice: [{ id: 'o1', qty: '', role: '' }], backOffice: [], milestone: '' }));
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deletingTask = draft.tasks.find((t) => t.id === deletingId);

  const publish = () => {
    saveReport(date, draft);
    addToast('success', `Отчёт за ${formatShort(date)}.2026 опубликован — клиент уже видит его.`);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: SYS.paper, color: SYS.ink, display: 'flex', flexDirection: 'column' }}>
      {!online && <OfflineBanner />}
      <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span onClick={onClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>←</span>
        <MonoLabel color={SYS.ink} style={{ fontSize: 11 }}>отчёт · {formatShort(date)}.2026</MonoLabel>
        <span style={{ width: 18 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px 20px' }} className="sys-modal-scroll">
        <ReportEditorBody
          draft={draft}
          setDraft={setDraft}
          allowDeskType={false}
          allowBackOffice={false}
          onRequestDeleteTask={setDeletingId}
          addTaskButtonStyle="button"
        />
      </div>

      <div style={{ padding: '14px 20px 18px', borderTop: `1px solid ${SYS.line}`, display: 'flex', gap: 10 }}>
        <SysButton tone="ghost" full={false} small type="button" onClick={() => { saveReport(date, draft); onClose(); }}>Черновик</SysButton>
        <div style={{ flex: 1 }}>
          <SysButton type="button" onClick={publish}>Опубликовать</SysButton>
        </div>
      </div>

      {deletingTask && (
        <ConfirmModal
          title="Удалить задачу?"
          message={`«${deletingTask.title || 'Без названия'}» и все прикреплённые к ней фото будут удалены. Действие необратимо.`}
          onCancel={() => setDeletingId(null)}
          onConfirm={() => { setDraft((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== deletingId) })); setDeletingId(null); }}
        />
      )}
    </div>
  );
};
