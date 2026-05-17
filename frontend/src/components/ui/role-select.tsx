'use client';

import { useState } from 'react';
import { Select } from './select';
import {
  Role,
  Permission,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
  getAssignableRoles,
} from '@/lib/rbac';
import { IconAlertCircle } from '@/components/icons';

interface RoleSelectProps {
  value: string;
  onChange: (role: string) => void;
  customPermissions?: Permission[];
  onCustomPermissionsChange?: (perms: Permission[]) => void;
  actorRole: string;
  label?: string;
  error?: string;
}

export function RoleSelect({
  value,
  onChange,
  customPermissions,
  onCustomPermissionsChange,
  actorRole,
  label = 'Role',
  error,
}: RoleSelectProps) {
  const [customMode, setCustomMode] = useState(false);
  const assignable = getAssignableRoles(actorRole);
  const options = assignable.map((r) => ({ value: r, label: ROLE_LABELS[r] }));
  const rolePerms = ROLE_PERMISSIONS[value as Role] ?? [];
  const activePerms = customMode && customPermissions ? customPermissions : rolePerms;

  function handleToggleCustom() {
    if (!customMode) {
      onCustomPermissionsChange?.([...rolePerms]);
    }
    setCustomMode(!customMode);
  }

  function handleTogglePerm(perm: Permission) {
    if (!customPermissions || !onCustomPermissionsChange) return;
    const next = customPermissions.includes(perm)
      ? customPermissions.filter((p) => p !== perm)
      : [...customPermissions, perm];
    onCustomPermissionsChange(next);
  }

  return (
    <div className="space-y-3">
      <Select
        label={label}
        value={value}
        onChange={(v) => { onChange(v); setCustomMode(false); }}
        options={options}
        error={error}
      />

      {value && (
        <div className="rounded-xl bg-neutral-50 p-4 space-y-3">
          <p className="text-sm text-neutral-600">{ROLE_DESCRIPTIONS[value as Role]}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">
              {customMode ? 'Custom access' : 'Role defaults'}
            </span>
            {onCustomPermissionsChange && (
              <button
                type="button"
                onClick={handleToggleCustom}
                className="text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                {customMode ? 'Use role defaults' : 'Customize access'}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {PERMISSION_GROUPS.map((group) => (
              <PermissionGroup
                key={group.label}
                label={group.label}
                permissions={group.permissions}
                activePerms={activePerms}
                editable={customMode}
                onToggle={handleTogglePerm}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PermissionGroup({
  label,
  permissions,
  activePerms,
  editable,
  onToggle,
}: {
  label: string;
  permissions: { key: Permission; label: string; dangerous?: boolean }[];
  activePerms: Permission[];
  editable: boolean;
  onToggle: (p: Permission) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">{label}</p>
      <div className="space-y-1">
        {permissions.map((p) => {
          const enabled = activePerms.includes(p.key);
          return (
            <PermissionRow
              key={p.key}
              label={p.label}
              enabled={enabled}
              dangerous={p.dangerous}
              editable={editable}
              onToggle={() => onToggle(p.key)}
            />
          );
        })}
      </div>
    </div>
  );
}

function PermissionRow({
  label,
  enabled,
  dangerous,
  editable,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  dangerous?: boolean;
  editable: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
        editable ? 'hover:bg-neutral-100' : ''
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          editable ? '' : 'pointer-events-none'
        } ${
          enabled
            ? dangerous
              ? 'border-warning-400 bg-warning-50'
              : 'border-primary-400 bg-primary-50'
            : 'border-neutral-300 bg-white'
        }`}
      >
        {enabled && (
          <svg className={`h-2.5 w-2.5 ${dangerous ? 'text-warning-600' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {editable && (
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            className="sr-only"
          />
        )}
      </span>
      <span className={`flex-1 ${enabled ? 'text-neutral-700' : 'text-neutral-400'}`}>
        {label}
      </span>
      {dangerous && enabled && (
        <IconAlertCircle className="h-3.5 w-3.5 text-warning-500 shrink-0" />
      )}
    </label>
  );
}
