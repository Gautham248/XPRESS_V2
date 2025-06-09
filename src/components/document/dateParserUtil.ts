// src/components/dateParserUtil.ts

/**
 * Attempts to parse a date string from various common formats and some OCR variations
 * into a standardized "DD/MM/YYYY" format.
 *
 * @param dateStr The date string to parse.
 * @returns The parsed date in "DD/MM/YYYY" format, or the original trimmed string if parsing fails but it looks like a date,
 *          or undefined if the input is clearly not a date or is empty.
 */
export const parseStandardDate = (dateStr: string | undefined | null): string | undefined => {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
    return undefined;
  }

  let normalizedDateStr = dateStr.trim();

  // Common OCR mistakes: 'O' for '0', 'l' or 'I' for '1', 'S' for '5', 'B' for '8'
  normalizedDateStr = normalizedDateStr
    .replace(/O/gi, '0')
    .replace(/l/g, '1')
    .replace(/I/g, '1') // Capital I
    .replace(/S/gi, '5')
    .replace(/B/gi, '8');
  
  // Normalize separators to '/'
  normalizedDateStr = normalizedDateStr.replace(/[\s.-]+/g, '/');

  let day: string | undefined, month: string | undefined, year: string | undefined;

  // Month names map (short and long, case-insensitive for matching)
  const monthMap: { [key: string]: string } = {
    JAN: '01', JANUARY: '01',
    FEB: '02', FEBRUARY: '02',
    MAR: '03', MARCH: '03',
    APR: '04', APRIL: '04',
    MAY: '05', // MAY is already 3 letters
    JUN: '06', JUNE: '06',
    JUL: '07', JULY: '07',
    AUG: '08', AUGUST: '08',
    SEP: '09', SEPTEMBER: '09',
    OCT: '10', OCTOBER: '10',
    NOV: '11', NOVEMBER: '11',
    DEC: '12', DECEMBER: '12',
  };

  // Regex patterns to try:
  // 1. DD/MM/YYYY or D/M/YY or D/M/YYYY (handles 2 or 4 digit year)
  let match = normalizedDateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (match) {
    day = match[1];
    month = match[2];
    year = match[3];
  }

  // 2. DD/MMM/YYYY or D/MMM/YY (e.g., 05/JAN/2020 or 5/Jan/20)
  if (!day) {
    match = normalizedDateStr.match(/^(\d{1,2})\/([A-Z]{3,9})\/(\d{2}|\d{4})$/i);
    if (match) {
      const monthStr = match[2].toUpperCase();
      if (monthMap[monthStr] || monthMap[monthStr.substring(0,3)]) { // Check full name and short name
        day = match[1];
        month = monthMap[monthStr] || monthMap[monthStr.substring(0,3)];
        year = match[3];
      }
    }
  }
  
  // 3. YYYY/MM/DD (less common in documents but possible)
  if (!day) {
    match = normalizedDateStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (match) {
        year = match[1];
        month = match[2];
        day = match[3];
    }
  }

  // 4. Month DD, YYYY (e.g. January 05, 2020 or Jan 5 20) - spaces might be slashes now
  if (!day) {
    match = normalizedDateStr.match(/^([A-Z]{3,9})\/(\d{1,2})\/(\d{2}|\d{4})$/i);
    if (match) {
        const monthStr = match[1].toUpperCase();
        if (monthMap[monthStr] || monthMap[monthStr.substring(0,3)]) {
            month = monthMap[monthStr] || monthMap[monthStr.substring(0,3)];
            day = match[2];
            year = match[3];
        }
    }
  }
  
  // If a valid date was parsed:
  if (day && month && year) {
    // Normalize year to 4 digits
    if (year.length === 2) {
      const currentYear = new Date().getFullYear();
      const currentCentury = Math.floor(currentYear / 100) * 100;
      const yearInt = parseInt(year, 10);
      // Heuristic: if YY is <= current year's last two digits + 10 (for future expiry dates) assume current century
      // otherwise assume previous century (e.g. '98' -> 1998 not 2098)
      // For expiry dates, this might need adjustment. A '30' could be 2030.
      // A common rule is that years 00-68 are 20xx and 69-99 are 19xx for ICAO MRZ.
      // For simplicity now: if yearInt > (currentYear % 100) + 15 (allow 15 years in past)
      // then assume 19xx, else 20xx. This is a rough heuristic.
      if (yearInt + currentCentury > currentYear + 15 && yearInt > 50) { // e.g. if '98' and current year 2023 -> 1998
          year = (currentCentury - 100 + yearInt).toString();
      } else { // e.g. if '20' and current year 2023 -> 2020
          year = (currentCentury + yearInt).toString();
      }
    }

    // Pad day and month with leading zero if necessary
    const finalDay = day.padStart(2, '0');
    const finalMonth = month.padStart(2, '0');

    // Validate numeric parts (simple check)
    const dayNum = parseInt(finalDay, 10);
    const monthNum = parseInt(finalMonth, 10);
    const yearNum = parseInt(year, 10);

    if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
      // Basic sanity check with Date object (handles leap years, month day counts)
      const testDate = new Date(yearNum, monthNum - 1, dayNum); // month is 0-indexed
      if (testDate.getFullYear() === yearNum && testDate.getMonth() === monthNum -1 && testDate.getDate() === dayNum) {
        return `${finalDay}/${finalMonth}/${year}`;
      }
    }
  }

  // If no specific pattern matched, but the original string (after basic OCR cleanup)
  // "looks" like a date (e.g., contains numbers and slashes/dots/dashes), return it as is for manual review.
  // This is a weak check and can be improved.
  if (dateStr.trim().match(/(\d{1,2}[-\/\s.]\d{1,2}[-\/\s.]\d{2,4})|(\d{1,2}[-\/\s.][A-Za-z]{3,}[-\/\s.]\d{2,4})/)) {
    return dateStr.trim(); // Return original (trimmed) string as a fallback
  }

  return undefined; // Could not confidently parse as a date
};

// Example Usage (for testing in Node.js or browser console):
// console.log(parseStandardDate("05/Jan/2020"));        // Expected: 05/01/2020
// console.log(parseStandardDate("5.1.20"));           // Expected: 05/01/2020
// console.log(parseStandardDate("2023-12-25"));        // Expected: 25/12/2023
// console.log(parseStandardDate("1O/O2/2O21"));        // Expected: 10/02/2021 (after OCR fix)
// console.log(parseStandardDate("MARCH 3 1999"));       // Expected: 03/03/1999
// console.log(parseStandardDate("12 05 2025"));         // Expected: 12/05/2025
// console.log(parseStandardDate("Not a date"));        // Expected: undefined
// console.log(parseStandardDate("2/30/2023")); // Invalid day for Feb -> should fallback or be undefined depending on strictness
// console.log(parseStandardDate("Feb 30 2023")); // Should be undefined after Date object validation
// console.log(parseStandardDate("31.04.2024")); // April has 30 days -> should be undefined