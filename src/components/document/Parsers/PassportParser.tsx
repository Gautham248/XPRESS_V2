// src/components/Parsers/PassportParser.tsx

import React, { useEffect } from 'react';

export interface ParsedPassportInfo {
  passportNumber?: string;
  issuingCountry?: string;
  issueDate?: Date | null;
  expiryDate?: Date | null;
}

interface PassportParserProps {
  rawText: string;
  onDataParsed: (info: ParsedPassportInfo) => void;
}


const normalizeDate = (dateStr: string | undefined): Date | null => {
  if (!dateStr) return null;

  const monthMap: { [key: string]: number } = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  let match = dateStr.match(/(\d{1,2})\s*([A-Za-z]{3})\s*(\d{4})/i);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = monthMap[match[2].toLowerCase()];
    const year = parseInt(match[3], 10);
    if (day && month !== undefined && year) {
        const d = new Date(Date.UTC(year, month, day));
        if (!isNaN(d.getTime())) return d;
    }
  }

  match = dateStr.match(/(\d{1,2})[\s\.\/](\d{1,2})[\s\.\/](\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const d = new Date(Date.UTC(year, month, day));
    if (!isNaN(d.getTime())) return d;
  }
  
  match = dateStr.match(/^(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    let year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    year = year < 50 ? 2000 + year : 1900 + year;
    const d = new Date(Date.UTC(year, month, day));
    if (!isNaN(d.getTime())) return d;
  }

  return null;
};

const parsePassportText = (rawText: string): ParsedPassportInfo => {
    const newInfo: ParsedPassportInfo = {};
    const text = rawText.replace(/O/g, '0');

    const passportNumLabelRegex = /(?:Passport\s*No\.?)[\s\S]*?\b([A-Z0-9<]{7,9})\b/i;
    const mrzLine2Regex = /([A-Z0-9<]{9})[A-Z0-9<]?\d?([A-Z<]{3})(\d{6})\d[MFX<](\d{6})/;
    const countryCodeRegex = /(?:Country\s*Code)[\s\S]*?\b([A-Z]{3})\b/i;

    let match = text.match(passportNumLabelRegex);
    if (match) newInfo.passportNumber = match[1].replace(/</g, '');
    
    match = text.match(countryCodeRegex);
    if (match) newInfo.issuingCountry = match[1];

    const allDatesRegex = /(\d{1,2}[\s\.\/]\d{1,2}[\s\.\/]\d{4})/g;
    const dateMatches = text.match(allDatesRegex);

    if (dateMatches && dateMatches.length >= 2) {
      const validDates = dateMatches
        .map(dateStr => normalizeDate(dateStr))
        .filter((date): date is Date => date !== null);
      
      validDates.sort((a, b) => a.getTime() - b.getTime());

      if (validDates.length === 3) {
        newInfo.issueDate = validDates[1];
        newInfo.expiryDate = validDates[2];
      } 
      else if (validDates.length === 2) {
        newInfo.issueDate = validDates[0];
        newInfo.expiryDate = validDates[1];
      }
    }

    const mrzMatch = text.match(mrzLine2Regex);
    if (mrzMatch) {
        if (!newInfo.passportNumber) newInfo.passportNumber = mrzMatch[1].replace(/</g, '');
        if (!newInfo.issuingCountry) newInfo.issuingCountry = mrzMatch[2].replace(/</g, '');
        if (!newInfo.expiryDate) newInfo.expiryDate = normalizeDate(mrzMatch[4]);
    }
    
    return newInfo;
};

const PassportParser: React.FC<PassportParserProps> = ({ rawText, onDataParsed }) => {
  useEffect(() => {
    if (!rawText) return;

    console.log("--- RAW OCR TEXT FOR PARSER ---", `\n${rawText}\n`, "--- END RAW TEXT ---");

    const parsedInfo = parsePassportText(rawText);

    console.log("--- PARSED PASSPORT INFO (Date objects) ---", parsedInfo);

    onDataParsed(parsedInfo);

  }, [rawText, onDataParsed]);

  return (
    <div className="mt-2 mb-4 p-3 border-l-4 border-blue-400 bg-blue-50">
      <p className="text-sm text-blue-700">Please verify the auto-filled details and click 'Save' below.</p>
    </div>
  );
};

export default PassportParser;
 