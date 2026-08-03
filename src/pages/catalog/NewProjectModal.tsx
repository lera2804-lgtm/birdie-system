import { useRef, useState } from 'react';
import { SysButton, SysLabeledField, SysModal } from '../../components/form';
import { MonoLabel, RoleBadge } from '../../components/primitives';
import { SYS, type Role } from '../../theme/tokens';
import { supabase } from '../../lib/supabaseClient';
import { uploadCover } from '../../lib/storage';
import { inviteMember } from '../../lib/invite';
import { useToasts } from '../../state/ToastContext';

interface Person {
  name: string;
  email: string;
}

const ROLE_GROUPS_INITIAL: { role: Role; hint: string; people: Person[] }[] = [
  { role: 'project_manager', hint: 'управляет проектами и составом работ', people: [{ name: '', email: '' }] },
  { role: 'site_manager', hint: 'ведёт отчёты с площадки', people: [{ name: '', email: '' }] },
  { role: 'client', hint: 'только просмотр', people: [{ name: '', email: '' }] },
];

const AssignRoleRow = ({
  role, first, person, onChangeName, onChangeEmail, onRemove,
}: {
  role: Role; first: boolean; person: Person;
  onChangeName: (name: string) => void; onChangeEmail: (email: string) => void; onRemove: () => void;
}) => (
  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 20px', gap: 12, alignItems: 'center', padding: '10px 0', borderTop: `1px solid ${SYS.line}` }}>
    {first ? <RoleBadge role={role} size="sm" /> : <span />}
    <input
      placeholder="Имя (опционально)"
      value={person.name}
      onChange={(e) => onChangeName(e.target.value)}
      style={{ border: `1px solid ${SYS.line}`, background: SYS.paper, padding: '11px 14px', fontFamily: 'inherit', fontSize: 14, color: SYS.ink, outline: 'none', minWidth: 0 }}
    />
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${SYS.line}`, background: SYS.paper, padding: '11px 14px' }}>
      <span style={{ color: SYS.muted, fontSize: 14 }}>✉</span>
      <input
        placeholder="Email для приглашения"
        value={person.email}
        onChange={(e) => onChangeEmail(e.target.value)}
        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 14, color: SYS.ink, minWidth: 0 }}
      />
    </div>
    <span title="удалить" onClick={onRemove} style={{ fontSize: 13, color: SYS.muted, cursor: 'pointer', textAlign: 'right' }}>✕</span>
  </div>
);

export const NewProjectModal = ({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) => {
  const { addToast } = useToasts();
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [cadastre, setCadastre] = useState('');
  const [startDate, setStartDate] = useState('');
  const [handoverDate, setHandoverDate] = useState('');
  const [contacts, setContacts] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [groups, setGroups] = useState(ROLE_GROUPS_INITIAL);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const [dragOver, setDragOver] = useState(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    onFile(e.dataTransfer.files?.[0]);
  };

  const updatePersonName = (gi: number, pi: number, name: string) => {
    setGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, people: g.people.map((p, j) => (j === pi ? { ...p, name } : p)) } : g)));
  };
  const updatePersonEmail = (gi: number, pi: number, email: string) => {
    setGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, people: g.people.map((p, j) => (j === pi ? { ...p, email } : p)) } : g)));
  };
  const removePerson = (gi: number, pi: number) => {
    setGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, people: g.people.filter((_, j) => j !== pi) } : g)));
  };
  const addPerson = (gi: number) => {
    setGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, people: [...g.people, { name: '', email: '' }] } : g)));
  };

  const canSubmit = title.trim().length > 0 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const code = title.trim().toUpperCase().replace(/\s+/g, '-');

    let coverUrl: string | null = null;
    if (coverFile) {
      const { url, error: uploadError } = await uploadCover(code, coverFile);
      if (uploadError) {
        setSubmitting(false);
        addToast('error', `Не удалось загрузить фото: ${uploadError}`);
        return;
      }
      coverUrl = url;
    }

    const { error } = await supabase.from('objects').insert({
      code,
      title: title.trim(),
      address: address.trim(),
      cadastre: cadastre.trim(),
      contacts: contacts.trim(),
      start_date: startDate || null,
      cover_url: coverUrl,
    });
    if (error) {
      setSubmitting(false);
      addToast('error', `Не удалось создать объект: ${error.message}`);
      return;
    }

    const invites = groups.flatMap((g) => g.people.filter((p) => p.email.trim()).map((p) => ({ role: g.role, email: p.email.trim(), name: p.name.trim() || undefined })));
    let failed = 0;
    for (const inv of invites) {
      const { error: inviteError } = await inviteMember(code, inv.role, inv.email, inv.name);
      if (inviteError) failed++;
    }

    setSubmitting(false);
    onCreate();
    if (invites.length === 0) {
      addToast('success', `Объект «${title.trim()}» создан.`);
    } else if (failed === 0) {
      addToast('success', `Объект создан, приглашения отправлены (${invites.length}).`);
    } else {
      addToast('error', `Объект создан, но ${failed} из ${invites.length} приглашений не отправились — пригласите их позже в настройках объекта.`);
    }
  };

  return (
    <SysModal width={640} onClose={onClose}>
      <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <MonoLabel color={SYS.red}>admin · новый объект</MonoLabel>
          <h2 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 500, letterSpacing: '-0.008em' }}>Создание объекта</h2>
        </div>
        <span onClick={onClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>✕</span>
      </div>

      <div style={{ padding: '26px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <SysLabeledField label="Название объекта" placeholder="напр. Birdie-10" value={title} onChange={(e: any) => setTitle(e.target.value)} />

        <SysLabeledField
          label="Адрес"
          as="textarea"
          placeholder="напр. МО, Одинцовский р-н, р.п. Заречье, «Кунцево-2», уч. 10"
          value={address}
          onChange={(e: any) => setAddress(e.target.value)}
        />

        <SysLabeledField
          label="Кадастровые номера"
          placeholder="через запятую, если несколько"
          value={cadastre}
          onChange={(e: any) => setCadastre(e.target.value)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <SysLabeledField label="Дата старта" type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} />
          <SysLabeledField label="Плановая сдача" type="date" hint="можно уточнить позже" value={handoverDate} onChange={(e: any) => setHandoverDate(e.target.value)} />
        </div>

        <div>
          <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>Фото-заставка объекта</MonoLabel>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{
              marginTop: 8, border: `1px dashed ${dragOver ? SYS.red : SYS.line}`, background: coverPreview ? undefined : (dragOver ? '#fbf1ee' : '#f7f6f2'),
              height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              cursor: 'pointer', overflow: 'hidden', position: 'relative',
            }}
          >
            {coverPreview ? (
              <img src={coverPreview} alt={coverFile?.name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <span style={{ fontSize: 20, color: SYS.muted }}>⤒</span>
                <span style={{ fontSize: 12.5, color: SYS.ink2 }}>Перетащите фото сюда или нажмите, чтобы загрузить</span>
                <span style={{ fontSize: 11, color: SYS.muted }}>JPG, PNG · показывается в каталоге объектов</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files?.[0])} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <MonoLabel color={SYS.ink} style={{ fontSize: 10 }}>участники и роли</MonoLabel>
          </div>
          <div style={{ fontSize: 11.5, color: SYS.muted, lineHeight: 1.4, marginBottom: 4 }}>
            Кому и с каким доступом открыть объект — укажите email, приглашения отправятся при создании объекта. Можно назначить позже.
          </div>
          <div>
            {groups.map((g, gi) => (
              <div key={g.role} style={{ marginBottom: 4 }}>
                {g.people.map((p, pi) => (
                  <AssignRoleRow
                    key={pi}
                    role={g.role}
                    first={pi === 0}
                    person={p}
                    onChangeName={(name) => updatePersonName(gi, pi, name)}
                    onChangeEmail={(email) => updatePersonEmail(gi, pi, email)}
                    onRemove={() => removePerson(gi, pi)}
                  />
                ))}
                <div style={{ padding: '8px 0 14px 162px' }}>
                  <span onClick={() => addPerson(gi)} style={{ fontSize: 11, color: SYS.ink, cursor: 'pointer' }}>
                    + добавить ещё {g.role === 'project_manager' ? 'Project Manager' : g.role === 'site_manager' ? 'Object Manager' : 'Client'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <SysLabeledField label="Контакты заказчика" placeholder="имя, телефон или email — опционально" value={contacts} onChange={(e: any) => setContacts(e.target.value)} />
      </div>

      <div style={{ padding: '20px 32px 28px', display: 'flex', gap: 10, borderTop: `1px solid ${SYS.line}` }}>
        <SysButton tone="ghost" full={false} small type="button" onClick={onClose}>Отмена</SysButton>
        <div style={{ flex: 1 }}>
          <SysButton type="button" disabled={!canSubmit} loading={submitting} onClick={submit}>Создать объект</SysButton>
        </div>
      </div>
    </SysModal>
  );
};
