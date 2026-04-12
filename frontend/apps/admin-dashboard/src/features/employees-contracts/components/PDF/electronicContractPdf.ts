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

const escapePdfLiteral = (value: string) =>
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

/**
 * Creates a minimal valid PDF blob using byte-accurate offsets.
 * Uses TextEncoder to ensure xref table offsets match actual byte positions.
 */
const createSimplePdfBlob = (pages: string[][]) => {
  const encoder = new TextEncoder();
  const fontObjId = 1;
  const pagesObjId = 2 + pages.length * 2;
  const catalogObjId = pagesObjId + 1;

  const objects: Array<{ id: number; body: string }> = [];

  objects.push({
    id: fontObjId,
    body: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  });

  pages.forEach((pageLines, index) => {
    const contentObjId = 2 + index * 2;
    const pageObjId = 3 + index * 2;

    const streamLines = [
      'BT',
      '/F1 12 Tf',
      '14 TL',
      '48 790 Td',
      ...pageLines.map((line) => `(${escapePdfLiteral(line)}) Tj T*`),
      'ET',
    ];
    const streamBody = streamLines.join('\n');
    const streamByteLength = encoder.encode(streamBody).byteLength;

    objects.push({
      id: contentObjId,
      body: `<< /Length ${streamByteLength} >>\nstream\n${streamBody}\nendstream`,
    });

    objects.push({
      id: pageObjId,
      body:
        `<< /Type /Page /Parent ${pagesObjId} 0 R /MediaBox [0 0 595 842] ` +
        `/Resources << /Font << /F1 ${fontObjId} 0 R >> >> /Contents ${contentObjId} 0 R >>`,
    });
  });

  const pageKids = pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ');

  objects.push({
    id: pagesObjId,
    body: `<< /Type /Pages /Count ${pages.length} /Kids [${pageKids}] >>`,
  });

  objects.push({
    id: catalogObjId,
    body: `<< /Type /Catalog /Pages ${pagesObjId} 0 R >>`,
  });

  objects.sort((a, b) => a.id - b.id);

  let pdf = '%PDF-1.4\n';
  const byteOffsets = new Map<number, number>();

  objects.forEach((obj) => {
    byteOffsets.set(obj.id, encoder.encode(pdf).byteLength);
    pdf += `${obj.id} 0 obj\n${obj.body}\nendobj\n`;
  });

  const xrefByteOffset = encoder.encode(pdf).byteLength;
  const totalObjects = catalogObjId + 1;

  pdf += `xref\n0 ${totalObjects}\n0000000000 65535 f \n`;

  for (let objectId = 1; objectId <= catalogObjId; objectId += 1) {
    const offset = byteOffsets.get(objectId) ?? 0;
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${totalObjects} /Root ${catalogObjId} 0 R >>\nstartxref\n${xrefByteOffset}\n%%EOF`;

  return new Blob([encoder.encode(pdf)], { type: 'application/pdf' });
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
    'HỢP ĐỒNG ĐIỆN TỬ - XEM TRƯỚC',
    '',
    `Số hợp đồng: ${contractNumber || 'Đang cập nhật'}`,
    `Tên hợp đồng: ${templateName || attachmentName || 'Hợp đồng điện tử'}`,
    `Loại hợp đồng: ${contractTypeLabel || 'Đang cập nhật'}`,
    `Nhân viên: ${employeeName || 'Đang cập nhật'}`,
    `Mã nhân viên: ${employeeCode || 'Đang cập nhật'}`,
    `Người ký: ${signedBy || 'Đang cập nhật'}`,
    `Ngày ký: ${signDate || 'Đang cập nhật'}`,
    `Ngày hết hạn: ${expiryDate || 'Đang cập nhật'}`,
    `Loại thuế TNCN: ${taxType || 'Đang cập nhật'}`,
    '',
    'Lưu ý:',
    '1. Đây là file xem trước được FE tạo để mô phỏng bước đọc PDF và đặt vị trí ký.',
    '2. Nếu HR tải lên file PDF thật ở Bước 1, hệ thống sẽ ưu tiên hiển thị file đó.',
    'Noi dung tong hop:',
    `- Nguon noi dung: ${templateName || attachmentName || 'Mau hop dong noi bo'}`,
    '- Luồng ký sẽ được thiết lập ở các bước tiếp theo.',
    '- Toàn bộ thông tin hiện tại chỉ dùng để xem trước và xác nhận.',
  ]
    .flatMap((line) => wrapPdfLine(line, 78))
    .filter((line) => line.length > 0 || line === '');

  const pages: string[][] = [];

  for (let index = 0; index < contentLines.length; index += PAGE_LINE_LIMIT) {
    pages.push(contentLines.slice(index, index + PAGE_LINE_LIMIT));
  }

  return createSimplePdfBlob(pages.length > 0 ? pages : [['HOP DONG DIEN TU - XEM TRUOC']]);
};
