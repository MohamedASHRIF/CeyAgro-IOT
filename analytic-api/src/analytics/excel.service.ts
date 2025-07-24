// import { Injectable } from '@nestjs/common';
// import * as ExcelJS from 'exceljs';

// @Injectable()
// export class ExcelService {
//   async generateExcel(data: any[], deviceName: string, fields?: string[] | null): Promise<Buffer> {
//     const workbook = new ExcelJS.Workbook();
//     // Sanitize device name for worksheet naming (Excel restricts to 31 chars, no special chars)
//     const sanitizedDeviceName = (deviceName || 'Unknown Device').trim().replace(/[\\/*[\]?:]/g, '_').substring(0, 31);
//     const worksheet = workbook.addWorksheet(sanitizedDeviceName);

//     // Title: Device name in row 1
//     worksheet.mergeCells('A1:' + String.fromCharCode(65 + (fields?.length || 3) - 1) + '1');
//     const titleCell = worksheet.getCell('A1');
//     titleCell.value = `Device Report: ${(deviceName || 'Unknown Device').trim()}`;
//     titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
//     titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
//     titleCell.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FF4A90E2' }, // Blue background for title
//     };

//     // Device ID in row 2 (assuming deviceId is available in the first data item)
//     const deviceId = data[0]?.deviceId || 'N/A';
//     worksheet.mergeCells('A2:' + String.fromCharCode(65 + (fields?.length || 3) - 1) + '2');
//     const deviceIdCell = worksheet.getCell('A2');
//     deviceIdCell.value = `Device ID: ${deviceId}`;
//     deviceIdCell.font = { italic: true, size: 12, color: { argb: 'FF333333' } };
//     deviceIdCell.alignment = { horizontal: 'center', vertical: 'middle' };
//     deviceIdCell.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FFE6F0FA' }, // Light blue background
//     };

//     // Add some spacing (row 3 is empty)
//     worksheet.getRow(3).height = 10;

//     // Dynamic headers in row 4, excluding deviceId
//     let headers: string[] = [];
//     let fieldKeys: string[] = [];
//     if (fields && fields.length > 0) {
//       // Filter out deviceId and map field keys to readable headers
//       fieldKeys = fields.filter(f => f !== 'deviceId');
//       headers = fieldKeys.map(f => {
//         if (f === 'date') return 'Date';
//         // Capitalize and add 'Value' for sensor fields
//         return f.charAt(0).toUpperCase() + f.slice(1) + ' Value';
//       });
//     } else {
//       headers = ['Temperature Value', 'Humidity Value', 'Date'];
//       fieldKeys = ['temperatureValue', 'humidityValue', 'date'];
//     }
//     worksheet.getRow(4).values = headers;
//     headers.forEach((_, index) => {
//       const cell = worksheet.getCell(`${String.fromCharCode(65 + index)}4`);
//       cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
//       cell.fill = {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: 'FF1E88E5' }, // Darker blue for headers
//       };
//       cell.border = {
//         top: { style: 'thin', color: { argb: 'FF000000' } },
//         left: { style: 'thin', color: { argb: 'FF000000' } },
//         bottom: { style: 'thin', color: { argb: 'FF000000' } },
//         right: { style: 'thin', color: { argb: 'FF000000' } },
//       };
//       cell.alignment = { horizontal: 'center', vertical: 'middle' };
//     });

//     // Data starting in row 5 with alternating row colors
//     data.forEach((item, index) => {
//       const row = worksheet.getRow(index + 5);
//       fieldKeys.forEach((key, colIdx) => {
//         if (key === 'date') {
//           row.getCell(colIdx + 1).value = item.date
//             ? new Date(item.date).toLocaleString('en-US', {
//                 month: '2-digit',
//                 day: '2-digit',
//                 year: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 second: '2-digit',
//                 hour12: true,
//               })
//             : '-';
//         } else {
//           row.getCell(colIdx + 1).value = item[key] !== undefined ? item[key] : '-';
//         }
//       });
//       row.eachCell((cell) => {
//         cell.border = {
//           top: { style: 'thin', color: { argb: 'FF000000' } },
//           left: { style: 'thin', color: { argb: 'FF000000' } },
//           bottom: { style: 'thin', color: { argb: 'FF000000' } },
//           right: { style: 'thin', color: { argb: 'FF000000' } },
//         };
//         cell.alignment = { horizontal: 'center', vertical: 'middle' };
//         cell.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: index % 2 === 0 ? 'FFF5F7FA' : 'FFFFFFFF' }, // Alternating light gray and white rows
//         };
//       });
//     });

//     // Column widths
//     for (let i = 0; i < headers.length; i++) {
//       worksheet.getColumn(i + 1).width = 20;
//     }

//     // Set row heights for better appearance
//     worksheet.getRow(1).height = 30;
//     worksheet.getRow(2).height = 20;
//     worksheet.getRow(4).height = 25;

//     return await workbook.xlsx.writeBuffer() as Buffer;
//   }
// }

import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
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