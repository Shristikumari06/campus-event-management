/**
 * CampusConnect — Client-Side Native PDF Generator (pdf-generator.js)
 * Generates genuine, vector-rendered, standalone PDF 1.4 documents for:
 * 1. Official Auditorium Entry Passes & Confirmation Slips (.pdf)
 * 2. Official University Participation Certificates (.pdf)
 *
 * 100% Client-Side. 0 External Dependencies. Fully functional offline.
 */

(function (window) {
  'use strict';

  // Helper: Sanitize ASCII text for PDF Type 1 fonts (WinAnsiEncoding)
  function cleanPdfText(str) {
    return String(str || '')
      .replace(/\u2022/g, '-')
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  // Helper: Compute UTF-8 byte length
  function getByteLength(str) {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(str).length;
    }
    return encodeURI(str).split(/%(?:u[0-9A-F]{2})?[0-9A-F]{2}|./).length - 1;
  }

  // ============================================================================
  // 1. GENERATE OFFICIAL EVENT PASS PDF (A4 Portrait: 595.28 x 841.89 pt)
  // ============================================================================
  function generatePassPDF(data) {
    const title = cleanPdfText(data.title || data.event_title || 'CampusConnect Campus Event');
    const category = cleanPdfText(data.category || 'CAMPUS EVENT').toUpperCase();
    const studentName = cleanPdfText(data.student_name || data.full_name || 'Alex Morgan');
    const studentId = cleanPdfText(data.student_id || 'CS2026101');
    const department = cleanPdfText(data.department || 'Computer Science & Engineering');
    const eligibility = cleanPdfText(data.eligibility || 'Open to All Enrolled Students');
    const venue = cleanPdfText(data.venue || 'University Main Auditorium');
    const dateStr = cleanPdfText(data.date_str || data.start_datetime || 'Nov 12, 2026 - 09:30 AM');
    const ticketCode = cleanPdfText(data.ticket_code || 'CC-2026-PASS-0042');
    const timestamp = cleanPdfText(new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }));

    let stream = '';

    // Dark Card Body Background (deep luxury navy #0a0f21)
    stream += '0.04 0.06 0.13 rg\n';
    stream += '40 180 515 580 re f\n';

    // Outer Border Line
    stream += '0.2 0.3 0.5 RG\n2 w\n';
    stream += '40 180 515 580 re S\n';

    // Top Header Banner (Neon Pink / Gradient Header #ff0080)
    stream += '0.98 0.0 0.5 rg\n';
    stream += '40 710 515 50 re f\n';

    // Header Text
    stream += 'BT\n/F1 15 Tf\n1 1 1 rg\n60 728 Td\n(' + cleanPdfText('CAMPUSCONNECT OFFICIAL ENTRY PASS') + ') Tj\nET\n';
    stream += 'BT\n/F1 10 Tf\n0.4 1 0.7 rg\n425 728 Td\n(' + cleanPdfText('VERIFIED STUDENT') + ') Tj\nET\n';

    // Category Chip Badge
    stream += '0.02 0.7 0.83 rg\n';
    stream += '60 665 140 22 re f\n';
    stream += 'BT\n/F1 10 Tf\n1 1 1 rg\n70 672 Td\n(' + category + ' EVENT) Tj\nET\n';

    // Event Title
    stream += 'BT\n/F1 18 Tf\n1 1 1 rg\n60 630 Td\n(' + title + ') Tj\nET\n';

    // Divider Line
    stream += '0.25 0.35 0.5 RG\n1.5 w\n';
    stream += '60 610 m 535 610 l S\n';

    // Information Grid Box
    stream += '0.07 0.1 0.22 rg\n';
    stream += '60 415 475 175 re f\n';
    stream += '0.2 0.25 0.4 RG\n1 w\n';
    stream += '60 415 475 175 re S\n';

    const fields = [
      { label: 'STUDENT NAME', val: studentName, x: 80, y: 550 },
      { label: 'STUDENT ROLL ID', val: studentId, x: 310, y: 550 },
      { label: 'DEPARTMENT', val: department, x: 80, y: 495 },
      { label: 'ELIGIBILITY CRITERIA', val: eligibility, x: 310, y: 495 },
      { label: 'VENUE / AUDITORIUM', val: venue, x: 80, y: 440 },
      { label: 'DATE & TIME', val: dateStr, x: 310, y: 440 },
    ];

    fields.forEach(function (f) {
      stream += 'BT\n/F2 8 Tf\n0.6 0.65 0.75 rg\n' + f.x + ' ' + (f.y + 13) + ' Td\n(' + f.label + ') Tj\nET\n';
      stream += 'BT\n/F1 12 Tf\n1 1 1 rg\n' + f.x + ' ' + f.y + ' Td\n(' + f.val + ') Tj\nET\n';
    });

    // Barcode Security Box
    stream += '0.02 0.04 0.08 rg\n';
    stream += '60 305 475 90 re f\n';
    stream += '0.2 0.25 0.35 RG\n1 w\n';
    stream += '60 305 475 90 re S\n';

    // Barcode Vector Graphic Lines
    stream += '1 1 1 rg\n';
    let bx = 90;
    const barPattern = [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4];
    for (let i = 0; i < barPattern.length; i++) {
      const w = barPattern[i];
      stream += bx + ' 345 ' + w + ' 38 re f\n';
      bx += w + (i % 2 === 0 ? 3 : 5);
    }

    // Barcode Ticket Code String
    stream += 'BT\n/F1 14 Tf\n0.02 0.7 0.83 rg\n200 318 Td\n(' + ticketCode + ') Tj\nET\n';

    // Guidelines Section
    stream += 'BT\n/F1 9 Tf\n0.9 0.9 0.9 rg\n60 270 Td\n(' + cleanPdfText('IMPORTANT GATE ENTRY GUIDELINES:') + ') Tj\nET\n';
    stream += 'BT\n/F2 8 Tf\n0.6 0.65 0.75 rg\n60 252 Td\n(' + cleanPdfText('1. Present this official PDF entry pass at the auditorium entrance barcode scanner.') + ') Tj\nET\n';
    stream += 'BT\n/F2 8 Tf\n0.6 0.65 0.75 rg\n60 238 Td\n(' + cleanPdfText('2. Carry your University Student ID Card for biometric/manual identity verification.') + ') Tj\nET\n';
    stream += 'BT\n/F2 8 Tf\n0.6 0.65 0.75 rg\n60 224 Td\n(' + cleanPdfText('3. Gate registration secures 1 reserved seat. Non-transferable official credential.') + ') Tj\nET\n';
    stream += 'BT\n/F2 7 Tf\n0.4 0.45 0.55 rg\n60 200 Td\n(' + cleanPdfText('CAMPUSCONNECT EVENT MANAGEMENT PORTAL - VERIFIED DIGITAL PASS (' + timestamp + ')') + ') Tj\nET\n';

    // Assemble PDF 1.4 Object Structure
    const objOffsets = [];
    let pdf = '%PDF-1.4\n';

    function writeObj(num, content) {
      objOffsets[num] = getByteLength(pdf);
      pdf += num + ' 0 obj\n' + content + '\nendobj\n';
    }

    writeObj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    writeObj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    writeObj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>');
    writeObj(4, '<< /Length ' + getByteLength(stream) + ' >>\nstream\n' + stream + 'endstream');
    writeObj(5, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
    writeObj(6, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

    const xrefOffset = getByteLength(pdf);
    pdf += 'xref\n0 7\n0000000000 65535 f \n';
    for (let i = 1; i <= 6; i++) {
      pdf += String(objOffsets[i]).padStart(10, '0') + ' 00000 n \n';
    }
    pdf += 'trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
    return pdf;
  }

  // ============================================================================
  // 2. GENERATE PARTICIPATION CERTIFICATE PDF (A4 Landscape: 841.89 x 595.28 pt)
  // ============================================================================
  function generateCertificatePDF(data) {
    const studentName = cleanPdfText(data.student_name || 'Alex Morgan');
    const studentId = cleanPdfText(data.student_id || 'CS2026101');
    const department = cleanPdfText(data.department || 'Computer Science & Engineering');
    const eventTitle = cleanPdfText(data.event_title || data.title || 'TechFest 2026: Quantum Leap');
    const certCode = cleanPdfText(data.cert_code || 'CC-CERT-9481');

    let stream = '';

    // Background
    stream += '0.04 0.06 0.13 rg\n';
    stream += '30 30 781.89 535.28 re f\n';

    // Double Gold Border
    stream += '0.83 0.69 0.22 RG\n3 w\n';
    stream += '35 35 771.89 525.28 re S\n';
    stream += '0.83 0.69 0.22 RG\n1 w\n';
    stream += '42 42 757.89 511.28 re S\n';

    // Header Text
    stream += 'BT\n/F1 11 Tf\n0.83 0.69 0.22 rg\n270 515 Td\n(' + cleanPdfText('UNIVERSITY STUDENT AFFAIRS COUNCIL - CAMPUSCONNECT') + ') Tj\nET\n';

    // Main Title
    stream += 'BT\n/F1 28 Tf\n1 1 1 rg\n200 460 Td\n(' + cleanPdfText('CERTIFICATE OF PARTICIPATION') + ') Tj\nET\n';

    // Subtitle
    stream += 'BT\n/F2 13 Tf\n0.7 0.75 0.85 rg\n290 425 Td\n(' + cleanPdfText('This official credential proudly certifies that') + ') Tj\nET\n';

    // Student Name
    stream += 'BT\n/F1 24 Tf\n0.83 0.69 0.22 rg\n280 380 Td\n(' + studentName + ') Tj\nET\n';
    stream += '0.83 0.69 0.22 RG\n2 w\n';
    stream += '240 372 m 600 372 l S\n';

    // Student ID & Department
    stream += 'BT\n/F1 12 Tf\n0.75 0.5 0.95 rg\n260 345 Td\n(' + cleanPdfText('Roll No: ' + studentId + '   |   Dept: ' + department) + ') Tj\nET\n';

    // Participation Text
    stream += 'BT\n/F2 13 Tf\n0.8 0.85 0.9 rg\n200 305 Td\n(' + cleanPdfText('has successfully registered and participated in the university campus event:') + ') Tj\nET\n';

    // Event Title
    stream += 'BT\n/F1 20 Tf\n0.2 0.75 0.95 rg\n220 265 Td\n(' + eventTitle + ') Tj\nET\n';

    // Footer divider
    stream += '0.3 0.35 0.5 RG\n1 w\n';
    stream += '90 150 m 750 150 l S\n';

    // Dean Signature
    stream += 'BT\n/F1 13 Tf\n1 1 1 rg\n130 120 Td\n(' + cleanPdfText('Prof. Robert Harrison') + ') Tj\nET\n';
    stream += 'BT\n/F2 9 Tf\n0.6 0.65 0.75 rg\n130 105 Td\n(' + cleanPdfText('Dean of Student Affairs') + ') Tj\nET\n';

    // Official Verification Seal
    stream += '0.83 0.69 0.22 RG\n1.5 w\n';
    stream += '375 90 90 45 re S\n';
    stream += 'BT\n/F1 9 Tf\n0.83 0.69 0.22 rg\n390 120 Td\n(' + cleanPdfText('OFFICIAL SEAL') + ') Tj\nET\n';
    stream += 'BT\n/F1 9 Tf\n1 1 1 rg\n382 102 Td\n(' + certCode + ') Tj\nET\n';

    // Coordinator Signature
    stream += 'BT\n/F1 13 Tf\n1 1 1 rg\n600 120 Td\n(' + cleanPdfText('Dr. Ananya Sharma') + ') Tj\nET\n';
    stream += 'BT\n/F2 9 Tf\n0.6 0.65 0.75 rg\n590 105 Td\n(' + cleanPdfText('Faculty Event Coordinator') + ') Tj\nET\n';

    const objOffsets = [];
    let pdf = '%PDF-1.4\n';

    function writeObj(num, content) {
      objOffsets[num] = getByteLength(pdf);
      pdf += num + ' 0 obj\n' + content + '\nendobj\n';
    }

    writeObj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    writeObj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    writeObj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>');
    writeObj(4, '<< /Length ' + getByteLength(stream) + ' >>\nstream\n' + stream + 'endstream');
    writeObj(5, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
    writeObj(6, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

    const xrefOffset = getByteLength(pdf);
    pdf += 'xref\n0 7\n0000000000 65535 f \n';
    for (let i = 1; i <= 6; i++) {
      pdf += String(objOffsets[i]).padStart(10, '0') + ' 00000 n \n';
    }
    pdf += 'trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
    return pdf;
  }

  // ============================================================================
  // 3. BROWSER DOWNLOAD TRIGGERS (.pdf)
  // ============================================================================
  function downloadPassPDF(passData) {
    try {
      const pdfString = generatePassPDF(passData);
      const ticketCode = (passData.ticket_code || 'PASS').replace(/[^a-zA-Z0-9-]/g, '_');
      const filename = `CampusConnect-Pass-${ticketCode}.pdf`;

      const blob = new Blob([pdfString], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (typeof showToast === 'function') {
        showToast(`Official Entry Pass PDF downloaded: ${filename}`, 'success');
      }
    } catch (err) {
      console.error('PDF download error:', err);
      if (typeof showToast === 'function') {
        showToast('Error generating PDF pass. Please try again.', 'error');
      }
    }
  }

  function downloadCertificatePDF(certData) {
    try {
      const pdfString = generateCertificatePDF(certData);
      const certCode = (certData.cert_code || 'CERT').replace(/[^a-zA-Z0-9-]/g, '_');
      const filename = `CampusConnect-Certificate-${certCode}.pdf`;

      const blob = new Blob([pdfString], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (typeof showToast === 'function') {
        showToast(`Official Certificate PDF downloaded: ${filename}`, 'success');
      }
    } catch (err) {
      console.error('Certificate PDF download error:', err);
      if (typeof showToast === 'function') {
        showToast('Error generating Certificate PDF.', 'error');
      }
    }
  }

  // Expose to window
  window.downloadPassPDF = downloadPassPDF;
  window.downloadCertificatePDF = downloadCertificatePDF;
  window.generatePassPDF = generatePassPDF;
  window.generateCertificatePDF = generateCertificatePDF;

})(typeof window !== 'undefined' ? window : this);
