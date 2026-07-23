import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonoLabel, OrlovMark, PhotoPlaceholder, RoleBadge } from '../../components/primitives';
import { SysButton } from '../../components/form';
import { SYS } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { CATALOG_HEADING, projectsForRole, type CatalogProject } from '../../mocks/catalog';
import { useArchivedObjects } from '../../state/ArchivedObjectsContext';
import { NewProjectModal } from './NewProjectModal';

const CatalogTopbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '22px 48px', borderBottom: `1px solid ${SYS.line}`, background: SYS.paper,
      }}
    >
      <OrlovMark size={12} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <RoleBadge role={user.role} size="sm" />
        <span style={{ width: 1, height: 16, background: SYS.line }} />
        <MonoLabel color={SYS.ink}>{user.name}</MonoLabel>
        <a
          href="/login"
          onClick={(e) => { e.preventDefault(); logout(); navigate('/login'); }}
          style={{ fontSize: 12, color: SYS.muted, textDecoration: 'none' }}
        >
          выход ↗
        </a>
      </div>
    </div>
  );
};

const CatalogCard = ({ p }: { p: CatalogProject }) => {
  const navigate = useNavigate();
  return (
    <div style={{ background: SYS.paper, border: `1px solid ${SYS.line}`, display: 'flex', flexDirection: 'column' }}>
      {p.cover ? (
        <div style={{ height: 168, overflow: 'hidden' }}>
          <img src={p.cover} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ) : (
        <PhotoPlaceholder label={p.code} height={168} />
      )}
      <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.3 }}>{p.title}</div>
          <div style={{ marginTop: 6, fontSize: 12.5, color: SYS.muted, lineHeight: 1.4 }}>{p.address}</div>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${SYS.line}`, display: 'flex', justifyContent: 'flex-end' }}>
          <a
            href={`/${p.code}`}
            onClick={(e) => { e.preventDefault(); navigate(`/${p.code}`); }}
            style={{ fontSize: 13, color: SYS.ink, textDecoration: 'none', fontWeight: 500 }}
          >
            Открыть →
          </a>
        </div>
      </div>
    </div>
  );
};

const CatalogSkeleton = () => (
  <div style={{ background: SYS.paper, border: `1px solid ${SYS.line}` }}>
    <div style={{ height: 168, background: '#eae7dc' }} />
    <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ height: 18, width: '55%', background: '#eae7dc' }} />
      <div style={{ height: 13, width: '90%', background: '#f0eee9' }} />
      <div style={{ height: 13, width: '70%', background: '#f0eee9' }} />
      <div style={{ marginTop: 8, paddingTop: 14, borderTop: `1px solid ${SYS.line}`, height: 13, width: '30%', background: '#f0eee9', alignSelf: 'flex-end' }} />
    </div>
  </div>
);

const CatalogCardMobile = ({ p }: { p: CatalogProject }) => {
  const navigate = useNavigate();
  return (
    <a
      href={`/${p.code}`}
      onClick={(e) => { e.preventDefault(); navigate(`/${p.code}`); }}
      style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: `1px solid ${SYS.line}`, textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{ width: 64, height: 64, flex: 'none', overflow: 'hidden', background: '#eae7dc' }}>
        {p.cover && <img src={p.cover} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
        <div style={{ fontSize: 15.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{p.title}</div>
        <div style={{ fontSize: 11.5, color: SYS.muted, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
          {p.address}
        </div>
      </div>
      <span style={{ alignSelf: 'center', fontSize: 15, color: SYS.muted }}>→</span>
    </a>
  );
};

export const CatalogPage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { archivedCodes } = useArchivedObjects();
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [projects, setProjects] = useState<CatalogProject[]>([]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const t = setTimeout(() => {
      setProjects(projectsForRole(user.role).filter((p) => !archivedCodes.has(p.code)));
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, archivedCodes]);

  if (!user) return null;
  const heading = CATALOG_HEADING[user.role];

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: SYS.paper, color: SYS.ink, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${SYS.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <OrlovMark size={10} />
            <RoleBadge role={user.role} size="sm" />
          </div>
          <div style={{ marginTop: 16 }}>
            <MonoLabel color={SYS.red} style={{ fontSize: 10 }}>каталог объектов</MonoLabel>
            <h1 style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em' }}>{heading}</h1>
            <div style={{ marginTop: 6, fontSize: 12, color: SYS.muted }}>{user.name}</div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }} className="sys-modal-scroll">
          {loading ? (
            <div style={{ padding: 20, fontSize: 12.5, color: SYS.muted }}>Загрузка…</div>
          ) : (
            projects.map((p) => <CatalogCardMobile key={p.code} p={p} />)
          )}
        </div>

        {!loading && projects.length === 1 && (
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${SYS.line}`, fontSize: 11.5, color: SYS.muted, lineHeight: 1.45 }}>
            У вас один объект — при следующем входе система откроет его сразу, минуя каталог.
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: SYS.bg, color: SYS.ink }}>
      <CatalogTopbar />
      <div style={{ padding: '40px 48px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <MonoLabel color={SYS.red}>каталог проектов</MonoLabel>
            <h1 style={{ margin: '10px 0 0', fontSize: 34, fontWeight: 500, letterSpacing: '-0.01em' }}>{heading}</h1>
          </div>
          {user.role === 'admin' && (
            <SysButton tone="fill" full={false} small type="button" onClick={() => setModalOpen(true)}>
              + Новый объект
            </SysButton>
          )}
        </div>

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {[0, 1, 2, 3].map((i) => <CatalogSkeleton key={i} />)}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div style={{ border: `1px dashed ${SYS.line}`, background: SYS.paper, padding: '72px 40px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, border: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: SYS.muted, margin: '0 auto 20px' }}>◇</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 500, letterSpacing: '-0.008em' }}>
              {user.role === 'admin' ? 'В системе пока нет объектов' : 'Пока нет доступных объектов'}
            </h2>
            <p style={{ margin: '0 auto 24px', fontSize: 14, color: SYS.muted, lineHeight: 1.55, maxWidth: 440 }}>
              {user.role === 'admin'
                ? 'Создайте первый объект — задайте адрес, назначьте менеджера проекта и пригласите участников.'
                : 'Как только вас добавят на объект, он появится здесь. Обратитесь к менеджеру проекта, если ждёте доступ.'}
            </p>
            {user.role === 'admin' && (
              <SysButton tone="fill" full={false} type="button" onClick={() => setModalOpen(true)}>+ Создать первый объект</SysButton>
            )}
          </div>
        )}

        {!loading && projects.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              {projects.map((p) => <CatalogCard key={p.code} p={p} />)}
            </div>
            {user.role === 'client' && projects.length === 1 && (
              <div style={{ marginTop: 28, padding: '16px 20px', border: `1px solid ${SYS.line}`, background: SYS.paper, fontSize: 12.5, color: SYS.muted, lineHeight: 1.5, maxWidth: 560 }}>
                У вас один проект — при следующем входе система сразу откроет его, минуя каталог.
              </div>
            )}
          </>
        )}
      </div>

      {modalOpen && (
        <NewProjectModal
          onClose={() => setModalOpen(false)}
          onCreate={(p) => { setProjects((prev) => [...prev, p]); setModalOpen(false); }}
        />
      )}
    </div>
  );
};
