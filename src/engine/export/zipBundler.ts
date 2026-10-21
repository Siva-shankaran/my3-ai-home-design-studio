import type { ProjectDesign } from '../../types/project.ts';
import { exportProjectToDxf } from './dxfWriter.ts';
import { exportFloorPlanToSvg } from './svgExporter.ts';
import { generatePdfIssueSetArrayBuffer } from './pdfIssueSet.ts';

// Standard IEEE 802.3 CRC-32 Table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c >>> 0;
}

function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipFileEntry {
  filename: string;
  data: Uint8Array | string;
}

export class SimpleZipWriter {
  private files: { name: string; data: Uint8Array; crc: number; offset: number }[] = [];

  public addFile(filename: string, content: Uint8Array | string) {
    let data: Uint8Array;
    if (typeof content === 'string') {
      data = new TextEncoder().encode(content);
    } else {
      data = content;
    }
    const crc = calculateCrc32(data);
    this.files.push({ name: filename, data, crc, offset: 0 });
  }

  public buildZip(): Uint8Array {
    const localHeaders: Uint8Array[] = [];
    let currentOffset = 0;

    // 1. Build Local File Headers + File Data
    for (const f of this.files) {
      f.offset = currentOffset;
      const nameBytes = new TextEncoder().encode(f.name);
      const size = f.data.length;

      const header = new Uint8Array(30 + nameBytes.length);
      const view = new DataView(header.buffer);

      view.setUint32(0, 0x04034b50, true); // Local file header signature
      view.setUint16(4, 20, true); // Version needed to extract (2.0)
      view.setUint16(6, 0, true); // General purpose bit flag
      view.setUint16(8, 0, true); // Compression method (0 = Store / Uncompressed)
      view.setUint16(10, 0, true); // File last mod time
      view.setUint16(12, 0, true); // File last mod date
      view.setUint32(14, f.crc, true); // CRC-32
      view.setUint32(18, size, true); // Compressed size
      view.setUint32(22, size, true); // Uncompressed size
      view.setUint16(26, nameBytes.length, true); // File name length
      view.setUint16(28, 0, true); // Extra field length

      header.set(nameBytes, 30);

      localHeaders.push(header);
      localHeaders.push(f.data);

      currentOffset += header.length + f.data.length;
    }

    const centralDirectoryStart = currentOffset;
    const cdHeaders: Uint8Array[] = [];

    // 2. Build Central Directory Headers
    for (const f of this.files) {
      const nameBytes = new TextEncoder().encode(f.name);
      const size = f.data.length;

      const cd = new Uint8Array(46 + nameBytes.length);
      const view = new DataView(cd.buffer);

      view.setUint32(0, 0x02014b50, true); // Central directory header signature
      view.setUint16(4, 20, true); // Version made by
      view.setUint16(6, 20, true); // Version needed
      view.setUint16(8, 0, true); // Bit flag
      view.setUint16(10, 0, true); // Compression method (Store)
      view.setUint16(12, 0, true); // Mod time
      view.setUint16(14, 0, true); // Mod date
      view.setUint32(16, f.crc, true); // CRC-32
      view.setUint32(20, size, true); // Compressed size
      view.setUint32(24, size, true); // Uncompressed size
      view.setUint16(28, nameBytes.length, true); // Name len
      view.setUint16(30, 0, true); // Extra field len
      view.setUint16(32, 0, true); // Comment len
      view.setUint16(34, 0, true); // Disk number start
      view.setUint16(36, 0, true); // Internal attributes
      view.setUint32(38, 0, true); // External attributes
      view.setUint32(42, f.offset, true); // Relative offset of local header

      cd.set(nameBytes, 46);
      cdHeaders.push(cd);
      currentOffset += cd.length;
    }

    const centralDirectorySize = currentOffset - centralDirectoryStart;

    // 3. End of Central Directory Record (EOCD)
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
    eocdView.setUint16(4, 0, true); // Disk number
    eocdView.setUint16(6, 0, true); // Disk where central directory starts
    eocdView.setUint16(8, this.files.length, true); // Number of central directory records on this disk
    eocdView.setUint16(10, this.files.length, true); // Total number of central directory records
    eocdView.setUint32(12, centralDirectorySize, true); // Size of central directory
    eocdView.setUint32(16, centralDirectoryStart, true); // Offset of start of central directory
    eocdView.setUint16(20, 0, true); // Comment length

    // 4. Combine all chunks into single Uint8Array
    const totalBytes = currentOffset + eocd.length;
    const result = new Uint8Array(totalBytes);
    let writePos = 0;

    for (const chunk of localHeaders) {
      result.set(chunk, writePos);
      writePos += chunk.length;
    }

    for (const chunk of cdHeaders) {
      result.set(chunk, writePos);
      writePos += chunk.length;
    }

    result.set(eocd, writePos);
    return result;
  }
}

export function bundleCompleteProjectZip(project: ProjectDesign): Uint8Array {
  const zip = new SimpleZipWriter();

  // 1. 15-Sheet PDF Issue Set
  try {
    const pdfBuffer = generatePdfIssueSetArrayBuffer(project);
    zip.addFile(`MY3_${project.conceptTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_15_Sheets.pdf`, new Uint8Array(pdfBuffer));
  } catch (e) {
    console.error('Failed to append PDF to ZIP', e);
  }

  // 2. Layered AutoCAD DXF
  const dxfContent = exportProjectToDxf(project);
  zip.addFile('MY3_AutoCAD_Layout.dxf', dxfContent);

  // 3. Vector SVG Plans
  const groundSvg = exportFloorPlanToSvg(project, { floorIndex: 0 });
  zip.addFile('Ground_Floor_Plan.svg', groundSvg);

  if (project.floors.length > 1) {
    const firstSvg = exportFloorPlanToSvg(project, { floorIndex: 1 });
    zip.addFile('First_Floor_Plan.svg', firstSvg);
  }

  // 4. Project Verification Audit Report JSON
  const auditJson = JSON.stringify(project.verificationReport, null, 2);
  zip.addFile('Verification_Audit_Report.json', auditJson);

  // 5. Engineering Disclaimer & Readme
  const readme = `========================================================================
MY3 DESIGNS STUDIO ENGINE — v2.0
PROJECT: ${project.conceptTitle}
TYPOLOGY: ${project.archetype}
BUILT-UP AREA: ${project.totalBuiltUpSqFt} SQ.FT
========================================================================

LEGAL NOTICE & MANDATORY ENGINEERING DISCLAIMER:
------------------------------------------------------------------------
The drawings, quantities, load calculations, and architectural models
contained in this package are preliminary estimates prepared for design
evaluation, concept comparison, and planning purposes only.

Before commencement of excavation or construction:
1. All structural calculations, column grids, and footing dimensions
   must be vetted, calculated, and formally signed off by a licensed
   structural engineer in accordance with local building bye-laws
   (e.g., TNCDBR-2019 / NBC-2016 / IS 456 / IS 875).
2. Geotechnical soil boreholes and safe bearing capacity (SBC) must be
   confirmed on-site prior to foundation casting.
3. Official building approval sanctions must be obtained from the local
   corporation, municipality, or planning authority (CMDA / DTCP).

Generated automatically by MY3 Designs Studio Computational Geometry Engine.
========================================================================
`;
  zip.addFile('README_LEGAL_DISCLAIMER.txt', readme);

  return zip.buildZip();
}
