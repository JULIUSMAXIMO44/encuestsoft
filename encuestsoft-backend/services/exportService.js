const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

/** Aplana los envíos (con raw_answers_json) a filas planas usando los field_key como columnas. */
function flattenSubmissions(submissions, fields) {
  const columns = ['reference_id', 'submitted_at', 'status', 'respondent_email', ...fields.map((f) => f.field_key)];
  const rows = submissions.map((s) => {
    const row = {
      reference_id: s.reference_id,
      submitted_at: s.submitted_at,
      status: s.status,
      respondent_email: s.respondent_email || '',
    };
    for (const f of fields) {
      const val = (s.raw_answers_json || {})[f.field_key];
      row[f.field_key] = Array.isArray(val) ? val.join('; ') : (val ?? '');
    }
    return row;
  });
  return { columns, rows };
}

function exportToCsv(submissions, fields) {
  const { columns, rows } = flattenSubmissions(submissions, fields);
  const parser = new Parser({ fields: columns });
  return parser.parse(rows);
}

async function exportToExcel(submissions, fields, formTitle) {
  const { columns, rows } = flattenSubmissions(submissions, fields);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(formTitle.slice(0, 31) || 'Respuestas');

  sheet.columns = columns.map((c) => ({ header: c, key: c, width: 22 }));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
  sheet.getRow(1).eachCell((cell) => { cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; });

  rows.forEach((r) => sheet.addRow(r));
  return workbook.xlsx.writeBuffer();
}

module.exports = { exportToCsv, exportToExcel };
