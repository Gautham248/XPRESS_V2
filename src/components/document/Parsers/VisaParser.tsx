// src/components/Parsers/VisaParser.tsx

import React, { useEffect } from 'react';

export interface ParsedVisaInfo {
  visaNumber?: string;
  visaClass?: string;
  issuingCountry?: string; 
  issueDate?: Date | null;
  expiryDate?: Date | null;
}

interface VisaParserProps {
  rawText: string;
  onDataParsed: (info: ParsedVisaInfo) => void;
}

const normalizeDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;

  let match = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    if (day && month >= 0 && year) {
      const d = new Date(Date.UTC(year, month, day));
      if (!isNaN(d.getTime())) return d;
    }
  }

  const cleanedDateStr = dateStr.replace(/\s/g, '').toUpperCase();
  const monthMap: { [key: string]: number } = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
  };
  match = cleanedDateStr.match(/(\d{1,2})([A-Z]{3})(\d{4})/i);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = monthMap[match[2]];
    const year = parseInt(match[3], 10);
    if (day && month !== undefined && year) {
      const d = new Date(Date.UTC(year, month, day));
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
};


const parseVisaText = (rawText: string): ParsedVisaInfo => {
  const newInfo: ParsedVisaInfo = {};
  const text = rawText.replace(/O/g, '0');
  const lines = text.split('\n');

  const isUSVisa = /Control\s*Number|Issuing\s*Post|Expiration\s*Date/i.test(text);

  if (isUSVisa) {
    const visaNoMatch = text.match(/(?:Control\s*Number)[\s\S]*?(\d{10,})/i);
    if (visaNoMatch) newInfo.visaNumber = visaNoMatch[1];

    const issuingPostMatch = text.match(/(?:Issuing\s*Post\s*Name)[\s\S]*?([A-Z\s]+?)(?=\s*Surname)/i);
    if (issuingPostMatch) newInfo.issuingCountry = issuingPostMatch[1].trim();

    const visaClassMatch = text.match(/(?:Visa\s*Type\s*[\/\w]*\s*Class)[\s\S]*?\b([A-Z0-9]+)\b/i);
    if (visaClassMatch) newInfo.visaClass = visaClassMatch[1];

    const issueDateMatch = text.match(/(?:Issue\s*Date)[\s\S]*?(\d{1,2}[A-Z]{3}\d{4})/i);
    newInfo.issueDate = normalizeDate(issueDateMatch?.[1]);

    const expiryDateMatch = text.match(/(?:Exp\w*\s*Date)[\s\S]*?(\d{1,2}[A-Z]{3}\d{4})/i);
    newInfo.expiryDate = normalizeDate(expiryDateMatch?.[1]);

  } else {
    const indianVisaNoRegex = /REPUBLIC\sOF\sINDIA\s*([A-Z]{2}\s*\d{7})/;
    const indianVisaTypeRegex = /(?:Visa\sType)\s*([A-Z0-9]+)\b/;
    const indianIssueDateRegex = /(?:Date\sof\sIssue)[\s\S]*?(\d{2}\/\d{2}\/\d{4})/;
    const indianExpiryDateRegex = /(?:Date\sof\sExpiry|Date\sot\sExpiry)[\s\S]*?(\d{2}\/\d{2}\/\d{4})/;
    const indianIssuedAtRegex = /ISSUED\sAT\s([A-Z\s]+?)(?=\n|BY\sROAD)/;

    let match = text.match(indianVisaNoRegex);
    if (match) newInfo.visaNumber = match[1].replace(/\s/g, '');

    match = text.match(indianVisaTypeRegex);
    if (match) newInfo.visaClass = match[1].trim();

    match = text.match(indianIssuedAtRegex);
    if (match) newInfo.issuingCountry = match[1].trim();

    const issueDateMatch = text.match(indianIssueDateRegex);
    newInfo.issueDate = normalizeDate(issueDateMatch?.[1]);

    const expiryDateMatch = text.match(indianExpiryDateRegex);
    newInfo.expiryDate = normalizeDate(expiryDateMatch?.[1]);

    if (!newInfo.visaNumber) {
      const mrzLine2 = lines.find(line => line.startsWith('V') && line.includes('BGD'));
      if (mrzLine2) {
        newInfo.visaNumber = mrzLine2.substring(0, 9).replace(/</g, '');
      }
    }
  }

  return newInfo;
};

const VisaParser: React.FC<VisaParserProps> = ({ rawText, onDataParsed }) => {
  useEffect(() => {
    if (!rawText) return;

    console.log("--- RAW OCR TEXT FOR VisaParser ---", `\n${rawText}\n`, "--- END RAW TEXT ---");
    const parsedInfo = parseVisaText(rawText);
    console.log("--- PARSED VISA INFO ---", parsedInfo);

    onDataParsed(parsedInfo);
  }, [rawText, onDataParsed]);

  return (
    <div className="mt-2 mb-4 p-3 border-l-4 border-yellow-400 bg-yellow-50">
    </div>
  );
};

export default VisaParser;