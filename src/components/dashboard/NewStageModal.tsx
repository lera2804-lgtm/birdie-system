import { useState } from 'react';
import { SysButton, SysLabeledField, SysModal } from '../form';
import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import { recomputeReadiness, type ContractStage, type StageEvent, type WorkItem } from '../../mocks/dashboard';
import { useStages } from '../../state/StagesContext';

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

const AddEventForm = ({ tone, onAdd }: { tone: 'plan' | 'fact'; onAdd: (e: StageEvent) => void }) => {
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const submit = () => {
    if (!date.trim() || !title.trim()) return;
    const parts = date.split('-');
    const label = parts.length === 3 ? `${parts[2]}.${parts[1]}` : date;
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const monthIdx = parts.length === 3 ? Number(parts[1]) - 1 : new Date().getMonth();
    onAdd({ date: label, title: title.trim(), month: `${monthNames[monthIdx]} ${parts[0] || new Date().getFullYear()}` });
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
          <MonoLabel color={SYS.red}>{projectCode} · новый подпроект</MonoLabel>
          <span onClick={onClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>✕</span>
        </div>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14 }}>
          <SysLabeledField label="Код подпроекта" placeholder={`напр. ${projectCode}/8`} value={code} onChange={(e: any) => setCode(e.target.value)} />
          <SysLabeledField label="Название подпроекта" placeholder="напр. Устройство дренажной системы" value={title} onChange={(e: any) => setTitle(e.target.value)} />
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
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: `1px solid ${SYS.line}`, fontSize: 12.5 }}>
              <span>{w.title}{w.qty && <span style={{ color: SYS.muted }}> · {w.qty}</span>}</span>
              <span title="удалить" onClick={() => setWorkItems(workItems.filter((_, xi) => xi !== i))} style={{ color: SYS.muted, cursor: 'pointer' }}>✕</span>
            </div>
          ))}
          <AddWorkForm onAdd={(item) => setWorkItems([...workItems, item])} />
        </div>

        <div>
          <MonoLabel color={SYS.ink} style={{ fontSize: 10, display: 'block', marginBottom: 12 }}>события</MonoLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AddEventForm tone="plan" onAdd={(e) => setPlanEvents([...planEvents, e])} />
            <AddEventForm tone="fact" onAdd={(e) => setFactEvents([...factEvents, e])} />
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 32px 28px', display: 'flex', gap: 10, borderTop: `1px solid ${SYS.line}` }}>
        <SysButton tone="ghost" full={false} small type="button" onClick={onClose}>Отмена</SysButton>
        <div style={{ flex: 1 }}>
          <SysButton type="button" disabled={!canSubmit} onClick={submit}>Создать подпроект</SysButton>
        </div>
      </div>
    </SysModal>
  );
};
