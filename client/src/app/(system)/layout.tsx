import SystemHeader from "@/components/layouts/system-header";

export default function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SystemHeader />
      {children}
    </>
  );
}
