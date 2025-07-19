export function ErrorBox({ children }: { children: React.ReactNode }) {
  return <div className="p-5 text-red-200 bg-red-900">{children}</div>;
}
