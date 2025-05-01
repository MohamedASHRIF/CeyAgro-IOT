export default function UsersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>; // Only render the page content
}
