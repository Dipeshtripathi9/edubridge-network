import PDFDocument from 'pdfkit';
import { Certificate } from '@prisma/client';

/**
 * Builds (but does not `.end()`) a text-based certificate PDF. Purely generative —
 * no image/font file dependencies, so it works unchanged on Render's ephemeral
 * filesystem. Callers are responsible for `doc.pipe(res)` then `doc.end()`; this
 * lets the same builder serve both the public inline-verify route and the
 * authenticated attachment-download route (they differ only in headers).
 */
export function buildCertificatePdf(cert: Certificate): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 60 });

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Decorative border.
  doc
    .lineWidth(2)
    .strokeColor('#1d4ed8')
    .rect(30, 30, pageWidth - 60, pageHeight - 60)
    .stroke();
  doc
    .lineWidth(0.75)
    .strokeColor('#93c5fd')
    .rect(40, 40, pageWidth - 80, pageHeight - 80)
    .stroke();

  doc.moveDown(4);
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#1d4ed8')
    .text('EDUBRIDGE NETWORK', { align: 'center' });

  doc.moveDown(0.5);
  doc
    .font('Helvetica')
    .fontSize(20)
    .fillColor('#111827')
    .text('Certificate of Completion', { align: 'center' });

  doc.moveDown(2);
  doc
    .font('Helvetica')
    .fontSize(12)
    .fillColor('#374151')
    .text('This is to certify that', { align: 'center' });

  doc.moveDown(0.5);
  doc
    .font('Helvetica-Bold')
    .fontSize(26)
    .fillColor('#111827')
    .text(cert.recipientName, { align: 'center' });

  doc.moveDown(0.5);
  doc
    .font('Helvetica')
    .fontSize(12)
    .fillColor('#374151')
    .text('has successfully completed', { align: 'center' });

  doc.moveDown(0.5);
  doc
    .font('Helvetica-Bold')
    .fontSize(18)
    .fillColor('#1d4ed8')
    .text(cert.title, { align: 'center' });

  const meta = (cert.metadata ?? {}) as Record<string, unknown>;
  const maintenanceUntil = meta.maintenanceUntil as string | undefined;
  if (maintenanceUntil) {
    doc.moveDown(1);
    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#6b7280')
      .text(
        `Includes a complimentary maintenance window through ${new Date(maintenanceUntil).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}.`,
        { align: 'center' },
      );
  }

  const payoutAmount = meta.payoutAmount as number | undefined;
  if (payoutAmount) {
    doc.moveDown(1);
    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#6b7280')
      .text(`Paid client work — payout ₹${payoutAmount.toLocaleString('en-IN')}.`, { align: 'center' });
  }

  doc.moveDown(3);
  const issued = cert.issuedAt.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc
    .font('Helvetica')
    .fontSize(11)
    .fillColor('#374151')
    .text(`Issued on ${issued}`, { align: 'center' });

  doc.moveDown(0.5);
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#111827')
    .text(`Certificate Code: ${cert.code}`, { align: 'center' });

  doc.moveDown(0.5);
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#9ca3af')
    .text('Verify this certificate at edubridge.network/verify-certificate', { align: 'center' });

  return doc;
}
