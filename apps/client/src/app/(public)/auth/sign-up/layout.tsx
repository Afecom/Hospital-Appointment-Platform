export default function loginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex justify-center items-center min-h-full bg-blue-100">
      {children}
    </div>
  );
}
