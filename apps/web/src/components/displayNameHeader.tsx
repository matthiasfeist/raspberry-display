export function DisplayNameHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xl uppercase text-gray-100 font-medium tracking-tight">
      {children}
    </p>
  );
}
