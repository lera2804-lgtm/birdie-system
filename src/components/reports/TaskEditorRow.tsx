import { useRef } from 'react';
import { MonoLabel } from '../primitives';
import { SysLabeledField, SysSelectField } from '../form';
import { SYS } from '../../theme/tokens';
import type { ReportTask } from '../../mocks/reports';
import { uploadReportPhoto } from '../../lib/storage';

const MAX_PHOTOS = 4;

export const TaskEditorRow = ({
  task, n, allowDeskType, stages, objectCode, reportDate, onChange, onRequestDelete, nameError,
}: {
  task: ReportTask;
  n: number;
  allowDeskType: boolean;
  stages: { code: string; title: string }[];
  objectCode: string;
  reportDate: string;
  onChange: (patch: Partial<ReportTask>) => void;
  onRequestDelete: () => void;
  nameError?: boolean;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const isField = task.kind === 'field';

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const room = MAX_PHOTOS - task.photos.length;
    const picked = Array.from(files).slice(0, room);
    if (picked.length === 0) return;
    // Threaded through a local variable rather than re-reading task.photos
    // between awaits, since that prop won't reflect our own prior updates
    // until the parent re-renders.
    const pendingIds = picked.map((f) => `${Date.now()}-${f.name}-${Math.random()}`);
    let working = [...task.photos, ...pendingIds.map((id) => ({ id, url: '', uploading: true }))];
    onChange({ photos: working });
    for (let i = 0; i < picked.length; i++) {
      const { url, error } = await uploadReportPhoto(objectCode, reportDate, picked[i]);
      working = working.map((p) => (p.id === pendingIds[i] ? { id: p.id, url: url ?? '', uploading: false } : p));
      onChange({ photos: working });
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Photo upload failed:', error);
      }
    }
  };

  // Storage cleanup is deferred to save time (see ReportsContext.saveReport),
  // so cancelling out of the editor after removing a photo doesn't orphan a
  // file that's still referenced by the last-saved version of this report.
  const removePhoto = (id: string) => onChange({ photos: task.photos.filter((p) => p.id !== id) });

  return (
    <div style={{ border: `1px solid ${SYS.line}`, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>задача {n}</MonoLabel>
        <span title="удалить задачу" onClick={onRequestDelete} style={{ fontSize: 13, color: SYS.muted, cursor: 'pointer' }}>✕</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: allowDeskType ? '160px 1fr' : '1fr', gap: 10 }}>
          <SysSelectField
            label="Проект"
            value={task.subproject}
            onChange={(e: any) => onChange({ subproject: e.target.value })}
            options={stages.map((s) => ({ value: s.code, label: s.code }))}
          />
          {allowDeskType && (
            <SysSelectField
              label="Тип задачи"
              value={task.kind}
              onChange={(e: any) => onChange({ kind: e.target.value as ReportTask['kind'], ...(e.target.value === 'desk' ? { photos: [] } : {}) })}
              options={[{ value: 'field', label: 'Полевая (с фото)' }, { value: 'desk', label: 'Кабинетная (без фото)' }]}
            />
          )}
        </div>

        <SysLabeledField
          label="Название"
          placeholder={isField ? 'напр. Обработка крон в северной части участка' : 'напр. Согласование сметы доп. работ с заказчиком'}
          value={task.title}
          onChange={(e: any) => onChange({ title: e.target.value })}
          error={nameError}
        />
        {nameError && (
          <div style={{ marginTop: -6, fontSize: 11.5, color: SYS.red, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚠</span> Укажите название задачи
          </div>
        )}

        {isField && (
          <div>
            <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>Фото / видео</MonoLabel>
            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {task.photos.map((p) => (
                <div key={p.id} style={{ position: 'relative', aspectRatio: '1', background: '#eae7dc', overflow: 'hidden' }}>
                  {p.uploading ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: SYS.muted }}>загрузка…</div>
                  ) : p.url ? (
                    <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : null}
                  <span
                    onClick={() => removePhoto(p.id)}
                    style={{ position: 'absolute', top: 3, right: 3, fontSize: 10, color: '#fff', background: 'rgba(10,10,10,0.55)', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >✕</span>
                </div>
              ))}
              {task.photos.length < MAX_PHOTOS && (
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ aspectRatio: '1', border: `1px dashed ${SYS.line}`, background: '#f7f6f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: SYS.muted, cursor: 'pointer' }}
                >+</div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={(e) => addFiles(e.target.files)} />
            <div style={{ marginTop: 6, fontSize: 10.5, color: task.photos.length >= MAX_PHOTOS ? SYS.red : SYS.muted }}>
              {task.photos.length >= MAX_PHOTOS ? 'Достигнут лимит — максимум 4 фото на задачу' : 'максимум 4 фото · до 1 мин на видео'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
