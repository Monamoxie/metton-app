import AuthenticatedLayout from "@/components/AuthenticatedLayout";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
