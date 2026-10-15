const Vendor = require('../models/Vendor');
const Invoice = require('../models/Invoice');
const { checkDuplicateInvoice } = require('./duplicateService');

/**
 * Automated Invoice Verification Engine
 * Validates vendor details, structure, dates, calculations, and checks for duplicates.
 */
const verifyInvoice = async (invoiceData, existingInvoiceId = null) => {
  const details = [];
  let score = 0;

  // 1. Vendor Verification
  let vendorValid = false;
  if (invoiceData.vendor) {
    const vendor = await Vendor.findById(invoiceData.vendor);
    if (vendor && vendor.status === 'ACTIVE') {
      vendorValid = true;
      score += 20;
      details.push(`Vendor verified: "${vendor.companyName}" is active and registered.`);
    } else if (vendor) {
      details.push(`Vendor warning: "${vendor.companyName}" is currently marked inactive.`);
    } else {
      details.push('Vendor error: Selected vendor was not found in registry.');
    }
  } else {
    details.push('Vendor error: Vendor information is missing.');
  }

  // 2. Invoice Number Format & Presence
  let invoiceNumberValid = false;
  if (invoiceData.invoiceNumber && invoiceData.invoiceNumber.trim().length >= 3) {
    invoiceNumberValid = true;
    score += 15;
    details.push(`Invoice number "${invoiceData.invoiceNumber}" format is valid.`);
  } else {
    details.push('Invoice number error: Missing or invalid format.');
  }

  // 3. Date Consistency & Due Date Validation
  let datesValid = false;
  if (invoiceData.invoiceDate && invoiceData.dueDate) {
    const invDate = new Date(invoiceData.invoiceDate);
    const dueDate = new Date(invoiceData.dueDate);

    if (!isNaN(invDate.getTime()) && !isNaN(dueDate.getTime())) {
      if (dueDate >= invDate) {
        datesValid = true;
        score += 20;
        details.push('Date consistency: Due date is valid and follows invoice date.');
      } else {
        details.push('Date error: Due date cannot be earlier than invoice date.');
      }
    } else {
      details.push('Date error: Malformed invoice or due date.');
    }
  } else {
    details.push('Date error: Missing invoice date or due date.');
  }

  // 4. Amount Validation
  let amountValid = false;
  const totalAmount = Number(invoiceData.amount);
  if (!isNaN(totalAmount) && totalAmount > 0) {
    amountValid = true;
    score += 15;
    details.push(`Amount check: Valid positive total amount of ₹${totalAmount.toLocaleString('en-IN')}.`);
  } else {
    details.push('Amount error: Invoice total must be a positive number.');
  }

  // 5. Line items & Math Consistency
  let itemsValid = true;
  let subtotalCalc = 0;
  if (invoiceData.items && Array.isArray(invoiceData.items) && invoiceData.items.length > 0) {
    for (const item of invoiceData.items) {
      if (!item.description || item.quantity <= 0 || item.unitPrice < 0) {
        itemsValid = false;
        break;
      }
      subtotalCalc += Number(item.quantity) * Number(item.unitPrice);
    }

    if (itemsValid) {
      score += 15;
      details.push(`Line items check: ${invoiceData.items.length} line items verified.`);
    } else {
      details.push('Line items warning: One or more line items have missing or invalid values.');
    }
  } else {
    // If no line items provided, accept subtotal if provided
    itemsValid = true;
    score += 10;
  }

  // 6. Tax Calculation Consistency
  let taxValid = true;
  const subtotal = Number(invoiceData.subtotal) || subtotalCalc || totalAmount;
  const taxRate = Number(invoiceData.taxRate) || 0;
  const taxAmount = Number(invoiceData.taxAmount) || 0;

  if (taxRate > 0) {
    const expectedTax = (subtotal * taxRate) / 100;
    const diff = Math.abs(expectedTax - taxAmount);
    if (diff <= 2) {
      score += 15;
      details.push(`Tax check: GST/Tax calculation (${taxRate}%) is mathematically verified.`);
    } else {
      taxValid = false;
      details.push(`Tax warning: Expected tax ₹${expectedTax.toFixed(2)} differs from declared tax ₹${taxAmount}.`);
    }
  } else {
    score += 15;
    details.push('Tax check: Zero or exempted tax declared.');
  }

  // 7. Duplicate Check
  const duplicateCheck = await checkDuplicateInvoice(invoiceData, existingInvoiceId);
  const duplicateCheckPassed = !duplicateCheck.isDuplicate;

  if (duplicateCheck.isDuplicate) {
    details.push(`DUPLICATE WARNING: ${duplicateCheck.message}`);
  } else {
    details.push('Duplicate check: No identical existing invoice detected.');
  }

  // Determine Overall Status
  let verificationStatus = 'VERIFIED';

  if (!vendorValid || !invoiceNumberValid || !datesValid || !amountValid) {
    verificationStatus = 'INVALID';
  } else if (!duplicateCheckPassed || !taxValid || !itemsValid || score < 80) {
    verificationStatus = 'NEEDS_REVIEW';
  }

  return {
    verificationStatus,
    verificationChecks: {
      vendorValid,
      invoiceNumberValid,
      datesValid,
      amountValid,
      itemsValid,
      taxValid,
      duplicateCheckPassed,
      score,
      details,
    },
    duplicateResult: duplicateCheck,
  };
};

module.exports = { verifyInvoice };
