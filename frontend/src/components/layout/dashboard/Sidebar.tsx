/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/layout/dashboard/Sidebar.tsx

"use client";

import React, { useState, useMemo } from "react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/aceternity/Sidebar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";
import { translations } from "@/translations";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/context/LanguageContext";
import type { UserRole, UserRoleInfo, Section } from "@/types/shared/auth";
import { roleIcons, roleAccess } from "@/constants/shared/roleConstants";
import DashboardHeader from "@/components/common/DashboardHeader";
import { useAuth } from "@/hooks/shared/useAuth";

interface SidebarDashboardProps {
  children: React.ReactNode;
}

export function SidebarDashboard({ children }: SidebarDashboardProps) {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const { logout, user } = useAuth();
  const t: Record<string, string> = translations[language].dashboard.sidebar;

  // Default to 'manager' if no user role
  const userRole = (user?.role || 'manager') as keyof typeof roleAccess;
  

  const filteredSections = useMemo(() => {
    const pages = roleAccess[userRole] || roleAccess.manager; // Fallback to manager access
    const groupedBySection = Object.entries(pages).reduce(
      (acc, [key, page]) => {
        const section = acc[page.section] || {
          label: t[page.section],
          links: [],
        };
        section.links.push({
          label: t[key] || key,
          href: `/dashboard/${key}`,
          icon: (
            <page.icon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        });
        acc[page.section] = section;
        return acc;
      },
      {} as Record<string, Section>
    );

    return Object.values(groupedBySection);
  }, [userRole, t]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full h-full border border-neutral-200 dark:border-neutral-700 overflow-hidden"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo t={t} /> : roleIcons[userRole]}
            <Separator className="my-4 h-1 bg-gradient-to-r from-neutral-300 via-neutral-400 to-neutral-300 dark:from-neutral-600 dark:via-neutral-700 dark:to-neutral-600 rounded" />
            <div className="mt-0 flex flex-col">
              {filteredSections.map((section, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <Separator className="my-2 opacity-50" />}
                  <SectionLabel label={section.label} open={open} />
                  <div className="flex flex-col">
                    {section.links.map((link, linkIdx) => (
                      <SidebarLink key={linkIdx} link={link} />
                    ))}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div>
            <Separator className="my-1.5 h-1 bg-gradient-to-r from-neutral-300 via-neutral-400 to-neutral-300 dark:from-neutral-600 dark:via-neutral-700 dark:to-neutral-600 rounded" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <SidebarLink
                  link={{
                    label: t.logout,
                    href: "#",
                    icon: (
                      <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                    ),
                  }}
                />
              </AlertDialogTrigger>
              <AlertDialogContent className="z-[1050]">
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.logoutConfirmation}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.logoutDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                  >
                    {t.logout}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 h-full flex-col">
        <DashboardHeader variant="dashboard" />
        {children}
      </div>
    </div>
  );
}

const SectionLabel: React.FC<{ label: string; open: boolean }> = ({
  label,
  open,
}) => {
  if (!open) return null;
  return (
    <div className="px-3 py-2">
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
};

export const Logo: React.FC<{ t: any }> = ({ t }) => {
  const { user } = useAuth();
  const userRole = (user?.role || 'manager') as UserRole;
  
  const getRoleInfo = (role: UserRole): UserRoleInfo => ({
    title: t[role],
    description: t[`${role}Description`],
  });
  
  const roleInfo = getRoleInfo(userRole);

  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-0 relative z-20"
    >
      {roleIcons[userRole]}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        <h1>{roleInfo.title}</h1>
        <p className="text-xs text-neutral-500">{roleInfo.description}</p>
      </motion.span>
    </Link>
  );
};