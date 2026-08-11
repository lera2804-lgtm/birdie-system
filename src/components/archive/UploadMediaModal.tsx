import { useRef, useState } from 'react';
import { SysButton, SysLabeledField, SysModal, SysSelectField } from '../form';
import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import { toShortDate, type MediaItem, type MediaKind } from '../../mocks/archive';
import { useArchive } from '../../state/ArchiveContext';
import { useToasts } from '../../state/ToastContext';
import { uploadMediaFile } from '../../lib/storage';

export const UploadMediaModal = ({ objectCode, onClose }: { objectCode: string; onClose: () => void }) => {
  const { addMedia } = useArchive();
  const { addToast } = useToasts();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<MediaKind>('Video');
  const [title, setTitle] = useState('');
  const [album, setAlbum] = useState('');
  const [variant, setVariant] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [createdDate, setCreatedDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [dragOver, setDragOver] = useState(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const canSubmit = title.trim() && createdDate.trim() && !submitting && !uploading;

  const submit = async () => {
    if (!canSubmit) return;
    let storagePath: string | undefined;
    if (file) {
      setUploading(true);
      const { path, error } = await uploadMediaFile(objectCode, file);
      setUploading(false);
      if (error || !path) {
        addToast('error', `Не удалось загрузить файл: ${error}`);
        return;
      }
      storagePath = path;
    }
    const media: MediaItem = {
      id: `m${Date.now()}`,
      kind,
      name: `${title.trim()}${album ? ` ${album}` : ''}${variant ? ` / ${variant}` : ''}`,
      date: toShortDate(createdDate),
      driveUrl: driveUrl.trim() || undefined,
      storagePath,
    };
    setSubmitting(true);
    const { error } = await addMedia(media);
    setSubmitting(false);
    if (error) {
      addToast('error', `Не удалось добавить медиафайл: ${error}`);
      return;
    }
    addToast('success', `«${media.name}» добавлен в мультимедиа.`);
    onClose();
  };

  return (
    <SysModal width={560} onClose={onClose}>
      <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <MonoLabel color={SYS.red}>мультимедиа · загрузка</MonoLabel>
          <h2 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 500, letterSpacing: '-0.008em' }}>Новый медиафайл</h2>
        </div>
        <span onClick={onClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>✕</span>
      </div>

      <div style={{ padding: '26px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>Обложка / файл</MonoLabel>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{
              marginTop: 8, border: `1px dashed ${dragOver ? SYS.red : SYS.line}`, background: dragOver ? '#fbf1ee' : '#f7f6f2',
              height: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
            }}
          >
            {file ? (
              <span style={{ fontSize: 13, color: SYS.ink }}>✓ {file.name}</span>
            ) : (
              <>
                <span style={{ fontSize: 20, color: SYS.muted }}>⤒</span>
                <span style={{ fontSize: 12.5, color: SYS.ink2 }}>Перетащите видео / кадр сюда или нажмите</span>
                <span style={{ fontSize: 11, color: SYS.muted }}>MP4, MOV, ссылка на 3D-тур · до 500 МБ</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <SysSelectField
          label="Тип" value={kind} onChange={(e: any) => setKind(e.target.value)}
          options={[{ value: 'Video', label: 'Video' }, { value: 'AR tour', label: 'AR tour' }, { value: '3D', label: '3D' }]}
        />
        <SysLabeledField label="Название" placeholder="напр. Landscape concept" value={title} onChange={(e: any) => setTitle(e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <SysLabeledField label="Альбом / версия" placeholder="напр. Alb.3" value={album} onChange={(e: any) => setAlbum(e.target.value)} />
          <SysLabeledField label="Вариант" placeholder="напр. V5" value={variant} onChange={(e: any) => setVariant(e.target.value)} />
        </div>
        <SysLabeledField label="Ссылка на диск (опционально)" placeholder="https://disk.yandex.ru/…" hint="если указана — откроется кнопкой «Посмотреть»" value={driveUrl} onChange={(e: any) => setDriveUrl(e.target.value)} />
        <SysLabeledField label="Дата создания материала" type="date" value={createdDate} onChange={(e: any) => setCreatedDate(e.target.value)} />
      </div>

      <div style={{ padding: '20px 32px 28px', display: 'flex', gap: 10, borderTop: `1px solid ${SYS.line}` }}>
        <SysButton tone="ghost" full={false} small type="button" onClick={onClose}>Отмена</SysButton>
        <div style={{ flex: 1 }}>
          <SysButton type="button" loading={submitting || uploading} disabled={!canSubmit} onClick={submit}>Добавить в мультимедиа</SysButton>
        </div>
      </div>
    </SysModal>
  );
};
