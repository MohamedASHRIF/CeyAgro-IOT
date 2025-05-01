export default function DeviceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>; // Only render the page content
}
