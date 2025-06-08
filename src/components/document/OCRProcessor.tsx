// src/components/OcrProcessor.tsx

import React, { useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import type { Worker } from 'tesseract.js';
import toast from 'react-hot-toast';

// --- pdfjs-dist worker setup ---
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;
}

interface OcrProcessorProps {
  fileToProcess: File;
  onComplete: (rawText: string) => void;
  onCancel: () => void;
}

const OcrProcessor: React.FC<OcrProcessorProps> = ({ fileToProcess, onComplete, onCancel }) => {

  useEffect(() => {
    // <<< FIX START >>>
    // This flag will be used to signal to the async process if it has been cancelled.
    let isCancelled = false;
    // <<< FIX END >>>

    let tesseractWorker: Worker | null = null;
    const toastId = toast.loading('Initializing OCR Engine...', { position: 'bottom-center' });

    const runOcr = async () => {
      try {
        toast.loading('Loading OCR Model...', { id: toastId, position: 'bottom-center' });
        tesseractWorker = await createWorker('eng', 1, {
            logger: m => {
                // <<< FIX START >>>
                // Before updating the toast, check if the process has been cancelled.
                if (isCancelled) return;
                // <<< FIX END >>>
                if (m.status === 'recognizing text' && typeof m.progress === 'number') {
                    const progress = Math.round(m.progress * 100);
                    toast.loading(`Scanning Document: ${progress}%`, { id: toastId, position: 'bottom-center' });
                }
            },
        });

        let extractedRawText = '';

        if (fileToProcess.type === 'application/pdf') {
          // <<< FIX START >>>
          // Check for cancellation before starting a potentially long process
          if (isCancelled) return;
          // <<< FIX END >>>
          toast.loading('Processing PDF...', { id: toastId, position: 'bottom-center' });
          const arrayBuffer = await fileToProcess.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const numPages = pdf.numPages;

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Could not get 2D rendering context.');

          let fullOcrText = '';
          for (let i = 1; i <= numPages; i++) {
             // <<< FIX START >>>
            // Check for cancellation within the loop
            if (isCancelled) return;
            // <<< FIX END >>>
            toast.loading(`Rendering PDF Page ${i}/${numPages}`, { id: toastId, position: 'bottom-center' });
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            const { data: { text } } = await tesseractWorker.recognize(canvas);
            if (text.trim()) {
              fullOcrText += (fullOcrText ? '\n\n' : '') + text;
            }
          }
          extractedRawText = fullOcrText.trim();

        } else if (fileToProcess.type.startsWith('image/')) {
          if (isCancelled) return;
          const { data: { text } } = await tesseractWorker.recognize(fileToProcess);
          extractedRawText = text.trim();

        } else {
            throw new Error('Unsupported file type.');
        }

        // <<< FIX START >>>
        // This is the most crucial check. Do not proceed if the component has unmounted.
        if (isCancelled) {
          console.log("OCR process was cancelled before completion. Aborting callback.");
          return;
        }
        // <<< FIX END >>>

        console.log('[OCR] Raw extracted text from OcrProcessor:', `\n--- START TEXT ---\n${extractedRawText}\n--- END TEXT ---`);

        if (!extractedRawText) {
            toast.error('Scan complete, but no text was found in the document.', { id: toastId, duration: 4000 });
            onCancel();
            return;
        }

        toast.success('Scan complete. Parsing data...', { id: toastId, position: 'bottom-center' });
        onComplete(extractedRawText);

      } catch (error: any) {
        // <<< FIX START >>>
        // Also check here. Don't show an error for a process that was intentionally cancelled.
        if (isCancelled) {
          console.log("OCR process was cancelled, ignoring error from aborted process:", error);
          return;
        }
        // <<< FIX END >>>
        console.error("OCR Error:", error);
        toast.error(`OCR Scan Failed: ${error.message}`, { id: toastId, position: 'bottom-center' });
        onCancel();
      } finally {
        // The worker for the zombie process will be terminated here eventually.
        if (tesseractWorker) {
          await tesseractWorker.terminate();
        }
      }
    };

    runOcr();

    return () => {
      // <<< FIX START >>>
      // When the component unmounts (due to StrictMode or navigation),
      // set the flag to true. The running async function will see this and stop.
      isCancelled = true;
      console.log('Cleanup triggered: OCR process marked as cancelled.');
      // <<< FIX END >>>

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