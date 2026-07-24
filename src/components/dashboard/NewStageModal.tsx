import { useState } from 'react';
import { SysButton, SysLabeledField, SysModal } from '../form';
import { MonoLabel, ReorderButtons } from '../primitives';
import { SYS } from '../../theme/tokens';
import { recomputeReadiness, type ContractStage, type StageEvent, type WorkItem } from '../../mocks/dashboard';
import { useStages } from '../../state/StagesContext';
import { AddEventForm, ExistingEventsBlock } from './EventsListBlock';

const AddWorkForm = ({ onAdd }: { onAdd: (item: WorkItem) => void }) => {
  const [title, setTitle] = useState('');
  const [qty, setQty] = useState('');
  const [pct, setPct] = useState('');
  const submit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), qty: qty.trim() || undefined, pct: Math.max(0, Math.min(100, Number(pct) || 0)) });
    setTitle('');
    setQty('');
    setPct('');
  };
  return (
    <div style={{ border: `1px solid ${SYS.line}`, padding: 16, marginTop: 14 }}>
      <div style={{ margin: '-16px -16px 14px', padding: '10px 16px', background: '#EEEDED' }}>
        <MonoLabel color={SYS.ink} style={{ fontSize: 11 }}>+ новая работа</MonoLabel>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 90px', gap: 10 }}>
        <SysLabeledField label="Название работы" placeholder="напр. Обработка приствольных кругов" value={title} onChange={(e: any) => setTitle(e.target.value)} />
        <SysLabeledField label="Кол-во, ед." placeholder="напр. 120 шт." value={qty} onChange={(e: any) => setQty(e.target.value)} />
        <SysLabeledField label="Готовность, %" placeholder="0" type="number" min={0} max={100} value={pct} onChange={(e: any) => setPct(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <SysButton tone="ghost" full={false} small type="button" disabled={!title.trim()} onClick={submit}>+ Добавить работу</SysButton>
      </div>
    </div>
  );
};

export const NewStageModal = ({ projectCode, onClose }: { projectCode: string; onClose: () => void }) => {
  const { addStage } = useStages();
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [handover, setHandover] = useState('');
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [planEvents, setPlanEvents] = useState<StageEvent[]>([]);
  const [factEvents, setFactEvents] = useState<StageEvent[]>([]);

  const toShort = (iso: string) => {
    const parts = iso.split('-');
    return parts.length === 3 ? `${parts[2]}.${parts[1]}` : null;
  };

  const moveWorkItem = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= workItems.length) return;
    const next = [...workItems];
    [next[i], next[j]] = [next[j], next[i]];
    setWorkItems(next);
  };

  const canSubmit = code.trim() && title.trim();

  const submit = () => {
    if (!canSubmit) return;
    const stage: ContractStage = {
      code: code.trim(),
      title: title.trim(),
      readiness: recomputeReadiness(workItems),
      updatedOn: null,
      active: false,
      start: toShort(start),
      handover: toShort(handover),
      today: null,
      workItems,
      planEvents,
      factEvents,
    };
    addStage(stage);
    onClose();
  };

  return (
    <SysModal width={680} onClose={onClose}>
      <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${SYS.line}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <MonoLabel color={SYS.red}>{projectCode} · новый проект</MonoLabel>
          <span onClick={onClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>✕</span>
        </div>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14 }}>
          <SysLabeledField label="Код проекта" placeholder={`напр. ${projectCode}/8`} value={code} onChange={(e: any) => setCode(e.target.value)} />
          <SysLabeledField label="Название проекта" placeholder="напр. Устройство дренажной системы" value={title} onChange={(e: any) => setTitle(e.target.value)} />
        </div>
      </div>

      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <SysLabeledField label="Дата старта" type="date" value={start} onChange={(e: any) => setStart(e.target.value)} />
          <SysLabeledField label="Плановая сдача" type="date" hint="можно уточнить позже" value={handover} onChange={(e: any) => setHandover(e.target.value)} />
        </div>

        <div>
          <MonoLabel color={SYS.ink} style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>состав работ</MonoLabel>
          <div style={{ fontSize: 11.5, color: SYS.muted, lineHeight: 1.4, marginBottom: 4 }}>
            Пока пусто — добавьте первые работы, готовность будет считаться по ним автоматически.
          </div>
          {workItems.map((w, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 16px 20px', gap: 10, alignItems: 'center', padding: '8px 0', borderTop: `1px solid ${SYS.line}`, fontSize: 12.5 }}>
              <span>{w.title}{w.qty && <span style={{ color: SYS.muted }}> · {w.qty}</span>}</span>
              <span style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: w.pct === 100 ? SYS.ink : SYS.red }}>{w.pct}%</span>
              <ReorderButtons
                canMoveUp={i > 0}
                canMoveDown={i < workItems.length - 1}
                onMoveUp={() => moveWorkItem(i, -1)}
                onMoveDown={() => moveWorkItem(i, 1)}
              />
              <span title="удалить" onClick={() => setWorkItems(workItems.filter((_, xi) => xi !== i))} style={{ color: SYS.muted, cursor: 'pointer', textAlign: 'right' }}>✕</span>
            </div>
          ))}
          <AddWorkForm onAdd={(item) => setWorkItems([...workItems, item])} />
        </div>

        <div>
          <MonoLabel color={SYS.ink} style={{ fontSize: 10, display: 'block', marginBottom: 12 }}>события</MonoLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ExistingEventsBlock tone="plan" events={planEvents} onRemove={(i) => setPlanEvents(planEvents.filter((_, ei) => ei !== i))} />
            <AddEventForm tone="plan" onAdd={(e) => setPlanEvents([...planEvents, e])} />
            <ExistingEventsBlock tone="fact" events={factEvents} onRemove={(i) => setFactEvents(factEvents.filter((_, ei) => ei !== i))} />
            <AddEventForm tone="fact" onAdd={(e) => setFactEvents([...factEvents, e])} />
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 32px 28px', display: 'flex', gap: 10, borderTop: `1px solid ${SYS.line}` }}>
        <SysButton tone="ghost" full={false} small type="button" onClick={onClose}>Отмена</SysButton>
        <div style={{ flex: 1 }}>
          <SysButton type="button" disabled={!canSubmit} onClick={submit}>Создать проект</SysButton>
        </div>
      </div>
    </SysModal>
  );
};
