import * as pdfjsLib from 'pdfjs-dist';

// Initialize the worker. 
// We point to the same version as defined in the importmap to ensure compatibility.
// This is required for pdf.js to parse documents in a non-blocking way.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

/**
 * Extracts all text content from a PDF file.
 * Returns a string with page headers formatted as "--- Page X ---".
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    // We cast to any because Typescript types for the CDN version might be implicit
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Loop through each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Concatenate text items with spaces
      // @ts-ignore
      const pageText = textContent.items.map((item) => item.str).join(' ');
      
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error("Failed to parse PDF file.");
  }
};
