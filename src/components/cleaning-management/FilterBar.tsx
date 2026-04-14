import React from 'react';
import type { CleaningFilters, CleaningStatus, Floor, MachineType } from '../../types/cleaning';

interface Props {
  filters: CleaningFilters;
  onChange: (filters: CleaningFilters) => void;
  onAddRecord: () => void;
}

const inputBase: React.CSSProperties = {
  fontSize: 13,
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  color: '#374151',
  fontFamily: 'inherit',
  outline: 'none',
  height: 34,
  transition: 'border-color 0.15s',
};

const selectStyle: React.CSSProperties = {
  ...inputBase,
  paddingRight: 28,
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
};

// Wrapper for select with focus border
const SelectField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  width?: number;
}> = ({ value, onChange, children, width = 140 }) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...selectStyle,
        width,
        borderColor: focused ? '#1a2744' : '#d1d5db',
        boxShadow: focused ? '0 0 0 2px rgba(26,39,68,0.12)' : 'none',
      }}
    >
      {children}
    </select>
  );
};

export const FilterBar: React.FC<Props> = ({ filters, onChange, onAddRecord }) => {
  const set = <K extends keyof CleaningFilters>(key: K, value: CleaningFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const [searchFocused, setSearchFocused] = React.useState(false);

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      marginBottom: 12,
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', display: 'flex', alignItems: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#9ca3af">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Cari nama mesin..."
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            ...inputBase,
            width: 180,
            paddingLeft: 30,
            borderColor: searchFocused ? '#1a2744' : '#d1d5db',
            boxShadow: searchFocused ? '0 0 0 2px rgba(26,39,68,0.12)' : 'none',
          }}
        />
      </div>

      {/* All Machines */}
      <SelectField
        value={filters.machineType}
        onChange={(v) => set('machineType', v as MachineType | '')}
        width={140}
      >
        <option value="">All Machines</option>
        {(['RVS', 'TOYO', 'WB', 'K1R', 'MF'] as MachineType[]).map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </SelectField>

      {/* All Location */}
      <SelectField
        value={filters.location}
        onChange={(v) => set('location', v as Floor | '')}
        width={140}
      >
        <option value="">All Location</option>
        {(['Lantai 1', 'Lantai 2', 'Lantai 3', 'Lantai 4'] as Floor[]).map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </SelectField>

      {/* All Status */}
      <SelectField
        value={filters.status}
        onChange={(v) => set('status', v as CleaningStatus | '')}
        width={150}
      >
        <option value="">All Status</option>
        <option value="safe">Safe</option>
        <option value="due">Due Soon</option>
        <option value="overdue">Overdue</option>
        <option value="qa">Waiting QA</option>
        <option value="changeover">Changeover Required</option>
        <option value="inprogress">Cleaning In Progress</option>
      </SelectField>

      {/* Date range — Next Cleaning */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>Next cleaning:</span>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => onChange({ ...filters, dateFrom: e.target.value })}
          title="Dari tanggal"
          style={{ ...inputBase, width: 130, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 11, color: '#9ca3af' }}>–</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={e => onChange({ ...filters, dateTo: e.target.value })}
          title="Sampai tanggal"
          style={{ ...inputBase, width: 130, cursor: 'pointer' }}
        />
        {(filters.dateFrom || filters.dateTo) && (
          <button
            onClick={() => onChange({ ...filters, dateFrom: '', dateTo: '' })}
            title="Reset date filter"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14, padding: '0 2px', lineHeight: 1 }}
          >✕</button>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={onAddRecord}
        style={{
          marginLeft: 'auto',
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 16px',
          height: 34,
          fontSize: 13,
          borderRadius: 6,
          border: 'none',
          background: '#1a7fd4',
          color: '#ffffff',
          cursor: 'pointer',
          fontWeight: 600,
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#1565b0'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#1a7fd4'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        Add cleaning record
      </button>
    </div>
  );
};
