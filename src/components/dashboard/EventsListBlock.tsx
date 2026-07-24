import { useState } from 'react';
import { MonoLabel } from '../primitives';
import { SysButton, SysLabeledField } from '../form';
import { SYS } from '../../theme/tokens';
import { compareEvents, type StageEvent } from '../../mocks/dashboard';

// Shows plan/fact events already added in a stage editor (create or edit),
// with delete for every row and inline edit inputs when `onEdit` is given.
// Displayed in chronological order, but `onEdit`/`onRemove` still address
// the item's index in the original (unsorted) `events` array.
export const ExistingEventsBlock = ({
  tone, events, onRemove, onEdit,
}: {
  tone: 'plan' | 'fact';
  events: StageEvent[];
  onRemove: (i: number) => void;
  onEdit?: (i: number, patch: Partial<StageEvent>) => void;
}) => {
  const ordered = events
    .map((e, i) => ({ e, i }))
    .sort((a, b) => compareEvents(a.e, b.e));

  return (
    <div style={{ border: `1px solid ${SYS.line}` }}>
      <div style={{ padding: '10px 16px', background: tone === 'fact' ? '#f3d9d1' : '#e7e3d8' }}>
        <MonoLabel color={SYS.ink} style={{ fontSize: 11 }}>{tone === 'fact' ? 'факт' : 'план'} · события</MonoLabel>
      </div>
      <div style={{ padding: '4px 16px 12px' }}>
        {events.length === 0 && <div style={{ padding: '10px 0', fontSize: 12, color: SYS.muted }}>— нет событий —</div>}
        {ordered.map(({ e, i }) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 20px', gap: 10, alignItems: 'center', padding: '8px 0', borderTop: `1px solid ${SYS.line}` }}>
            {onEdit ? (
              <>
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
              </>
            ) : (
              <>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500 }}>{e.date}</span>
                <span style={{ fontSize: 12.5, lineHeight: 1.35 }}>{e.title}</span>
              </>
            )}
            <span title="удалить" onClick={() => onRemove(i)} style={{ fontSize: 13, color: SYS.muted, cursor: 'pointer', textAlign: 'right' }}>✕</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const todayISO = () => new Date().toISOString().slice(0, 10);

// Plan events describe scheduled/future work — can't be dated in the past.
// Fact events describe completed work — can't be dated in the future.
// Both are checked against the real calendar date (the day the project is
// being created/edited), not the mock timeline's "today" marker.
export const AddEventForm = ({ tone, onAdd }: { tone: 'plan' | 'fact'; onAdd: (e: StageEvent) => void }) => {
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');

  const dateInvalid = date ? (tone === 'plan' ? date < todayISO() : date > todayISO()) : false;
  const canSubmit = date.trim() && title.trim() && !dateInvalid;

  const submit = () => {
    if (!canSubmit) return;
    const [year, mm, dd] = date.split('-');
    const label = `${dd}.${mm}`;
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    onAdd({ date: label, title: title.trim(), month: `${monthNames[Number(mm) - 1]} ${year}` });
    setDate('');
    setTitle('');
  };

  return (
    <div style={{ border: `1px solid ${SYS.line}`, padding: 16 }}>
      <div style={{ margin: '-16px -16px 14px', padding: '10px 16px', background: tone === 'fact' ? '#f3d9d1' : '#e7e3d8' }}>
        <MonoLabel color={SYS.ink} style={{ fontSize: 11 }}>+ новое событие · {tone === 'fact' ? 'факт' : 'план'}</MonoLabel>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 10 }}>
        <SysLabeledField label="Дата" type="date" value={date} onChange={(e: any) => setDate(e.target.value)} error={dateInvalid} />
        <SysLabeledField
          label="Событие"
          placeholder={tone === 'fact' ? 'напр. Завершена ливневая канализация' : 'напр. Плановая сдача этапа'}
          value={title}
          onChange={(e: any) => setTitle(e.target.value)}
        />
      </div>
      {dateInvalid && (
        <div style={{ marginTop: 8, fontSize: 11.5, color: SYS.red, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>⚠</span> {tone === 'plan' ? 'Плановая дата не может быть раньше сегодняшнего дня' : 'Дата факта не может быть позже сегодняшнего дня'}
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <SysButton tone="ghost" full={false} small type="button" disabled={!canSubmit} onClick={submit}>+ Добавить в {tone === 'fact' ? 'факт' : 'план'}</SysButton>
      </div>
    </div>
  );
};
