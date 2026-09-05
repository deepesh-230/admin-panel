import type { AdminLifecycleFlag } from '../../api/dashboard';
import { dashboardApi } from '../../api/dashboard';

type Props = {
  entity: 'enquiry' | 'suggestion' | 'jobAlert' | 'event' | 'marketplaceProduct';
  id: string;
  value?: AdminLifecycleFlag | string | null;
  onChanged?: (flag: AdminLifecycleFlag) => void;
  onError?: (message: string) => void;
};

const OPTIONS: AdminLifecycleFlag[] = ['ACTIVE', 'READ', 'DELETE'];

export function LifecycleFlagSelect({ entity, id, value, onChanged, onError }: Props) {
  const current = (value as AdminLifecycleFlag) || 'ACTIVE';

  return (
    <select
      value={current}
      onChange={async (e) => {
        const flag = e.target.value as AdminLifecycleFlag;
        try {
          await dashboardApi.setFlag(entity, id, flag);
          onChanged?.(flag);
        } catch (err) {
          onError?.(err instanceof Error ? err.message : 'Flag update failed');
        }
      }}
      className="h-8 rounded-md border border-gray-300 px-2 text-xs"
      title="READ / ACTIVE / DELETE — DELETE purged after 60 days"
    >
      {OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
