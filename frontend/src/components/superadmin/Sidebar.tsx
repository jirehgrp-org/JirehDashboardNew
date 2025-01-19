// @/components/dashboard/Sidebar.tsx

"use client";
import React, { useState } from "react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/Aceternity/Sidebar";
import { Separator } from "@/components/ui/separator";
import {
  IconBrandTabler,
  IconUserBolt,
  IconChartHistogram,
  IconReportAnalytics,
  IconFileDollar,
  IconClipboardList,
  IconCategory,
  IconMapRoute,
  IconReport,
} from "@tabler/icons-react";
import { } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Dashboard from "./Dashboard";

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

  // Organized links by sections
  const sidebarSections = [
    {
      label: "Overview",
      links: [
        {
          label: "Overview",
          href: "#",
          description: "Overview of businesses",
          icon: (
            <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
        {
          label: "Activity Log",
          href: "#",
          description: "Analytics data",
          icon: (
            <IconChartHistogram className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
      ],
    },
    {
      label: "Stores",
      links: [
        {
          label: "All Businesses",
          href: "#",
          description: "Manage orders",
          icon: (
            <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
        {
          label: "Subscriptions",
          href: "#",
          description: "View sales reports",
          icon: (
            <IconReportAnalytics className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
        {
          label: "Store Analytics",
          href: "#",
          description: "Track expenses",
          icon: (
            <IconFileDollar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
      ],
    },
    {
      label: "Platform",
      links: [
        {
          label: "System Settings",
          href: "#",
          description: "Manage items",
          icon: (
            <IconClipboardList className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
        {
          label: "User Management",
          href: "#",
          description: "Manage categories",
          icon: (
            <IconCategory className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
        {
          label: "Billing & Payments",
          href: "#",
          description: "Manage locations",
          icon: (
            <IconMapRoute className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
      ],
    },
    {
      label: "Other",
      links: [
        {
          label: "Reports",
          href: "#",
          description: "View reports",
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
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col">
              {sidebarSections.map((section, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <Separator className="my-4 opacity-50" />}
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
            <SidebarLink
              link={{
                label: (
                  <div className="flex flex-col">
                    <span>Abebe Kebede</span>
                    <span className="text-xs text-neutral-500">
                      abebe.kebede@example.com
                    </span>
                  </div>
                ),
                href: "#",
                icon: (
                  <Image
                    src="/images/avatar/steve.jpg"
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
    </div>
  );
}

// Keep existing Logo and LogoIcon components as they are
export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        <h1>Owner</h1>
        <p className="text-xs text-neutral-500">Owner of the business</p>
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
