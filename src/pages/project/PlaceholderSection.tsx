import { MonoLabel } from '../../components/primitives';
import { SYS } from '../../theme/tokens';

// Temporary stand-in while later sections are built out (reports/archive/settings).
export const PlaceholderSection = ({ title }: { title: string }) => (
  <main style={{ padding: '56px', display: 'flex', flexDirection: 'column', gap: 10 }}>
    <MonoLabel color={SYS.red}>в разработке</MonoLabel>
    <h1 style={{ margin: 0, fontSize: 30, fontWeight: 500 }}>{title}</h1>
    <p style={{ color: SYS.muted, fontSize: 14 }}>Этот раздел ещё не реализован в текущей сборке.</p>
  </main>
);
