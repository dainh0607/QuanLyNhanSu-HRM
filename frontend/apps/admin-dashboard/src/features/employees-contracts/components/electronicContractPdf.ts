interface BuildElectronicContractPreviewPdfParams {
  contractNumber: string;
  contractTypeLabel: string;
  templateName: string;
  attachmentName: string;
  employeeName: string;
  employeeCode: string;
  signedBy: string;
  signDate: string;
  expiryDate: string;
  taxType: string;
}

const PAGE_LINE_LIMIT = 34;

const sanitizePdfText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const escapePdfText = (value: string) =>
  sanitizePdfText(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const wrapPdfLine = (text: string, maxLength: number) => {
  const words = sanitizePdfText(text).split(' ').filter(Boolean);
  if (words.length === 0) {
    return [''];
  }

  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxLength) {
      currentLine = nextLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const createSimplePdfBlob = (pages: string[][]) => {
  const fontId = 1;
  const pagesId = 2 + pages.length * 2;
  const catalogId = pagesId + 1;
  const objectBodies: string[] = [];

  objectBodies[fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  pages.forEach((pageLines, index) => {
    const contentId = 2 + index * 2;
    const pageId = 3 + index * 2;
    const contentStream = [
      'BT',
      '/F1 12 Tf',
      '14 TL',
      '48 790 Td',
      ...pageLines.map((line) => `(${escapePdfText(line)}) Tj\nT*`),
      'ET',
    ].join('\n');

    objectBodies[contentId] = `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`;
    objectBodies[pageId] =
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] ` +
      `/Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
  });

  const pageReferences = pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ');
  objectBodies[pagesId] = `<< /Type /Pages /Count ${pages.length} /Kids [${pageReferences}] >>`;
  objectBodies[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (let objectId = 1; objectId <= catalogId; objectId += 1) {
    offsets[objectId] = pdf.length;
    pdf += `${objectId} 0 obj\n${objectBodies[objectId]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${catalogId + 1}\n0000000000 65535 f \n`;

  for (let objectId = 1; objectId <= catalogId; objectId += 1) {
    pdf += `${String(offsets[objectId]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${catalogId + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
};

export const isPdfFile = (fileName: string, fileType?: string) =>
  fileType === 'application/pdf' || fileName.trim().toLowerCase().endsWith('.pdf');

export const buildElectronicContractPreviewPdf = ({
  contractNumber,
  contractTypeLabel,
  templateName,
  attachmentName,
  employeeName,
  employeeCode,
  signedBy,
  signDate,
  expiryDate,
  taxType,
}: BuildElectronicContractPreviewPdfParams) => {
  const contentLines = [
    'HOP DONG DIEN TU - XEM TRUOC',
    '',
    `So hop dong: ${contractNumber || 'Dang cap nhat'}`,
    `Ten hop dong: ${templateName || attachmentName || 'Hop dong dien tu'}`,
    `Loai hop dong: ${contractTypeLabel || 'Dang cap nhat'}`,
    `Nhan vien: ${employeeName || 'Dang cap nhat'}`,
    `Ma nhan vien: ${employeeCode || 'Dang cap nhat'}`,
    `Nguoi ky: ${signedBy || 'Dang cap nhat'}`,
    `Ngay ky: ${signDate || 'Dang cap nhat'}`,
    `Ngay het han: ${expiryDate || 'Dang cap nhat'}`,
    `Loai thue TNCN: ${taxType || 'Dang cap nhat'}`,
    '',
    'Luu y:',
    '1. Day la file xem truoc duoc FE tao de mo phong buoc doc PDF va dat vi tri ky.',
    '2. Neu HR tai len file PDF that o Buoc 1, he thong se uu tien hien thi file do.',
    '3. Voi file DOC/DOCX hoac khi chi chon mau, ban xem nay giup ra soat metadata truoc khi ky.',
    '',
    'Noi dung tong hop:',
    `- Nguon noi dung: ${templateName || attachmentName || 'Mau hop dong noi bo'}`,
    '- Luong ky se duoc thiet lap o cac buoc tiep theo.',
    '- Toan bo thong tin hien tai chi dung de xem truoc va xac nhan.',
  ]
    .flatMap((line) => wrapPdfLine(line, 78))
    .filter((line) => line.length > 0 || line === '');

  const pages: string[][] = [];

  for (let index = 0; index < contentLines.length; index += PAGE_LINE_LIMIT) {
    pages.push(contentLines.slice(index, index + PAGE_LINE_LIMIT));
  }

  return createSimplePdfBlob(pages.length > 0 ? pages : [['HOP DONG DIEN TU - XEM TRUOC']]);
};
