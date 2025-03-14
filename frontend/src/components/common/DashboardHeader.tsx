/* eslint-disable @typescript-eslint/no-unused-vars */
// @/components/common/DashboardHeader.tsx

"use client";
import React, { useEffect, useState } from "react";
import { Sun, Moon, User } from "lucide-react";
import { useTheme } from "next-themes";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { translations } from "@/translations";
import { useLanguage } from "@/components/context/LanguageContext";
import { useAuth } from "@/hooks/shared/useAuth";
// import api from '@/lib/axios';
import { SubscriptionStatus } from "./SubscriptionStatus";

interface EditableUser {
  name: string;
  username: string;
  email: string;
  phone: string;
}

interface BusinessInfo {
  name: string;
  contact_number: string;
  created_at: string;
  updated_at: string;
}


interface HeaderProps {
  variant?: "auth" | "dashboard";
}

// Set this to true to see debug panel
const isDevelopment = process.env.NODE_ENV !== "production";

const DashboardHeader: React.FC<HeaderProps> = ({ variant = "auth" }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [businessLoading, setBusinessLoading] = useState(false);
  const { language } = useLanguage();
  const t = translations[language].dashboard.header;
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Create a state for the current user profile data
  const [userProfile, setUserProfile] = useState<EditableUser>({
    name: "",
    username: "",
    email: "",
    phone: "",
  });

  // Create separate state for the editable fields
  const [editableUser, setEditableUser] = useState<EditableUser>({
    name: "",
    username: "",
    email: "",
    phone: "",
  });

  // const fetchBusinessData = async () => {
  //   try {
  //     setBusinessLoading(true);
      
  //     if (user && user.business) {
  //       console.log("Setting business info from user object:", user.business);
  //       setBusinessInfo({
  //         name: user.business.name,
  //         contact_number: user.business.contact_number,
  //         created_at: "", // These fields aren't in the user.business object
  //         updated_at: ""  // but are required by your BusinessInfo interface
  //       });
  //       return;
  //     }
      
  //     // If we need to fetch more business details, we can still try the API
  //     console.log("Attempting to fetch business data from API");
  //     const response = await api.get('/business/list/');
  //     console.log("Business data response:", response.data);
      
  //     if (response.data && response.data.length > 0) {
  //       setBusinessInfo(response.data[0]);
  //     } else {
  //       console.log("No business data found");
  //     }
  //   } catch (error: unknown) {
  //     console.error("Error fetching business data:", error);
      
  //     // Handle Axios errors
  //     if (error && typeof error === 'object' && 'response' in error) {
  //       const axiosError = error as any;
  //       console.error("Error response status:", axiosError.response?.status);
  //       console.error("Error response data:", axiosError.response?.data);
  //     }
  //   } finally {
  //     setBusinessLoading(false);
  //   }
  // };

  useEffect(() => {
    console.log("Full user object:", user);
    console.log("Username field:", user?.username);

    if (user) {
      const profileData = {
        name: user.fullname || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      };

      console.log("Mapped profile data:", profileData);

      setUserProfile(profileData);
      setEditableUser(profileData);

      // fetchBusinessData();
    }
    setMounted(true);
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditableUser(userProfile);
  };

  const handleChange = (field: string, value: string) => {
    setEditableUser({ ...editableUser, [field]: value });
  };

  const handleSaveConfirmed = () => {
    setUserProfile(editableUser);
    setIsEditing(false);
    // Here you would typically call an API to update the user profile
  };

  // Extract the phone number digits for display, removing the +251 prefix
  const formatPhoneForDisplay = (phone: string) => {
    if (!phone) return "";
    return phone.replace(/^\+251/, "");
  };

  // Debug panel component
  const DebugPanel = () => {
    if (!isDevelopment) return null;

    return (
      <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400">
            🔍 Development Debug
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? "Hide Debug" : "Show Debug"}
          </Button>
        </div>

        {showDebug && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
            <h5 className="font-medium mb-1 text-xs">Raw User Object:</h5>
            <pre className="text-xs overflow-auto max-h-40 mb-4">
              {JSON.stringify(user, null, 2)}
            </pre>

            <h5 className="font-medium mb-1 text-xs">Profile Data State:</h5>
            <pre className="text-xs overflow-auto max-h-40 mb-4">
              {JSON.stringify(userProfile, null, 2)}
            </pre>

            <h5 className="font-medium mb-1 text-xs">Editable User State:</h5>
            <pre className="text-xs overflow-auto max-h-40 mb-4">
              {JSON.stringify(editableUser, null, 2)}
            </pre>

            <h5 className="font-medium mb-1 text-xs">Phone Processing:</h5>
            <div className="text-xs mb-4">
              <p>
                Original phone: <code>{userProfile.phone || "N/A"}</code>
              </p>
              <p>
                After formatting:{" "}
                <code>
                  {userProfile.phone
                    ? formatPhoneForDisplay(userProfile.phone)
                    : "N/A"}
                </code>
              </p>
              <p>
                Phone regex test:{" "}
                <code>
                  {userProfile.phone
                    ? userProfile.phone.startsWith("+251")
                      ? "✅ Starts with +251"
                      : "❌ Does NOT start with +251"
                    : "N/A"}
                </code>
              </p>
            </div>

            {/* New Business Info Section */}
            <h5 className="font-medium mb-1 text-xs">Business Information:</h5>
            {businessLoading ? (
              <p className="text-xs">Loading business data...</p>
            ) : businessInfo ? (
              <div className="text-xs mb-4">
                <p>
                  Business Name: <code>{businessInfo.name}</code>
                </p>
                <p>
                  Contact Number: <code>{businessInfo.contact_number}</code>
                </p>
                <p>
                  Created At:{" "}
                  <code>
                    {new Date(businessInfo.created_at).toLocaleString()}
                  </code>
                </p>
                <p>
                  Updated At:{" "}
                  <code>
                    {new Date(businessInfo.updated_at).toLocaleString()}
                  </code>
                </p>
                <pre className="text-xs overflow-auto max-h-40 mt-2">
                  {JSON.stringify(businessInfo, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-xs">No business data available</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-12 items-center justify-end bg-gray-100 dark:bg-neutral-800 px-4 md:px-6">
      <div className="flex items-center space-x-2">
      <SubscriptionStatus />
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>
        <LanguageToggle />
        <Dialog>
          <DialogTrigger asChild>
            <button className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200">
              <User className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-[500px] p-6">
            <DialogHeader>
              <DialogTitle>{t.profileDetails}</DialogTitle>
              <DialogDescription>{t.manage}</DialogDescription>
            </DialogHeader>
            {/* User Details and Edit Button */}
            <div className="flex items-center justify-between mb-4">
              {/* User Details */}
              <div className="flex items-center space-x-4">
                <User width={48} height={48} className="rounded-full" />
                <div>
                  <h4 className="text-lg font-semibold">
                    {userProfile.name || "User"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {userProfile.email || "email@example.com"}
                  </p>
                </div>
              </div>
              {/* Edit Profile Button */}
              {!isEditing && (
                <Button onClick={handleEditToggle}>{t.editProfile}</Button>
              )}
            </div>

            {/* Edit Fields */}
            {isEditing && (
              <form
                onSubmit={(e) => e.preventDefault()}
                className="grid gap-4 py-4"
              >
                {/* Name field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={editableUser.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={isLoading}
                    className="col-span-3 border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>

                {/* Username field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={editableUser.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    disabled={isLoading}
                    className="col-span-3 border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>

                {/* Email field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editableUser.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={isLoading}
                    className="col-span-3 border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>

                {/* Phone field with country code */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <div className="col-span-3 flex">
                    <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      +251
                    </div>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formatPhoneForDisplay(editableUser.phone)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        handleChange("phone", value ? `+251${value}` : "");
                      }}
                      disabled={isLoading}
                      maxLength={9}
                      placeholder="912345678"
                      className="flex-1 rounded-l-none border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* Debug Panel */}
            {/* <DebugPanel /> */}

            {/* Footer with Save Confirmation */}
            {isEditing && (
              <DialogFooter>
                <Button variant="secondary" onClick={handleEditToggle}>
                  {t.cancel}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={isLoading}>
                      {isLoading ? t.saving : t.saveChanges}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.confirmSave}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t.areYouSure}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSaveConfirmed}>
                        {t.confirm}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DashboardHeader;
