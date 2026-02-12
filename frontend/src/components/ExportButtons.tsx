import { Button } from "@/components/ui/button";
import { FileText, FileDown, Code, FileJson } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonsProps {
  data: Record<string, string>[];
}

const ExportButtons = ({ data }: ExportButtonsProps) => {
  if (data.length === 0) return null;

  // Collect all unique keys from all records
  const allColumns = Array.from(new Set(data.flatMap((item) => Object.keys(item))));

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === "object" && !Array.isArray(val)) return JSON.stringify(val);
    return String(val);
  };

  /**
   * Normalizes data for export.
   * If a record has fields that are arrays, it splits those into multiple rows
   * so that each related item gets its own line.
   */
  const getNormalizedRows = () => {
    const normalized: any[] = [];
    data.forEach((record, originalIndex) => {
      // Find the maximum number of items in any array field of this record
      let maxSubRows = 1;
      allColumns.forEach((col) => {
        const val = record[col];
        if (Array.isArray(val) && val.length > maxSubRows) {
          maxSubRows = val.length;
        }
      });

      // Create N rows for this single record
      for (let i = 0; i < maxSubRows; i++) {
        const newRow: any = { "#": originalIndex + 1 };
        allColumns.forEach((col) => {
          const val = record[col];
          if (Array.isArray(val)) {
            newRow[col] = formatValue(val[i]); // Individual item from array or "" if out of bounds
          } else {
            // Non-array values only appear on the first sub-row of this record
            newRow[col] = i === 0 ? formatValue(val) : "";
          }
        });
        normalized.push(newRow);
      }
    });
    return normalized;
  };

  const exportCSV = () => {
    const normalized = getNormalizedRows();
    const exportColumns = ["#", ...allColumns];
    const header = exportColumns
      .map((c) => c.replace(/_/g, " ").toUpperCase())
      .join(",");

    const rows = normalized.map((row) => {
      const rowValues = exportColumns.map((col) => row[col]);
      return rowValues.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",");
    });

    const csvContent = "\uFEFF" + [header, ...rows].join("\r\n");
    download(csvContent, "extraction_results.csv", "text/csv;charset=utf-8");
  };

  const exportJSON = () => {
    const json = JSON.stringify(data, null, 2);
    download(json, "extraction_results.json", "application/json");
  };

  const exportPDF = () => {
    const normalized = getNormalizedRows();
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("ScrapingAgent Pro - Intelligence Report", 14, 15);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      `Generated: ${new Date().toLocaleString()} | Original Records: ${data.length}`,
      14,
      22
    );

    const pdfColumns = ["#", ...allColumns.map((c) => c.replace(/_/g, " ").toUpperCase())];
    const pdfBody = normalized.map((row) => [
      String(row["#"]),
      ...allColumns.map((col) => row[col]),
    ]);

    autoTable(doc, {
      head: [pdfColumns],
      body: pdfBody,
      startY: 28,
      styles: {
        fontSize: 7,
        cellPadding: 3,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 30, left: 10, right: 10 },
      theme: "grid",
    });

    doc.save("extraction_results.pdf");
  };

  const download = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={exportCSV} className="h-8 text-[10px] font-bold uppercase tracking-wider">
        <FileText className="h-3 w-3 mr-1.5 text-blue-600" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportJSON} className="h-8 text-[10px] font-bold uppercase tracking-wider">
        <FileJson className="h-3 w-3 mr-1.5 text-blue-600" />
        JSON
      </Button>
      <Button variant="outline" size="sm" onClick={exportPDF} className="h-8 text-[10px] font-bold uppercase tracking-wider">
        <FileDown className="h-3 w-3 mr-1.5 text-blue-600" />
        PDF
      </Button>
    </div>
  );
};

export default ExportButtons;
