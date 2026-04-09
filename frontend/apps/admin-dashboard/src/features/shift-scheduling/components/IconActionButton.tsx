interface IconActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  isLoading?: boolean;
}

export const IconActionButton = ({
  icon,
  label,
  onClick,
  isLoading = false,
}: IconActionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-[#BFDBFE] hover:text-[#134BBA]"
  >
    <span
      className={`material-symbols-outlined text-[20px] ${isLoading ? "animate-spin" : ""}`}
      aria-hidden="true"
    >
      {icon}
    </span>
    <span className="sr-only">{label}</span>
  </button>
);

export default IconActionButton;
