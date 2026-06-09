import CopierTabNav from "@/components/copier/CopierTabNav";

export default function CopierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-w-0">
      <CopierTabNav />
      <div className="pt-5 sm:pt-6">{children}</div>
    </div>
  );
}
