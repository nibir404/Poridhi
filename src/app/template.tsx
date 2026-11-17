/** Re-mounts on every navigation: a short fade/rise so route changes feel continuous, never a flash. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="pd-route">{children}</div>;
}
