import { useRef, useState } from 'react';
import { SysButton, SysLabeledField, SysModal, SysSelectField } from '../form';
import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import { ARCHIVE_BLOCK_FIELD_OBJECT_CODE, fromShortDate, toShortDate, type MediaItem, type MediaKind } from '../../mocks/archive';
import { useArchive } from '../../state/ArchiveContext';
import { useToasts } from '../../state/ToastContext';
import { uploadMediaFile } from '../../lib/storage';

export const EditMediaModal = ({ item, objectCode, onClose }: { item: MediaItem; objectCode: string; onClose: () => void }) => {
  const { updateMedia } = useArchive();
  const { addToast } = useToasts();
  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<MediaKind>(item.kind);
  const [name, setName] = useState(item.name);
  const [block, setBlock] = useState(item.block ?? '');
  const [createdDate, setCreatedDate] = useState(fromShortDate(item.date));
  const [driveUrl, setDriveUrl] = useState(item.driveUrl ?? '');
  const [saving, setSaving] = useState(false);

  // Same rule as on upload: a video file and a link are mutually exclusive
  // (an uploaded video plays inline, no link needed); a link can pair with
  // a plain image as its cover.
  const [newFile, setNewFile] = useState<File | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    setNewFile(f);
    setRemoveExisting(false);
    if (f.type.startsWith('video/')) setDriveUrl('');
  };
  const changeDriveUrl = (v: string) => {
    setDriveUrl(v);
    if (v.trim() && newFile?.type.startsWith('video/')) setNewFile(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const isVideoFile = newFile?.type.startsWith('video/') ?? (!!item.storagePath && item.kind === 'Video' && !item.driveUrl && !newFile && !removeExisting);
  const linkMode = driveUrl.trim().length > 0;
  const canSubmit = name.trim() && createdDate.trim() && !saving && !uploading;

  const submit = async () => {
    if (!canSubmit) return;
    const patch: Partial<MediaItem> = {
      kind,
      name: name.trim(),
      date: toShortDate(createdDate),
      driveUrl: driveUrl.trim() || undefined,
      block: block.trim() || undefined,
    };

    if (newFile) {
      setUploading(true);
      const { path, error } = await uploadMediaFile(objectCode, newFile);
      setUploading(false);
      if (error || !path) {
        addToast('error', `Не удалось загрузить файл: ${error}`);
        return;
      }
      patch.storagePath = path;
    } else if (removeExisting) {
      patch.storagePath = undefined;
    }

    setSaving(true);
    const { error } = await updateMedia(item.id, patch);
    setSaving(false);
    if (error) {
      addToast('error', `Не удалось сохранить: ${error}`);
      return;
    }
    addToast('success', `«${name.trim()}» обновлён.`);
    onClose();
  };

  const hasCurrentFile = item.storagePath && !removeExisting && !newFile;

  return (
    <SysModal width={640} onClose={onClose}>
      <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <MonoLabel color={SYS.red}>мультимедиа · редактирование</MonoLabel>
          <h2 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 500, letterSpacing: '-0.008em' }}>{item.name}</h2>
        </div>
        <span onClick={onClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>✕</span>
      </div>

      <div style={{ padding: '26px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>{linkMode ? 'Обложка (картинка)' : 'Видеофайл'}</MonoLabel>
          {hasCurrentFile ? (
            <div style={{ marginTop: 8, border: `1px solid ${SYS.line}`, background: SYS.paper, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <a href={item.fileUrl} download target="_blank" rel="noreferrer" style={{ fontSize: 13, color: SYS.ink }}>✓ текущий файл · скачать</a>
              <div style={{ display: 'flex', gap: 14 }}>
                <span onClick={() => fileRef.current?.click()} style={{ fontSize: 12, color: SYS.ink, textDecoration: 'underline', cursor: 'pointer' }}>Заменить</span>
                <span onClick={() => setRemoveExisting(true)} style={{ fontSize: 12, color: SYS.red, textDecoration: 'underline', cursor: 'pointer' }}>Удалить</span>
              </div>
            </div>
          ) : removeExisting ? (
            <div style={{ marginTop: 8, border: `1px solid ${SYS.red}`, background: '#fbeae6', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: SYS.red }}>⚠ Файл будет удалён при сохранении</span>
              <span onClick={() => setRemoveExisting(false)} style={{ fontSize: 12, color: SYS.ink, textDecoration: 'underline', cursor: 'pointer' }}>Отменить</span>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              style={{
                marginTop: 8, border: `1px dashed ${dragOver ? SYS.red : SYS.line}`, background: dragOver ? '#fbf1ee' : '#f7f6f2',
                height: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
              }}
            >
              {newFile ? (
                <span style={{ fontSize: 13, color: SYS.ink }}>✓ {newFile.name}</span>
              ) : linkMode ? (
                <>
                  <span style={{ fontSize: 18, color: SYS.muted }}>⤒</span>
                  <span style={{ fontSize: 12, color: SYS.ink2 }}>Перетащите обложку сюда или нажмите</span>
                  <span style={{ fontSize: 10.5, color: SYS.muted }}>JPG, PNG — картинка для превью ссылки</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 18, color: SYS.muted }}>⤒</span>
                  <span style={{ fontSize: 12, color: SYS.ink2 }}>Перетащите видео сюда или нажмите</span>
                  <span style={{ fontSize: 10.5, color: SYS.muted }}>MP4, MOV · до 500 МБ</span>
                </>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept={linkMode ? 'image/*' : 'video/*'} style={{ display: 'none' }} onChange={(e) => pickFile(e.target.files?.[0])} />
        </div>

        <SysSelectField
          label="Тип" value={kind} onChange={(e: any) => setKind(e.target.value)}
          options={[{ value: 'Video', label: 'Video' }, { value: 'AR tour', label: 'AR tour' }, { value: '3D', label: '3D' }]}
        />
        <SysLabeledField label="Название" value={name} onChange={(e: any) => setName(e.target.value)} />
        {objectCode === ARCHIVE_BLOCK_FIELD_OBJECT_CODE && (
          <SysLabeledField label="Блок" placeholder="напр. Блок А" value={block} onChange={(e: any) => setBlock(e.target.value)} />
        )}
        {!isVideoFile && (
          <SysLabeledField
            label="Ссылка на диск (опционально)"
            placeholder="https://disk.yandex.ru/…"
            hint="с загруженным видео эта ссылка не нужна; со ссылкой можно добавить картинку-обложку"
            value={driveUrl}
            onChange={(e: any) => changeDriveUrl(e.target.value)}
          />
        )}
        <SysLabeledField label="Дата создания материала" type="date" value={createdDate} onChange={(e: any) => setCreatedDate(e.target.value)} />
      </div>

      <div style={{ padding: '20px 32px 28px', display: 'flex', gap: 10, borderTop: `1px solid ${SYS.line}` }}>
        <SysButton tone="ghost" full={false} small type="button" onClick={onClose}>Отмена</SysButton>
        <div style={{ flex: 1 }}>
          <SysButton type="button" loading={saving || uploading} disabled={!canSubmit} onClick={submit}>
            {uploading ? 'Загрузка…' : 'Сохранить изменения'}
          </SysButton>
        </div>
      </div>
    </SysModal>
  );
};
