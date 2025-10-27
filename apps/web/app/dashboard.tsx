import React from "react";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  SidebarBody,
  SidebarContainer,
  SidebarLink,
} from "components/ui/sidebar";
import { BsPersonCircle } from "react-icons/bs";
import { headers } from "next/headers";

export async function SidebarDemo({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const pathname = (await headersList).get("x-pathname") || "";
  const links = [
    {
      label: "Dashboard",
      href: "/home",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "/",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-card",
        "h-screen"
      )}
    >
      <SidebarContainer animate={false}>
        <SidebarBody className="justify-between gap-10 dark:bg-card">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <>
              <Logo />
            </>
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link}
                  active={pathname === link.href}
                />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "User",
                href: "#",
                icon: <BsPersonCircle size={25} />,
              }}
            />
          </div>
        </SidebarBody>
      </SidebarContainer>
      <Dashboard>{children}</Dashboard>
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 font-normal text-white text-3xl"
    >
      Logo
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};

const Dashboard = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl bg-white dark:border-neutral-700 dark:bg-background">
        <div className="relative z-10 h-full w-full p-6 md:p-10">
          {children}
        </div>
      </div>
    </div>
  );
};
