import AuthenticatedLayout from "@/components/AuthenticatedLayout";

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout(props: UserLayoutProps) {
  return <AuthenticatedLayout>{props.children}</AuthenticatedLayout>;
}
