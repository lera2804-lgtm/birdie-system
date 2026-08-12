import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SysButton } from '../form';
import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import { formatShort, type DayReport } from '../../mocks/reports';
import { useReports } from '../../state/ReportsContext';
import { useStages } from '../../state/StagesContext';
import { useToasts } from '../../state/ToastContext';
import { ReportEditorBody } from './ReportEditorBody';
import { ConfirmModal } from '../ConfirmModal';
import { OfflineBanner } from '../OfflineBanner';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const NewReportMobileView = ({ date, existing, onClose }: { date: string; existing?: DayReport; onClose: () => void }) => {
  const { projectCode } = useParams();
  const { saveReport } = useReports();
  const { stages } = useStages();
  const { addToast } = useToasts();
  const online = useOnlineStatus();
  // Phones lock the screen mid-edit — a page reload from that (or the app
  // just losing focus) would otherwise wipe unsaved input, so every change
  // is mirrored to localStorage and restored on mount.
  const draftKey = `report-draft:${projectCode}:${date}`;
  const [draft, setDraft] = useState<DayReport>(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // corrupt or unavailable storage — fall through to a fresh draft
    }
    return existing ?? { date, tasks: [], frontOffice: [{ id: 'o1', qty: '', role: '' }], backOffice: [], milestone: '' };
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deletingTask = draft.tasks.find((t) => t.id === deletingId);

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      // storage full/unavailable — nothing more we can do locally
    }
  }, [draft, draftKey]);

  const submit = async (isDraft: boolean) => {
    setSubmitting(true);
    const { error } = await saveReport(date, { ...draft, isDraft });
    setSubmitting(false);
    if (error) {
      addToast('error', `Не удалось сохранить: ${error}`);
      return;
    }
    try { localStorage.removeItem(draftKey); } catch { /* best effort */ }
    if (!isDraft) addToast('success', `Отчёт за ${formatShort(date)} опубликован — клиент уже видит его.`);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: SYS.paper, color: SYS.ink, display: 'flex', flexDirection: 'column' }}>
      {!online && <OfflineBanner />}
      <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span onClick={onClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>←</span>
        <MonoLabel color={SYS.ink} style={{ fontSize: 11 }}>отчёт · {formatShort(date)}</MonoLabel>
        <span style={{ width: 18 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px 20px' }} className="sys-modal-scroll">
        <ReportEditorBody
          draft={draft}
          setDraft={setDraft}
          allowDeskType={false}
          allowBackOffice={false}
          stages={stages}
          objectCode={projectCode ?? ''}
          onRequestDeleteTask={setDeletingId}
        />
      </div>

      <div style={{ padding: '14px 20px 18px', borderTop: `1px solid ${SYS.line}`, display: 'flex', gap: 10 }}>
        <SysButton tone="ghost" full={false} small type="button" loading={submitting} onClick={() => submit(true)}>Черновик</SysButton>
        <div style={{ flex: 1 }}>
          <SysButton type="button" loading={submitting} onClick={() => submit(false)}>Опубликовать</SysButton>
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
