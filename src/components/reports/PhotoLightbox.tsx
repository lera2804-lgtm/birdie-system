import { useState } from 'react';
import { MonoLabel } from '../primitives';
import type { Photo } from '../../mocks/reports';

export const PhotoLightbox = ({
  photos, startIndex, subtitle, onClose,
}: {
  photos: Photo[];
  startIndex: number;
  subtitle: string;
  onClose: () => void;
}) => {
  const [index, setIndex] = useState(startIndex);
  const photo = photos[index];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.9)', display: 'flex', flexDirection: 'column', zIndex: 300 }}>
      <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f5f4f0' }}>
        <div>
          <MonoLabel color="rgba(245,244,240,0.55)" style={{ fontSize: 10 }}>{subtitle}</MonoLabel>
          <div style={{ marginTop: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>фото {index + 1} / {photos.length}</div>
        </div>
        <span onClick={onClose} style={{ fontSize: 22, cursor: 'pointer' }}>✕</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 28px 28px', minHeight: 0 }}>
        <span onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)} style={{ color: '#f5f4f0', fontSize: 30, cursor: 'pointer', opacity: photos.length > 1 ? 0.7 : 0.2 }}>‹</span>
        <div style={{ flex: 1, maxWidth: 900, height: '100%', maxHeight: 620, background: '#1a1a1a', border: '1px solid rgba(245,244,240,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(245,244,240,0.4)', fontSize: 40, overflow: 'hidden' }}>
          {photo?.url ? <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : '▤'}
        </div>
        <span onClick={() => setIndex((i) => (i + 1) % photos.length)} style={{ color: '#f5f4f0', fontSize: 30, cursor: 'pointer', opacity: photos.length > 1 ? 0.7 : 0.2 }}>›</span>
      </div>
      <div style={{ padding: '0 28px 24px', display: 'flex', gap: 10, justifyContent: 'center' }}>
        {photos.map((p, i) => (
          <div
            key={p.id}
            onClick={() => setIndex(i)}
            style={{ width: 66, height: 66, background: '#1a1a1a', border: i === index ? '2px solid #f5f4f0' : '1px solid rgba(245,244,240,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(245,244,240,0.35)', fontSize: 16, cursor: 'pointer', overflow: 'hidden' }}
          >
            {p.url ? <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '▤'}
          </div>
        ))}
      </div>
    </div>
  );
};
