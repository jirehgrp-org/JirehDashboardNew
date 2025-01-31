/* eslint-disable @typescript-eslint/no-unused-vars */
// @/hooks/shared/useCalendar.ts

import { useLanguage } from "@/components/context/LanguageContext";

export const useCalendar = () => {
  const { language } = useLanguage();

  const toEthiopian = (gregorianDate: Date): string => {
    if (language !== "am") {
      return gregorianDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    const ethiopianMonths: string[] = [
      "መስከረም",
      "ጥቅምት",
      "ህዳር",
      "ታህሳስ",
      "ጥር",
      "የካቲት",
      "መጋቢት",
      "ሚያዚያ",
      "ግንቦት",
      "ሰኔ",
      "ሐምሌ",
      "ነሐሴ",
      "ጷግሜ",
    ];

    const isLeapYear = (year: number): boolean => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    const getDaysInMonth = (year: number, month: number): number => {
      return new Date(year, month + 1, 0).getDate();
    };

    // JDN for Gregorian date
    const gregorianToJDN = (
      year: number,
      month: number,
      day: number
    ): number => {
      const a = Math.floor((14 - month) / 12);
      year = year + 4800 - a;
      month = month + 12 * a - 3;
      return (
        day +
        Math.floor((153 * month + 2) / 5) +
        365 * year +
        Math.floor(year / 4) -
        Math.floor(year / 100) +
        Math.floor(year / 400) -
        32045
      );
    };

    // JDN to Ethiopian date
    const JDNToEthiopian = (
      jdn: number
    ): { year: number; month: number; day: number } => {
      const r = (jdn - 1723856) % 1461;
      const n = (r % 365) + 365 * Math.floor(r / 1460);

      const year =
        4 * Math.floor((jdn - 1723856) / 1461) +
        Math.floor(r / 365) -
        Math.floor(r / 1460);
      const month = Math.floor(n / 30) + 1;
      const day = (n % 30) + 1;

      return { year, month, day };
    };

    const gregorianYear = gregorianDate.getFullYear();
    const gregorianMonth = gregorianDate.getMonth() + 1;
    const gregorianDay = gregorianDate.getDate();

    // Convert to JDN then to Ethiopian
    const jdn = gregorianToJDN(gregorianYear, gregorianMonth, gregorianDay);
    const ethiopianDate = JDNToEthiopian(jdn);

    // Handle Pagume special cases
    if (ethiopianDate.month === 13) {
      const maxPagumeDays = isLeapYear(ethiopianDate.year + 1) ? 6 : 5;
      if (ethiopianDate.day > maxPagumeDays) {
        ethiopianDate.month = 1;
        ethiopianDate.day = ethiopianDate.day - maxPagumeDays;
        ethiopianDate.year++;
      }
    }

    return `${ethiopianMonths[ethiopianDate.month - 1]} ${ethiopianDate.day} ${
      ethiopianDate.year
    }`;
  };

  return { toEthiopian };
};