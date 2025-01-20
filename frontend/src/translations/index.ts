// @/translations/index.ts

// Root translations
import { en as rootEn } from "./en";
import { am as rootAm } from "./am";

// Auth translations
import { en as authEn } from "./auth/en";
import { am as authAm } from "./auth/am";

// Dashboard translations
import { en as dashboardEn } from "./dashboard/en";
import { am as dashboardAm } from "./dashboard/am";

// Legal translations
import { en as legalEn } from "./legal/en";
import { am as legalAm } from "./legal/am";

// Superadmin translations
import { en as superadminEn } from "./superadmin/en";
import { am as superadminAm } from "./superadmin/am";

export const translations = {
  root: {
    en: rootEn,
    am: rootAm,
  },
  auth: {
    en: authEn,
    am: authAm,
  },
  dashboard: {
    en: dashboardEn,
    am: dashboardAm,
  },
  legal: {
    en: legalEn,
    am: legalAm,
  },
  superadmin: {
    en: superadminEn,
    am: superadminAm,
  },
};
