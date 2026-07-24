import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DiagnosticReport } from '../types';

/**
 * Exports a clinical diagnostic report as a local-only PDF file.
 * Completely client-side execution - zero server transmission.
 */
export async function exportReportToPDF(report: DiagnosticReport): Promise<void> {
  // Create a hidden off-screen container styled for print/PDF export
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '800px';
  container.style.padding = '32px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = 'Helvetica, Arial, sans-serif';
  container.style.fontSize = '12px';
  container.style.lineHeight = '1.5';

  const dateStr = new Date(report.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const classificationLabel =
    report.classification === 'RARE_DISEASE_PROBABLE'
      ? 'RARE / ORPHAN DISEASE HIGHLY PROBABLE'
      : report.classification === 'RARE_DISEASE_POSSIBLE'
      ? 'RARE DISEASE SUSPECTED'
      : 'COMMON ETIOLOGY PROBABLE';

  const classificationBg =
    report.classification === 'RARE_DISEASE_PROBABLE'
      ? '#f3e8ff'
      : report.classification === 'RARE_DISEASE_POSSIBLE'
      ? '#fef3c7'
      : '#f1f5f9';

  const classificationColor =
    report.classification === 'RARE_DISEASE_PROBABLE'
      ? '#6b21a8'
      : report.classification === 'RARE_DISEASE_POSSIBLE'
      ? '#92400e'
      : '#0f172a';

  container.innerHTML = `
    <!-- Header Letterhead -->
    <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; letter-spacing: -0.5px;">
          OrphanDx Clinical Diagnostic Evaluation
        </h1>
        <p style="font-size: 11px; color: #64748b; margin: 0;">
          Specialist Referral & Differential Assessment Record
        </p>
      </div>
      <div style="text-align: right; font-size: 10px; color: #64748b;">
        <div style="font-weight: 700; color: #0f172a;">REPORT ID: #${report.id.slice(-8).toUpperCase()}</div>
        <div>Date: ${dateStr}</div>
        <div>Context: ${report.patientAgeSex || 'Unspecified Patient'}</div>
      </div>
    </div>

    <!-- Classification Badge & Executive Summary -->
    <div style="background-color: ${classificationBg}; border: 1px solid ${classificationColor}30; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="background-color: ${classificationColor}; color: #ffffff; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.5px;">
          ${classificationLabel}
        </span>
        <span style="font-size: 11px; font-weight: 700; color: ${classificationColor};">
          Confidence Score: ${report.confidenceScore}%
        </span>
      </div>
      <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 8px 0 4px 0;">
        ${report.referralTitle}
      </h2>
      <p style="font-size: 11px; color: #334155; margin: 0;">
        ${report.executiveSummary}
      </p>
    </div>

    <!-- Rationale & Timeline Section -->
    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">
        1. Clinical Rationale & Symptom Progression
      </h3>
      <p style="font-size: 11px; color: #334155; margin-bottom: 8px;">
        <strong>Diagnostic Justification:</strong> ${report.rareDiseaseJustification}
      </p>
      <p style="font-size: 11px; color: #334155; margin: 0;">
        <strong>Symptom Timeline:</strong> ${report.symptomTimelineSummary}
      </p>
    </div>

    <!-- Symptom Inventory Table -->
    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">
        2. Extracted Symptom Matrix (${report.symptomsList.length} Items)
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: left;">
        <thead>
          <tr style="background-color: #f8fafc; color: #475569; font-weight: 700; border-bottom: 1.5px solid #cbd5e1;">
            <th style="padding: 6px 8px;">Symptom</th>
            <th style="padding: 6px 8px;">System</th>
            <th style="padding: 6px 8px;">Onset / Timeline</th>
            <th style="padding: 6px 8px;">Severity</th>
            <th style="padding: 6px 8px;">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${report.symptomsList
            .map(
              (s, i) => `
            <tr style="border-bottom: 1px solid #f1f5f9; background-color: ${
              s.isRedFlag ? '#fff1f2' : i % 2 === 0 ? '#ffffff' : '#f8fafc'
            };">
              <td style="padding: 6px 8px; font-weight: 700; color: ${s.isRedFlag ? '#be123c' : '#0f172a'};">
                ${s.isRedFlag ? '[RED FLAG] ' : ''}${s.name}
              </td>
              <td style="padding: 6px 8px; color: #2563eb;">${s.system}</td>
              <td style="padding: 6px 8px; color: #475569;">${s.onsetTimeline || 'Chronic'}</td>
              <td style="padding: 6px 8px; font-weight: 600;">${s.severity}</td>
              <td style="padding: 6px 8px; color: #64748b;">${s.notes || '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- Differential Diagnosis Section -->
    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">
        3. ${report.isRareDisease ? 'Candidate Rare & Orphan Diseases' : 'Common Differential Diagnoses'}
      </h3>
      ${
        report.isRareDisease && report.rareCandidates
          ? report.rareCandidates
              .map(
                (c, idx) => `
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 8px; background-color: #fafafa;">
              <div style="font-weight: 800; font-size: 11px; color: #0f172a; margin-bottom: 4px;">
                #${idx + 1} ${c.diseaseName}
                ${c.orphaCode ? `<span style="color: #0284c7; font-size: 9px; margin-left: 8px;">ORPHA: ${c.orphaCode}</span>` : ''}
                ${c.icd10Code ? `<span style="color: #4f46e5; font-size: 9px; margin-left: 8px;">ICD-10: ${c.icd10Code}</span>` : ''}
              </div>
              <p style="font-size: 10px; color: #334155; margin: 0 0 4px 0;"><strong>Rationale:</strong> ${c.clinicalRationale}</p>
              <p style="font-size: 10px; color: #334155; margin: 0 0 4px 0;"><strong>Recommended Workup:</strong> ${c.suggestedDiagnosticTests.join(', ')}</p>
              <p style="font-size: 10px; color: #0284c7; margin: 0; font-weight: 600;"><strong>Referrals:</strong> ${c.specialistReferralNeeded.join(', ')}</p>
            </div>
          `
              )
              .join('')
          : report.commonDifferentials
              ?.map(
                (d, idx) => `
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 8px; background-color: #fafafa;">
              <div style="font-weight: 800; font-size: 11px; color: #0f172a; margin-bottom: 4px;">
                #${idx + 1} ${d.diseaseName} ${d.icd10Code ? `<span style="color: #0284c7; font-size: 9px; margin-left: 8px;">ICD-10: ${d.icd10Code}</span>` : ''}
              </div>
              <p style="font-size: 10px; color: #334155; margin: 0 0 4px 0;"><strong>Why Common vs Rare:</strong> ${d.whyNotRare}</p>
              <p style="font-size: 10px; color: #334155; margin: 0;"><strong>Clinical Plan:</strong> ${d.clinicalPlan}</p>
            </div>
          `
              )
              .join('')
      }
    </div>

    <!-- Action Plan Section -->
    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">
        4. Prioritized Action Protocol
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: left;">
        <thead>
          <tr style="background-color: #f8fafc; color: #475569; font-weight: 700; border-bottom: 1.5px solid #cbd5e1;">
            <th style="padding: 6px;">Step</th>
            <th style="padding: 6px;">Priority</th>
            <th style="padding: 6px;">Action Item</th>
            <th style="padding: 6px;">Timeframe</th>
          </tr>
        </thead>
        <tbody>
          ${report.prioritizedActionPlan
            .map(
              (p) => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 6px; font-weight: 700; color: #0f172a;">${p.stepNumber}</td>
              <td style="padding: 6px;">
                <span style="font-weight: 700; color: ${
                  p.priority === 'CRITICAL' ? '#be123c' : p.priority === 'URGENT' ? '#b45309' : '#334155'
                };">
                  ${p.priority}
                </span>
              </td>
              <td style="padding: 6px; color: #1e293b;">
                <strong>${p.category}:</strong> ${p.description}
              </td>
              <td style="padding: 6px; color: #64748b;">${p.timeframe}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- Footer Disclaimer & Local Signature Block -->
    <div style="margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div style="font-size: 8px; color: #94a3b8; max-width: 500px;">
        <strong>Clinical Decision Support Notice:</strong> ${report.disclaimer || 'Generated as a clinical decision support record. Diagnostic conclusions must be evaluated by attending medical specialists.'}
        <br/>
        <em>Document rendered locally on client device. Secure local-only export.</em>
      </div>
      <div style="text-align: right; border-top: 1px border-style: dashed; width: 180px; padding-top: 4px;">
        <div style="font-size: 9px; color: #64748b;">Attending Physician / Specialist</div>
        <div style="height: 24px;"></div>
        <div style="font-size: 9px; font-weight: 700; color: #0f172a;">Signature & Date</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const filename = `OrphanDx_Clinical_Report_${report.id.slice(-6)}_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}
