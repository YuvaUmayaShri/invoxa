/**
 * Browser CSV Exporter for Financial Ledgers and Reports
 */

export const exportToCsv = (data, filename = 'export.csv') => {
  if (!data || !data.length) {
    alert('No records available to export.');
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);

  // Convert rows
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map((header) => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToCSV = exportToCsv;
export default exportToCsv;
