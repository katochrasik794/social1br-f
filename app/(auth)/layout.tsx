import AuthLayout from "@/components/auth/AuthLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout variant="user">{children}</AuthLayout>;
}
