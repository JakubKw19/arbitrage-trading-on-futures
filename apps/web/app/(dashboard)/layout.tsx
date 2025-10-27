import { SidebarDemo } from "@/dashboard";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SidebarDemo>{children}</SidebarDemo>;
}
