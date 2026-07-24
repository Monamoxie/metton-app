import AuthenticatedLayout from "@/components/AuthenticatedLayout";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
