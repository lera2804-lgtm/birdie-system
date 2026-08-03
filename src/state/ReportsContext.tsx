import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { publicUrl, pathFromPublicUrl } from '../lib/storage';
import { useAuth } from '../auth/AuthContext';
import type { DayReport, OfficeRow, Photo, ReportTask } from '../mocks/reports';

interface ReportsState {
  reports: Record<string, DayReport>;
  loading: boolean;
  saveReport: (date: string, report: DayReport, markEdited?: boolean) => Promise<{ error: string | null }>;
}

const ReportsContext = createContext<ReportsState | null>(null);

interface ReportRow {
  report_date: string;
  milestone: string;
  milestone_tag: string | null;
  is_draft: boolean;
  edited_at: string | null;
  report_tasks: { id: string; stage_code: string | null; kind: 'field' | 'desk'; title: string; position: number; report_photos: { id: string; storage_path: string; position: number }[] }[];
  report_office_rows: { id: string; side: 'front' | 'back'; qty: string; role: string; position: number }[];
}

const editedLabel = (iso: string | null): string | undefined => {
  if (!iso) return undefined;
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `✎ отредактировано ${dd}.${mm} в ${hh}:${min}`;
};

const fromRow = (row: ReportRow): DayReport => {
  const tasks: ReportTask[] = [...row.report_tasks]
    .sort((a, b) => a.position - b.position)
    .map((t) => ({
      id: t.id,
      subproject: t.stage_code ?? '',
      kind: t.kind,
      title: t.title,
      photos: [...t.report_photos]
        .sort((a, b) => a.position - b.position)
        .map((p): Photo => ({ id: p.id, url: publicUrl('report-photos', p.storage_path) })),
    }));
  const officeRows = [...row.report_office_rows].sort((a, b) => a.position - b.position);
  const toOfficeRow = (r: { id: string; qty: string; role: string }): OfficeRow => ({ id: r.id, qty: r.qty, role: r.role });
  return {
    date: row.report_date,
    tasks,
    frontOffice: officeRows.filter((r) => r.side === 'front').map(toOfficeRow),
    backOffice: officeRows.filter((r) => r.side === 'back').map(toOfficeRow),
    milestone: row.milestone,
    milestoneTag: row.milestone_tag ?? undefined,
    editedByPM: editedLabel(row.edited_at),
    isDraft: row.is_draft,
  };
};

export const ReportsProvider = ({ projectCode, children }: { projectCode: string; children: ReactNode }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Record<string, DayReport>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('report_date, milestone, milestone_tag, is_draft, edited_at, report_tasks(id, stage_code, kind, title, position, report_photos(id, storage_path, position)), report_office_rows(id, side, qty, role, position)')
      .eq('object_code', projectCode);
    const out: Record<string, DayReport> = {};
    for (const row of (data ?? []) as unknown as ReportRow[]) {
      out[row.report_date] = fromRow(row);
    }
    setReports(out);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectCode]);

  const saveReport = async (date: string, report: DayReport, markEdited?: boolean) => {
    const { data: reportRow, error: upsertError } = await supabase
      .from('reports')
      .upsert(
        {
          object_code: projectCode,
          report_date: date,
          milestone: report.milestone,
          is_draft: report.isDraft ?? false,
          ...(markEdited ? { edited_by: user?.id ?? null, edited_at: new Date().toISOString() } : {}),
        },
        { onConflict: 'object_code,report_date' },
      )
      .select('id')
      .single();
    if (upsertError || !reportRow) return { error: upsertError?.message ?? 'Не удалось сохранить отчёт' };
    const reportId = reportRow.id;

    // Only the DB rows are wholesale delete-and-reinsert (cheap bookkeeping);
    // the actual storage files are removed only for photos the new draft no
    // longer references, so untouched photos from earlier saves survive.
    const newPaths = new Set(
      report.tasks.flatMap((t) => t.photos.map((p) => (p.uploading ? null : pathFromPublicUrl('report-photos', p.url)))).filter((p): p is string => !!p),
    );
    const { data: oldTasks } = await supabase.from('report_tasks').select('id').eq('report_id', reportId);
    const oldTaskIds = (oldTasks ?? []).map((t) => t.id);
    if (oldTaskIds.length > 0) {
      const { data: oldPhotos } = await supabase.from('report_photos').select('storage_path').in('task_id', oldTaskIds);
      const removedPaths = (oldPhotos ?? []).map((p) => p.storage_path).filter((p) => !newPaths.has(p));
      if (removedPaths.length > 0) await supabase.storage.from('report-photos').remove(removedPaths);
    }
    await supabase.from('report_tasks').delete().eq('report_id', reportId);
    await supabase.from('report_office_rows').delete().eq('report_id', reportId);

    if (report.tasks.length > 0) {
      const { data: insertedTasks, error: taskError } = await supabase
        .from('report_tasks')
        .insert(report.tasks.map((t, i) => ({ report_id: reportId, stage_code: t.subproject || null, kind: t.kind, title: t.title, position: i })))
        .select('id');
      if (taskError || !insertedTasks) return { error: taskError?.message ?? 'Не удалось сохранить задачи отчёта' };

      const photoRows = insertedTasks.flatMap((row, i) =>
        report.tasks[i].photos
          .filter((p) => !p.uploading && p.url)
          .map((p, pi) => {
            const path = pathFromPublicUrl('report-photos', p.url);
            return path ? { task_id: row.id, storage_path: path, position: pi } : null;
          })
          .filter((r): r is { task_id: string; storage_path: string; position: number } => r !== null),
      );
      if (photoRows.length > 0) await supabase.from('report_photos').insert(photoRows);
    }

    const officeRows = [
      ...report.frontOffice.map((r, i) => ({ report_id: reportId, side: 'front' as const, qty: r.qty, role: r.role, position: i })),
      ...report.backOffice.map((r, i) => ({ report_id: reportId, side: 'back' as const, qty: r.qty, role: r.role, position: i })),
    ];
    if (officeRows.length > 0) await supabase.from('report_office_rows').insert(officeRows);

    await load();
    return { error: null };
  };

  return (
    <ReportsContext.Provider value={{ reports, loading, saveReport }}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used within ReportsProvider');
  return ctx;
};
