import { useState } from 'react';
import { SysButton, SysLabeledField, SysModal, SysSelectField } from '../form';
import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import { fromShortDate, toShortDate, type ArchiveFile, type KeyFileStatus } from '../../mocks/archive';
import { useArchive } from '../../state/ArchiveContext';
import { useToasts } from '../../state/ToastContext';

export const EditArchiveFileModal = ({ file, onClose }: { file: ArchiveFile; onClose: () => void }) => {
  const { updateFile } = useArchive();
  const { addToast } = useToasts();
  const [name, setName] = useState(file.name);
  const [album, setAlbum] = useState(file.album);
  const [variant, setVariant] = useState(file.variant);
  const [createdDate, setCreatedDate] = useState(fromShortDate(file.created));
  const [driveUrl, setDriveUrl] = useState(file.driveUrl ?? '');
  const [visible, setVisible] = useState(!file.clientHidden);
  const [isKey, setIsKey] = useState(!!file.key);
  const [status, setStatus] = useState<KeyFileStatus>(file.keyStatus ?? 'на согласовании');
  const [saving, setSaving] = useState(false);

  const canSubmit = name.trim() && createdDate.trim() && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    const { error } = await updateFile(file.id, {
      name: name.trim(),
      album: album.trim() || '—',
      variant: variant.trim() || '—',
      created: toShortDate(createdDate),
      driveUrl: driveUrl.trim() || undefined,
      clientHidden: !visible,
      key: isKey,
      keyStatus: isKey ? status : undefined,
    });
    setSaving(false);
    if (error) {
      addToast('error', `Не удалось сохранить: ${error}`);
      return;
    }
    addToast('success', `«${name.trim()}» обновлён.`);
    onClose();
  };

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
        <SysLabeledField label="Название материала" value={name} onChange={(e: any) => setName(e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <SysLabeledField label="Альбом / версия" value={album} onChange={(e: any) => setAlbum(e.target.value)} />
          <SysLabeledField label="Вариант" value={variant} onChange={(e: any) => setVariant(e.target.value)} />
        </div>
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
          <SysButton type="button" loading={saving} disabled={!canSubmit} onClick={submit}>Сохранить изменения</SysButton>
        </div>
      </div>
    </SysModal>
  );
};
