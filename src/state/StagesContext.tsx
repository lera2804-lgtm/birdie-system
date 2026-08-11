import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ContractStage, StageEvent, WorkItem } from '../mocks/dashboard';

interface StagesState {
  stages: ContractStage[];
  loading: boolean;
  addStage: (stage: ContractStage) => Promise<{ error: string | null }>;
  replaceStage: (code: string, next: ContractStage) => Promise<{ error: string | null }>;
  removeStage: (code: string) => Promise<{ error: string | null }>;
}

const StagesContext = createContext<StagesState | null>(null);

const todayISO = () => new Date().toISOString().slice(0, 10);

interface StageRow {
  code: string;
  title: string;
  readiness: number | null;
  updated_on: string | null;
  active: boolean;
  position: number;
  start_date: string | null;
  meeting_date: string | null;
  handover_date: string | null;
  work_items: { title: string; qty: string | null; pct: number }[];
  stage_events: { tone: 'plan' | 'fact'; event_date: string; title: string }[];
}

const fromRow = (row: StageRow): ContractStage => ({
  code: row.code,
  title: row.title,
  readiness: row.readiness,
  updatedOn: row.updated_on,
  active: row.active,
  position: row.position,
  start: row.start_date,
  meeting: row.meeting_date,
  handover: row.handover_date,
  today: todayISO(),
  workItems: row.work_items.map((w): WorkItem => ({ title: w.title, qty: w.qty ?? undefined, pct: w.pct })),
  planEvents: row.stage_events.filter((e) => e.tone === 'plan').map((e): StageEvent => ({ date: e.event_date, title: e.title })),
  factEvents: row.stage_events.filter((e) => e.tone === 'fact').map((e): StageEvent => ({ date: e.event_date, title: e.title })),
});

// Stage editors always submit the complete draft (work items + events
// included), so children are synced by deleting and reinserting the full
// set rather than diffing — simpler and matches how the UI already commits.
const writeChildren = async (stageId: string, stage: ContractStage) => {
  await supabase.from('work_items').delete().eq('stage_id', stageId);
  await supabase.from('stage_events').delete().eq('stage_id', stageId);

  if (stage.workItems.length > 0) {
    await supabase.from('work_items').insert(
      stage.workItems.map((w, i) => ({ stage_id: stageId, title: w.title, qty: w.qty ?? null, pct: w.pct, position: i })),
    );
  }
  const events = [
    ...stage.planEvents.map((e) => ({ stage_id: stageId, tone: 'plan' as const, event_date: e.date, title: e.title })),
    ...stage.factEvents.map((e) => ({ stage_id: stageId, tone: 'fact' as const, event_date: e.date, title: e.title })),
  ];
  if (events.length > 0) {
    await supabase.from('stage_events').insert(events);
  }
};

export const StagesProvider = ({ projectCode, children }: { projectCode: string; children: ReactNode }) => {
  const [stages, setStages] = useState<ContractStage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('stages')
      .select('code, title, readiness, updated_on, active, position, start_date, meeting_date, handover_date, work_items(title, qty, pct, position), stage_events(tone, event_date, title)')
      .eq('object_code', projectCode)
      .order('position')
      .order('position', { foreignTable: 'work_items' });
    setStages((data ?? []).map((row) => fromRow(row as unknown as StageRow)));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectCode]);

  const addStage = async (stage: ContractStage) => {
    const { data, error } = await supabase
      .from('stages')
      .insert({
        object_code: projectCode,
        code: stage.code,
        title: stage.title,
        readiness: stage.readiness,
        active: stage.active,
        start_date: stage.start,
        handover_date: stage.handover,
        position: stages.length,
      })
      .select('id')
      .single();
    if (error || !data) return { error: error?.message ?? 'Не удалось создать проект' };
    await writeChildren(data.id, stage);
    await load();
    return { error: null };
  };

  const replaceStage = async (code: string, next: ContractStage) => {
    const { data, error } = await supabase
      .from('stages')
      .update({
        code: next.code,
        title: next.title,
        readiness: next.readiness,
        updated_on: todayISO(),
        active: next.active,
        start_date: next.start,
        meeting_date: next.meeting ?? null,
        handover_date: next.handover,
      })
      .eq('code', code)
      .select('id')
      .single();
    if (error || !data) return { error: error?.message ?? 'Не удалось сохранить проект' };
    await writeChildren(data.id, next);
    await load();
    return { error: null };
  };

  const removeStage = async (code: string) => {
    const { error } = await supabase.from('stages').delete().eq('code', code);
    if (error) return { error: error.message };
    await load();
    return { error: null };
  };

  return (
    <StagesContext.Provider value={{ stages, loading, addStage, replaceStage, removeStage }}>
      {children}
    </StagesContext.Provider>
  );
};

export const useStages = () => {
  const ctx = useContext(StagesContext);
  if (!ctx) throw new Error('useStages must be used within StagesProvider');
  return ctx;
};
