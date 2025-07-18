export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>; // Only render the page content
}
