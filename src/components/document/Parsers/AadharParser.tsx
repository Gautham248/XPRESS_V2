// src/components/Parsers/AadharParser.tsx

import React, { useEffect } from 'react';

// Defines the data structure this component will parse and emit
export interface ParsedAadhaarInfo {
  idNumber?: string;
  fullName?: string;
}

interface AadharParserProps {
  rawText: string;
  onDataParsed: (info: ParsedAadhaarInfo) => void;
}

/**
 * A more robust function to parse raw OCR text into structured Aadhaar info.
 * This version uses a multi-layered approach to handle different Aadhaar formats and cleans the output.
 */
const parseAadhaarText = (rawText: string): ParsedAadhaarInfo => {
  const newInfo: ParsedAadhaarInfo = {};
  const lines = rawText.split('\n');

  // --- Regex Patterns for Aadhaar ---
  // A regex to find a line that looks like a name (2-3 capitalized words).
  const probableNameRegex = /^\s*([A-Z][a-zA-Z]+\s[A-Z][a-zA-Z]+(\s[A-Z][a-zA-Z]+)?)\s*$/;
  // ✅ NEW ROBUST REGEX: Finds a line containing only digits and spaces, with a total length of 10-14 chars.
  // This is a much better way to find the ID number regardless of exact digit count or spacing.
  const aadhaarNumberLineRegex = /^\s*[\d\s]{10,14}\s*$/;


  // --- Extraction Logic ---

  // 1. Extract Aadhaar Number by finding the correct line
  const numberLine = lines.find(line => aadhaarNumberLineRegex.test(line));
  if (numberLine) {
    // Clean the result by removing any spaces to get a pure digit string.
    newInfo.idNumber = numberLine.replace(/\s/g, '');
  }

  // 2. Extract Full Name (using a multi-step process)
  let nameFound = false;

  // Primary Strategy: Look for "Name / नाम" and grab the next non-empty line.
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/(Name|नाम)/i)) {
      if (lines[i + 1] && lines[i + 1].trim() !== '') {
        // Check if the next line looks like a name to avoid grabbing "DOB" etc.
        if (probableNameRegex.test(lines[i + 1])) {
          newInfo.fullName = lines[i + 1].trim();
          nameFound = true;
          break;
        }
      }
    }
  }
  
  // Fallback Strategy: If the primary method fails, find the first line that looks like a name.
  if (!nameFound) {
    for (const line of lines) {
      const nameMatch = line.match(probableNameRegex);
      if (nameMatch && nameMatch[1]) {
        const potentialName = nameMatch[1].toLowerCase();
        // Ensure we don't accidentally grab a header
        if (!potentialName.includes('government of india') && !potentialName.includes('your aadhaar')) {
          newInfo.fullName = nameMatch[1];
          break; // Found a likely name, stop searching
        }
      }
    }
  }

  // 3. CLEANUP: Remove any appended gender from the name.
  if (newInfo.fullName) {
    newInfo.fullName = newInfo.fullName
      .replace(/\s+Male$/i, '')
      .replace(/\s+Female$/i, '')
      .trim();
  }

  return newInfo;
};


// --- The React Component (No changes needed here) ---
const AadharParser: React.FC<AadharParserProps> = ({ rawText, onDataParsed }) => {
  useEffect(() => {
    if (!rawText) return;

    console.log("--- RAW OCR TEXT FOR AadharParser ---", `\n${rawText}\n`, "--- END RAW TEXT ---");
    const parsedInfo = parseAadhaarText(rawText);
    console.log("--- PARSED AADHAAR INFO ---", parsedInfo);

    onDataParsed(parsedInfo);
  }, [rawText, onDataParsed]);

  return (
    <div className="mt-2 mb-4 p-3 border-l-4 border-green-400 bg-green-50">
      <p className="text-sm text-green-700">Attempting to auto-fill form from the scanned Aadhaar card...</p>
    </div>
  );
};

export default AadharParser;