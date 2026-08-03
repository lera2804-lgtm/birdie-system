import { MonoLabel } from '../primitives';
import { SysButton, SysLabeledField } from '../form';
import { SYS } from '../../theme/tokens';
import { type DayReport, type ReportTask } from '../../mocks/reports';
import { TaskEditorRow } from './TaskEditorRow';
import { OfficeRows } from './OfficeRows';

let seq = 0;
const nid = (p: string) => `${p}${Date.now()}-${++seq}`;

export const ReportEditorBody = ({
  draft, setDraft, allowDeskType, allowBackOffice, stages, objectCode, invalidTaskIds, onRequestDeleteTask,
}: {
  draft: DayReport;
  setDraft: (updater: (d: DayReport) => DayReport) => void;
  allowDeskType: boolean;
  allowBackOffice: boolean;
  stages: { code: string; title: string }[];
  objectCode: string;
  invalidTaskIds?: Set<string>;
  onRequestDeleteTask: (taskId: string) => void;
}) => {
  const updateTask = (id: string, patch: Partial<ReportTask>) =>
    setDraft((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

  const addTask = () =>
    setDraft((d) => ({ ...d, tasks: [...d.tasks, { id: nid('t'), subproject: stages[0]?.code ?? '', kind: 'field', title: '', photos: [] }] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <MonoLabel color={SYS.ink} style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>задачи дня</MonoLabel>
        <div style={{ fontSize: 11.5, color: SYS.muted, lineHeight: 1.4, marginBottom: 12 }}>
          Публикуется сразу — клиент видит без модерации.
        </div>

        {draft.tasks.map((t, i) => (
          <TaskEditorRow
            key={t.id}
            task={t}
            n={i + 1}
            allowDeskType={allowDeskType}
            stages={stages}
            objectCode={objectCode}
            reportDate={draft.date}
            onChange={(patch) => updateTask(t.id, patch)}
            onRequestDelete={() => onRequestDeleteTask(t.id)}
            nameError={invalidTaskIds?.has(t.id)}
          />
        ))}

        <div style={{ marginBottom: 4 }}>
          <SysButton tone="ghost" type="button" onClick={addTask}>+ Добавить задачу</SysButton>
        </div>
      </div>

      <div>
        <MonoLabel color={SYS.ink} style={{ fontSize: 10, display: 'block', marginBottom: 12 }}>занятые люди сегодня</MonoLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <OfficeRows label="Фронт-офис" rows={draft.frontOffice} onChange={(rows) => setDraft((d) => ({ ...d, frontOffice: rows }))} />
          {allowBackOffice && (
            <OfficeRows label="Бэк-офис" rows={draft.backOffice} onChange={(rows) => setDraft((d) => ({ ...d, backOffice: rows }))} />
          )}
        </div>
      </div>

      <SysLabeledField
        label="Отметить как веху (опционально)"
        placeholder="напр. Завершён первый этап работ"
        hint="покажется в ленте вех месяца со звёздочкой ★"
        value={draft.milestone}
        onChange={(e: any) => setDraft((d) => ({ ...d, milestone: e.target.value }))}
      />
    </div>
  );
};
