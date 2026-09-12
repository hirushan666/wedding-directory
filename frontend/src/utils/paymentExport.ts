import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCoupleName } from "./formatCoupleName";

export interface ExportPaymentItem {
  id: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  bookingDate?: string | null;
  paymentReference?: string | null;
  gateway?: string | null;
  visitor?: {
    visitor_fname?: string;
    visitor_lname?: string;
    partner_fname?: string;
    email?: string;
    phone?: string;
  } | null;
  package?: {
    name?: string;
    offering?: {
      name?: string;
    } | null;
  } | null;
}

export interface ExportVendorInfo {
  busname?: string;
  fname?: string;
  lname?: string;
  email?: string;
  phone?: string;
  city?: string;
}

export interface ExportOptions {
  filteredOnly?: boolean;
  filterLabel?: string;
}

/**
 * Format a number as LKR currency string
 */
export const formatLKRNumber = (val: number): string => {
  return Number(val || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Export payment ledger as a banking-style PDF Statement
 */
export const exportPaymentPDF = (
  payments: ExportPaymentItem[],
  vendor?: ExportVendorInfo | null,
  options?: ExportOptions
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const now = new Date();
  const statementDate = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const statementId = `STMT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Calculate totals
  let totalRevenue = 0;
  let pendingRevenue = 0;
  let completedCount = 0;
  let pendingCount = 0;

  payments.forEach((p) => {
    const amt = Number(p.amount) || 0;
    if (p.status === "completed") {
      totalRevenue += amt;
      completedCount++;
    } else if (p.status === "pending") {
      pendingRevenue += amt;
      pendingCount++;
    }
  });

  // --- 1. Top Decorative Bar ---
  doc.setFillColor(252, 123, 84); // Theme Orange #FC7B54
  doc.rect(0, 0, pageWidth, 5, "F");

  // --- 2. Header Section ---
  // Brand title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(31, 41, 55); // Gray-800
  doc.text("Say I Do", margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(252, 123, 84);
  doc.text("VENDOR FINANCIAL STATEMENT", margin, 24);

  // Statement Meta on Right
  doc.setFontSize(8.5);
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.text(`Statement No:`, pageWidth - margin - 45, 15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(statementId, pageWidth - margin, 15, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(`Issue Date:`, pageWidth - margin - 45, 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(statementDate, pageWidth - margin, 20, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(`Currency:`, pageWidth - margin - 45, 25);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("LKR (Sri Lankan Rupee)", pageWidth - margin, 25, { align: "right" });

  // Divider
  doc.setDrawColor(229, 231, 235); // Gray-200
  doc.setLineWidth(0.4);
  doc.line(margin, 29, pageWidth - margin, 29);

  // --- 3. Account / Vendor Profile Card ---
  const boxTop = 33;
  const boxHeight = 26;
  doc.setFillColor(249, 250, 251); // Gray-50
  doc.roundedRect(margin, boxTop, pageWidth - margin * 2, boxHeight, 2, 2, "F");
  doc.setDrawColor(243, 244, 246);
  doc.roundedRect(margin, boxTop, pageWidth - margin * 2, boxHeight, 2, 2, "S");

  // Left side: Vendor info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175); // Gray-400
  doc.text("ACCOUNT HOLDER", margin + 4, boxTop + 6);

  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text(vendor?.busname || "Vendor Business", margin + 4, boxTop + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(75, 85, 99);
  const ownerName = `${vendor?.fname || ""} ${vendor?.lname || ""}`.trim();
  doc.text(
    `${ownerName ? `${ownerName} • ` : ""}${vendor?.email || "No email"} • ${vendor?.phone || "No phone"}`,
    margin + 4,
    boxTop + 18
  );
  doc.text(
    `Location: ${vendor?.city || "Sri Lanka"}${
      options?.filterLabel ? ` • Filter: ${options.filterLabel}` : ""
    }`,
    margin + 4,
    boxTop + 23
  );

  // --- 4. Summary Financial KPIs (4 Small Cards) ---
  const kpiTop = 64;
  const kpiWidth = (pageWidth - margin * 2 - 9) / 4;
  const kpiHeight = 16;

  const kpis = [
    { label: "CONFIRMED REVENUE", value: `LKR ${formatLKRNumber(totalRevenue)}`, color: [16, 185, 129] },
    { label: "PENDING ADVANCE", value: `LKR ${formatLKRNumber(pendingRevenue)}`, color: [245, 158, 11] },
    { label: "CONFIRMED BOOKINGS", value: `${completedCount} Transactions`, color: [59, 130, 246] },
    { label: "TOTAL TRANSACTIONS", value: `${payments.length} Records`, color: [252, 123, 84] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (kpiWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(x, kpiTop, kpiWidth, kpiHeight, 1.5, 1.5, "FD");

    // Indicator pill
    doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.rect(x + 1, kpiTop + 1, 2, kpiHeight - 2, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(107, 114, 128);
    doc.text(kpi.label, x + 5, kpiTop + 5.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text(kpi.value, x + 5, kpiTop + 12);
  });

  // --- 5. Ledger Title ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.text("TRANSACTION LEDGER & ADVANCE PAYMENTS", margin, 86);

  // --- 6. AutoTable: Itemized Ledger ---
  const tableData = payments.map((p, idx) => {
    const customer = formatCoupleName(p.visitor, "Client");
    const service = p.package?.offering?.name || "Service";
    const pkg = p.package?.name || "Package";
    const ref = p.paymentReference || p.id.slice(0, 12).toUpperCase();
    const date = new Date(p.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
    const bookingDate = p.bookingDate
      ? new Date(p.bookingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "Not set";
    const amount = `LKR ${formatLKRNumber(Number(p.amount))}`;
    const status = p.status.toUpperCase();

    return [
      String(idx + 1),
      date,
      ref,
      customer,
      `${service}\n(${pkg})`,
      bookingDate,
      status,
      amount,
    ];
  });

  autoTable(doc, {
    startY: 89,
    margin: { left: margin, right: margin, bottom: 18 },
    head: [["#", "Date", "Reference", "Customer", "Service & Package", "Event Date", "Status", "Advance (LKR)"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [31, 41, 55], // Dark Charcoal #1F2937
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
      halign: "left",
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [55, 65, 81],
    },
    columnStyles: {
      0: { cellWidth: 7, halign: "center" },
      1: { cellWidth: 18 },
      2: { cellWidth: 26, font: "courier" },
      3: { cellWidth: 26 },
      4: { cellWidth: 38 },
      5: { cellWidth: 20 },
      6: { cellWidth: 18, halign: "center" },
      7: { cellWidth: 29, halign: "right", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    didParseCell: (data) => {
      // Style status column
      if (data.section === "body" && data.column.index === 6) {
        const text = String(data.cell.raw);
        if (text === "COMPLETED") {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
          data.cell.styles.fontStyle = "bold";
        } else if (text === "PENDING") {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
          data.cell.styles.fontStyle = "bold";
        } else if (text === "FAILED") {
          data.cell.styles.textColor = [239, 68, 68]; // Red
        }
      }
    },
    didDrawPage: () => {
      // Header on continuation pages
      const pageNum = doc.getNumberOfPages();
      if (pageNum > 1) {
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`Say I Do - Statement ${statementId} (Cont.)`, margin, 10);
        doc.text(statementDate, pageWidth - margin, 10, { align: "right" });
        doc.setDrawColor(229, 231, 235);
        doc.line(margin, 12, pageWidth - margin, 12);
      }

      // Footer
      doc.setFontSize(7.5);
      doc.setTextColor(156, 163, 175);
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.text(
        "Official computer-generated financial statement issued by Say I Do. All figures in LKR.",
        margin,
        pageHeight - 7
      );
      doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 7, { align: "right" });
    },
  });

  // Save the PDF
  const safeBusName = (vendor?.busname || "vendor").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const fileName = `sayido_statement_${safeBusName}_${now.toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};

/**
 * Export payment records as an Excel-compatible CSV spreadsheet with UTF-8 BOM
 */
export const exportPaymentExcel = (
  payments: ExportPaymentItem[],
  vendor?: ExportVendorInfo | null,
  options?: ExportOptions
) => {
  const now = new Date();
  const statementDate = now.toLocaleDateString("en-US");

  // Calculate totals
  let totalRevenue = 0;
  payments.forEach((p) => {
    if (p.status === "completed") {
      totalRevenue += Number(p.amount) || 0;
    }
  });

  const metadataRows = [
    ["Say I Do - Vendor Payment Statement"],
    ["Business Name", vendor?.busname || "N/A"],
    ["Owner Name", `${vendor?.fname || ""} ${vendor?.lname || ""}`.trim() || "N/A"],
    ["Email", vendor?.email || "N/A"],
    ["Phone", vendor?.phone || "N/A"],
    ["City", vendor?.city || "N/A"],
    ["Generated On", statementDate],
    ["Currency", "LKR"],
    ["Total Completed Revenue", `LKR ${formatLKRNumber(totalRevenue)}`],
    ["Total Records", String(payments.length)],
    ["Filter Applied", options?.filterLabel || "All Payments"],
    [], // empty spacer row
  ];

  const headers = [
    "No",
    "Reference ID",
    "Date Created",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Service Name",
    "Package Name",
    "Event Date",
    "Advance Amount (LKR)",
    "Advance Type",
    "Status",
    "Gateway",
  ];

  const dataRows = payments.map((p, idx) => {
    const customer = formatCoupleName(p.visitor, "Client");
    const ref = p.paymentReference || p.id;
    const date = new Date(p.createdAt).toLocaleDateString("en-US");
    const bookingDate = p.bookingDate ? new Date(p.bookingDate).toLocaleDateString("en-US") : "N/A";
    const service = p.package?.offering?.name || "Wedding Service";
    const pkg = p.package?.name || "Standard";

    return [
      String(idx + 1),
      ref,
      date,
      customer,
      p.visitor?.email || "N/A",
      p.visitor?.phone || "N/A",
      service,
      pkg,
      bookingDate,
      Number(p.amount || 0).toFixed(2),
      "20% Advance",
      p.status.toUpperCase(),
      p.gateway || "PayHere",
    ];
  });

  // Combine with CSV escaping
  const escapeCsv = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvContent =
    "\uFEFF" + // UTF-8 BOM so Excel opens it with proper encoding
    metadataRows.map((row) => row.map(escapeCsv).join(",")).join("\r\n") +
    "\r\n" +
    headers.map(escapeCsv).join(",") +
    "\r\n" +
    dataRows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeBusName = (vendor?.busname || "vendor").toLowerCase().replace(/[^a-z0-9]/g, "_");
  link.href = url;
  link.download = `sayido_payments_${safeBusName}_${now.toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
