import AuthenticatedLayout from "@/components/AuthenticatedLayout";

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout(props: UserLayoutProps) {
  return <AuthenticatedLayout>{props.children}</AuthenticatedLayout>;
}
