/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/dashboard/Sidebar.tsx

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/Aceternity/Sidebar";
import { Separator } from "@/components/ui/separator";
import {
  IconBrandTabler,
  IconChartHistogram,
  IconReportAnalytics,
  IconDeviceAnalytics,
  IconUsers,
  IconCreditCardPay,
  IconReport,
} from "@tabler/icons-react";
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
import { Building2, Cog, Crown, LogOut } from "lucide-react";
import { translations } from "@/translations";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/libs/utils";
import Dashboard from "./Dashboard";
import { useLanguage } from "@/components/context/LanguageContext";

// Section Label component
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

export function SidebarSuperAdmin() {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const router = useRouter();
  const t = translations.superadmin[language].sidebar;

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  // Organized links by sections
  const sidebarSections = [
    {
      label: t.overview,
      links: [
        {
          label: t.overview,
          href: "#",
          icon: (
            <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
        {
          label: t.activityLog,
          href: "#",
          icon: (
            <IconChartHistogram className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
      ],
    },
    {
      label: t.businesses,
      links: [
        {
          label: t.allBusinesses,
          href: "#",
          icon: (
            <Building2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
        {
          label: t.subscriptions,
          href: "#",
          icon: (
            <IconReportAnalytics className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
        {
          label: t.businessAnalytics,
          href: "#",
          icon: (
            <IconDeviceAnalytics className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
      ],
    },
    {
      label: t.platform,
      links: [
        {
          label: t.systemSettings,
          href: "#",
          icon: (
            <Cog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
        {
          label: t.userManagement,
          href: "#",
          icon: (
            <IconUsers className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
        {
          label: t.billingPayments,
          href: "#",
          icon: (
            <IconCreditCardPay className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
      ],
    },
    {
      label: t.others,
      links: [
        {
          label: t.reports,
          href: "#",
          icon: (
            <IconReport className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full h-full border border-neutral-200 dark:border-neutral-700 overflow-hidden"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-8">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo t={t} /> : <LogoIcon />}
            <Separator className="my-4 h-1 bg-gradient-to-r from-neutral-300 via-neutral-400 to-neutral-300 dark:from-neutral-600 dark:via-neutral-700 dark:to-neutral-600 rounded" />
            <div className="mt-0 flex flex-col">
              {sidebarSections.map((section, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <Separator className="my-2 opacity-50" />}
                  <SectionLabel label={section.label} open={open} />
                  <div className="flex flex-col gap-">
                    {section.links.map((link, linkIdx) => (
                      <SidebarLink key={linkIdx} link={link} />
                    ))}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          <Separator className="my-4 opacity-50" />
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
              <AlertDialogContent
                className="z-[1050]" // Ensure it appears above the sidebar
              >
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
                      setOpen(false); // Close the sidebar before logout
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
      <Dashboard />
    </div>
  );
}

export const Logo: React.FC<{ t: any }> = ({ t }) => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-0 relative z-20"
    >
      <Crown className="h-5 w-6 text-black dark:text-white flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        <h1>{t.superAdmin}</h1>
        <p className="text-xs text-neutral-500">
          {t.superAdminOfThisDashboard}
        </p>
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-0 relative z-20"
    >
      <Crown className="h-5 w-6 text-black dark:text-white flex-shrink-0" />
    </Link>
  );
};
