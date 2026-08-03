import { SYS } from '../theme/tokens';

export const OfflineBanner = () => (
  <div style={{ background: SYS.ink, color: '#f5f4f0', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, lineHeight: 1.35 }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: SYS.red, flex: 'none' }} />
    <span>Нет сети — изменения сохранятся и отправятся, когда связь появится</span>
  </div>
);
