// Auth layout — no admin shell, no auth check
// The login page renders standalone
export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
