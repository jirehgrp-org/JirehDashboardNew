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
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    };

    const gregorianYear = gregorianDate.getFullYear();
    const gregorianMonth = gregorianDate.getMonth() + 1;
    const gregorianDay = gregorianDate.getDate();

    // Ethiopian year starts roughly 8 years behind Gregorian
    let ethiopianYear = gregorianYear - 7;

    // Adjust for dates before Ethiopian New Year (Sept 11/12)
    if (gregorianMonth < 9 || (gregorianMonth === 9 && gregorianDay < 12)) {
      ethiopianYear--;
    }

    interface MonthStart {
      month: number;
      day: number;
    }

    // Date conversion matrix
    const monthStartDays: Record<number, MonthStart> = {
      1: { month: 9, day: 12 }, // Meskerem starts Sept 12
      2: { month: 10, day: 12 }, // Tikimt starts Oct 12
      3: { month: 11, day: 11 }, // Hidar starts Nov 11
      4: { month: 12, day: 11 }, // Tahsas starts Dec 11
      5: { month: 1, day: 10 }, // Tir starts Jan 10
      6: { month: 2, day: 9 }, // Yekatit starts Feb 9
      7: { month: 3, day: 10 }, // Megabit starts Mar 10
      8: { month: 4, day: 9 }, // Miyazia starts Apr 9
      9: { month: 5, day: 9 }, // Ginbot starts May 9
      10: { month: 6, day: 8 }, // Sene starts June 8
      11: { month: 7, day: 8 }, // Hamle starts July 8
      12: { month: 8, day: 7 }, // Nehase starts Aug 7
      13: { month: 9, day: 6 }, // Pagume starts Sept 6
    };

    let ethiopianMonth: number;
    let ethiopianDay: number = 0;

    // Handle Pagume (Ethiopian 13th month)
    if (gregorianMonth === 9 && gregorianDay >= 6 && gregorianDay < 12) {
      ethiopianMonth = 13;
      ethiopianDay = gregorianDay - 5;
      // Ensure Pagume doesn't exceed 5 days (6 in leap years)
      const maxPagumeDays = isLeapYear(gregorianYear) ? 6 : 5;
      if (ethiopianDay > maxPagumeDays) {
        ethiopianMonth = 1;
        ethiopianDay = ethiopianDay - maxPagumeDays;
      }
    } else {
      // Find the Ethiopian month based on Gregorian date
      let foundMonth = 1;
      for (let i = 1; i <= 13; i++) {
        const start = monthStartDays[i];
        const nextStart = monthStartDays[i + 1] || { month: 9, day: 12 };

        if (gregorianMonth === start.month) {
          if (gregorianDay >= start.day) {
            foundMonth = i;
            ethiopianDay = gregorianDay - start.day + 1;
            break;
          }
        } else if (gregorianMonth === nextStart.month) {
          if (gregorianDay < nextStart.day) {
            foundMonth = i;
            const daysInPrevMonth = new Date(
              gregorianYear,
              gregorianMonth - 1,
              0
            ).getDate();
            ethiopianDay = gregorianDay + (daysInPrevMonth - start.day) + 1;
            break;
          }
        }
      }
      ethiopianMonth = foundMonth;
    }

    // Ensure we don't exceed 30 days for regular months
    if (ethiopianMonth !== 13 && ethiopianDay > 30) {
      ethiopianMonth++;
      ethiopianDay -= 30;
    }

    return `${
      ethiopianMonths[ethiopianMonth - 1]
    } ${ethiopianDay} ${ethiopianYear}`;
  };

  return { toEthiopian };
};
