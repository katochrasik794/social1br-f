import { Star } from "lucide-react";

type ExpertiseBadgeProps = {
  label: string;
};

const BADGE_STYLES: Record<string, string> = {
  "High achiever":
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 [&_svg]:fill-amber-500 dark:[&_svg]:fill-amber-400",
  Experienced:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-300 [&_svg]:fill-orange-500 dark:[&_svg]:fill-orange-400",
  "Rising star":
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 [&_svg]:fill-sky-500 dark:[&_svg]:fill-sky-400",
};

const DEFAULT_STYLE = BADGE_STYLES["High achiever"];

export default function ExpertiseBadge({ label }: ExpertiseBadgeProps) {
  const style = BADGE_STYLES[label] ?? DEFAULT_STYLE;

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${style}`}>
      <Star className="h-3 w-3" />
      {label}
    </span>
  );
}
