import { useMemo, useState } from 'react';
import { MonoLabel, PhotoPlaceholder } from '../../components/primitives';
import { SysButton } from '../../components/form';
import { SYS } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';
import { useArchive } from '../../state/ArchiveContext';
import type { ArchiveFile } from '../../mocks/archive';
import { UploadDocModal } from '../../components/archive/UploadDocModal';
import { UploadMediaModal } from '../../components/archive/UploadMediaModal';
import { ConfirmDeleteModal } from '../../components/reports/ConfirmDeleteModal';

const ARCH_COLS = '48px 64px 1fr 130px 110px 110px 110px 150px';
const PAGE_SIZE = 15;

const SectionHead = ({ title, count, action }: { title: string; count: string; action?: React.ReactNode }) => (
  <div style={{ padding: '30px 28px', borderBottom: `1px solid ${SYS.line}`, background: SYS.bg, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 30, fontWeight: 500, letterSpacing: '-0.01em' }}>{title}</h2>
      <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: SYS.ink2 }}>{count}</div>
    </div>
    {action}
  </div>
);

const EmptySection = ({ icon, title, hint, cta }: { icon: string; title: string; hint: string; cta?: React.ReactNode }) => (
  <section style={{ border: `1px dashed ${SYS.line}`, background: SYS.paper, padding: '72px 40px', textAlign: 'center' }}>
    <div style={{ width: 52, height: 52, border: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: SYS.muted, margin: '0 auto 20px' }}>{icon}</div>
    <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 500, letterSpacing: '-0.008em' }}>{title}</h2>
    <p style={{ margin: '0 auto 24px', fontSize: 14, color: SYS.muted, lineHeight: 1.55, maxWidth: 440 }}>{hint}</p>
    {cta}
  </section>
);

export const ArchivePage = () => {
  const { user } = useAuth();
  const { keyFiles, allFiles, media, removeFile, toggleHidden, removeMedia } = useArchive();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Все типы');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [deletingFile, setDeletingFile] = useState<ArchiveFile | null>(null);

  if (!user) return null;
  const canManage = user.role === 'admin' || user.role === 'project_manager';

  const scopedFiles = canManage ? allFiles : allFiles.filter((f) => !f.clientHidden);
  const types = useMemo(() => ['Все типы', ...Array.from(new Set(scopedFiles.map((f) => f.type)))], [scopedFiles]);
  const filtered = scopedFiles.filter((f) => {
    if (typeFilter !== 'Все типы' && f.type !== typeFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return f.name.toLowerCase().includes(q) || f.album.toLowerCase().includes(q) || f.variant.toLowerCase().includes(q);
  });
  const shown = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > shown.length;

  const isEmpty = allFiles.length === 0 && media.length === 0;

  return (
    <main style={{ padding: '36px 56px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
        <MonoLabel color={SYS.red}>документы</MonoLabel>
        <span style={{ flex: 1, height: 1, background: SYS.line }} />
        <MonoLabel color={SYS.muted}>все версии файлов</MonoLabel>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 40, marginBottom: 44, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 640 }}>
          <h1 style={{ margin: 0, fontSize: 52, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.02 }}>Архив материалов</h1>
          <p style={{ marginTop: 20, fontSize: 15, lineHeight: 1.5, color: SYS.ink2 }}>
            Здесь хранится каждая итерация проекта — концепции, чертежи, сметы и видео.
            Файлы лежат на Яндекс.Диске компании; вы можете открыть их в облаке.
          </p>
        </div>
        <div style={{ display: 'flex', border: `1px solid ${SYS.line}`, background: SYS.paper, borderBottom: `3px solid ${SYS.line}` }}>
          {[
            ['Всего', String(allFiles.length).padStart(2, '0')],
            ['Утверждённые', String(keyFiles.length)],
            ['Видео', String(media.filter((m) => m.kind === 'Video').length)],
          ].map(([l, v], i, arr) => (
            <div key={l} style={{ padding: '16px 28px 18px', borderRight: i < arr.length - 1 ? `1px solid ${SYS.line}` : 'none' }}>
              <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>{l}</MonoLabel>
              <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em', textAlign: 'center' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <EmptySection
            icon="□"
            title={canManage ? 'В архиве пока нет файлов' : 'Архив пока пуст'}
            hint={canManage ? 'Загрузите первый документ — чертёж, смету, концепцию. Файлы хранятся на Яндекс.Диске компании.' : 'Как только команда загрузит документы по проекту, они появятся здесь.'}
            cta={canManage && <SysButton tone="fill" full={false} small type="button" onClick={() => setUploadingDoc(true)}>+ Загрузить первый файл</SysButton>}
          />
          <EmptySection
            icon="▷"
            title={canManage ? 'Мультимедиа ещё нет' : 'Медиафайлов пока нет'}
            hint={canManage ? 'Добавьте видео, облёт дроном или 3D-тур — они откроются прямо в кабинете.' : 'Как только команда добавит видео или 3D-туры, они появятся здесь.'}
            cta={canManage && <SysButton tone="fill" full={false} small type="button" onClick={() => setUploadingMedia(true)}>+ Добавить медиафайл</SysButton>}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {keyFiles.length > 0 && (
            <section style={{ border: `1px solid ${SYS.line}` }}>
              <SectionHead title="Ключевые файлы" count={`${keyFiles.length} файл`} />
              {keyFiles.map((f) => (
                <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 150px 170px 120px 150px', gap: 20, alignItems: 'center', padding: '22px 28px', background: SYS.paper }}>
                  <MonoLabel color={SYS.red} style={{ fontSize: 12 }}>{f.id.slice(-2).toUpperCase()}</MonoLabel>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{f.name}</div>
                  <MonoLabel color={SYS.red} style={{ fontSize: 11 }}>{f.status}</MonoLabel>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: SYS.ink2 }}>{f.album}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: SYS.muted, textAlign: 'right' }}>{f.date}</div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ padding: '11px 22px', background: 'transparent', color: SYS.ink, border: `1px solid ${SYS.line}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Скачать</span>
                  </div>
                </div>
              ))}
            </section>
          )}

          <section style={{ border: `1px solid ${SYS.line}` }}>
            <SectionHead
              title="Все материалы" count={`${allFiles.length} файлов`}
              action={canManage && <SysButton tone="fill" full={false} small type="button" onClick={() => setUploadingDoc(true)}>+ Добавить файл</SysButton>}
            />

            <div style={{ padding: '16px 28px', borderBottom: `1px solid ${SYS.line}`, background: SYS.paper, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${SYS.line}`, padding: '11px 14px', minWidth: 320, flex: 1 }}>
                <span style={{ color: SYS.muted, fontSize: 14 }}>⌕</span>
                <input
                  placeholder="Поиск по названию, альбому, варианту…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: SYS.ink2 }}
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setVisibleCount(PAGE_SIZE); }}
                style={{ padding: '11px 14px', background: 'transparent', border: `1px solid ${SYS.line}`, color: SYS.ink, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: ARCH_COLS, gap: 18, padding: '14px 28px', background: SYS.paper, borderBottom: `1px solid ${SYS.line}` }}>
              {['№', 'ТИП', 'ФАЙЛ', 'АЛЬБОМ/ВЕРСИЯ', 'ВАРИАНТ', 'СОЗДАН', 'ЗАГРУЖЕН', 'ДЕЙСТВИЕ'].map((h, i) => (
                <MonoLabel key={h} color={SYS.muted} style={{ fontSize: 9.5, textAlign: i === 7 ? 'right' : 'left' }}>{h}</MonoLabel>
              ))}
            </div>

            {shown.length === 0 && (
              <div style={{ padding: '32px 28px', textAlign: 'center', fontSize: 13, color: SYS.muted }}>Ничего не найдено</div>
            )}
            {shown.map((f, i) => (
              <div key={f.id} style={{ display: 'grid', gridTemplateColumns: ARCH_COLS, gap: 18, alignItems: 'center', padding: '16px 28px', borderTop: `1px solid ${SYS.line}`, background: SYS.paper, opacity: f.clientHidden && canManage ? 0.72 : 1 }}>
                <MonoLabel color={SYS.muted} style={{ fontSize: 11 }}>{String(i + 1).padStart(2, '0')}</MonoLabel>
                <div style={{ width: 46, height: 46, background: SYS.bg, border: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: SYS.ink2 }}>{f.type}</div>
                <div style={{ fontSize: 14.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {f.key && <span title="ключевой файл" style={{ color: SYS.red, fontSize: 14 }}>★</span>}
                  {f.name}
                  {f.clientHidden && canManage && <span title="скрыт от заказчика" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: SYS.muted, border: `1px solid ${SYS.line}`, padding: '2px 6px' }}>⊘ скрыт</span>}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>{f.album}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: SYS.ink2 }}>{f.variant}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: SYS.ink2 }}>{f.created}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: SYS.muted }}>{f.uploaded}</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                  {canManage && (
                    <span title={f.clientHidden ? 'показать заказчику' : 'скрыть от заказчика'} onClick={() => toggleHidden(f.id)} style={{ fontSize: 14, color: f.clientHidden ? SYS.muted : SYS.ink, cursor: 'pointer' }}>
                      {f.clientHidden ? '⊘' : '◉'}
                    </span>
                  )}
                  {f.driveUrl ? (
                    <a href={f.driveUrl} target="_blank" rel="noreferrer" style={{ padding: '10px 18px', background: 'transparent', color: SYS.ink, border: `1px solid ${SYS.line}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>Посмотреть</a>
                  ) : (
                    <span style={{ padding: '10px 18px', background: 'transparent', color: SYS.ink, border: `1px solid ${SYS.line}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Скачать</span>
                  )}
                  {canManage && <span title="удалить" onClick={() => setDeletingFile(f)} style={{ fontSize: 13, color: SYS.muted, cursor: 'pointer' }}>✕</span>}
                </div>
              </div>
            ))}

            <div style={{ padding: '18px 28px', borderTop: `1px solid ${SYS.line}`, display: 'flex', justifyContent: 'center', background: SYS.bg }}>
              {hasMore ? (
                <button type="button" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)} style={{ padding: '13px 40px', background: 'transparent', border: `1px solid ${SYS.ink}`, color: SYS.ink, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer' }}>Показать ещё</button>
              ) : filtered.length > 0 ? (
                <MonoLabel color={SYS.muted}>показаны все {filtered.length} файлов</MonoLabel>
              ) : null}
            </div>
          </section>

          <section style={{ border: `1px solid ${SYS.line}` }}>
            <SectionHead
              title="Мультимедиа" count={`${media.length} файла`}
              action={canManage && <SysButton tone="fill" full={false} small type="button" onClick={() => setUploadingMedia(true)}>+ Добавить медиа</SysButton>}
            />
            {media.length === 0 ? (
              <div style={{ padding: '32px 28px', textAlign: 'center', fontSize: 13, color: SYS.muted, background: SYS.paper }}>Пока нет медиафайлов</div>
            ) : (
              <div style={{ padding: 28, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, background: SYS.paper }}>
                {media.map((m) => (
                  <div key={m.id}>
                    <PhotoPlaceholder label={m.kind === 'AR tour' ? '⊹ 3D' : '▶'} height={220} />
                    <div style={{ marginTop: 14, fontSize: 15 }}>{m.kind} / {m.name}</div>
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>{m.date}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <a href={m.driveUrl || undefined} target="_blank" rel="noreferrer" style={{ padding: '10px 18px', background: 'transparent', color: SYS.ink, border: `1px solid ${SYS.line}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>Посмотреть</a>
                        {canManage && <span title="удалить" onClick={() => removeMedia(m.id)} style={{ fontSize: 13, color: SYS.muted, cursor: 'pointer' }}>✕</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {uploadingDoc && <UploadDocModal onClose={() => setUploadingDoc(false)} />}
      {uploadingMedia && <UploadMediaModal onClose={() => setUploadingMedia(false)} />}
      {deletingFile && (
        <ConfirmDeleteModal
          title="Удалить файл?"
          message={`«${deletingFile.name}» будет удалён из архива без возможности восстановления.`}
          onCancel={() => setDeletingFile(null)}
          onConfirm={() => { removeFile(deletingFile.id); setDeletingFile(null); }}
        />
      )}
    </main>
  );
};
