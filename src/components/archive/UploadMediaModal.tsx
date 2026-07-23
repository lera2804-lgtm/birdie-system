import { useRef, useState } from 'react';
import { SysButton, SysLabeledField, SysModal, SysSelectField } from '../form';
import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import type { MediaItem, MediaKind } from '../../mocks/archive';
import { useArchive } from '../../state/ArchiveContext';
import { useToasts } from '../../state/ToastContext';

export const UploadMediaModal = ({ onClose }: { onClose: () => void }) => {
  const { addMedia } = useArchive();
  const { addToast } = useToasts();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [kind, setKind] = useState<MediaKind>('Video');
  const [title, setTitle] = useState('');
  const [album, setAlbum] = useState('');
  const [variant, setVariant] = useState('');
  const [driveUrl, setDriveUrl] = useState('');

  const canSubmit = title.trim();

  const submit = () => {
    if (!canSubmit) return;
    const media: MediaItem = {
      id: `m${Date.now()}`,
      kind,
      name: `${title.trim()}${album ? ` ${album}` : ''}${variant ? ` / ${variant}` : ''}`,
      date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      driveUrl: driveUrl.trim() || undefined,
    };
    addMedia(media);
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
            style={{ marginTop: 8, border: `1px dashed ${SYS.line}`, background: '#f7f6f2', height: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}
          >
            {fileName ? (
              <span style={{ fontSize: 13, color: SYS.ink }}>✓ {fileName}</span>
            ) : (
              <>
                <span style={{ fontSize: 20, color: SYS.muted }}>⤒</span>
                <span style={{ fontSize: 12.5, color: SYS.ink2 }}>Перетащите видео / кадр сюда или нажмите</span>
                <span style={{ fontSize: 11, color: SYS.muted }}>MP4, MOV, ссылка на 3D-тур · до 500 МБ</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')} />
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
      </div>

      <div style={{ padding: '20px 32px 28px', display: 'flex', gap: 10, borderTop: `1px solid ${SYS.line}` }}>
        <SysButton tone="ghost" full={false} small type="button" onClick={onClose}>Отмена</SysButton>
        <div style={{ flex: 1 }}>
          <SysButton type="button" disabled={!canSubmit} onClick={submit}>Добавить в мультимедиа</SysButton>
        </div>
      </div>
    </SysModal>
  );
};
