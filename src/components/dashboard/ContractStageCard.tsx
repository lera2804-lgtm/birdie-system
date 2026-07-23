import { MonoLabel } from '../primitives';
import { SysButton } from '../form';
import { SYS } from '../../theme/tokens';
import type { ContractStage } from '../../mocks/dashboard';
import { StageTimeline } from './StageTimeline';
import { EventColumn } from './EventColumn';

export const ContractStageCard = ({ s, canEdit, onEdit }: { s: ContractStage; canEdit: boolean; onEdit: () => void }) => (
  <section style={{ background: SYS.paper, border: `1px solid ${SYS.line}`, padding: 32 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <MonoLabel color={SYS.red}>{s.code}</MonoLabel>
        <h2 style={{ margin: '8px 0 0', fontSize: 26, fontWeight: 500, letterSpacing: '-0.008em' }}>{s.title}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ textAlign: 'right' }}>
          <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>готовность</MonoLabel>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 500, color: s.readiness == null ? SYS.muted : s.readiness === 100 ? SYS.ink : SYS.red }}>
            {s.readiness == null ? '—' : `${s.readiness}%`}
          </div>
        </div>
        {canEdit && <SysButton tone="ghost" full={false} small type="button" onClick={onEdit}>✎ Изменить</SysButton>}
      </div>
    </div>

    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>таймлайн проекта</MonoLabel>
        {s.updatedOn && <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>обновлено {s.updatedOn}</MonoLabel>}
      </div>
      {s.start && s.handover ? (
        <>
          <StageTimeline s={s} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 12, fontSize: 11, color: SYS.muted }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 6, background: '#ecab99' }} /> выполнено</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: SYS.paper, border: `2px solid ${SYS.red}` }} /> очная встреча</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 0, height: 12, borderLeft: `2px dashed ${SYS.red}` }} /> сегодня</span>
          </div>
        </>
      ) : (
        <div style={{ border: `1px dashed ${SYS.line}`, padding: '18px 20px', fontSize: 12.5, color: SYS.muted }}>
          Сроки ещё не заданы — укажите даты старта и сдачи в редактировании подпроекта.
        </div>
      )}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <MonoLabel color={SYS.ink} style={{ fontSize: 10 }}>состав работ</MonoLabel>
          <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>{s.workItems.length} задач</MonoLabel>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {s.workItems.length === 0 && (
            <div style={{ border: `1px dashed ${SYS.line}`, padding: '16px 18px', fontSize: 12.5, color: SYS.muted, lineHeight: 1.45 }}>
              Работы ещё не добавлены. {canEdit ? 'Добавьте первые — готовность посчитается по ним.' : 'Менеджер ещё не заполнил состав работ.'}
            </div>
          )}
          {s.workItems.map((w, i) => (
            <div key={i} style={{ padding: '9px 0', borderTop: i === 0 ? 'none' : `1px solid ${SYS.line}`, display: 'grid', gridTemplateColumns: '1fr 64px 34px', gap: 10, alignItems: 'center' }}>
              <div style={{ fontSize: 12.5, lineHeight: 1.3 }}>
                {w.title}{w.qty && <span style={{ color: SYS.muted }}> · {w.qty}</span>}
              </div>
              <div style={{ height: 4, background: '#eae7dc', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${w.pct}%`, background: w.pct === 100 ? SYS.ink : SYS.red }} />
              </div>
              <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: w.pct === 100 ? SYS.ink : SYS.red }}>{w.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <MonoLabel color={SYS.ink} style={{ fontSize: 10 }}>события</MonoLabel>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <EventColumn label="план" sub="запланировано" tone="plan" events={s.planEvents} />
          <EventColumn label="факт" sub="выполнено" tone="fact" events={s.factEvents} />
        </div>
      </div>
    </div>
  </section>
);
