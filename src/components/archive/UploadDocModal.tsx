import { useRef, useState } from 'react';
import { SysButton, SysLabeledField, SysModal, SysSelectField } from '../form';
import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import { ALLOWED_DOC_EXTENSIONS, MAX_UPLOAD_MB, toShortDate, type ArchiveFile, type KeyFileStatus } from '../../mocks/archive';
import { useArchive } from '../../state/ArchiveContext';
import { useToasts } from '../../state/ToastContext';
import { uploadDocFile } from '../../lib/storage';

type PickState = 'idle' | 'picked' | 'error';

export const UploadDocModal = ({ objectCode, onClose }: { objectCode: string; onClose: () => void }) => {
  const { addFile } = useArchive();
  const { addToast } = useToasts();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pickState, setPickState] = useState<PickState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [fileExt, setFileExt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [title, setTitle] = useState('');
  const [album, setAlbum] = useState('');
  const [variant, setVariant] = useState('');
  const [createdDate, setCreatedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [driveUrl, setDriveUrl] = useState('');
  const [visible, setVisible] = useState(true);
  const [isKey, setIsKey] = useState(false);
  const [status, setStatus] = useState<KeyFileStatus>('на согласовании');

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    const tooBig = f.size > MAX_UPLOAD_MB * 1024 * 1024;
    if (!ALLOWED_DOC_EXTENSIONS.includes(ext) || tooBig) {
      setFile(null);
      setPickState('error');
      setErrorMsg(`${f.name} — ${tooBig ? `размер больше ${MAX_UPLOAD_MB} МБ` : 'неподдерживаемый формат'}. Разрешены PDF, DWG, XLSX, MP4.`);
      return;
    }
    setFile(f);
    setFileExt(ext.toUpperCase());
    setPickState('picked');
  };

  const [dragOver, setDragOver] = useState(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = title.trim() && createdDate.trim() && (pickState === 'picked' || driveUrl.trim()) && !submitting && !uploading;

  const submit = async () => {
    if (!canSubmit) return;
    let storagePath: string | undefined;
    if (file) {
      setUploading(true);
      const { path, error } = await uploadDocFile(objectCode, file);
      setUploading(false);
      if (error || !path) {
        addToast('error', `Не удалось загрузить файл: ${error}`);
        return;
      }
      storagePath = path;
    }
    const archiveFile: ArchiveFile = {
      id: `f${Date.now()}`,
      type: file ? fileExt : 'ССЫЛКА',
      name: title.trim(),
      album: album.trim() || '—',
      variant: variant.trim() || '—',
      created: toShortDate(createdDate),
      uploaded: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      key: isKey,
      keyStatus: isKey ? status : undefined,
      clientHidden: !visible,
      driveUrl: driveUrl.trim() || undefined,
      storagePath,
    };
    setSubmitting(true);
    const { error } = await addFile(archiveFile);
    setSubmitting(false);
    if (error) {
      addToast('error', `Не удалось добавить файл: ${error}`);
      return;
    }
    addToast('success', `«${archiveFile.name}» добавлен в архив.`);
    onClose();
  };

  return (
    <SysModal width={640} onClose={onClose}>
      <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <MonoLabel color={SYS.red}>архив · загрузка</MonoLabel>
          <h2 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 500, letterSpacing: '-0.008em' }}>Новый материал</h2>
        </div>
        <span onClick={onClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>✕</span>
      </div>

      <div style={{ padding: '26px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>Файл</MonoLabel>
          {pickState === 'error' ? (
            <div style={{ marginTop: 8, border: `1px solid ${SYS.red}`, background: '#fbeae6', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: SYS.red, fontSize: 13, marginBottom: 6 }}><span>⚠</span> Файл не выбран</div>
              <div style={{ fontSize: 12, color: SYS.ink2, lineHeight: 1.45 }}>{errorMsg}</div>
              <div onClick={() => fileRef.current?.click()} style={{ marginTop: 10, fontSize: 12, color: SYS.ink, textDecoration: 'underline', cursor: 'pointer' }}>Выбрать другой файл</div>
            </div>
          ) : (
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
              {pickState === 'picked' && file ? (
                <span style={{ fontSize: 13, color: SYS.ink }}>✓ {file.name}</span>
              ) : (
                <>
                  <span style={{ fontSize: 20, color: SYS.muted }}>⤒</span>
                  <span style={{ fontSize: 12.5, color: SYS.ink2 }}>Перетащите файл сюда или нажмите, чтобы загрузить</span>
                  <span style={{ fontSize: 11, color: SYS.muted }}>PDF, DWG, XLSX, MP4 · до {MAX_UPLOAD_MB} МБ</span>
                </>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={(e) => pickFile(e.target.files?.[0])} />
        </div>

        <SysLabeledField label="Название материала" placeholder="напр. Landscape concept / ORLOV.RED" value={title} onChange={(e: any) => setTitle(e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <SysLabeledField label="Альбом / версия" placeholder="напр. 03" value={album} onChange={(e: any) => setAlbum(e.target.value)} />
          <SysLabeledField label="Вариант" placeholder="напр. V5" value={variant} onChange={(e: any) => setVariant(e.target.value)} />
        </div>
        <SysLabeledField
          label="Дата создания материала"
          type="date"
          hint="по этой дате файл встанет в общий список; дата загрузки проставляется автоматически"
          value={createdDate}
          onChange={(e: any) => setCreatedDate(e.target.value)}
        />
        <SysLabeledField
          label="Ссылка на диск (опционально)"
          placeholder="https://disk.yandex.ru/…"
          hint="если указана ссылка — файл откроется кнопкой «Посмотреть», без ссылки будет «Скачать»"
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
          <div style={{ fontSize: 11, color: SYS.muted, lineHeight: 1.45 }}>Выключите, чтобы файл видели только команда и менеджеры (напр. черновики и внутренние сметы).</div>
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
          <SysButton type="button" loading={uploading || submitting} disabled={!canSubmit} onClick={submit}>
            {uploading ? 'Загрузка…' : 'Загрузить в архив'}
          </SysButton>
        </div>
      </div>
    </SysModal>
  );
};
