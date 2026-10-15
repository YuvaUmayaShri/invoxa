const Invoice = require('../models/Invoice');
const Vendor = require('../models/Vendor');

/**
 * Normalizes an invoice number string:
 * e.g., "INV - 2026 / 001" -> "inv2026001"
 */
function normalizeString(str) {
  if (!str) return '';
  return str.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Token overlap / Jaccard similarity for OCR / Notes text
 */
function calculateTextSimilarity(textA, textB) {
  if (!textA || !textB) return 0;
  const setA = new Set(textA.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
  const setB = new Set(textB.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

/**
 * Deterministic Multi-Signal Duplicate Detection Engine
 *
 * Signals & Maximum Weights:
 * - Exact or normalized Invoice Number: 40 pts
 * - Vendor match (same vendor ObjectId or normalized name): 20 pts
 * - Amount similarity: 15 pts
 * - Invoice date proximity: 10 pts
 * - PO number match: 10 pts
 * - File hash exact match: 15 pts
 * - OCR text token similarity: 10 pts
 * Total maximum possible raw score is normalized / capped to 100%.
 */
const checkDuplicateInvoice = async (invoiceData, excludeId = null) => {
  if (!invoiceData) {
    return {
      duplicateConfidence: 0,
      duplicateStatus: 'UNIQUE',
      matchedInvoiceId: null,
      matchedInvoiceNumber: '',
      reasons: [],
      scoreBreakdown: { invoiceNumber: 0, vendor: 0, amount: 0, invoiceDate: 0, poNumber: 0, fileHash: 0 },
      isDuplicate: false,
      duplicateOf: null,
      confidence: 0,
      message: 'No invoice data provided.',
    };
  }

  const rawInvNumber = (invoiceData.invoiceNumber || '').trim();
  const normInvNumber = normalizeString(rawInvNumber);
  const targetAmount = Number(invoiceData.amount) || 0;
  const targetDate = invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate) : null;
  const targetPO = normalizeString(invoiceData.poNumber || '');
  const targetHash = (invoiceData.fileHash || '').trim().toLowerCase();
  const targetText = (invoiceData.ocrText || invoiceData.notes || '').trim();

  // Find candidate vendor doc to check normalized name
  let targetVendorName = '';
  if (invoiceData.vendor) {
    const vDoc = await Vendor.findById(invoiceData.vendor).select('companyName');
    if (vDoc) targetVendorName = normalizeString(vDoc.companyName);
  }

  // Build query to retrieve potential duplicate candidate invoices
  const candidateOrConditions = [];

  if (invoiceData.vendor) {
    candidateOrConditions.push({ vendor: invoiceData.vendor });
  }

  if (rawInvNumber) {
    candidateOrConditions.push({
      invoiceNumber: { $regex: new RegExp(normInvNumber.slice(0, 8) || rawInvNumber, 'i') },
    });
  }

  if (targetAmount > 0) {
    candidateOrConditions.push({
      amount: { $gte: targetAmount * 0.95, $lte: targetAmount * 1.05 },
    });
  }

  if (targetHash) {
    candidateOrConditions.push({ fileHash: targetHash });
  }

  const candidateQuery = candidateOrConditions.length > 0 ? { $or: candidateOrConditions } : {};
  if (excludeId) {
    candidateQuery._id = { $ne: excludeId };
  }

  const candidateInvoices = await Invoice.find(candidateQuery)
    .populate('vendor', 'companyName')
    .limit(100);

  let bestMatch = null;
  let highestScore = 0;
  let bestBreakdown = {
    invoiceNumber: 0,
    vendor: 0,
    amount: 0,
    invoiceDate: 0,
    poNumber: 0,
    fileHash: 0,
  };
  let bestReasons = [];

  for (const candidate of candidateInvoices) {
    const breakdown = {
      invoiceNumber: 0,
      vendor: 0,
      amount: 0,
      invoiceDate: 0,
      poNumber: 0,
      fileHash: 0,
    };
    const reasons = [];

    // ── Signal 1: Invoice Number (Max 40) ───────────────────────────────────
    const candRawNumber = (candidate.invoiceNumber || '').trim();
    const candNormNumber = normalizeString(candRawNumber);

    if (rawInvNumber && candRawNumber.toLowerCase() === rawInvNumber.toLowerCase()) {
      breakdown.invoiceNumber = 40;
      reasons.push(`Exact invoice number match (#${candRawNumber})`);
    } else if (normInvNumber && candNormNumber && normInvNumber === candNormNumber) {
      breakdown.invoiceNumber = 35;
      reasons.push(`Normalized invoice number match (#${candRawNumber} vs #${rawInvNumber})`);
    } else if (normInvNumber.length >= 4 && candNormNumber.length >= 4) {
      const dist = levenshteinDistance(normInvNumber, candNormNumber);
      if (dist === 1) {
        breakdown.invoiceNumber = 25;
        reasons.push(`Near-identical invoice number (typo similarity to #${candRawNumber})`);
      } else if (normInvNumber.includes(candNormNumber) || candNormNumber.includes(normInvNumber)) {
        breakdown.invoiceNumber = 18;
        reasons.push(`Partial invoice number substring overlap with #${candRawNumber}`);
      }
    }

    // ── Signal 2: Vendor Match (Max 20) ─────────────────────────────────────
    const candidateVendorId = candidate.vendor?._id ? candidate.vendor._id.toString() : candidate.vendor?.toString();
    const targetVendorId = invoiceData.vendor ? invoiceData.vendor.toString() : '';

    if (targetVendorId && candidateVendorId && targetVendorId === candidateVendorId) {
      breakdown.vendor = 20;
      reasons.push(`Same registered vendor (${candidate.vendor?.companyName || 'Vendor'})`);
    } else if (targetVendorName && candidate.vendor?.companyName) {
      const candVendorName = normalizeString(candidate.vendor.companyName);
      if (candVendorName === targetVendorName) {
        breakdown.vendor = 18;
        reasons.push(`Matching vendor company name (${candidate.vendor.companyName})`);
      } else if (candVendorName.includes(targetVendorName) || targetVendorName.includes(candVendorName)) {
        breakdown.vendor = 10;
        reasons.push(`Vendor name substring overlap`);
      }
    }

    // ── Signal 3: Amount Similarity (Max 15) ────────────────────────────────
    if (targetAmount > 0 && candidate.amount > 0) {
      const diff = Math.abs(candidate.amount - targetAmount);
      const ratio = diff / targetAmount;

      if (diff < 0.01) {
        breakdown.amount = 15;
        reasons.push(`Identical invoice amount (₹${targetAmount.toLocaleString('en-IN')})`);
      } else if (ratio <= 0.01) {
        breakdown.amount = 10;
        reasons.push(`Near-identical amount (within 1% difference)`);
      } else if (ratio <= 0.05) {
        breakdown.amount = 5;
        reasons.push(`Similar amount (within 5% range)`);
      }
    }

    // ── Signal 4: Invoice Date Proximity (Max 10) ───────────────────────────
    if (targetDate && candidate.invoiceDate && !isNaN(targetDate.getTime())) {
      const candDate = new Date(candidate.invoiceDate);
      if (!isNaN(candDate.getTime())) {
        const diffMs = Math.abs(targetDate.getTime() - candDate.getTime());
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          breakdown.invoiceDate = 10;
          reasons.push(`Same invoice issue date`);
        } else if (diffDays <= 3) {
          breakdown.invoiceDate = 7;
          reasons.push(`Invoice date within ${diffDays} day(s)`);
        } else if (diffDays <= 7) {
          breakdown.invoiceDate = 4;
          reasons.push(`Invoice date within 1 week`);
        }
      }
    }

    // ── Signal 5: PO Number Match (Max 10) ──────────────────────────────────
    if (targetPO && candidate.poNumber) {
      const candPO = normalizeString(candidate.poNumber);
      if (candPO && targetPO === candPO) {
        breakdown.poNumber = 10;
        reasons.push(`Matching Purchase Order number (${candidate.poNumber})`);
      }
    }

    // ── Signal 6: File SHA-256 Hash Match (Max 15) ──────────────────────────
    if (targetHash && candidate.fileHash && candidate.fileHash.toLowerCase() === targetHash) {
      breakdown.fileHash = 15;
      reasons.push(`Identical document file hash (byte-level duplicate)`);
    }

    // ── Signal 7: Extracted / OCR Text Similarity (Bonus up to 10) ──────────
    if (targetText && (candidate.ocrText || candidate.notes)) {
      const sim = calculateTextSimilarity(targetText, candidate.ocrText || candidate.notes);
      if (sim > 0.8) {
        breakdown.ocrSimilarity = 10;
        reasons.push(`High document content similarity (${Math.round(sim * 100)}%)`);
      } else if (sim > 0.5) {
        breakdown.ocrSimilarity = 5;
        reasons.push(`Moderate document content similarity (${Math.round(sim * 100)}%)`);
      }
    }

    // Compute deterministic composite score
    let totalScore =
      breakdown.invoiceNumber +
      breakdown.vendor +
      breakdown.amount +
      breakdown.invoiceDate +
      breakdown.poNumber +
      breakdown.fileHash +
      (breakdown.ocrSimilarity || 0);

    // If both exact vendor AND exact invoice number matched, high baseline
    if (breakdown.invoiceNumber >= 35 && breakdown.vendor >= 18) {
      totalScore = Math.max(totalScore, 85);
      if (breakdown.amount >= 15) totalScore = 100;
    }

    // Cap at 100
    totalScore = Math.min(100, Math.max(0, totalScore));

    if (totalScore > highestScore) {
      highestScore = totalScore;
      bestMatch = candidate;
      bestBreakdown = breakdown;
      bestReasons = reasons;
    }
  }

  // Determine duplicateStatus based on deterministic score thresholds
  let duplicateStatus = 'UNIQUE';
  let isDuplicate = false;

  if (highestScore >= 80) {
    duplicateStatus = 'CONFIRMED_DUPLICATE';
    isDuplicate = true;
  } else if (highestScore >= 55) {
    duplicateStatus = 'POSSIBLE_DUPLICATE';
    isDuplicate = true;
  } else if (highestScore >= 30) {
    duplicateStatus = 'LOW_RISK';
    isDuplicate = false;
  } else {
    duplicateStatus = 'UNIQUE';
    isDuplicate = false;
  }

  return {
    duplicateConfidence: highestScore,
    duplicateStatus,
    matchedInvoiceId: bestMatch ? bestMatch._id : null,
    matchedInvoiceNumber: bestMatch ? bestMatch.invoiceNumber : '',
    reasons: bestReasons,
    scoreBreakdown: bestBreakdown,
    // Backward compatibility fields
    isDuplicate,
    duplicateOf: bestMatch ? bestMatch._id : null,
    confidence: highestScore,
    message: bestReasons.length > 0 ? bestReasons.join('; ') : 'No duplicate signals detected.',
  };
};

module.exports = { checkDuplicateInvoice };
