import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SysButton, SysModal } from '../form';
import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import { formatLong, type DayReport } from '../../mocks/reports';
import { useReports } from '../../state/ReportsContext';
import { useStages } from '../../state/StagesContext';
import { useToasts } from '../../state/ToastContext';
import { ReportEditorBody } from './ReportEditorBody';
import { ConfirmModal } from '../ConfirmModal';

export const NewReportModal = ({ date, onClose }: { date: string; onClose: () => void }) => {
  const { projectCode } = useParams();
  const { saveReport } = useReports();
  const { stages } = useStages();
  const { addToast } = useToasts();
  const [draft, setDraft] = useState<DayReport>(() => ({
    date,
    tasks: [],
    frontOffice: [{ id: 'o1', qty: '', role: '' }],
    backOffice: [{ id: 'o2', qty: '', role: '' }],
    milestone: '',
  }));
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const invalidIds = new Set(draft.tasks.filter((t) => !t.title.trim()).map((t) => t.id));
  const invalid = attempted && invalidIds.size > 0;

  const submit = async (isDraft: boolean) => {
    if (!isDraft && invalidIds.size > 0) { setAttempted(true); return; }
    setSubmitting(true);
    const { error } = await saveReport(date, { ...draft, isDraft });
    setSubmitting(false);
    if (error) {
      addToast('error', `Не удалось сохранить: ${error}`);
      return;
    }
    if (!isDraft) addToast('success', `Отчёт за ${formatLong(date)} опубликован — клиент уже видит его.`);
    onClose();
  };

  const deletingTask = draft.tasks.find((t) => t.id === deletingId);

  return (
    <>
      <SysModal width={640} onClose={onClose}>
        <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <MonoLabel color={SYS.red}>новый отчёт · {formatLong(date)}</MonoLabel>
            <h2 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 500, letterSpacing: '-0.008em' }}>Отчёт за сегодня</h2>
          </div>
          <span onClick={onClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>✕</span>
        </div>

        <div style={{ padding: '24px 32px' }}>
          <ReportEditorBody
            draft={draft}
            setDraft={setDraft}
            allowDeskType
            allowBackOffice
            stages={stages}
            objectCode={projectCode ?? ''}
            invalidTaskIds={invalid ? invalidIds : undefined}
            onRequestDeleteTask={setDeletingId}
          />
        </div>

        <div style={{ padding: '20px 32px 28px', borderTop: `1px solid ${SYS.line}` }}>
          {invalid && (
            <div style={{ marginBottom: 12, fontSize: 11.5, color: SYS.red, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚠</span> Заполните названия задач и дождитесь загрузки файлов
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <SysButton tone="ghost" full={false} small type="button" loading={submitting} onClick={() => submit(true)}>Сохранить черновик</SysButton>
            <div style={{ flex: 1 }}>
              <SysButton type="button" loading={submitting} onClick={() => submit(false)}>Опубликовать отчёт</SysButton>
            </div>
          </div>
        </div>
      </SysModal>

      {deletingTask && (
        <ConfirmModal
          title="Удалить задачу?"
          message={`«${deletingTask.title || 'Без названия'}» и все прикреплённые к ней фото будут удалены. Действие необратимо.`}
          onCancel={() => setDeletingId(null)}
          onConfirm={() => {
            setDraft((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== deletingId) }));
            setDeletingId(null);
          }}
        />
      )}
    </>
  );
};
