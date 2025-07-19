import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
  async generateExcel(data: any[], fields?: string[] | null): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    // Extract device name and location from the first data item, with fallbacks
    const deviceName = data.length > 0 ? data[0].name || 'Device Report' : 'No Data';
    const location = data.length > 0 ? data[0].location || 'Unknown Location' : 'Unknown Location';
    // Sanitize device name for worksheet naming (Excel restricts to 31 chars, no special chars)
    const sanitizedDeviceName = (deviceName || 'Unknown Device').trim().replace(/[\\/*[\]?:]/g, '_').substring(0, 31);
    const worksheet = workbook.addWorksheet(sanitizedDeviceName);

    // Title: Device name in row 1
    worksheet.mergeCells('A1:C1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Device Report: ${(deviceName || 'Unknown Device').trim()}`;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };

    // // Title: Location in row 2
    // worksheet.mergeCells('A2:C2');
    // const locationCell = worksheet.getCell('A2');
    // locationCell.value = `Location: ${location}`;
    // locationCell.font = { bold: true, size: 14 };
    // locationCell.alignment = { horizontal: 'center' };

    // Headers in row 4
    const headers = ['Temperature Value', 'Humidity Value', 'Date'];
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
      row.getCell(1).value = item.temperatureValue || '-';
      row.getCell(2).value = item.humidityValue || '-';
      row.getCell(3).value = item.date
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
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Column widths
    worksheet.getColumn('A').width = 20;
    worksheet.getColumn('B').width = 20;
    worksheet.getColumn('C').width = 25;

    return await workbook.xlsx.writeBuffer() as Buffer;
  }
}



