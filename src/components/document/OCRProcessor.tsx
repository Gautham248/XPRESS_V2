
// src/components/OcrProcessor.tsx

import React, { useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker, PSM } from 'tesseract.js';
import type { Worker } from 'tesseract.js';
import toast from 'react-hot-toast';

// --- pdfjs-dist worker setup ---
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;
}

// Define the props interface for the OcrProcessor component
interface OcrProcessorProps {
  fileToProcess: File;
  onComplete: (rawText: string) => void;
  onCancel: () => void;
}

// Interface to hold results from each OCR rotation attempt
interface OcrResult {
  text: string;
  confidence: number;
  quality: number; // Custom document quality score
  rotation: number; // The rotation angle (0, 90, 180, 270)
  score: number; // Combined score (confidence + quality) for comparison
}

/**
 * Helper function to rotate an HTMLCanvasElement image by a specified degree.
 * This is important for OCR accuracy, as Tesseract performs best on upright text.
 * @param originalCanvas The canvas containing the original image.
 * @param degrees The rotation angle (e.g., 90, 180, 270).
 * @returns A new HTMLCanvasElement with the rotated image.
 */
const rotateCanvas = (originalCanvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement => {
  const rotatedCanvas = document.createElement('canvas');
  const ctx = rotatedCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context for rotation');

  const { width, height } = originalCanvas;
  
  if (degrees === 90 || degrees === 270) {
    rotatedCanvas.width = height;
    rotatedCanvas.height = width;
  } else {
    rotatedCanvas.width = width;
    rotatedCanvas.height = height;
  }

  ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(originalCanvas, -width / 2, -height / 2);

  return rotatedCanvas;
};

/**
 * Calculates a quality score for the extracted text based on expected document structure and content,
 * specifically tailored for identity documents like passports/visas.
 * This helps in selecting the best OCR result among different rotations.
 * @param text The raw text extracted by OCR.
 * @returns A numerical score indicating the quality/relevance of the document.
 */
const calculateDocumentQuality = (text: string): number => {
  let score = 0;
  
  // Presence of key document identifiers (case-insensitive)
  if (/passport/i.test(text)) score += 20;
  if (/visa/i.test(text)) score += 15;
  if (/republic of|kingdom of/i.test(text)) score += 10;
  
  // Presence of key fields commonly found in identity documents
  if (/(surname|name|nom)/i.test(text)) score += 10;
  if (/(given name|pr[eé]noms)/i.test(text)) score += 10;
  if (/(nationality|nationalit[eé])/i.test(text)) score += 10;
  if (/(date of birth|date de naissance)/i.test(text)) score += 15;
  if (/(date of issue|date de d[eé]livrance)/i.test(text)) score += 20; // Increased weight for issue date
  if (/(date of expiry|date d.expiration)/i.test(text)) score += 20; // Increased weight for expiry date
  if (/(authority|autorit[eé])/i.test(text)) score += 10;
  
  // Check for structured data patterns (e.g., 3-letter country codes, common passport number patterns, date formats)
  if (/\b[A-Z]{3}\b/.test(text)) score += 10; // 3-letter country codes (e.g., IND, USA)
  
  // Stronger pattern match for passport number (alphanumeric, 7-9 chars, often starts with a letter)
  if (/\b[A-Z][A-Z0-9]{6,8}\b/.test(text)) score += 25; 

  // Stronger pattern match for common date formats (DD MON YYYY, DD/MM/YYYY, DD.MM.YYYY)
  if (/\b\d{1,2}\s*(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s*\d{4}\b/i.test(text)) score += 30; // DD MON YYYY
  if (/\b\d{1,2}[\s.\/\-]\d{1,2}[\s.\/\-]\d{4}\b/.test(text)) score += 20; // DD/MM/YYYY or DD.MM.YYYY

  // Check for Machine Readable Zone (MRZ) - a very strong indicator for passports/visas
  const mrzLines = text.match(/([A-Z0-9<]{30,44})/g) || [];
  if (mrzLines.length > 0) {
      score += 30; // Bonus for finding at least one potential MRZ line
      if (mrzLines.length > 1) score += 30; // Bigger bonus for finding two MRZ lines (typical for TD-3 passports)
  }
  
  // Penalize very short text (likely garbage OCR or empty document)
  if (text.length < 50) score -= 30;
  
  // Bonus for reasonable text length (not too short, not excessively long)
  if (text.length > 150 && text.length < 2000) score += 10;
  
  return Math.max(0, score); // Ensure the score is not negative
};

/**
 * Attempts OCR on a canvas image with different rotations (0, 90, 180, 270 degrees)
 * and returns all successful results.
 * @param canvas The HTMLCanvasElement containing the image to OCR.
 * @param tesseractWorker The Tesseract.js worker instance.
 * @param isCancelled A function to check if the OCR process has been cancelled.
 * @returns An array of OcrResult objects for each successful rotation attempt.
 */
const tryOcrWithRotations = async (
  canvas: HTMLCanvasElement, 
  tesseractWorker: Worker,
  isCancelled: () => boolean
): Promise<OcrResult[]> => {
  if (isCancelled()) return [];

  // Prioritize 0-degree first, then others.
  const orientations = [0, 180, 90, 270]; 
  const results: OcrResult[] = [];

  for (const rotation of orientations) {
    if (isCancelled()) return [];
    try {
      console.log(`Trying OCR at ${rotation}° rotation...`);
      const canvasToProcess = rotation === 0 ? canvas : rotateCanvas(canvas, rotation);
      
      const { data: { text, confidence } } = await tesseractWorker.recognize(canvasToProcess);
      
      const qualityScore = calculateDocumentQuality(text);
      // Combine Tesseract's confidence with our custom quality score.
      const combinedScore = (confidence * 0.4) + (qualityScore * 0.6); // Weight quality higher

      console.log(`Rotation ${rotation}°: confidence=${confidence.toFixed(2)}, quality=${qualityScore}, combined=${combinedScore.toFixed(2)}, textLength=${text.length}`);
      
      if (text.trim().length > 0) { // Only add non-empty results
        results.push({ text, confidence, quality: qualityScore, rotation, score: combinedScore });
      }

    } catch (error) {
      console.warn(`OCR failed at ${rotation}° rotation:`, error);
      // Do not add failed results to the array, or add with a very low score if needed for debugging.
    }
  }
  return results;
};

/**
 * Selects the best OCR text from a list of results, prioritizing 0-degree
 * if it meets certain criteria, otherwise selecting the overall best by score.
 * @param results An array of OcrResult objects from various rotations.
 * @param isCancelled A function to check if the OCR process has been cancelled.
 * @returns The selected raw text string.
 */
const selectFinalOcrText = (results: OcrResult[], isCancelled: () => boolean): string => {
  if (isCancelled()) return '';

  const validResults = results.filter(r => r.text.trim().length > 0);
  if (validResults.length === 0) {
      console.log("No valid OCR results to select from.");
      return '';
  }

  const zeroDegreeResult = validResults.find(r => r.rotation === 0);
  // Find the best overall result based on the combined score (confidence + custom quality)
  const bestOverallResult = validResults.reduce((best, current) => (current.score > best.score ? current : best));

  console.log("--- OCR Text Selection Logic ---");
  console.log("0-degree result (if exists):", zeroDegreeResult ? `Conf: ${zeroDegreeResult.confidence.toFixed(2)}, Quality: ${zeroDegreeResult.quality}, Score: ${zeroDegreeResult.score.toFixed(2)}` : 'N/A');
  console.log("Best overall result:", `Rotation: ${bestOverallResult.rotation}°, Conf: ${bestOverallResult.confidence.toFixed(2)}, Quality: ${bestOverallResult.quality}, Score: ${bestOverallResult.score.toFixed(2)}`);

  // --- Decision Logic ---
  // If the 0-degree result exists and is "good enough" based on confidence and custom quality,
  // we prioritize it, as the user indicated it gives correct issue dates.
  const MIN_CONFIDENCE_FOR_ZERO_DEGREE_PRIORITY = 70; // Tesseract confidence
  const MIN_QUALITY_FOR_ZERO_DEGREE_PRIORITY = 60; // Custom quality score

  if (
      zeroDegreeResult &&
      zeroDegreeResult.confidence >= MIN_CONFIDENCE_FOR_ZERO_DEGREE_PRIORITY &&
      zeroDegreeResult.quality >= MIN_QUALITY_FOR_ZERO_DEGREE_PRIORITY
  ) {
      console.log("Prioritizing 0-degree result due to meeting minimum confidence and quality thresholds.");
      return zeroDegreeResult.text;
  }

  // Otherwise, fall back to the best overall result (which could be 0-degree anyway if it was the best,
  // but this ensures we get a rotated result if 0-degree was poor).
  console.log(`Falling back to best overall result (${bestOverallResult.rotation}° rotation) as 0-degree was not prioritized.`);
  return bestOverallResult.text;
};

/**
 * OcrProcessor component handles the core OCR logic for a given file.
 * It initializes Tesseract, processes PDFs or images, and provides progress/completion feedback.
 */
const OcrProcessor: React.FC<OcrProcessorProps> = ({ fileToProcess, onComplete, onCancel }) => {

  useEffect(() => {
    let isCancelled = false;
    const checkCancelled = () => isCancelled;

    let tesseractWorker: Worker | null = null;
    const toastId = toast.loading('Initializing OCR Engine...', { position: 'bottom-center' });

    const runOcr = async () => {
      try {
        toast.loading('Loading OCR Model...', { id: toastId, position: 'bottom-center' });
        tesseractWorker = await createWorker('eng', 1, {
            logger: m => {
                if (isCancelled) return;
                if (m.status.startsWith('recognizing text') && typeof m.progress === 'number') {
                    const progress = Math.round(m.progress * 100);
                    toast.loading(`Scanning Document: ${progress}%`, { id: toastId, position: 'bottom-center' });
                }
            },
        });
        
        await tesseractWorker.setParameters({
          tessedit_pageseg_mode: PSM.AUTO,
          tessedit_ocr_engine_mode: 1,
        });

        let extractedRawText = '';
        const canvas = document.createElement('canvas'); // Create canvas once
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get 2D rendering context.');

        if (fileToProcess.type === 'application/pdf') {
          if (isCancelled) return;
          toast.loading('Processing PDF...', { id: toastId, position: 'bottom-center' });
          const arrayBuffer = await fileToProcess.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const numPages = pdf.numPages;

          let fullOcrResults: OcrResult[] = [];
          for (let i = 1; i <= numPages; i++) {
            if (isCancelled) return;
            toast.loading(`Rendering PDF Page ${i}/${numPages}`, { id: toastId, position: 'bottom-center' });
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;
            
            // Get all OCR results for different rotations for this page
            const pageOcrResults = await tryOcrWithRotations(canvas, tesseractWorker, checkCancelled);
            fullOcrResults = fullOcrResults.concat(pageOcrResults); // Accumulate results from all pages
          }
          // For multi-page PDFs, we might need a more complex selection or concatenation logic.
          // For now, let's assume single-page passport documents, and select the best from all pages combined.
          extractedRawText = selectFinalOcrText(fullOcrResults, checkCancelled);

        } else if (fileToProcess.type.startsWith('image/')) {
          if (isCancelled) return;
          
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              context.drawImage(img, 0, 0);
              resolve();
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(fileToProcess);
          });

          // Get all OCR results for different rotations for the image
          const imageOcrResults = await tryOcrWithRotations(canvas, tesseractWorker, checkCancelled);
          extractedRawText = selectFinalOcrText(imageOcrResults, checkCancelled);

        } else {
            throw new Error('Unsupported file type. Please upload a PDF or an image.');
        }

        if (isCancelled) {
          console.log("OCR process was cancelled before completion. Aborting callback.");
          return;
        }

        console.log('[OCR] Raw extracted text from OcrProcessor:', `\n--- START TEXT ---\n${extractedRawText}\n--- END TEXT ---`);

        if (!extractedRawText) {
            toast.error('Scan complete, but no text was found in the document.', { id: toastId, duration: 4000 });
            onCancel();
            return;
        }

        toast.success('Scan complete. Parsing data...', { id: toastId, position: 'bottom-center' });
        onComplete(extractedRawText);

      } catch (error: any) {
        if (isCancelled) {
          console.log("OCR process was cancelled, ignoring error from aborted process:", error);
          return;
        }
        console.error("OCR Error:", error);
        toast.error(`OCR Scan Failed: ${error.message}`, { id: toastId, position: 'bottom-center' });
        onCancel();
      } finally {
        if (tesseractWorker) {
          await tesseractWorker.terminate();
        }
      }
    };

    runOcr();

    return () => {
      isCancelled = true;
      console.log('Cleanup triggered: OCR process marked as cancelled.');

      toast.dismiss(toastId);
      if (tesseractWorker) {
           tesseractWorker.terminate().then(() => {
             console.log('OCR worker termination requested on cleanup.');
           });
      }
    };
  }, [fileToProcess, onComplete, onCancel]);

  return null;
};

export default OcrProcessor;
