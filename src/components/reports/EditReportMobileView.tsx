import { useState } from 'react';
import { SysButton } from '../form';
import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import { formatShort, type DayReport } from '../../mocks/reports';
import { useReports } from '../../state/ReportsContext';
import { ReportEditorBody } from './ReportEditorBody';
import { ConfirmModal } from '../ConfirmModal';
import { OfflineBanner } from '../OfflineBanner';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useToasts } from '../../state/ToastContext';

export const EditReportMobileView = ({ date, report, onClose }: { date: string; report: DayReport; onClose: () => void }) => {
  const { saveReport } = useReports();
  const { addToast } = useToasts();
  const online = useOnlineStatus();
  const [draft, setDraft] = useState<DayReport>(() => ({ ...report }));
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deletingTask = draft.tasks.find((t) => t.id === deletingId);

  const save = () => {
    saveReport(date, draft);
    addToast('success', 'Изменения сохранены.');
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: SYS.paper, color: SYS.ink, display: 'flex', flexDirection: 'column' }}>
      {!online && <OfflineBanner />}
      <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span onClick={onClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>←</span>
        <div style={{ textAlign: 'center' }}>
          <MonoLabel color={SYS.red} style={{ fontSize: 10 }}>редактирование</MonoLabel>
          <div style={{ marginTop: 2, fontSize: 13, fontWeight: 500 }}>Отчёт · {formatShort(date)}.2026</div>
        </div>
        <span style={{ width: 18 }} />
      </div>

      <div style={{ padding: '10px 20px', background: '#fbf1ee', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11.5, color: SYS.red }}>Доступно для правки только за вчерашний день</span>
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
        <SysButton tone="ghost" full={false} small type="button" onClick={onClose}>Отмена</SysButton>
        <div style={{ flex: 1 }}>
          <SysButton type="button" onClick={save}>Сохранить изменения</SysButton>
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
