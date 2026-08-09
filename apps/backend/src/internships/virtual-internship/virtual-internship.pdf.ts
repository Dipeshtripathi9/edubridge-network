import PDFDocument from 'pdfkit';
import { VirtualInternshipEnrollment, VirtualInternshipTask, VirtualInternshipTrack } from '@prisma/client';
import { getVirtualInternshipPricingInfo } from './pricing.constants';
import { getVirtualInternshipTaskTemplate } from './tasks.constants';

const TRACK_LABEL: Record<VirtualInternshipTrack, string> = {
  [VirtualInternshipTrack.WEEK]: 'Web Development (4 week)',
  [VirtualInternshipTrack.MONTH]: 'Web Development + DevOps (4 Months)',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function money(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Purely generative — no image/font file dependencies (same rationale as certificates.pdf.ts). */
export function buildInvoicePdf(
  enrollment: VirtualInternshipEnrollment & { user: { email: string | null; profile: { fullName: string } | null } },
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 60 });
  const pricing = getVirtualInternshipPricingInfo();
  const trackPricing = enrollment.track === VirtualInternshipTrack.MONTH ? pricing.month : pricing.week;
  const donation = enrollment.donateApplied ? pricing.donationAmount : 0;
  const total = Number(enrollment.feeAmount);

  doc.font('Helvetica-Bold').fontSize(18).fillColor('#1d4ed8').text('EDUBRIDGE NETWORK');
  doc.font('Helvetica').fontSize(10).fillColor('#6b7280').text('edubridgenetwork.in');

  doc.moveDown(2);
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#111827').text('Payment Invoice');
  doc.moveDown(0.5);
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#374151')
    .text(`Invoice date: ${formatDate(enrollment.paidAt ?? enrollment.createdAt)}`)
    .text(`Enrollment ID: ${enrollment.id}`)
    .text(`Razorpay payment ID: ${enrollment.razorpayPaymentId ?? '—'}`);

  doc.moveDown(1.5);
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text('Billed to');
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#374151')
    .text(enrollment.user.profile?.fullName ?? 'EduBridge Student')
    .text(enrollment.user.email ?? '');

  doc.moveDown(1.5);
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text('Virtual Internship — ' + TRACK_LABEL[enrollment.track]);

  const rows: [string, number][] = [
    ['Base fee', trackPricing.priceNow],
    ['GST (18%)', trackPricing.gst],
  ];
  if (donation > 0) rows.push(['Scholarship donation', donation]);

  doc.moveDown(1);
  rows.forEach(([label, amount]) => {
    doc.font('Helvetica').fontSize(10).fillColor('#374151').text(label, { continued: true });
    doc.text(money(amount), { align: 'right' });
  });

  doc.moveDown(0.5);
  doc
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor('#e5e7eb')
    .stroke();
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827').text('Total paid', { continued: true });
  doc.text(money(total), { align: 'right' });

  doc.moveDown(3);
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#9ca3af')
    .text('This is a system-generated invoice and does not require a signature.', { align: 'center' });

  return doc;
}

/**
 * Recommendation letter / report-card PDFs. Both are gated by the caller on
 * 100% task approval; the report card additionally lists each task's mentor
 * review note as the closest thing to a real per-task evaluation record.
 */
export function buildRewardDocumentPdf(
  type: 'letter' | 'report',
  enrollment: VirtualInternshipEnrollment & { user: { email: string | null; profile: { fullName: string } | null } },
  tasks: VirtualInternshipTask[],
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 60 });
  const recipientName = enrollment.user.profile?.fullName ?? 'EduBridge Student';
  const trackLabel = TRACK_LABEL[enrollment.track];

  doc.font('Helvetica-Bold').fontSize(14).fillColor('#1d4ed8').text('EDUBRIDGE NETWORK', { align: 'center' });
  doc.moveDown(1.5);

  if (type === 'letter') {
    doc.font('Helvetica').fontSize(10).fillColor('#374151').text(formatDate(new Date()));
    doc.moveDown(1.5);
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#111827').text('Letter of Recommendation');
    doc.moveDown(1);
    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#374151')
      .text(
        `This is to confirm that ${recipientName} has successfully completed the EduBridge Network virtual internship track "${trackLabel}", finishing all assigned project work to a satisfactory standard across mentor review.`,
        { align: 'left' },
      );
    doc.moveDown(1);
    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#374151')
      .text(
        `Throughout the program, ${recipientName} demonstrated consistent effort, met project deliverables, and responded constructively to mentor feedback across all ${tasks.length} project milestones.`,
      );
    doc.moveDown(1);
    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#374151')
      .text('We are glad to recommend them for future academic or professional opportunities.');
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text('EduBridge Network — Mentorship Team');
  } else {
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#111827').text('Report Card', { align: 'center' });
    doc.moveDown(0.5);
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#6b7280')
      .text(`${recipientName} — ${trackLabel}`, { align: 'center' });
    doc.moveDown(2);

    tasks.forEach((task) => {
      const template = getVirtualInternshipTaskTemplate(enrollment.track, task.taskIndex);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(template?.title ?? `Task ${task.taskIndex}`);
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#065f46')
        .text('Status: Approved');
      if (task.reviewNote) {
        doc.font('Helvetica').fontSize(10).fillColor('#374151').text(`Mentor note: ${task.reviewNote}`);
      }
      doc.moveDown(1);
    });
  }

  doc.moveDown(2);
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#9ca3af')
    .text('EduBridge Network — edubridgenetwork.in', { align: 'center' });

  return doc;
}
