import { useState } from "react";

const tables = [
  {
    name: "roles",
    x: 60, y: 30,
    fields: [
      { name: "roles_id", type: "SERIAL", pk: true },
      { name: "roles_name", type: "VARCHAR(50)" },
      { name: "created_at", type: "TIMESTAMPTZ" },
      { name: "updated_at", type: "TIMESTAMPTZ" },
    ],
  },
  {
    name: "users",
    x: 60, y: 220,
    fields: [
      { name: "users_id", type: "SERIAL", pk: true },
      { name: "roles_id", type: "INT", fk: "roles" },
      { name: "name", type: "VARCHAR(100)" },
      { name: "email", type: "VARCHAR(100)" },
      { name: "pass_hash", type: "VARCHAR(255)" },
      { name: "is_active", type: "BOOLEAN" },
    ],
  },
  {
    name: "areas",
    x: 440, y: 30,
    fields: [
      { name: "areas_id", type: "SERIAL", pk: true },
      { name: "areas_name", type: "VARCHAR(100)" },
      { name: "floor", type: "INT" },
    ],
  },
  {
    name: "lines",
    x: 440, y: 200,
    fields: [
      { name: "lines_id", type: "SERIAL", pk: true },
      { name: "areas_id", type: "INT", fk: "areas" },
      { name: "lines_name", type: "VARCHAR(100)" },
    ],
  },
  {
    name: "machines",
    x: 440, y: 370,
    fields: [
      { name: "machines_id", type: "SERIAL", pk: true },
      { name: "lines_id", type: "INT", fk: "lines", nullable: true },
      { name: "areas_id", type: "INT", fk: "areas" },
      { name: "machines_code", type: "VARCHAR(50)" },
      { name: "machines_name", type: "VARCHAR(100)" },
      { name: "is_active", type: "BOOLEAN" },
    ],
  },
  {
    name: "cleaning_ms",
    x: 820, y: 30,
    fields: [
      { name: "cms_id", type: "SERIAL", pk: true },
      { name: "machines_id", type: "INT", fk: "machines" },
      { name: "areas_id", type: "INT", fk: "areas" },
      { name: "type", type: "VARCHAR(50)" },
      { name: "status", type: "VARCHAR(50)" },
      { name: "frequency", type: "VARCHAR(50)" },
      { name: "duration", type: "INT" },
      { name: "users_id", type: "INT", fk: "users" },
      { name: "next_cleaning", type: "DATE" },
      { name: "last_cleaning", type: "DATE" },
    ],
  },
  {
    name: "cleaning_records",
    x: 820, y: 310,
    fields: [
      { name: "record_id", type: "SERIAL", pk: true },
      { name: "machines_id", type: "INT", fk: "machines" },
      { name: "areas_id", type: "INT", fk: "areas" },
      { name: "user_id", type: "INT", fk: "users" },
      { name: "cleaning_type", type: "VARCHAR(50)" },
      { name: "status", type: "VARCHAR(50)" },
      { name: "date", type: "DATE" },
      { name: "times_start", type: "TIME" },
      { name: "times_end", type: "TIME" },
      { name: "duration", type: "INT" },
      { name: "notes", type: "TEXT" },
    ],
  },
  {
    name: "qa_verif",
    x: 60, y: 500,
    fields: [
      { name: "verif_id", type: "SERIAL", pk: true },
      { name: "record_id", type: "INT", fk: "cleaning_records" },
      { name: "user_id", type: "INT", fk: "users" },
      { name: "machine_id", type: "INT", fk: "machines" },
      { name: "floor", type: "INT" },
      { name: "date", type: "DATE" },
      { name: "status", type: "VARCHAR(50)" },
      { name: "form_feedback", type: "TEXT" },
      { name: "verified_at", type: "TIMESTAMPTZ" },
    ],
  },
  {
    name: "suhu_rh",
    x: 440, y: 600,
    fields: [
      { name: "tagname_id", type: "SERIAL", pk: true },
      { name: "tag_name", type: "VARCHAR(100)" },
      { name: "areas_id", type: "INT", fk: "areas" },
      { name: "timestamp_start", type: "TIMESTAMPTZ" },
      { name: "timestamp_end", type: "TIMESTAMPTZ" },
      { name: "suhu", type: "DECIMAL(5,2)" },
      { name: "rh", type: "DECIMAL(5,2)" },
      { name: "status_level", type: "VARCHAR(10)" },
    ],
  },
  {
    name: "threshold_config",
    x: 440, y: 850,
    fields: [
      { name: "threshold_id", type: "SERIAL", pk: true },
      { name: "areas_id", type: "INT", fk: "areas" },
      { name: "parameter", type: "VARCHAR(20)" },
      { name: "green_min", type: "DECIMAL(5,2)" },
      { name: "green_max", type: "DECIMAL(5,2)" },
      { name: "yellow_min", type: "DECIMAL(5,2)" },
      { name: "yellow_max", type: "DECIMAL(5,2)" },
      { name: "is_active", type: "BOOLEAN" },
    ],
  },
  {
    name: "audit_logs",
    x: 820, y: 620,
    fields: [
      { name: "log_id", type: "BIGSERIAL", pk: true },
      { name: "user_id", type: "INT", fk: "users", nullable: true },
      { name: "action", type: "VARCHAR(50)" },
      { name: "entity_type", type: "VARCHAR(50)" },
      { name: "entity_id", type: "INT" },
      { name: "old_value", type: "JSONB" },
      { name: "new_value", type: "JSONB" },
      { name: "ip_address", type: "INET" },
    ],
  },
  {
    name: "report",
    x: 820, y: 870,
    fields: [
      { name: "report_id", type: "SERIAL", pk: true },
      { name: "report_name", type: "VARCHAR(100)" },
      { name: "report_type", type: "VARCHAR(100)" },
      { name: "floor", type: "INT" },
      { name: "start_date", type: "DATE" },
      { name: "end_date", type: "DATE" },
      { name: "generated_by", type: "INT", fk: "users" },
    ],
  },
];

const relations = [
  { from: "users", fromField: "roles_id", to: "roles", toField: "roles_id", label: "M:1" },
  { from: "lines", fromField: "areas_id", to: "areas", toField: "areas_id", label: "M:1" },
  { from: "machines", fromField: "lines_id", to: "lines", toField: "lines_id", label: "1:1" },
  { from: "machines", fromField: "areas_id", to: "areas", toField: "areas_id", label: "M:1" },
  { from: "cleaning_ms", fromField: "machines_id", to: "machines", toField: "machines_id", label: "1:1" },
  { from: "cleaning_ms", fromField: "areas_id", to: "areas", toField: "areas_id", label: "M:1" },
  { from: "cleaning_ms", fromField: "users_id", to: "users", toField: "users_id", label: "M:1" },
  { from: "cleaning_records", fromField: "machines_id", to: "machines", toField: "machines_id", label: "M:1" },
  { from: "cleaning_records", fromField: "areas_id", to: "areas", toField: "areas_id", label: "M:1" },
  { from: "cleaning_records", fromField: "user_id", to: "users", toField: "users_id", label: "M:1" },
  { from: "qa_verif", fromField: "record_id", to: "cleaning_records", toField: "record_id", label: "M:1" },
  { from: "qa_verif", fromField: "user_id", to: "users", toField: "users_id", label: "M:1" },
  { from: "qa_verif", fromField: "machine_id", to: "machines", toField: "machines_id", label: "M:1" },
  { from: "suhu_rh", fromField: "areas_id", to: "areas", toField: "areas_id", label: "M:1" },
  { from: "threshold_config", fromField: "areas_id", to: "areas", toField: "areas_id", label: "M:1" },
  { from: "audit_logs", fromField: "user_id", to: "users", toField: "users_id", label: "M:1" },
  { from: "report", fromField: "generated_by", to: "users", toField: "users_id", label: "M:1" },
];

const TABLE_W = 280;
const FIELD_H = 22;
const HEADER_H = 34;
const PAD = 12;

function getTableHeight(t) {
  return HEADER_H + t.fields.length * FIELD_H + PAD;
}

function getFieldY(table, fieldName) {
  const idx = table.fields.findIndex((f) => f.name === fieldName);
  return table.y + HEADER_H + idx * FIELD_H + FIELD_H / 2;
}

function getTableCenter(table) {
  const h = getTableHeight(table);
  return { cx: table.x + TABLE_W / 2, cy: table.y + h / 2 };
}

const colorMap = {
  roles: "#6366f1",
  users: "#8b5cf6",
  areas: "#0ea5e9",
  lines: "#06b6d4",
  machines: "#14b8a6",
  cleaning_ms: "#f59e0b",
  cleaning_records: "#f97316",
  qa_verif: "#ef4444",
  suhu_rh: "#10b981",
  threshold_config: "#22d3ee",
  audit_logs: "#a78bfa",
  report: "#f472b6",
};

function TableBox({ table, isHovered, onHover, onLeave }) {
  const h = getTableHeight(table);
  const color = colorMap[table.name] || "#6366f1";

  return (
    <g
      onMouseEnter={() => onHover(table.name)}
      onMouseLeave={onLeave}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={table.x}
        y={table.y}
        width={TABLE_W}
        height={h}
        rx={8}
        fill={isHovered ? "#1e293b" : "#0f172a"}
        stroke={color}
        strokeWidth={isHovered ? 2.5 : 1.5}
        filter={isHovered ? "url(#glow)" : undefined}
      />
      <rect
        x={table.x}
        y={table.y}
        width={TABLE_W}
        height={HEADER_H}
        rx={8}
        fill={color}
      />
      <rect
        x={table.x}
        y={table.y + HEADER_H - 8}
        width={TABLE_W}
        height={8}
        fill={color}
      />
      <text
        x={table.x + TABLE_W / 2}
        y={table.y + HEADER_H / 2 + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize={13}
        fontWeight={700}
        fontFamily="'JetBrains Mono', 'Fira Code', monospace"
      >
        {table.name}
      </text>
      {table.fields.map((f, i) => {
        const fy = table.y + HEADER_H + i * FIELD_H + FIELD_H / 2;
        return (
          <g key={f.name}>
            {f.pk && (
              <text
                x={table.x + 10}
                y={fy + 1}
                fill="#facc15"
                fontSize={9}
                fontFamily="'JetBrains Mono', monospace"
                dominantBaseline="central"
                fontWeight={700}
              >
                PK
              </text>
            )}
            {f.fk && !f.pk && (
              <text
                x={table.x + 10}
                y={fy + 1}
                fill="#38bdf8"
                fontSize={9}
                fontFamily="'JetBrains Mono', monospace"
                dominantBaseline="central"
                fontWeight={700}
              >
                FK
              </text>
            )}
            <text
              x={table.x + 34}
              y={fy + 1}
              fill={f.pk ? "#facc15" : f.fk ? "#7dd3fc" : "#cbd5e1"}
              fontSize={11}
              fontFamily="'JetBrains Mono', 'Fira Code', monospace"
              dominantBaseline="central"
            >
              {f.name}
            </text>
            <text
              x={table.x + TABLE_W - 10}
              y={fy + 1}
              textAnchor="end"
              fill="#64748b"
              fontSize={10}
              fontFamily="'JetBrains Mono', 'Fira Code', monospace"
              dominantBaseline="central"
            >
              {f.type}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function RelationLine({ rel, tablesMap, hoveredTable }) {
  const fromT = tablesMap[rel.from];
  const toT = tablesMap[rel.to];
  if (!fromT || !toT) return null;

  const isActive = hoveredTable === rel.from || hoveredTable === rel.to;

  const fromCenter = getTableCenter(fromT);
  const toCenter = getTableCenter(toT);

  let x1, y1, x2, y2;
  const fromRight = fromT.x + TABLE_W;
  const toRight = toT.x + TABLE_W;

  if (fromRight <= toT.x) {
    x1 = fromRight;
    x2 = toT.x;
  } else if (toRight <= fromT.x) {
    x1 = fromT.x;
    x2 = toRight;
  } else {
    if (fromCenter.cx < toCenter.cx) {
      x1 = fromRight;
      x2 = toRight;
    } else {
      x1 = fromT.x;
      x2 = toT.x;
    }
  }

  y1 = getFieldY(fromT, rel.fromField);
  y2 = getFieldY(toT, rel.toField);

  const midX = (x1 + x2) / 2;

  return (
    <g>
      <path
        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
        fill="none"
        stroke={isActive ? "#38bdf8" : "#334155"}
        strokeWidth={isActive ? 2 : 1}
        strokeDasharray={isActive ? "none" : "4 3"}
        opacity={hoveredTable && !isActive ? 0.15 : 1}
      />
      {isActive && (
        <text
          x={midX}
          y={(y1 + y2) / 2 - 6}
          fill="#38bdf8"
          fontSize={9}
          fontFamily="'JetBrains Mono', monospace"
          textAnchor="middle"
          fontWeight={700}
        >
          {rel.label}
        </text>
      )}
    </g>
  );
}

export default function ERDDiagram() {
  const [hoveredTable, setHoveredTable] = useState(null);

  const tablesMap = {};
  tables.forEach((t) => (tablesMap[t.name] = t));

  const totalW = 1160;
  const totalH = 1060;

  return (
    <div
      style={{
        background: "#020617",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      <h1
        style={{
          color: "#f1f5f9",
          fontSize: 22,
          fontWeight: 800,
          margin: "0 0 4px 0",
          letterSpacing: "-0.5px",
        }}
      >
        e-LISA Database Schema
      </h1>
      <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 20px 0" }}>
        Integrated Cleaning & Maintenance Management System — PostgreSQL ERD
      </p>

      <div
        style={{
          width: "100%",
          maxWidth: totalW + 40,
          overflowX: "auto",
          borderRadius: 12,
          border: "1px solid #1e293b",
          background: "#0a0f1e",
        }}
      >
        <svg
          viewBox={`0 0 ${totalW} ${totalH}`}
          width={totalW}
          style={{ display: "block", minWidth: totalW }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {relations.map((r, i) => (
            <RelationLine
              key={i}
              rel={r}
              tablesMap={tablesMap}
              hoveredTable={hoveredTable}
            />
          ))}

          {tables.map((t) => (
            <TableBox
              key={t.name}
              table={t}
              isHovered={hoveredTable === t.name}
              onHover={setHoveredTable}
              onLeave={() => setHoveredTable(null)}
            />
          ))}
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 16,
          justifyContent: "center",
        }}
      >
        {Object.entries(colorMap).map(([name, color]) => (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              background: "#0f172a",
              borderRadius: 6,
              border: `1px solid ${color}33`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: color,
              }}
            />
            <span style={{ color: "#94a3b8", fontSize: 10 }}>{name}</span>
          </div>
        ))}
      </div>
      <p
        style={{
          color: "#475569",
          fontSize: 10,
          marginTop: 10,
          textAlign: "center",
        }}
      >
        Hover tabel untuk melihat relasi • PK = Primary Key • FK = Foreign Key
      </p>
    </div>
  );
}
