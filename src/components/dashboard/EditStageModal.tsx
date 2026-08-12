import { useState } from 'react';
import { SysButton, SysLabeledField, SysModal } from '../form';
import { MonoLabel, ReorderButtons } from '../primitives';
import { ConfirmModal } from '../ConfirmModal';
import { SYS } from '../../theme/tokens';
import { recomputeReadiness, type ContractStage, type WorkItem } from '../../mocks/dashboard';
import { useStages } from '../../state/StagesContext';
import { useToasts } from '../../state/ToastContext';
import { AddEventForm, ExistingEventsBlock } from './EventsListBlock';

const EditWorkRow = ({
  w, onEdit, onRemove, canMoveUp, canMoveDown, onMoveUp, onMoveDown,
}: {
  w: WorkItem;
  onEdit: (patch: Partial<WorkItem>) => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) => {
  const combined = w.title + (w.qty ? ` · ${w.qty}` : '');
  const handleChange = (e: any) => {
    const [t, qty] = e.target.value.split(' · ');
    onEdit({ title: t, qty: qty || undefined });
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 50px 16px 20px', gap: 10, alignItems: 'center', padding: '10px 0', borderTop: `1px solid ${SYS.line}` }}>
      <input
        value={combined}
        onChange={handleChange}
        style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: SYS.ink, padding: 0, width: '100%' }}
      />
      <input
        type="range" min="0" max="100" value={w.pct}
        onChange={(e) => onEdit({ pct: Number(e.target.value) })}
        style={{ width: '100%', accentColor: SYS.red }}
      />
      <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: w.pct === 100 ? SYS.ink : SYS.red }}>{w.pct}%</div>
      <ReorderButtons canMoveUp={canMoveUp} canMoveDown={canMoveDown} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
      <span title="удалить работу" onClick={onRemove} style={{ fontSize: 13, color: SYS.muted, cursor: 'pointer', textAlign: 'right' }}>✕</span>
    </div>
  );
};

const AddWorkForm = ({ onAdd }: { onAdd: (item: WorkItem) => void }) => {
  const [title, setTitle] = useState('');
  const [qty, setQty] = useState('');
  const submit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), qty: qty.trim() || undefined, pct: 0 });
    setTitle('');
    setQty('');
  };
  return (
    <div style={{ border: `1px solid ${SYS.line}`, padding: 16, marginTop: 14 }}>
      <div style={{ margin: '-16px -16px 14px', padding: '10px 16px', background: '#EEEDED' }}>
        <MonoLabel color={SYS.ink} style={{ fontSize: 11 }}>+ новая работа</MonoLabel>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 10 }}>
        <SysLabeledField label="Название работы" placeholder="напр. Обработка приствольных кругов" value={title} onChange={(e: any) => setTitle(e.target.value)} />
        <SysLabeledField label="Кол-во, ед." placeholder="напр. 120 шт." value={qty} onChange={(e: any) => setQty(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <SysButton tone="ghost" full={false} small type="button" disabled={!title.trim()} onClick={submit}>+ Добавить работу</SysButton>
      </div>
    </div>
  );
};

export const EditStageModal = ({ stage, onClose }: { stage: ContractStage; onClose: () => void }) => {
  const { replaceStage, removeStage } = useStages();
  const { addToast } = useToasts();
  const [draft, setDraft] = useState<ContractStage>(() => ({ ...stage }));
  const [readinessOverridden, setReadinessOverridden] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const dateRangeInvalid = !!(draft.start && draft.handover && draft.handover < draft.start);

  const commitAndClose = async () => {
    if (dateRangeInvalid) return;
    setSaving(true);
    const { error } = await replaceStage(stage.code, draft);
    setSaving(false);
    if (error) {
      addToast('error', `Не удалось сохранить: ${error}`);
      return;
    }
    onClose();
  };

  const setWorkItems = (workItems: WorkItem[]) => {
    setDraft((d) => ({ ...d, workItems, readiness: readinessOverridden ? d.readiness : recomputeReadiness(workItems) }));
  };

  const moveWorkItem = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= draft.workItems.length) return;
    const next = [...draft.workItems];
    [next[i], next[j]] = [next[j], next[i]];
    setWorkItems(next);
  };

  return (
    <SysModal width={760} onClose={commitAndClose}>
      <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${SYS.line}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>редактирование проекта</MonoLabel>
          <span onClick={commitAndClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>✕</span>
        </div>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14 }}>
          <SysLabeledField label="Код проекта" value={draft.code} onChange={(e: any) => setDraft((d) => ({ ...d, code: e.target.value }))} />
          <SysLabeledField label="Название проекта" value={draft.title} onChange={(e: any) => setDraft((d) => ({ ...d, title: e.target.value }))} />
        </div>
      </div>

      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <SysLabeledField label="Дата старта" type="date" value={draft.start ?? ''} error={dateRangeInvalid} onChange={(e: any) => setDraft((d) => ({ ...d, start: e.target.value || null }))} />
            <SysLabeledField label="Плановая сдача" type="date" value={draft.handover ?? ''} error={dateRangeInvalid} onChange={(e: any) => setDraft((d) => ({ ...d, handover: e.target.value || null }))} />
          </div>
          {dateRangeInvalid && (
            <div style={{ marginTop: 8, fontSize: 11.5, color: SYS.red, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚠</span> Дата сдачи не может быть раньше даты старта
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <MonoLabel color={SYS.ink} style={{ fontSize: 10 }}>общая готовность проекта</MonoLabel>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 500, color: SYS.red }}>{draft.readiness ?? 0}%</div>
          </div>
          <input
            type="range" min="0" max="100" value={draft.readiness ?? 0}
            onChange={(e) => { setReadinessOverridden(true); setDraft((d) => ({ ...d, readiness: Number(e.target.value) })); }}
            style={{ width: '100%', accentColor: SYS.red }}
          />
          <div style={{ marginTop: 6, fontSize: 11.5, color: SYS.muted, lineHeight: 1.4 }}>
            Считается автоматически по составу работ ниже — можно скорректировать вручную.
          </div>
        </div>

        <div>
          <MonoLabel color={SYS.ink} style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>состав работ</MonoLabel>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {draft.workItems.map((w, i) => (
              <EditWorkRow
                key={i}
                w={w}
                onEdit={(patch) => setWorkItems(draft.workItems.map((x, xi) => (xi === i ? { ...x, ...patch } : x)))}
                onRemove={() => setWorkItems(draft.workItems.filter((_, xi) => xi !== i))}
                canMoveUp={i > 0}
                canMoveDown={i < draft.workItems.length - 1}
                onMoveUp={() => moveWorkItem(i, -1)}
                onMoveDown={() => moveWorkItem(i, 1)}
              />
            ))}
          </div>
          <AddWorkForm onAdd={(item) => setWorkItems([...draft.workItems, item])} />
        </div>

        <div>
          <MonoLabel color={SYS.ink} style={{ fontSize: 10, display: 'block', marginBottom: 12 }}>события</MonoLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ExistingEventsBlock
              tone="plan" events={draft.planEvents}
              onEdit={(i, patch) => setDraft((d) => ({ ...d, planEvents: d.planEvents.map((e, ei) => (ei === i ? { ...e, ...patch } : e)) }))}
              onRemove={(i) => setDraft((d) => ({ ...d, planEvents: d.planEvents.filter((_, ei) => ei !== i) }))}
            />
            <AddEventForm tone="plan" onAdd={(e) => setDraft((d) => ({ ...d, planEvents: [...d.planEvents, e] }))} />
            <ExistingEventsBlock
              tone="fact" events={draft.factEvents}
              onEdit={(i, patch) => setDraft((d) => ({ ...d, factEvents: d.factEvents.map((e, ei) => (ei === i ? { ...e, ...patch } : e)) }))}
              onRemove={(i) => setDraft((d) => ({ ...d, factEvents: d.factEvents.filter((_, ei) => ei !== i) }))}
            />
            <AddEventForm tone="fact" onAdd={(e) => setDraft((d) => ({ ...d, factEvents: [...d.factEvents, e] }))} />
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${SYS.line}`, paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <MonoLabel color={SYS.red} style={{ fontSize: 10 }}>опасная зона</MonoLabel>
            <div style={{ marginTop: 6, fontSize: 12, color: SYS.muted, lineHeight: 1.45, maxWidth: 380 }}>
              Проект будет удалён без возможности восстановления, вместе с составом работ и событиями.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            style={{ padding: '11px 20px', background: 'transparent', color: SYS.red, border: `1px solid ${SYS.red}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Удалить проект
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 32px 28px', display: 'flex', gap: 10, borderTop: `1px solid ${SYS.line}` }}>
        <SysButton tone="ghost" full={false} small type="button" onClick={onClose}>Отмена</SysButton>
        <div style={{ flex: 1 }}>
          <SysButton type="button" disabled={dateRangeInvalid} loading={saving} onClick={commitAndClose}>Сохранить изменения</SysButton>
        </div>
      </div>

      {confirmingDelete && (
        <ConfirmModal
          kicker="опасная зона · подтверждение"
          title="Удалить проект?"
          confirmLabel="Удалить проект"
          message={`«${draft.code} · ${draft.title}» будет удалён без возможности восстановления — вместе с составом работ и всеми событиями.`}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={async () => {
            const { error } = await removeStage(stage.code);
            if (error) { addToast('error', `Не удалось удалить: ${error}`); return; }
            onClose();
          }}
        />
      )}
    </SysModal>
  );
};
