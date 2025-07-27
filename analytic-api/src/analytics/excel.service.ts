import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
  // Helper to convert UTC to UTC-5:30
  private convertToUTCMinus530(dateString: string): string {
    const date = new Date(dateString);
    // Subtract 5 hours and 30 minutes (5.5 hours = 5.5 * 60 * 60 * 1000 milliseconds)
    const adjustedDate = new Date(date.getTime() - 5.5 * 60 * 60 * 1000);
    // Format the adjusted date
    return adjustedDate.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }

  async generateExcel(data: any[], deviceName: string, fields?: string[] | null): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sanitizedDeviceName = (deviceName || 'Unknown Device').trim().replace(/[\\/*[\]?:]/g, '_').substring(0, 31);
    const worksheet = workbook.addWorksheet(sanitizedDeviceName);

    worksheet.mergeCells('A1:' + String.fromCharCode(65 + (fields?.length || 3) - 1) + '1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Device Report: ${(deviceName || 'Unknown Device').trim()}`;
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4A90E2' },
    };

    const deviceId = data[0]?.deviceId || 'N/A';
    worksheet.mergeCells('A2:' + String.fromCharCode(65 + (fields?.length || 3) - 1) + '2');
    const deviceIdCell = worksheet.getCell('A2');
    deviceIdCell.value = `Device ID: ${deviceId}`;
    deviceIdCell.font = { italic: true, size: 12, color: { argb: 'FF333333' } };
    deviceIdCell.alignment = { horizontal: 'center', vertical: 'middle' };
    deviceIdCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F0FA' },
    };

    worksheet.getRow(3).height = 10;

    // Dynamically determine all sensor fields from readings
    let allSensorFields: string[] = [];
    data.forEach(item => {
      if (item.readings && typeof item.readings === 'object') {
        for (const key of Object.keys(item.readings)) {
          const lowerKey = key.toLowerCase();
          if (!allSensorFields.includes(lowerKey)) {
            allSensorFields.push(lowerKey);
          }
        }
      }
    });
    allSensorFields.sort();

    // Compose headers and fieldKeys (all lowercased)
    let headers: string[] = [];
    let fieldKeys: string[] = [];
    if (fields && fields.length > 0) {
      fieldKeys = fields.filter(f => f !== 'deviceId').map(f => f.toLowerCase());
      headers = fieldKeys.map(f => {
        if (f === 'date') return 'Date';
        return f.charAt(0).toUpperCase() + f.slice(1) + ' Value';
      });
    } else {
      fieldKeys = [...allSensorFields, 'date'];
      headers = [...allSensorFields.map(f => f.charAt(0).toUpperCase() + f.slice(1) + ' Value'), 'Date'];
    }
    worksheet.getRow(4).values = headers;
    headers.forEach((_, index) => {
      const cell = worksheet.getCell(`${String.fromCharCode(65 + index)}4`);
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E88E5' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Data rows (normalize readings keys to lowercase)
    data.forEach((item, index) => {
      const row = worksheet.getRow(index + 5);
      const normalizedReadings = Object.fromEntries(
        Object.entries(item.readings || {}).map(([k, v]) => [k.toLowerCase(), v])
      );
      fieldKeys.forEach((key, colIdx) => {
        if (key === 'date') {
          row.getCell(colIdx + 1).value = item.date
            ? this.convertToUTCMinus530(item.date) // Convert to UTC-5:30
            : '-';
        } else {
          const cellValue = normalizedReadings[key];
          row.getCell(colIdx + 1).value =
            cellValue !== undefined && (typeof cellValue === 'number' || typeof cellValue === 'string')
              ? cellValue
              : '-';
        }
      });
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: index % 2 === 0 ? 'FFF5F7FA' : 'FFFFFFFF' },
        };
      });
    });

    for (let i = 0; i < headers.length; i++) {
      worksheet.getColumn(i + 1).width = 20;
    }

    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 20;
    worksheet.getRow(4).height = 25;

    return await workbook.xlsx.writeBuffer() as Buffer;
  }
}