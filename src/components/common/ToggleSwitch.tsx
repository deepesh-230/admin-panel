
import { cn } from '../../utils/cn';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const ToggleSwitch = ({ checked, onChange, className }: ToggleSwitchProps) => {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-[22px] w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
        checked ? "bg-[#22c55e]" : "bg-red-500",
        className
      )}
      onClick={() => onChange(!checked)}
    >
      <span className="sr-only">Toggle status</span>
      <span
        className={cn(
          "pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-[18px]" : "translate-x-0"
        )}
      />
    </button>
  );
};
