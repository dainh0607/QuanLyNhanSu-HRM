const MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const encoder = new TextEncoder();

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const getColumnName = (index: number): string => {
  let current = index + 1;
  let column = "";

  while (current > 0) {
    const remainder = (current - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    current = Math.floor((current - 1) / 26);
  }

  return column;
};

const getDosDateTime = (date: Date): { dosDate: number; dosTime: number } => {
  const year = Math.max(date.getFullYear(), 1980);
  const dosDate =
    ((year - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();
  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);

  return { dosDate, dosTime };
};

const setUint16 = (target: Uint8Array, offset: number, value: number): void => {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
};

const setUint32 = (target: Uint8Array, offset: number, value: number): void => {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
};

const createCrc32Table = (): Uint32Array => {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) === 1 ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    }

    table[index] = value >>> 0;
  }

  return table;
};

const crc32Table = createCrc32Table();

const getCrc32 = (content: Uint8Array): number => {
  let crc = 0xffffffff;

  for (let index = 0; index < content.length; index += 1) {
    crc = crc32Table[(crc ^ content[index]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
};

const joinBuffers = (parts: Uint8Array[]): Uint8Array => {
  const totalLength = parts.reduce((sum, item) => sum + item.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  parts.forEach((item) => {
    output.set(item, offset);
    offset += item.length;
  });

  return output;
};

const toArrayBuffer = (source: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(source.byteLength);
  new Uint8Array(buffer).set(source);
  return buffer;
};

const createSheetXml = (rows: Array<Array<string | number>>): string => {
  const rowXml = rows
    .map((cells, rowIndex) => {
      const cellXml = cells
        .map((cellValue, columnIndex) => {
          const cellReference = `${getColumnName(columnIndex)}${rowIndex + 1}`;
          return `<c r="${cellReference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(
            String(cellValue ?? ""),
          )}</t></is></c>`;
        })
        .join("");

      return `<row r="${rowIndex + 1}">${cellXml}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowXml}</sheetData>
</worksheet>`;
};

const sanitizeSheetName = (value: string): string =>
  value.replace(/[\\/*?:[\]]/g, " ").trim().slice(0, 31) || "Sheet1";

const createWorkbookFiles = (
  rows: Array<Array<string | number>>,
  sheetName: string,
): Array<{ name: string; content: Uint8Array }> => {
  const safeSheetName = sanitizeSheetName(sheetName);
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(safeSheetName)}" sheetId="1" r:id="rId1" />
  </sheets>
</workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml" />
</Relationships>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml" />
</Relationships>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="xml" ContentType="application/xml" />
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />
</Types>`;

  return [
    {
      name: "[Content_Types].xml",
      content: encoder.encode(contentTypesXml),
    },
    {
      name: "_rels/.rels",
      content: encoder.encode(rootRelsXml),
    },
    {
      name: "xl/workbook.xml",
      content: encoder.encode(workbookXml),
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: encoder.encode(workbookRelsXml),
    },
    {
      name: "xl/worksheets/sheet1.xml",
      content: encoder.encode(createSheetXml(rows)),
    },
  ];
};

const createZipBlob = (
  files: Array<{ name: string; content: Uint8Array }>,
): Blob => {
  const now = new Date();
  const { dosDate, dosTime } = getDosDateTime(now);
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  files.forEach((file) => {
    const fileNameBytes = encoder.encode(file.name);
    const crc = getCrc32(file.content);

    const localHeader = new Uint8Array(30 + fileNameBytes.length);
    setUint32(localHeader, 0, 0x04034b50);
    setUint16(localHeader, 4, 20);
    setUint16(localHeader, 6, 0);
    setUint16(localHeader, 8, 0);
    setUint16(localHeader, 10, dosTime);
    setUint16(localHeader, 12, dosDate);
    setUint32(localHeader, 14, crc);
    setUint32(localHeader, 18, file.content.length);
    setUint32(localHeader, 22, file.content.length);
    setUint16(localHeader, 26, fileNameBytes.length);
    setUint16(localHeader, 28, 0);
    localHeader.set(fileNameBytes, 30);

    const centralHeader = new Uint8Array(46 + fileNameBytes.length);
    setUint32(centralHeader, 0, 0x02014b50);
    setUint16(centralHeader, 4, 20);
    setUint16(centralHeader, 6, 20);
    setUint16(centralHeader, 8, 0);
    setUint16(centralHeader, 10, 0);
    setUint16(centralHeader, 12, dosTime);
    setUint16(centralHeader, 14, dosDate);
    setUint32(centralHeader, 16, crc);
    setUint32(centralHeader, 20, file.content.length);
    setUint32(centralHeader, 24, file.content.length);
    setUint16(centralHeader, 28, fileNameBytes.length);
    setUint16(centralHeader, 30, 0);
    setUint16(centralHeader, 32, 0);
    setUint16(centralHeader, 34, 0);
    setUint16(centralHeader, 36, 0);
    setUint32(centralHeader, 38, 0);
    setUint32(centralHeader, 42, offset);
    centralHeader.set(fileNameBytes, 46);

    localParts.push(localHeader, file.content);
    centralParts.push(centralHeader);
    offset += localHeader.length + file.content.length;
  });

  const centralDirectory = joinBuffers(centralParts);
  const endOfCentralDirectory = new Uint8Array(22);
  setUint32(endOfCentralDirectory, 0, 0x06054b50);
  setUint16(endOfCentralDirectory, 4, 0);
  setUint16(endOfCentralDirectory, 6, 0);
  setUint16(endOfCentralDirectory, 8, files.length);
  setUint16(endOfCentralDirectory, 10, files.length);
  setUint32(endOfCentralDirectory, 12, centralDirectory.length);
  setUint32(endOfCentralDirectory, 16, offset);
  setUint16(endOfCentralDirectory, 20, 0);

  const archive = joinBuffers([...localParts, centralDirectory, endOfCentralDirectory]);
  return new Blob([toArrayBuffer(archive)], { type: MIME_TYPE });
};

export const createXlsxBlob = (
  rows: Array<Array<string | number>>,
  sheetName: string,
): Blob => createZipBlob(createWorkbookFiles(rows, sheetName));

export const triggerBlobDownload = (blob: Blob, fileName: string): void => {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
};
