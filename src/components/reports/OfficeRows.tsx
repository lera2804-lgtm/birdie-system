import { MonoLabel } from '../primitives';
import { SysButton } from '../form';
import { SYS } from '../../theme/tokens';
import type { OfficeRow } from '../../mocks/reports';

const Row = ({ row, onChange, onRemove }: { row: OfficeRow; onChange: (patch: Partial<OfficeRow>) => void; onRemove: () => void }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 20px', gap: 10, alignItems: 'center', marginBottom: 8 }}>
    <input
      placeholder="Кол-во"
      value={row.qty}
      onChange={(e) => onChange({ qty: e.target.value })}
      style={{ border: `1px solid ${SYS.line}`, background: SYS.paper, padding: '13px 14px', fontFamily: 'inherit', fontSize: 14, color: SYS.ink, outline: 'none', boxSizing: 'border-box' }}
    />
    <input
      placeholder="напр. Рабочие / подрядчик"
      value={row.role}
      onChange={(e) => onChange({ role: e.target.value })}
      style={{ border: `1px solid ${SYS.line}`, background: SYS.paper, padding: '13px 14px', fontFamily: 'inherit', fontSize: 14, color: SYS.ink, outline: 'none', boxSizing: 'border-box' }}
    />
    <span title="удалить" onClick={onRemove} style={{ fontSize: 13, color: SYS.muted, cursor: 'pointer', textAlign: 'right' }}>✕</span>
  </div>
);

export const OfficeRows = ({
  label, rows, onChange,
}: {
  label: string;
  rows: OfficeRow[];
  onChange: (rows: OfficeRow[]) => void;
}) => (
  <div>
    <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>{label}</MonoLabel>
    <div style={{ marginTop: 8 }}>
      {rows.map((r, i) => (
        <Row
          key={r.id}
          row={r}
          onChange={(patch) => onChange(rows.map((x, xi) => (xi === i ? { ...x, ...patch } : x)))}
          onRemove={() => onChange(rows.filter((_, xi) => xi !== i))}
        />
      ))}
    </div>
    <SysButton
      tone="ghost" full={false} small type="button"
      onClick={() => onChange([...rows, { id: `o${Date.now()}`, qty: '', role: '' }])}
    >
      + Добавить специализацию
    </SysButton>
  </div>
);
