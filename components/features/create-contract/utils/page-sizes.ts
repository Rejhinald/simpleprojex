import { PageSize } from "./types";

interface PageDimensions {
  width: number;
  height: number;
}

// Paper dimensions in pixels at 96 DPI (standard screen resolution)
// This provides more accurate real-world sizes on screens
export const getPageDimensions = (pageSize: PageSize): PageDimensions => {
  switch (pageSize) {
    case "a4":
      // A4: 210mm × 297mm (8.27in × 11.69in)
      return { width: 794, height: 1123 }; // A4 in pixels at 96 DPI
    case "letter":
      // US Letter: 8.5in × 11in (216mm × 279mm)
      return { width: 816, height: 1056 }; // Letter in pixels at 96 DPI
    case "legal":
      // US Legal: 8.5in × 14in (216mm × 356mm)
      return { width: 816, height: 1344 }; // Legal in pixels at 96 DPI
    case "short":
      // Custom short format (adjusted for new DPI)
      return { width: 794, height: 935 }; // Scaled to keep proportions
    default:
      return { width: 794, height: 1123 }; // Default to A4
  }
};

// Fix: Use 'export type' instead of just 'export' for re-exporting types
export type { PageSize };
