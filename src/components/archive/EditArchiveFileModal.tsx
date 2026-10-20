import { useRef, useState } from 'react';
import { SysButton, SysLabeledField, SysModal, SysSelectField } from '../form';
import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import { ALLOWED_DOC_EXTENSIONS, ARCHIVE_BLOCK_FIELD_OBJECT_CODE, MAX_UPLOAD_MB, fromShortDate, toShortDate, type ArchiveFile, type KeyFileStatus } from '../../mocks/archive';
import { useArchive } from '../../state/ArchiveContext';
import { useToasts } from '../../state/ToastContext';
import { uploadDocFile } from '../../lib/storage';

export const EditArchiveFileModal = ({ file, objectCode, onClose }: { file: ArchiveFile; objectCode: string; onClose: () => void }) => {
  const { updateFile } = useArchive();
  const { addToast } = useToasts();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(file.name);
  const [album, setAlbum] = useState(file.album);
  const [variant, setVariant] = useState(file.variant);
  const [block, setBlock] = useState(file.block ?? '');
  const [createdDate, setCreatedDate] = useState(fromShortDate(file.created));
  const [driveUrl, setDriveUrl] = useState(file.driveUrl ?? '');
  const [visible, setVisible] = useState(!file.clientHidden);
  const [isKey, setIsKey] = useState(!!file.key);
  const [status, setStatus] = useState<KeyFileStatus>(file.keyStatus ?? 'на согласовании');
  const [saving, setSaving] = useState(false);

  // File swap: newFile replaces the current one on save; removeExisting
  // clears it (to a link-only entry, if a Яндекс.Диск link is set).
  // Neither touches storage until Save is pressed.
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFileExt, setNewFileExt] = useState('');
  const [removeExisting, setRemoveExisting] = useState(false);
  const [pickError, setPickError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    const tooBig = f.size > MAX_UPLOAD_MB * 1024 * 1024;
    if (!ALLOWED_DOC_EXTENSIONS.includes(ext) || tooBig) {
      setPickError(`${f.name} — ${tooBig ? `размер больше ${MAX_UPLOAD_MB} МБ` : 'неподдерживаемый формат'}. Разрешены PDF, DWG, XLSX, MP4.`);
      return;
    }
    setPickError('');
    setNewFile(f);
    setNewFileExt(ext.toUpperCase());
    setRemoveExisting(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const canSubmit = name.trim() && createdDate.trim() && !saving && !uploading;

  const submit = async () => {
    if (!canSubmit) return;
    const patch: Partial<ArchiveFile> = {
      name: name.trim(),
      album: album.trim() || '—',
      variant: variant.trim() || '—',
      created: toShortDate(createdDate),
      driveUrl: driveUrl.trim() || undefined,
      clientHidden: !visible,
      key: isKey,
      keyStatus: isKey ? status : undefined,
      block: block.trim() || undefined,
    };

    if (newFile) {
      setUploading(true);
      const { path, error } = await uploadDocFile(objectCode, newFile);
      setUploading(false);
      if (error || !path) {
        addToast('error', `Не удалось загрузить файл: ${error}`);
        return;
      }
      patch.storagePath = path;
      patch.type = newFileExt;
    } else if (removeExisting) {
      patch.storagePath = undefined;
      patch.type = driveUrl.trim() ? 'ССЫЛКА' : file.type;
    }

    setSaving(true);
    const { error } = await updateFile(file.id, patch);
    setSaving(false);
    if (error) {
      addToast('error', `Не удалось сохранить: ${error}`);
      return;
    }
    addToast('success', `«${name.trim()}» обновлён.`);
    onClose();
  };

  const hasCurrentFile = file.storagePath && !removeExisting && !newFile;

  return (
    <SysModal width={560} onClose={onClose}>
      <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <MonoLabel color={SYS.red}>архив · редактирование</MonoLabel>
          <h2 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 500, letterSpacing: '-0.008em' }}>{file.type} · {file.name}</h2>
        </div>
        <span onClick={onClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>✕</span>
      </div>

      <div style={{ padding: '26px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>Файл</MonoLabel>
          {hasCurrentFile ? (
            <div style={{ marginTop: 8, border: `1px solid ${SYS.line}`, background: SYS.paper, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <a href={file.fileUrl} download target="_blank" rel="noreferrer" style={{ fontSize: 13, color: SYS.ink }}>✓ текущий файл · скачать</a>
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
                height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
              }}
            >
              {newFile ? (
                <span style={{ fontSize: 13, color: SYS.ink }}>✓ {newFile.name} {file.storagePath ? '(заменит текущий)' : ''}</span>
              ) : (
                <>
                  <span style={{ fontSize: 18, color: SYS.muted }}>⤒</span>
                  <span style={{ fontSize: 12, color: SYS.ink2 }}>{file.storagePath ? 'Перетащите файл, чтобы заменить' : 'Перетащите файл сюда или нажмите, чтобы загрузить'}</span>
                  <span style={{ fontSize: 10.5, color: SYS.muted }}>PDF, DWG, XLSX, MP4 · до {MAX_UPLOAD_MB} МБ</span>
                </>
              )}
            </div>
          )}
          {pickError && (
            <div style={{ marginTop: 8, fontSize: 11.5, color: SYS.red, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚠</span> {pickError}
            </div>
          )}
          <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={(e) => pickFile(e.target.files?.[0])} />
        </div>

        <SysLabeledField label="Название материала" value={name} onChange={(e: any) => setName(e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <SysLabeledField label="Альбом / версия" value={album} onChange={(e: any) => setAlbum(e.target.value)} />
          <SysLabeledField label="Вариант" value={variant} onChange={(e: any) => setVariant(e.target.value)} />
        </div>
        {objectCode === ARCHIVE_BLOCK_FIELD_OBJECT_CODE && (
          <SysLabeledField label="Блок" placeholder="напр. Блок А" value={block} onChange={(e: any) => setBlock(e.target.value)} />
        )}
        <SysLabeledField
          label="Дата создания материала"
          type="date"
          value={createdDate}
          onChange={(e: any) => setCreatedDate(e.target.value)}
        />
        <SysLabeledField
          label="Ссылка на диск (опционально)"
          placeholder="https://disk.yandex.ru/…"
          hint="если указана — файл откроется кнопкой «Посмотреть», без ссылки будет «Скачать» (если загружен файл)"
          value={driveUrl}
          onChange={(e: any) => setDriveUrl(e.target.value)}
        />

        <div style={{ borderTop: `1px solid ${SYS.line}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>видимость</MonoLabel>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: SYS.ink2, cursor: 'pointer' }}>
            <span
              onClick={() => setVisible((v) => !v)}
              style={{ width: 36, height: 20, background: visible ? SYS.ink : SYS.line, position: 'relative', flex: 'none' }}
            >
              <span style={{ position: 'absolute', top: 2, left: visible ? 18 : 2, width: 16, height: 16, background: '#fff', transition: 'left 0.15s' }} />
            </span>
            Показывать заказчику (Client)
          </label>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: SYS.ink2, cursor: 'pointer' }} onClick={() => setIsKey((k) => !k)}>
          <span style={{ width: 16, height: 16, border: `1px solid ${SYS.ink}`, background: isKey ? SYS.ink : 'transparent', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{isKey ? '✓' : ''}</span>
          Пометить как ключевой / утверждённый файл
        </label>
        {isKey && (
          <SysSelectField
            label="Состояние (для ключевого файла)"
            value={status}
            onChange={(e: any) => setStatus(e.target.value)}
            options={[{ value: 'утверждено', label: 'Утверждено' }, { value: 'в работе', label: 'В работе' }, { value: 'на согласовании', label: 'На согласовании' }]}
          />
        )}
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
