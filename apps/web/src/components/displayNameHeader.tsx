export function DisplayNameHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xl font-medium uppercase tracking-tight text-gray-100">
      {children}
    </p>
  );
}
