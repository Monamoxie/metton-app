import AuthenticatedLayout from "@/components/AuthenticatedLayout";

interface EventLayoutProps {
  children: React.ReactNode;
}

export default function SecureAreaLayout(props: EventLayoutProps) {
  return <AuthenticatedLayout>{props.children}</AuthenticatedLayout>;
}
