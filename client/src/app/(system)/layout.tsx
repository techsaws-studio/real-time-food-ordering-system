import SystemHeader from "@/components/layouts/system-header";
import SystemFooter from "@/components/layouts/system-footer";

export default function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SystemHeader />
      {children}
      <SystemFooter />
    </>
  );
}
