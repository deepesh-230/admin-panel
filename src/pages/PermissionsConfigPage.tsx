import { Fragment, useEffect, useMemo, useState } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/common/Button';
import { Toast } from '../components/common/Toast';
import {
  permissionsApi,
  type PermissionRoleName,
  type PermissionsMatrix,
} from '../api/permissions';

function codesEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

export const PermissionsConfigPage = () => {
  const [data, setData] = useState<PermissionsMatrix | null>(null);
  const [draft, setDraft] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const load = async () => {
    try {
      setLoading(true);
      const matrix = await permissionsApi.getMatrix();
      setData(matrix);
      setDraft({ ...matrix.matrix });
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load permissions',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const editableRoles = useMemo(
    () => (data?.roles || []).filter((r) => r.editable),
    [data],
  );

  const displayRoles = useMemo(() => data?.roles || [], [data]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof data extends null ? never[] : PermissionsMatrix['permissions']>();
    for (const perm of data?.permissions || []) {
      const list = map.get(perm.group) || [];
      list.push(perm);
      map.set(perm.group, list);
    }
    return [...map.entries()];
  }, [data]);

  const dirty = useMemo(() => {
    if (!data) return false;
    return editableRoles.some(
      (role) => !codesEqual(draft[role.name] || [], data.matrix[role.name] || []),
    );
  }, [data, draft, editableRoles]);

  const hasPermission = (roleName: string, code: string) =>
    (draft[roleName] || []).includes(code);

  const toggle = (roleName: PermissionRoleName, code: string, editable: boolean) => {
    if (!editable) return;
    setDraft((prev) => {
      const current = new Set(prev[roleName] || []);
      if (current.has(code)) current.delete(code);
      else current.add(code);
      return { ...prev, [roleName]: [...current].sort() };
    });
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const roles: Partial<Record<PermissionRoleName, string[]>> = {};
      for (const role of editableRoles) {
        roles[role.name] = draft[role.name] || [];
      }
      const updated = await permissionsApi.updateMatrix(roles);
      setData(updated);
      setDraft({ ...updated.matrix });
      setToast({
        visible: true,
        message: 'Access settings saved. Affected users pick this up on their next request.',
        type: 'success',
      });
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Save failed',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetAll = async () => {
    if (!window.confirm('Reset State Admin, Provider Admin, Volunteer, and End User to default permissions?')) {
      return;
    }
    setSaving(true);
    try {
      const updated = await permissionsApi.resetAll();
      setData(updated);
      setDraft({ ...updated.matrix });
      setToast({ visible: true, message: 'Defaults restored', type: 'success' });
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Reset failed',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col max-w-full gap-4">
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}

      <Breadcrumb
        title="Access control"
        paths={[{ name: 'Settings' }, { name: 'Permissions' }]}
      />

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Role permissions</h2>
            <p className="mt-1 text-sm text-gray-500 max-w-2xl">
              Central Admin can grant or revoke admin-panel access for State Admin, Provider Admin,
              Volunteer, and End User. Central Admin always has full access. Service provider listing
              access is controlled via the Service providers permissions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleResetAll} disabled={saving || loading}>
              Reset to defaults
            </Button>
            <Button onClick={handleSave} disabled={saving || loading || !dirty}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>

        {loading || !data ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[720px]">
              <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 sticky left-0 bg-[#f8fafc] z-10 min-w-[220px]">
                    Permission
                  </th>
                  {displayRoles.map((role) => (
                    <th key={role.name} className="px-3 py-3 text-center min-w-[110px]">
                      <div>{role.label}</div>
                      {!role.editable && (
                        <div className="text-[10px] font-normal text-gray-400 mt-0.5">Read-only</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map(([group, perms]) => (
                  <Fragment key={group}>
                    <tr className="bg-gray-50/80">
                      <td
                        colSpan={displayRoles.length + 1}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {group}
                      </td>
                    </tr>
                    {perms.map((perm) => (
                      <tr key={perm.code} className="border-t border-gray-100 hover:bg-gray-50/40">
                        <td className="px-4 py-2.5 sticky left-0 bg-white">
                          <div className="font-medium text-gray-800">{perm.code}</div>
                          <div className="text-xs text-gray-500">{perm.description}</div>
                        </td>
                        {displayRoles.map((role) => {
                          const checked =
                            role.name === 'ADMIN' || hasPermission(role.name, perm.code);
                          return (
                            <td key={`${role.name}-${perm.code}`} className="px-3 py-2.5 text-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={checked}
                                disabled={!role.editable || saving}
                                onChange={() => toggle(role.name, perm.code, role.editable)}
                                title={
                                  role.editable
                                    ? `${role.label}: ${perm.code}`
                                    : 'Central Admin always has full access'
                                }
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
