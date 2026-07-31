import { Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { MonoLabel, OrlovMark, RoleBadge } from '../../components/primitives';
import { SYS, type Role } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';
import { NAV_ITEMS } from '../../mocks/project';
import { NoAccessPage } from '../system/NoAccessPage';
import { StagesProvider } from '../../state/StagesContext';
import { ReportsProvider } from '../../state/ReportsContext';
import { ArchiveProvider } from '../../state/ArchiveContext';
import { ProjectDetailsProvider, useProjectDetails } from '../../state/ProjectDetailsContext';
import { ObjectRoleProvider, useResolveObjectRole } from '../../state/ObjectRoleContext';

const activeIdFromPath = (pathname: string, projectCode: string) => {
  const rest = pathname.replace(`/${projectCode}`, '').replace(/^\//, '').split('/')[0];
  return NAV_ITEMS.find((it) => it.path === rest)?.id ?? null;
};

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: SYS.paper, color: SYS.muted, fontSize: 13 }}>
    Загрузка…
  </div>
);

const SidebarInfo = () => {
  const { details } = useProjectDetails();
  const [phone, email] = (details.contacts || '').split(' · ');
  const hasAbout = details.address || details.cadastre;
  const hasContacts = phone || email;
  if (!hasAbout && !hasContacts) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {hasAbout && (
        <div>
          <MonoLabel color={SYS.red} style={{ fontSize: 10 }}>о проекте</MonoLabel>
          {details.address && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Адрес:</div>
              <div style={{ marginTop: 4, fontSize: 12, color: SYS.ink2, lineHeight: 1.45 }}>{details.address}</div>
            </div>
          )}
          {details.cadastre && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Кадастровый номер:</div>
              <div style={{ marginTop: 4, fontSize: 12, color: SYS.ink2, lineHeight: 1.45 }}>{details.cadastre}</div>
            </div>
          )}
        </div>
      )}
      {hasContacts && (
        <div>
          <MonoLabel color={SYS.red} style={{ fontSize: 10 }}>контакты</MonoLabel>
          {phone && <div style={{ marginTop: 12, fontSize: 13, fontWeight: 500 }}>{phone}</div>}
          {email && <div style={{ marginTop: 4, fontSize: 12, color: SYS.ink2 }}>{email}</div>}
        </div>
      )}
    </div>
  );
};

const ProjectSidebar = ({ active, role }: { active: string | null; role: Role }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { projectCode } = useParams();
  const { details } = useProjectDetails();
  const items = NAV_ITEMS.filter((it) => it.roles.includes(role));

  return (
    <aside
      style={{
        width: 240, background: SYS.paper, borderRight: `1px solid ${SYS.line}`,
        padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 28, color: SYS.ink,
      }}
    >
      <OrlovMark size={9} />

      <div style={{ paddingTop: 16, borderTop: `1px solid ${SYS.line}` }}>
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
          style={{ display: 'inline-block', textDecoration: 'none', cursor: 'pointer' }}
        >
          <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>← назад к объектам</MonoLabel>
        </a>
        <div style={{ marginTop: 8, fontSize: 17, fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.3 }}>{projectCode}</div>
        <div style={{ marginTop: 4, fontSize: 11.5, color: SYS.muted, lineHeight: 1.4 }}>{details.address}</div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, margin: '0 -24px' }}>
        {items.map((it) => {
          const on = it.id === active;
          return (
            <a
              key={it.id}
              href={`/${projectCode}/${it.path}`}
              onClick={(e) => { e.preventDefault(); navigate(`/${projectCode}/${it.path}`); }}
              style={{
                display: 'grid', gridTemplateColumns: '30px 1fr', alignItems: 'center', columnGap: 12,
                padding: '15px 24px', paddingLeft: 22,
                background: on ? SYS.bg : 'transparent',
                color: on ? SYS.ink : SYS.ink2,
                borderLeft: on ? `2px solid ${SYS.red}` : '2px solid transparent',
                textDecoration: 'none', cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: on ? SYS.red : SYS.muted }}>{it.code}</span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: on ? 500 : 400 }}>{it.label}</div>
                <div style={{ marginTop: 2, fontSize: 11, color: on ? SYS.ink2 : SYS.muted }}>{it.sub}</div>
              </div>
            </a>
          );
        })}
      </nav>

      <SidebarInfo />

      <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <RoleBadge role={role} size="sm" />
        <a href="/login" onClick={(e) => { e.preventDefault(); logout(); navigate('/login'); }} style={{ fontSize: 11, color: SYS.muted, textDecoration: 'none' }}>выход ↗</a>
      </div>
    </aside>
  );
};

export const ProjectShell = () => {
  const { user } = useAuth();
  const { projectCode } = useParams();
  const location = useLocation();
  const { role, loading } = useResolveObjectRole(projectCode);

  if (!user) return null;
  if (!projectCode) return <Navigate to="/" replace />;
  if (loading) return <LoadingScreen />;
  // Not a member of this object (or it doesn't exist) — don't distinguish
  // the two, just send them back to what they can actually see.
  if (!role) return <Navigate to="/" replace />;

  const active = activeIdFromPath(location.pathname, projectCode);
  const item = NAV_ITEMS.find((it) => it.id === active);
  if (item && !item.roles.includes(role)) return <NoAccessPage role={role} />;

  const roleValue = { role, loading };

  // Object Manager's whole workflow is mobile, full-screen pages with their
  // own chrome (see sys-reports.jsx Sys_ReportsMobile) — no desktop sidebar.
  if (role === 'site_manager') {
    return (
      <ObjectRoleProvider value={roleValue}>
        <StagesProvider projectCode={projectCode}>
          <ReportsProvider projectCode={projectCode}>
            <Outlet />
          </ReportsProvider>
        </StagesProvider>
      </ObjectRoleProvider>
    );
  }

  return (
    <ObjectRoleProvider value={roleValue}>
      <StagesProvider projectCode={projectCode}>
        <ReportsProvider projectCode={projectCode}>
          <ArchiveProvider projectCode={projectCode}>
            <ProjectDetailsProvider projectCode={projectCode}>
              <div style={{ width: '100%', minHeight: '100vh', display: 'grid', gridTemplateColumns: '240px 1fr', background: SYS.bg, color: SYS.ink }}>
                <ProjectSidebar active={active} role={role} />
                <Outlet />
              </div>
            </ProjectDetailsProvider>
          </ArchiveProvider>
        </ReportsProvider>
      </StagesProvider>
    </ObjectRoleProvider>
  );
};

export const ProjectIndexRedirect = () => {
  const { user } = useAuth();
  const { projectCode } = useParams();
  const { role, loading } = useResolveObjectRole(projectCode);
  if (!user || loading) return null;
  const first = NAV_ITEMS.find((it) => role && it.roles.includes(role));
  return <Navigate to={`/${projectCode}/${first?.path ?? 'reports'}`} replace />;
};
