import { useState } from 'react';
import { SysButton, SysLabeledField, SysModal } from '../form';
import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import { recomputeReadiness, type ContractStage, type StageEvent, type WorkItem } from '../../mocks/dashboard';
import { useStages } from '../../state/StagesContext';

const EditWorkRow = ({ w, onEdit, onRemove }: { w: WorkItem; onEdit: (patch: Partial<WorkItem>) => void; onRemove: () => void }) => {
  const [title, setTitle] = useState(w.title + (w.qty ? ` · ${w.qty}` : ''));
  const commitTitle = () => {
    const [t, qty] = title.split(' · ');
    onEdit({ title: t, qty: qty || undefined });
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 50px 20px', gap: 10, alignItems: 'center', padding: '10px 0', borderTop: `1px solid ${SYS.line}` }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commitTitle}
        style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: SYS.ink, padding: 0, width: '100%' }}
      />
      <input
        type="range" min="0" max="100" value={w.pct}
        onChange={(e) => onEdit({ pct: Number(e.target.value) })}
        style={{ width: '100%', accentColor: SYS.red }}
      />
      <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: w.pct === 100 ? SYS.ink : SYS.red }}>{w.pct}%</div>
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

const ExistingEventsBlock = ({ tone, events, onEdit, onRemove }: { tone: 'plan' | 'fact'; events: StageEvent[]; onEdit: (i: number, patch: Partial<StageEvent>) => void; onRemove: (i: number) => void }) => (
  <div style={{ border: `1px solid ${SYS.line}` }}>
    <div style={{ padding: '10px 16px', background: tone === 'fact' ? '#f3d9d1' : '#e7e3d8' }}>
      <MonoLabel color={SYS.ink} style={{ fontSize: 11 }}>{tone === 'fact' ? 'факт' : 'план'} · существующие события</MonoLabel>
    </div>
    <div style={{ padding: '4px 16px 12px' }}>
      {events.length === 0 && <div style={{ padding: '10px 0', fontSize: 12, color: SYS.muted }}>— нет событий —</div>}
      {events.map((e, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 20px', gap: 10, alignItems: 'center', padding: '8px 0', borderTop: `1px solid ${SYS.line}` }}>
          <input
            value={e.date}
            onChange={(ev) => onEdit(i, { date: ev.target.value })}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500, color: SYS.ink, padding: 0, width: '100%' }}
          />
          <input
            value={e.title}
            onChange={(ev) => onEdit(i, { title: ev.target.value })}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 12.5, color: SYS.ink, padding: 0, width: '100%' }}
          />
          <span title="удалить" onClick={() => onRemove(i)} style={{ fontSize: 13, color: SYS.muted, cursor: 'pointer', textAlign: 'right' }}>✕</span>
        </div>
      ))}
    </div>
  </div>
);

const AddEventForm = ({ tone, onAdd }: { tone: 'plan' | 'fact'; onAdd: (e: StageEvent) => void }) => {
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const submit = () => {
    if (!date.trim() || !title.trim()) return;
    const [dd, mm] = date.split('-').length === 3
      ? [date.split('-')[2], date.split('-')[1]]
      : [date, ''];
    const label = mm ? `${dd}.${mm}` : date;
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const monthIdx = mm ? Number(mm) - 1 : new Date().getMonth();
    onAdd({ date: label, title: title.trim(), month: `${monthNames[monthIdx]} ${date.split('-')[0] || new Date().getFullYear()}` });
    setDate('');
    setTitle('');
  };
  return (
    <div style={{ border: `1px solid ${SYS.line}`, padding: 16 }}>
      <div style={{ margin: '-16px -16px 14px', padding: '10px 16px', background: tone === 'fact' ? '#f3d9d1' : '#e7e3d8' }}>
        <MonoLabel color={SYS.ink} style={{ fontSize: 11 }}>+ новое событие · {tone === 'fact' ? 'факт' : 'план'}</MonoLabel>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 10 }}>
        <SysLabeledField label="Дата" type="date" value={date} onChange={(e: any) => setDate(e.target.value)} />
        <SysLabeledField
          label="Событие"
          placeholder={tone === 'fact' ? 'напр. Завершена ливневая канализация' : 'напр. Плановая сдача этапа'}
          value={title}
          onChange={(e: any) => setTitle(e.target.value)}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <SysButton tone="ghost" full={false} small type="button" disabled={!date.trim() || !title.trim()} onClick={submit}>+ Добавить в {tone === 'fact' ? 'факт' : 'план'}</SysButton>
      </div>
    </div>
  );
};

export const EditStageModal = ({ stage, onClose }: { stage: ContractStage; onClose: () => void }) => {
  const { replaceStage } = useStages();
  const [draft, setDraft] = useState<ContractStage>(() => ({ ...stage }));
  const [readinessOverridden, setReadinessOverridden] = useState(false);

  const commitAndClose = () => {
    replaceStage(stage.code, draft);
    onClose();
  };

  const setWorkItems = (workItems: WorkItem[]) => {
    setDraft((d) => ({ ...d, workItems, readiness: readinessOverridden ? d.readiness : recomputeReadiness(workItems) }));
  };

  return (
    <SysModal width={680} onClose={commitAndClose}>
      <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${SYS.line}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>редактирование подпроекта</MonoLabel>
          <span onClick={commitAndClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>✕</span>
        </div>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14 }}>
          <SysLabeledField label="Код подпроекта" value={draft.code} onChange={(e: any) => setDraft((d) => ({ ...d, code: e.target.value }))} />
          <SysLabeledField label="Название подпроекта" value={draft.title} onChange={(e: any) => setDraft((d) => ({ ...d, title: e.target.value }))} />
        </div>
      </div>

      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <SysLabeledField label="Дата старта" value={draft.start ?? ''} placeholder="дд.мм" onChange={(e: any) => setDraft((d) => ({ ...d, start: e.target.value || null }))} />
          <SysLabeledField label="Плановая сдача" value={draft.handover ?? ''} placeholder="дд.мм" onChange={(e: any) => setDraft((d) => ({ ...d, handover: e.target.value || null }))} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <MonoLabel color={SYS.ink} style={{ fontSize: 10 }}>общая готовность подпроекта</MonoLabel>
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
      </div>

      <div style={{ padding: '20px 32px 28px', display: 'flex', gap: 10, borderTop: `1px solid ${SYS.line}` }}>
        <SysButton tone="ghost" full={false} small type="button" onClick={onClose}>Отмена</SysButton>
        <div style={{ flex: 1 }}>
          <SysButton type="button" onClick={commitAndClose}>Сохранить изменения</SysButton>
        </div>
      </div>
    </SysModal>
  );
};
