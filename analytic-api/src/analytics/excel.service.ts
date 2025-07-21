import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
  async generateExcel(data: any[], deviceName: string, fields?: string[] | null): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    // Sanitize device name for worksheet naming (Excel restricts to 31 chars, no special chars)
    const sanitizedDeviceName = (deviceName || 'Unknown Device').trim().replace(/[\\/*[\]?:]/g, '_').substring(0, 31);
    const worksheet = workbook.addWorksheet(sanitizedDeviceName);

    // Title: Device name in row 1
    worksheet.mergeCells('A1:' + String.fromCharCode(65 + (fields?.length || 3) - 1) + '1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Device Report: ${(deviceName || 'Unknown Device').trim()}`;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };

    // Dynamic headers in row 4
    let headers: string[] = [];
    let fieldKeys: string[] = [];
    if (fields && fields.length > 0) {
      // Map field keys to readable headers
      headers = fields.map(f => {
        if (f === 'date') return 'Date';
        if (f === 'deviceId') return 'Device ID';
        // Capitalize and add 'Value' for sensor fields
        return f.charAt(0).toUpperCase() + f.slice(1) + ' Value';
      });
      fieldKeys = fields;
    } else {
      headers = ['Temperature Value', 'Humidity Value', 'Date'];
      fieldKeys = ['temperatureValue', 'humidityValue', 'date'];
    }
    worksheet.getRow(4).values = headers;
    headers.forEach((_, index) => {
      const cell = worksheet.getCell(`${String.fromCharCode(65 + index)}4`);
      cell.font = { bold: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Data starting in row 5
    data.forEach((item, index) => {
      const row = worksheet.getRow(index + 5);
      fieldKeys.forEach((key, colIdx) => {
        if (key === 'date') {
          row.getCell(colIdx + 1).value = item.date
            ? new Date(item.date).toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              })
            : '-';
        } else {
          row.getCell(colIdx + 1).value = item[key] !== undefined ? item[key] : '-';
        }
      });
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Column widths (auto for all columns)
    for (let i = 0; i < headers.length; i++) {
      worksheet.getColumn(i + 1).width = 20;
    }

    return await workbook.xlsx.writeBuffer() as Buffer;
  }
}