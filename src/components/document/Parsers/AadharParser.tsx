// src/components/Parsers/AadharParser.tsx

import React, { useEffect } from 'react';

export interface ParsedAadhaarInfo {
  idNumber?: string;
  fullName?: string;
}

interface AadharParserProps {
  rawText: string;
  onDataParsed: (info: ParsedAadhaarInfo) => void;
}


const parseAadhaarText = (rawText: string): ParsedAadhaarInfo => {
  const newInfo: ParsedAadhaarInfo = {};
  const lines = rawText.split('\n');

  const probableNameRegex = /^\s*([A-Z][a-zA-Z]+\s[A-Z][a-zA-Z]+(\s[A-Z][a-zA-Z]+)?)\s*$/;
  const aadhaarNumberLineRegex = /^\s*[\d\s]{10,14}\s*$/;


  const numberLine = lines.find(line => aadhaarNumberLineRegex.test(line));
  if (numberLine) {
    newInfo.idNumber = numberLine.replace(/\s/g, '');
  }

  let nameFound = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/(Name)/i)) {
      if (lines[i + 1] && lines[i + 1].trim() !== '') {
        if (probableNameRegex.test(lines[i + 1])) {
          newInfo.fullName = lines[i + 1].trim();
          nameFound = true;
          break;
        }
      }
    }
  }
  
  if (!nameFound) {
    for (const line of lines) {
      const nameMatch = line.match(probableNameRegex);
      if (nameMatch && nameMatch[1]) {
        const potentialName = nameMatch[1].toLowerCase();
        if (!potentialName.includes('government of india') && !potentialName.includes('your aadhaar')) {
          newInfo.fullName = nameMatch[1];
          break; 
        }
      }
    }
  }

  if (newInfo.fullName) {
    newInfo.fullName = newInfo.fullName
      .replace(/\s+Male$/i, '')
      .replace(/\s+Female$/i, '')
      .trim();
  }

  return newInfo;
};


const AadharParser: React.FC<AadharParserProps> = ({ rawText, onDataParsed }) => {
  useEffect(() => {
    if (!rawText) return;

    console.log("--- RAW OCR TEXT FOR AadharParser ---", `\n${rawText}\n`, "--- END RAW TEXT ---");
    const parsedInfo = parseAadhaarText(rawText);
    console.log("--- PARSED AADHAAR INFO ---", parsedInfo);

    onDataParsed(parsedInfo);
  }, [rawText, onDataParsed]);

  return (
    <></>
  );
};

export default AadharParser;