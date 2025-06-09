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

  let match = normalizedDateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (match) {
    day = match[1];
    month = match[2];
    year = match[3];
  }

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
  
  if (!day) {
    match = normalizedDateStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (match) {
        year = match[1];
        month = match[2];
        day = match[3];
    }
  }

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

      if (yearInt + currentCentury > currentYear + 15 && yearInt > 50) { // e.g. if '98' and current year 2023 -> 1998
          year = (currentCentury - 100 + yearInt).toString();
      } else { // e.g. if '20' and current year 2023 -> 2020
          year = (currentCentury + yearInt).toString();
      }
    }

    const finalDay = day.padStart(2, '0');
    const finalMonth = month.padStart(2, '0');

    const dayNum = parseInt(finalDay, 10);
    const monthNum = parseInt(finalMonth, 10);
    const yearNum = parseInt(year, 10);

    if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
      const testDate = new Date(yearNum, monthNum - 1, dayNum); // month is 0-indexed
      if (testDate.getFullYear() === yearNum && testDate.getMonth() === monthNum -1 && testDate.getDate() === dayNum) {
        return `${finalDay}/${finalMonth}/${year}`;
      }
    }
  }

  if (dateStr.trim().match(/(\d{1,2}[-\/\s.]\d{1,2}[-\/\s.]\d{2,4})|(\d{1,2}[-\/\s.][A-Za-z]{3,}[-\/\s.]\d{2,4})/)) {
    return dateStr.trim(); 
  }

  return undefined; 
};