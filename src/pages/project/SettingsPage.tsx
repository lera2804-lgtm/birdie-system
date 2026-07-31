import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRef } from 'react';
import { MonoLabel, RoleBadge } from '../../components/primitives';
import { SysButton, SysLabeledField } from '../../components/form';
import { PageHeader } from '../../components/PageHeader';
import { SectionHead } from '../../components/SectionHead';
import { ConfirmModal } from '../../components/ConfirmModal';
import { SYS } from '../../theme/tokens';
import { useObjectRole } from '../../state/ObjectRoleContext';
import { seedMembers, type Member, type ProjectDetails } from '../../mocks/settings';
import { useProjectDetails } from '../../state/ProjectDetailsContext';
import { useToasts } from '../../state/ToastContext';
import { InviteMemberModal } from '../../components/settings/InviteMemberModal';

const SettingsCard = ({ title, sub, children, action }: { title: string; sub?: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <section style={{ border: `1px solid ${SYS.line}`, marginBottom: 24, background: SYS.paper }}>
    <SectionHead title={title} sub={sub} action={action} />
    {children}
  </section>
);

const MemberRow = ({ m, canManage, resent, onResend, onRevoke }: { m: Member; canManage: boolean; resent: boolean; onResend: () => void; onRevoke: () => void }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 220px 150px 90px', gap: 18, alignItems: 'center', padding: '16px 24px', borderTop: `1px solid ${SYS.line}`, background: SYS.paper }}>
    <RoleBadge role={m.role} size="sm" />
    <div style={{ fontSize: 14.5 }}>{m.name}</div>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: SYS.ink2 }}>{m.email}</div>
    <div>
      {m.status === 'active' ? (
        <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>активен</MonoLabel>
      ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', border: `1px solid ${SYS.red}`, color: SYS.red, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase' }}>приглашение отправлено</span>
      )}
    </div>
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
      {m.status === 'pending' && canManage && (
        <span onClick={onResend} style={{ fontSize: 11, color: SYS.ink, cursor: 'pointer', whiteSpace: 'nowrap' }}>{resent ? 'отправлено ✓' : 'повторить'}</span>
      )}
      {canManage && <span title="отозвать доступ" onClick={onRevoke} style={{ fontSize: 13, color: SYS.muted, cursor: 'pointer' }}>✕</span>}
    </div>
  </div>
);

export const SettingsPage = () => {
  const role = useObjectRole();
  const { projectCode } = useParams();
  const navigate = useNavigate();
  const { details: savedDetails, loading: detailsLoading, setDetails: commitDetails, archiveObject } = useProjectDetails();
  const { addToast } = useToasts();
  const fileRef = useRef<HTMLInputElement>(null);

  const [details, setDetails] = useState<ProjectDetails>(savedDetails);
  const [members, setMembers] = useState<Member[]>(() => seedMembers());
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [invitingOpen, setInvitingOpen] = useState(false);
  const [revoking, setRevoking] = useState<Member | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [resentIds, setResentIds] = useState<Set<string>>(new Set());

  // savedDetails loads asynchronously from Supabase — the draft above only
  // captures it once via useState, so re-sync once the real data arrives.
  useEffect(() => {
    if (!detailsLoading) setDetails(savedDetails);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailsLoading]);

  if (!role || !projectCode) return null;
  const canEdit = role === 'admin' || role === 'project_manager';

  const update = (patch: Partial<ProjectDetails>) => {
    setDetails((d) => ({ ...d, ...patch }));
    setDirty(true);
    setSavedAt(null);
  };

  const save = async () => {
    const { error } = await commitDetails(details);
    if (error) {
      addToast('error', `Не удалось сохранить: ${error}`);
      return;
    }
    setDirty(false);
    setSavedAt(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
    addToast('success', 'Настройки объекта сохранены.');
  };

  return (
    <main style={{ padding: '36px 56px 56px' }}>
      <PageHeader
        kicker="настройки проекта"
        title={projectCode}
        right={
          <>
            {canEdit && (
              savedAt && !dirty ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: SYS.ink2 }}><span style={{ color: SYS.red }}>✓</span> Сохранено {savedAt}</span>
              ) : (
                <span style={{ fontSize: 12.5, color: SYS.muted }}>Есть несохранённые изменения</span>
              )
            )}
            {canEdit && <SysButton tone="fill" full={false} small type="button" disabled={!dirty} onClick={save}>Сохранить</SysButton>}
            <RoleBadge role={role} size="sm" />
          </>
        }
      />

      <SettingsCard title="Реквизиты объекта" sub="отображаются в шапке и каталоге">
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <SysLabeledField label="Название" value={details.name} disabled={!canEdit} onChange={(e: any) => update({ name: e.target.value })} />
            <SysLabeledField label="Дата старта" type="date" value={details.startDate} disabled={!canEdit} onChange={(e: any) => update({ startDate: e.target.value })} />
          </div>
          <SysLabeledField label="Адрес" as="textarea" value={details.address} disabled={!canEdit} onChange={(e: any) => update({ address: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <SysLabeledField label="Посёлок" value={details.village} disabled={!canEdit} onChange={(e: any) => update({ village: e.target.value })} />
            <SysLabeledField label="Кадастровые номера" value={details.cadastre} disabled={!canEdit} onChange={(e: any) => update({ cadastre: e.target.value })} />
          </div>
          <SysLabeledField label="Контакты" value={details.contacts} disabled={!canEdit} onChange={(e: any) => update({ contacts: e.target.value })} />
        </div>
      </SettingsCard>

      <SettingsCard title="Фото-заставка" sub="показывается на карточке объекта в каталоге">
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'center' }}>
          <div style={{ height: 150, overflow: 'hidden', border: `1px solid ${SYS.line}` }}>
            <img src={details.cover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div>
            {canEdit && <SysButton tone="ghost" full={false} small type="button" onClick={() => fileRef.current?.click()}>Заменить фото</SysButton>}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) update({ cover: URL.createObjectURL(f) }); }} />
            <div style={{ marginTop: 10, fontSize: 11.5, color: SYS.muted, lineHeight: 1.5 }}>JPG или PNG · рекомендуемый размер 1200×800</div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Участники и роли"
        sub="приглашение по email · роль привязана к паре пользователь + проект"
        action={canEdit && <SysButton tone="fill" full={false} small type="button" onClick={() => setInvitingOpen(true)}>+ Пригласить участника</SysButton>}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 220px 150px 90px', gap: 18, padding: '12px 24px', background: SYS.paper }}>
          {['РОЛЬ', 'ИМЯ', 'EMAIL', 'СТАТУС', ''].map((h, i) => (
            <MonoLabel key={h} color={SYS.muted} style={{ fontSize: 9.5, textAlign: i === 4 ? 'right' : 'left' }}>{h}</MonoLabel>
          ))}
        </div>
        {members.map((m) => (
          <MemberRow
            key={m.id}
            m={m}
            canManage={canEdit}
            resent={resentIds.has(m.id)}
            onResend={() => setResentIds((prev) => new Set(prev).add(m.id))}
            onRevoke={() => setRevoking(m)}
          />
        ))}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${SYS.line}`, background: SYS.bg, fontSize: 11.5, color: SYS.muted, lineHeight: 1.5 }}>
          Object Manager и Client видят только то, что разрешено их ролью. Client — строго просмотр; Object Manager — только раздел «Отчёты».
        </div>
      </SettingsCard>

      {role === 'admin' && (
        <SettingsCard title="Опасная зона" sub="действия необратимы">
          <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13, color: SYS.ink2, lineHeight: 1.5, maxWidth: 520 }}>
              Архивировать объект — он скроется из каталога у всех ролей, но данные и файлы сохранятся. Восстановить может только Admin.
            </div>
            <button
              type="button"
              onClick={() => setArchiving(true)}
              style={{ padding: '11px 22px', background: 'transparent', color: SYS.red, border: `1px solid ${SYS.red}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Архивировать объект
            </button>
          </div>
        </SettingsCard>
      )}

      {invitingOpen && (
        <InviteMemberModal
          onClose={() => setInvitingOpen(false)}
          onInvite={(member) => setMembers((prev) => [...prev, member])}
        />
      )}

      {revoking && (
        <ConfirmModal
          title="Отозвать доступ?"
          confirmLabel="Отозвать доступ"
          message={`${revoking.name !== '—' ? revoking.name : revoking.email} (${revoking.role === 'client' ? 'Client' : revoking.role === 'project_manager' ? 'Project Manager' : 'Object Manager'}) потеряет доступ к объекту ${projectCode} сразу же. Пригласить снова можно будет по email.`}
          onCancel={() => setRevoking(null)}
          onConfirm={() => {
            setMembers((prev) => prev.filter((m) => m.id !== revoking.id));
            addToast('info', `Доступ для ${revoking.name !== '—' ? revoking.name : revoking.email} отозван.`);
            setRevoking(null);
          }}
        />
      )}

      {archiving && (
        <ConfirmModal
          kicker="опасная зона · подтверждение"
          title="Архивировать объект?"
          confirmLabel="Архивировать"
          message={`${projectCode} скроется из каталога у всех ролей. Данные, отчёты и файлы сохранятся. Восстановить объект сможет только Admin.`}
          onCancel={() => setArchiving(false)}
          onConfirm={async () => {
            const { error } = await archiveObject();
            if (error) { addToast('error', `Не удалось архивировать: ${error}`); return; }
            addToast('success', `${projectCode} архивирован и скрыт из каталога.`);
            navigate('/');
          }}
        />
      )}
    </main>
  );
};
