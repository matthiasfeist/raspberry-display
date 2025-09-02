export function ErrorBox({ children }: { children: React.ReactNode }) {
  return <div className="bg-red-900 p-5 text-red-200">{children}</div>;
}
