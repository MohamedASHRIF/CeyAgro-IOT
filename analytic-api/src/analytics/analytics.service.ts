// // import {
// //   Injectable,
// //   NotFoundException,
// //   InternalServerErrorException,
// //    BadRequestException,
// // } from '@nestjs/common';
// // import { InjectModel } from '@nestjs/mongoose';
// // import { Model } from 'mongoose';
// // import { DeviceData, DeviceDataDocument } from './schemas/analytics.schema';
// // import { AnalyticsQueryDto } from './dto/analytics-query.dto';
// // import { ExcelService } from './excel.service';
// // import { S3Service } from './s3.service';
// // import { KafkaContext } from '@nestjs/microservices';
// // import { DeviceUser, DeviceUserDocument } from './schemas/device-user.schema';

// // @Injectable()
// // export class AnalyticsService {
// //   constructor(
// //     @InjectModel(DeviceData.name)
// //     private deviceModel: Model<DeviceDataDocument>,
// //     @InjectModel(DeviceUser.name)
// //     private deviceUserModel: Model<DeviceUserDocument>, // Inject DeviceUser model
// //     private excelService: ExcelService,
// //     private s3Service: S3Service,
// //   ) {}

// //   //kafka code
// //   async processIoTData(data: any, context: KafkaContext) {
// //     // Get the Kafka topic name from the context
// //     const topic = context.getTopic();
// //     console.log(`Received message from topic ${topic}:`, data);

// //     // Create a new DeviceData document with fields from the Kafka message
// //     const deviceData = new this.deviceModel({
// //       deviceId: data.deviceId, // new field
// //       temperatureValue: data.temperatureValue,
// //       humidityValue: data.humidityValue,
// //       isActive: data.isActive ?? true,
// //       date: data.date ? new Date(data.date) : new Date(),
// //       topic: topic,
// //     });

// //     //Save in MongoDB
// //     await deviceData.save();
// //     return { status: 'processed', data: deviceData };
// //   }


// //     async getDeviceNamesForUser(email: string): Promise<string[]> {
// //     try {
// //       console.log('Fetching device names for user email:', email);
// //       const userDevices = await this.deviceUserModel
// //         .find({ email })
// //         .select('deviceName')
// //         .exec();

// //       const deviceNames = userDevices
// //         .filter(device => device.deviceName && typeof device.deviceName === 'string')
// //         .map(device => device.deviceName)
// //         .sort((a, b) => a.localeCompare(b));
// //       console.log('Found device names for user:', deviceNames);

// //       if (deviceNames.length === 0) {
// //         console.warn(`No valid device names found for email: ${email}`);
// //       }
// //       return deviceNames;
// //     } catch (error) {
// //       console.error('Failed to fetch user device names:', error);
// //       throw new InternalServerErrorException('Failed to fetch user device names');
// //     }
// //   }

// // async generateAndUploadReport(
// //   queryDto: AnalyticsQueryDto,
// //   email?: string,
// // ): Promise<{ downloadUrl: string; expiresIn: number; recordCount: number }> {
// //   let data;
// //   let deviceId = queryDto.deviceId;

// //   // Fetch data based on email and deviceId
// //   if (email) {
// //     const userDeviceIds = await this.getDeviceIdsForUser(email);
// //     if (!userDeviceIds.length) {
// //       throw new NotFoundException('No devices found for the user');
// //     }
// //     if (deviceId && !userDeviceIds.includes(deviceId)) {
// //       throw new NotFoundException(`Device ID ${deviceId} not associated with user`);
// //     }
// //     data = await this.getFilteredDataForUser(queryDto, userDeviceIds);
// //   } else {
// //     data = await this.getFilteredData(queryDto);
// //   }

// //   if (data.length === 0) {
// //     throw new NotFoundException('No data found for the given criteria');
// //   }

// //   if (data[0].date) {
// //     data.sort(
// //       (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
// //     );
// //   }

// //   let fieldsToInclude = queryDto.fields;
// //   if (!fieldsToInclude || fieldsToInclude.length === 0) {
// //     // Dynamically determine fields from deviceTypes
// //     fieldsToInclude = ['date', 'deviceId'];
// //     if (deviceId && email) {
// //       const deviceUser = await this.deviceUserModel
// //         .findOne({ deviceId, email })
// //         .select('deviceTypes')
// //         .lean();
// //       if (deviceUser && Array.isArray(deviceUser.deviceTypes)) {
// //         const typeFields = deviceUser.deviceTypes.map((t: any) => {
// //           let key = t.type.charAt(0).toLowerCase() + t.type.slice(1);
// //           if (!key.endsWith('Value')) key += 'Value';
// //           return key;
// //         });
// //         fieldsToInclude = [...typeFields, 'date', 'deviceId'];
// //       } else {
// //         // fallback to temperature/humidity
// //         fieldsToInclude = ['temperatureValue', 'humidityValue', 'date', 'deviceId'];
// //       }
// //     } else {
// //       fieldsToInclude = ['temperatureValue', 'humidityValue', 'date', 'deviceId'];
// //     }
// //   }

// //   let deviceName = 'Device Report'; // Default fallback
// //   if (deviceId && email) {
// //     // Fetch device name for the specific deviceId and email to ensure user ownership
// //     const deviceUser = await this.deviceUserModel
// //       .findOne({ deviceId, email }) // Ensure device belongs to the user
// //       .select('deviceName')
// //       .lean();
// //     if (deviceUser && deviceUser.deviceName) {
// //       deviceName = deviceUser.deviceName.trim();
// //       if (!deviceName) {
// //         console.warn(`Empty deviceName after trimming for deviceId: ${deviceId}, email: ${email}`);
// //         deviceName = `Device ${deviceId}`;
// //       }
// //     } else {
// //       console.warn(`No device found for deviceId: ${deviceId}, email: ${email}`);
// //       throw new NotFoundException(`Device ID ${deviceId} not found for user`);
// //     }
// //   } else if (email) {
// //     // For multiple devices, use a generic name
// //     const userDevices = await this.deviceUserModel
// //       .find({ email })
// //       .select('deviceName')
// //       .lean();
// //     deviceName =
// //       userDevices.length === 1 && userDevices[0].deviceName
// //         ? userDevices[0].deviceName.trim()
// //         : 'Multiple Devices';
// //     if (!deviceName) {
// //       console.warn(`Empty deviceName for user devices, email: ${email}`);
// //       deviceName = 'Multiple Devices';
// //     }
// //   }

// //   console.log(`Generating report for deviceName: ${deviceName}, deviceId: ${deviceId}, email: ${email}`);

// //   const excelBuffer = await this.excelService.generateExcel(
// //     data,
// //     deviceName,
// //     fieldsToInclude,
// //   );

// //   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
// //   const deviceInfo = deviceId ? `-${deviceId.replace(/\s+/g, '-')}` : '';
// //   const dateInfo = queryDto.date ? `-${queryDto.date}` : '';
// //   const filename = `device-report${deviceInfo}${dateInfo}-${timestamp}.xlsx`;
// //   const s3Key = `analytics/${filename}`;

// //   try {
// //     await this.s3Service.uploadFile(
// //       excelBuffer,
// //       s3Key,
// //       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
// //     );
// //   } catch (error) {
// //     console.error('Failed to upload to S3:', error);
// //     throw new InternalServerErrorException('Failed to upload report to storage');
// //   }

// //   const expiresIn = 1800;
// //   const downloadUrl = this.s3Service.getSignedUrl(s3Key, expiresIn);
// //   return {
// //     downloadUrl,
// //     expiresIn,
// //     recordCount: data.length,
// //   };
// // }


// //  async getReadingsByDeviceAndDate(
// //     queryDto: AnalyticsQueryDto,
// //     email?: string,
// //   ): Promise<any[]> {
// //     let data;

// //     if (email) {
// //       const userDeviceIds = await this.getDeviceIdsForUser(email);
// //       data = await this.getFilteredDataForUser(queryDto, userDeviceIds);
// //     } else {
// //       data = await this.getFilteredData(queryDto);
// //     }

// //     if (data.length === 0) {
// //       return [];
// //     }
// //     return data;
// //   }

  


// //  private async getFilteredDataForUser(queryDto: AnalyticsQueryDto, userDeviceIds: string[]): Promise<any[]> {
// //     if (!userDeviceIds.length) {
// //       console.warn('No valid device IDs provided for the user');
// //       throw new NotFoundException('No valid device IDs provided for the user');
// //     }

// //     const query: any = { deviceId: { $in: userDeviceIds } };

// //     if (queryDto.deviceId) {
// //       if (!userDeviceIds.includes(queryDto.deviceId)) {
// //         throw new NotFoundException(`Device ID ${queryDto.deviceId} not associated with user`);
// //       }
// //       query.deviceId = queryDto.deviceId;
// //     }

// //     if (queryDto.temperatureValue != null) {
// //       query.temperatureValue = queryDto.temperatureValue;
// //     }
// //     if (queryDto.humidityValue != null) {
// //       query.humidityValue = queryDto.humidityValue;
// //     }

// //     if (queryDto.date || queryDto.startDate || queryDto.endDate) {
// //       query.date = query.date || {};
// //       if (queryDto.date) {
// //         const targetDate = new Date(queryDto.date);
// //         if (isNaN(targetDate.getTime())) {
// //           throw new BadRequestException('Invalid date format provided');
// //         }
// //         const startDate = new Date(targetDate);
// //         startDate.setHours(0, 0, 0, 0);
// //         const endDate = new Date(targetDate);
// //         endDate.setHours(23, 59, 59, 999);
// //         query.date.$gte = startDate;
// //         query.date.$lte = endDate;
// //       } else {
// //         if (queryDto.startDate) {
// //           const startDate = new Date(queryDto.startDate);
// //           if (isNaN(startDate.getTime())) {
// //             throw new BadRequestException('Invalid startDate format provided');
// //           }
// //           startDate.setHours(0, 0, 0, 0);
// //           query.date.$gte = startDate;
// //         }
// //         if (queryDto.endDate) {
// //           const endDate = new Date(queryDto.endDate);
// //           if (isNaN(endDate.getTime())) {
// //             throw new BadRequestException('Invalid endDate format provided');
// //           }
// //           endDate.setHours(23, 59, 59, 999);
// //           query.date.$lte = endDate;
// //         }
// //       }
// //     }

// //     console.log('Filtered query for user:', JSON.stringify(query));
// //     try {
// //       const devices = await this.deviceModel.find(query).lean().exec();
// //       console.log(`Query returned ${devices.length} results for user`);
// //       return devices.map((device) => {
// //         const rawDevice = device as Record<string, any>;
// //         const id = rawDevice._id ? rawDevice._id.toString() : null;
// //         const { _id, __v, ...cleanDevice } = rawDevice;
// //         if (cleanDevice.date) {
// //           cleanDevice.date = new Date(cleanDevice.date).toISOString();
// //         }
// //         return { ...cleanDevice, id };
// //       });
// //     } catch (error) {
// //       throw new InternalServerErrorException('Failed to fetch device data');
// //     }
// //   }

// //  private async getFilteredData(queryDto: AnalyticsQueryDto): Promise<any[]> {
// //     const query: any = {};

// //     if (queryDto.deviceId) {
// //       query.deviceId = queryDto.deviceId;
// //     }
// //     if (queryDto.temperatureValue != null) {
// //       query.temperatureValue = queryDto.temperatureValue;
// //     }
// //     if (queryDto.humidityValue != null) {
// //       query.humidityValue = queryDto.humidityValue;
// //     }

// //     if (queryDto.date || queryDto.startDate || queryDto.endDate) {
// //       query.date = query.date || {};
// //       if (queryDto.date) {
// //         const targetDate = new Date(queryDto.date);
// //         if (isNaN(targetDate.getTime())) {
// //           throw new BadRequestException('Invalid date format provided');
// //         }
// //         const startDate = new Date(targetDate);
// //         startDate.setHours(0, 0, 0, 0);
// //         const endDate = new Date(targetDate);
// //         endDate.setHours(23, 59, 59, 999);
// //         query.date.$gte = startDate;
// //         query.date.$lte = endDate;
// //       } else {
// //         if (queryDto.startDate) {
// //           const startDate = new Date(queryDto.startDate);
// //           if (isNaN(startDate.getTime())) {
// //             throw new BadRequestException('Invalid startDate format provided');
// //           }
// //           startDate.setHours(0, 0, 0, 0);
// //           query.date.$gte = startDate;
// //         }
// //         if (queryDto.endDate) {
// //           const endDate = new Date(queryDto.endDate);
// //           if (isNaN(endDate.getTime())) {
// //             throw new BadRequestException('Invalid endDate format provided');
// //           }
// //           endDate.setHours(23, 59, 59, 999);
// //           query.date.$lte = endDate;
// //         }
// //       }
// //     }

// //     try {
// //       const devices = await this.deviceModel.find(query).lean().exec();
// //       return devices.map((device) => {
// //         const rawDevice = device as Record<string, any>;
// //         const id = rawDevice._id ? rawDevice._id.toString() : null;
// //         const { _id, __v, ...cleanDevice } = rawDevice;
// //         if (cleanDevice.date) {
// //           cleanDevice.date = new Date(cleanDevice.date).toISOString();
// //         }
// //         return { ...cleanDevice, id };
// //       });
// //     } catch (error) {
// //       throw new InternalServerErrorException('Failed to fetch device data');
// //     }
// //   }


// //     async deleteReportFile(
// //     s3Key: string,
// //   ): Promise<{ success: boolean; message: string }> {
// //     try {
// //       s3Key = decodeURIComponent(s3Key).trim();
// //       await this.s3Service.deleteFile(s3Key);
// //       return {
// //         success: true,
// //         message: `File "${s3Key}" deleted successfully`,
// //       };
// //     } catch (error) {
// //       if (error instanceof NotFoundException) {
// //         return {
// //           success: false,
// //           message: error.message,
// //         };
// //       }
// //       console.error('Error deleting file:', error);
// //       throw new InternalServerErrorException(
// //         `Failed to delete file from storage: ${error.message}`,
// //       );
// //     }
// //   }




// //   // Visualization Methods
// // // Retrieves the latest real-time stats for a device by name and metric (temperature or humidity)
// // async getRealtimeStats(deviceId: string, metric: string) {
// //   console.log('SERVICE DEBUG: getRealtimeStats called', { deviceId, metric });
// //   try {
// //     const valueKey = (metric || '').toLowerCase() === 'humidity' ? 'humidityValue' : 'temperatureValue';
// //     // Find the most recent document with a valid value for the metric
// //     const latest = await this.deviceModel
// //       .findOne({
// //         deviceId,
// //         [valueKey]: { $exists: true, $ne: null, $type: 'number' }
// //       })
// //       .sort({ date: -1, _id: -1 })
// //       .select('-__v');
// //     console.log('SERVICE DEBUG: getRealtimeStats latest', latest);
// //     if (!latest) {
// //       console.log('SERVICE DEBUG: No valid data found for device');
// //       return {
// //         deviceId: deviceId,
// //         metric,
// //         value: 0,
// //         timestamp: new Date().toISOString(),
// //       };
// //     }
// //     return {
// //       deviceId: latest.deviceId,
// //       metric,
// //       value: latest[valueKey],
// //       timestamp: latest.date ? latest.date.toISOString() : new Date().toISOString(),
// //     };
// //   } catch (err) {
// //     console.error('SERVICE ERROR: getRealtimeStats', err);
// //     throw err;
// //   }
// // }

// // // Retrieves historical stats for a device within a specified date range
// // async getHistoricalStats(
// //   deviceId: string,
// //   metric: 'temperature' | 'humidity',
// //   startDate: string,
// //   endDate: string,
// // ) {
// //   const metricField = metric === 'temperature' ? 'temperatureValue' : 'humidityValue';

// //   const query = {
// //     deviceId,
// //     date: { $gte: new Date(startDate), $lte: new Date(endDate) },
// //     [metricField]: { $exists: true, $ne: null, $type: 'number' }, // only valid entries
// //   };

// //   console.log('DEBUG: getHistoricalStats query:', JSON.stringify(query));

// //   try {
// //     const data = await this.deviceModel
// //       .find(query)
// //       .sort({ date: 1 }) // optional: ensure chronological order
// //       .select(`deviceId ${metricField} date`);

// //     console.log('DEBUG: getHistoricalStats valid data count:', data.length);

// //     return data.map(item => ({
// //       deviceId: item.deviceId,
// //       metric,
// //       value: item[metricField], // only valid numbers
// //       timestamp: item.date?.toISOString() || new Date().toISOString(),
// //     }));
// //   } catch (err) {
// //     console.error('SERVICE ERROR: getHistoricalStats', err);
// //     throw err;
// //   }
// // }


// // // Retrieves aggregated stats (min, max, avg) for a device over a time range (lastHour or lastDay)
// // async getStats(deviceId: string, metric: 'temperature' | 'humidity', timeRange: string) {
// //   const now = new Date();
// //   const startDate = new Date(
// //     now.getTime() - (timeRange === 'lastHour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
// //   );
// //   const query = {
// //     deviceId,
// //     date: { $gte: startDate, $lte: now },
// //   };
// //   console.log('DEBUG: getStats query:', JSON.stringify(query));
// //   try {
// //     const data = await this.deviceModel
// //       .find(query)
// //       .select('temperatureValue humidityValue');
// //     console.log('DEBUG: getStats results:', data.length);
// //     const values = data
// //       .map(item => (metric === 'temperature' ? item.temperatureValue : item.humidityValue))
// //       .filter(v => typeof v === 'number' && !isNaN(v));
// //     return {
// //       min: values.length > 0 ? Math.min(...values) : 0,
// //       max: values.length > 0 ? Math.max(...values) : 0,
// //       avg: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
// //     };
// //   } catch (err) {
// //     console.error('SERVICE ERROR: getStats', err);
// //     throw err;
// //   }
// // }

// // // Returns the available metrics for a device 
// // async getAvailableMetrics(deviceId: string) {
// //   // Optionally, you could check if the device exists by deviceId
// //   return ['temperature', 'humidity'];
// // }

// //   // Helper: Get all deviceIds for a user by email
// //   async getDeviceIdsForUser(email: string): Promise<string[]> {
// //     const userDevices = await this.deviceUserModel.find({ email }).lean();
// //     return userDevices.map((d) => d.deviceId);
// //   }

// //   async getDeviceUserByDeviceIdAndEmail(deviceId: string, email: string) {
// //     return this.deviceUserModel.findOne({ deviceId, email }).lean();
// //   }

// //   // Fetch readings for multiple deviceIds with filtering
// //   async getReadingsForDevices(deviceIds: string[], queryDto: AnalyticsQueryDto) {
// //     const query: any = { deviceId: { $in: deviceIds } };
// //     if (queryDto.startDate || queryDto.endDate) {
// //       query.date = {};
// //       if (queryDto.startDate) {
// //         query.date.$gte = new Date(queryDto.startDate);
// //       }
// //       if (queryDto.endDate) {
// //         query.date.$lte = new Date(queryDto.endDate);
// //       }
// //     }
// //     // Add more filters as needed from queryDto
// //     return this.deviceModel.find(query).lean();
// //   }

// // // --- Advanced Analytics Methods ---
// // // Anomaly Detection (simple z-score or threshold based)
// // async getAnomalies(deviceId: string, metric: 'temperature' | 'humidity', startDate: string, endDate: string) {
// //   const query = {
// //     deviceId,
// //     date: { $gte: new Date(startDate), $lte: new Date(endDate) },
// //   };
// //   console.log('DEBUG: getAnomalies query:', JSON.stringify(query));
// //   const data = await this.deviceModel.find(query).select('date temperatureValue humidityValue').lean();
// //   console.log('DEBUG: getAnomalies results:', data.length);
// //   const values = data.map(item => metric === 'temperature' ? item.temperatureValue : item.humidityValue)
// //     .filter(v => typeof v === 'number' && !isNaN(v));
// //   if (values.length === 0) return [];
// //   const mean = values.reduce((a, b) => a + b, 0) / values.length;
// //   const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
// //   // Mark as anomaly if value is >2 std from mean
// //   const anomalies = data.filter((item, idx) => Math.abs(values[idx] - mean) > 2 * std).map(item => ({
// //     timestamp: item.date,
// //     value: metric === 'temperature' ? item.temperatureValue : item.humidityValue,
// //   }));
// //   return { anomalies, mean, std };
// // }
// // // Device/Period Comparison (returns stats for each)
// // async compareDevicesOrPeriods(deviceA: string, deviceB: string, metric: 'temperature' | 'humidity', startDateA: string, endDateA: string, startDateB: string, endDateB: string) {
// //   const getStats = async (deviceId: string, start: string, end: string) => {
// //     const data = await this.deviceModel.find({
// //       deviceId,
// //       date: { $gte: new Date(start), $lte: new Date(end) },
// //     }).select('temperatureValue humidityValue');
// //     const values = data.map(item => metric === 'temperature' ? item.temperatureValue : item.humidityValue)
// //       .filter(v => typeof v === 'number' && !isNaN(v));
// //     return {
// //       min: values.length > 0 ? Math.min(...values) : 0,
// //       max: values.length > 0 ? Math.max(...values) : 0,
// //       avg: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
// //     };
// //   };
// //   const statsA = await getStats(deviceA, startDateA, endDateA);
// //   const statsB = await getStats(deviceB, startDateB, endDateB);
// //   return { deviceA: statsA, deviceB: statsB };
// // }
// // // Correlation (Pearson correlation between temp and humidity)
// // async getCorrelation(deviceId: string, startDate: string, endDate: string) {
// //   const data = await this.deviceModel.find({
// //     deviceId,
// //     date: { $gte: new Date(startDate), $lte: new Date(endDate) },
// //   }).select('temperatureValue humidityValue');
// //   const tempsFiltered = data.map(item => item.temperatureValue)
// //     .filter(v => typeof v === 'number' && !isNaN(v));
// //   const humsFiltered = data.map(item => item.humidityValue)
// //     .filter(v => typeof v === 'number' && !isNaN(v));
// //   if (tempsFiltered.length === 0 || humsFiltered.length === 0) return { correlation: null, points: [] };
// //   const meanT = tempsFiltered.reduce((a, b) => a + b, 0) / tempsFiltered.length;
// //   const meanH = humsFiltered.reduce((a, b) => a + b, 0) / humsFiltered.length;
// //   const numerator = tempsFiltered.reduce((sum, t, i) => sum + (t - meanT) * (humsFiltered[i] - meanH), 0);
// //   const denominator = Math.sqrt(tempsFiltered.reduce((sum, t) => sum + Math.pow(t - meanT, 2), 0) * humsFiltered.reduce((sum, h) => sum + Math.pow(h - meanH, 2), 0));
// //   const corr = denominator === 0 ? null : numerator / denominator;
// //   // Return points as {x, y} for scatter plot compatibility
// //   const points = data
// //     .filter(item => typeof item.temperatureValue === 'number' && !isNaN(item.temperatureValue) && typeof item.humidityValue === 'number' && !isNaN(item.humidityValue))
// //     .map(item => ({ x: item.temperatureValue, y: item.humidityValue }));
// //   return { correlation: corr, points };
// // }
// // // Prediction: returns actual and predicted values for a device/metric
// // async getPrediction(deviceId: string, metric: 'temperature' | 'humidity', futureWindow: number) {
// //   // 1. Get recent actual data (last 24h)
// //   const now = new Date();
// //   const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
// //   const actualData = await this.deviceModel.find({
// //     deviceId,
// //     date: { $gte: past, $lte: now },
// //   }).sort({ date: 1 }).select('date temperatureValue humidityValue');

// //   // 2. Prepare actual values for chart
// //   const actualPoints = actualData.map(item => ({
// //     timestamp: item.date.toISOString(),
// //     actualValue: metric === 'temperature' ? item.temperatureValue : item.humidityValue,
// //     predictedValue: null,
// //   }));

// //   // 3. Generate mock predictions (simple linear extrapolation)
// //   let lastValue = actualPoints.length > 0 ? actualPoints[actualPoints.length - 1].actualValue : 0;
// //   let slope = 0;
// //   if (actualPoints.length > 1) {
// //     const first = actualPoints[0].actualValue;
// //     const last = actualPoints[actualPoints.length - 1].actualValue;
// //     slope = (last - first) / (actualPoints.length - 1);
// //   }
// //   const intervalMs = 60 * 60 * 1000; // 1 hour intervals
// //   const predictionPoints = [];
// //   for (let i = 1; i <= futureWindow; i++) {
// //     const futureDate = new Date(now.getTime() + i * intervalMs);
// //     const predictedValue = lastValue + slope * i;
// //     predictionPoints.push({
// //       timestamp: futureDate.toISOString(),
// //       actualValue: null,
// //       predictedValue,
// //     });
// //   }

// //   // 4. Combine actual and predicted
// //   return {
// //     deviceId,
// //     metric,
// //     points: [...actualPoints, ...predictionPoints],
// //   };
// // }
// // // Forecast: returns forecasted values for a device/metric for the next N hours using a hybrid of moving average, exponential smoothing, and linear regression
// // async getForecast(deviceId: string, metric: 'temperature' | 'humidity', futureWindow: number) {
// //   // 1. Get recent actual data (last 24h)
// //   const now = new Date();
// //   const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
// //   const actualData = await this.deviceModel.find({
// //     deviceId,
// //     date: { $gte: past, $lte: now },
// //   }).sort({ date: 1 }).select('date temperatureValue humidityValue');

// //   // Prepare values
// //   const values = actualData.map(item => metric === 'temperature' ? item.temperatureValue : item.humidityValue)
// //     .filter(v => typeof v === 'number' && !isNaN(v));
// //   if (values.length === 0) values.push(0);

// //   // --- Moving Average ---
// //   const windowSize = 6;
// //   let maValues = [...values];

// //   // --- Exponential Smoothing ---
// //   const alpha = 0.5; // smoothing factor (0 < alpha <= 1)
// //   let esValues = [values[0]];
// //   for (let i = 1; i < values.length; i++) {
// //     esValues.push(alpha * values[i] + (1 - alpha) * esValues[i - 1]);
// //   }

// //   // --- Linear Regression (trend) ---
// //   // Fit y = a + b*x to the last N points
// //   const n = values.length;
// //   let lrA = 0, lrB = 0;
// //   if (n > 1) {
// //     const x = Array.from({ length: n }, (_, i) => i);
// //     const sumX = x.reduce((a, b) => a + b, 0);
// //     const sumY = values.reduce((a, b) => a + b, 0);
// //     const sumXY = x.reduce((a, b, i) => a + b * values[i], 0);
// //     const sumX2 = x.reduce((a, b) => a + b * b, 0);
// //     lrB = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
// //     lrA = (sumY - lrB * sumX) / n;
// //   } else {
// //     lrA = values[0];
// //     lrB = 0;
// //   }

// //   // --- Forecast future points ---
// //   const forecastPoints = [];
// //   let lastMA = maValues.slice(-windowSize);
// //   let lastES = esValues[esValues.length - 1];
// //   for (let i = 1; i <= futureWindow; i++) {
// //     // Moving Average
// //     const ma = lastMA.reduce((sum, v) => sum + v, 0) / lastMA.length;
// //     lastMA.push(ma);
// //     if (lastMA.length > windowSize) lastMA.shift();
// //     // Exponential Smoothing
// //     lastES = alpha * ma + (1 - alpha) * lastES;
// //     // Linear Regression
// //     const lr = lrA + lrB * (n + i - 1);
// //     // Hybrid: average of all three
// //     const hybrid = (ma + lastES + lr) / 3;
// //     const futureDate = new Date(now.getTime() + i * 60 * 60 * 1000);
// //     forecastPoints.push({
// //       timestamp: futureDate.toISOString(),
// //       forecastValue: hybrid,
// //     });
// //     // For next step
// //     maValues.push(ma);
// //     esValues.push(lastES);
// //   }
// //   return {
// //     deviceId,
// //     metric,
// //     forecast: forecastPoints,
// //   };
// // }

// //   async getUserDeviceList(email: string): Promise<{ deviceId: string; deviceName: string }[]> {
// //     try {
// //       const userDevices = await this.deviceUserModel
// //         .find({ email })
// //         .select('deviceId deviceName')
// //         .exec();
// //       return userDevices
// //         .filter(device => device.deviceId && device.deviceName)
// //         .map(device => ({
// //           deviceId: device.deviceId,
// //           deviceName: device.deviceName,
// //         }));
// //     } catch (error) {
// //       console.error('Failed to fetch user device list:', error);
// //       throw new InternalServerErrorException('Failed to fetch user device list');
// //     }
// //   }
// // }

// import {
//   Injectable,
//   NotFoundException,
//   InternalServerErrorException,
//   BadRequestException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { DeviceData, DeviceDataDocument } from './schemas/analytics.schema';
// import { AnalyticsQueryDto } from './dto/analytics-query.dto';
// import { ExcelService } from './excel.service';
// import { S3Service } from './s3.service';
// import { KafkaContext } from '@nestjs/microservices';
// import { DeviceUser, DeviceUserDocument } from './schemas/device-user.schema';

// @Injectable()
// export class AnalyticsService {
//   constructor(
//     @InjectModel(DeviceData.name)
//     private deviceModel: Model<DeviceDataDocument>,
//     @InjectModel(DeviceUser.name)
//     private deviceUserModel: Model<DeviceUserDocument>,
//     private excelService: ExcelService,
//     private s3Service: S3Service,
//   ) {}

//   async processIoTData(data: any, context: KafkaContext) {
//     const topic = context.getTopic();
//     console.log(`Received message from topic ${topic}:`, data);

//     const deviceData = new this.deviceModel({
//       deviceId: data.deviceId,
//       temperatureValue: data.temperatureValue,
//       humidityValue: data.humidityValue,
//       isActive: data.isActive ?? true,
//       date: data.date ? new Date(data.date) : new Date(),
//       topic: topic,
//     });

//     await deviceData.save();
//     return { status: 'processed', data: deviceData };
//   }

//   async getDeviceNamesForUser(email: string): Promise<string[]> {
//     try {
//       console.log('Fetching device names for user email:', email);
//       const userDevices = await this.deviceUserModel
//         .find({ email })
//         .select('deviceName')
//         .exec();

//       const deviceNames = userDevices
//         .filter(device => device.deviceName && typeof device.deviceName === 'string')
//         .map(device => device.deviceName)
//         .sort((a, b) => a.localeCompare(b));
//       console.log('Found device names for user:', deviceNames);

//       if (deviceNames.length === 0) {
//         console.warn(`No valid device names found for email: ${email}`);
//       }
//       return deviceNames;
//     } catch (error) {
//       console.error('Failed to fetch user device names:', error);
//       throw new InternalServerErrorException('Failed to fetch user device names');
//     }
//   }

//   async generateAndUploadReport(
//     queryDto: AnalyticsQueryDto,
//     email?: string,
//   ): Promise<{ downloadUrl: string; expiresIn: number; recordCount: number }> {
//     let data;
//     let deviceId = queryDto.deviceId;
//     let deviceName = 'Device Report';
//     let fieldsToInclude: string[] = queryDto.fields || ['temperatureValue', 'humidityValue', 'date', 'deviceId'];

//     if (email) {
//       const userDeviceIds = await this.getDeviceIdsForUser(email);
//       if (!userDeviceIds.length) {
//         throw new NotFoundException('No devices found for the user');
//       }
//       if (deviceId && !userDeviceIds.includes(deviceId)) {
//         throw new NotFoundException(`Device ID ${deviceId} not associated with user`);
//       }

//       if (deviceId) {
//         const deviceUser = await this.deviceUserModel
//           .findOne({ deviceId, email })
//           .select('deviceName deviceTypes')
//           .lean();
//         if (!deviceUser) {
//           throw new NotFoundException(`Device ID ${deviceId} not found for user`);
//         }
//         deviceName = (deviceUser.deviceName?.trim() || `Device ${deviceId}`).substring(0, 31);

//         if (!queryDto.fields?.length && Array.isArray(deviceUser.deviceTypes)) {
//           try {
//             fieldsToInclude = [
//               ...deviceUser.deviceTypes.map((t: any) => {
//                 let key = t.type.charAt(0).toLowerCase() + t.type.slice(1);
//                 return key.endsWith('Value') ? key : `${key}Value`;
//               }),
//               'date',
//               'deviceId',
//             ];
//           } catch (error) {
//             console.warn(`Invalid deviceTypes for deviceId: ${deviceId}, falling back to defaults`);
//             fieldsToInclude = ['temperatureValue', 'humidityValue', 'date', 'deviceId'];
//           }
//         }
//       } else {
//         const userDevices = await this.deviceUserModel
//           .find({ email })
//           .select('deviceName')
//           .lean();
//         deviceName = userDevices.length === 1 && userDevices[0].deviceName?.trim()
//           ? userDevices[0].deviceName.trim().substring(0, 31)
//           : 'Multiple Devices';
//       }

//       data = await this.getFilteredDataForUser(queryDto, userDeviceIds);
//     } else {
//       data = await this.getFilteredData(queryDto);
//     }

//     if (data.length === 0) {
//       throw new NotFoundException('No data found for the given criteria');
//     }

//     if (data[0].date) {
//       data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
//     }

//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const deviceInfo = deviceId ? `-${deviceId.replace(/[\\/*[\]?:]/g, '-')}` : '';
//     const dateInfo = queryDto.date ? `-${queryDto.date.replace(/[\\/*[\]?:]/g, '-')}` : '';
//     const filename = `device-report${deviceInfo}${dateInfo}-${timestamp}.xlsx`.substring(0, 255);
//     const s3Key = `analytics/${filename}`;

//     console.log(`Generating report for deviceName: ${deviceName}, deviceId: ${deviceId}, email: ${email}`);

//     const excelBuffer = await this.excelService.generateExcel(data, deviceName, fieldsToInclude);

//     try {
//       await this.s3Service.uploadFile(
//         excelBuffer,
//         s3Key,
//         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       );
//     } catch (error) {
//       console.error('Failed to upload to S3:', error);
//       throw new InternalServerErrorException('Failed to upload report to storage');
//     }

//     const expiresIn = 1800;
//     const downloadUrl = this.s3Service.getSignedUrl(s3Key, expiresIn);
//     return {
//       downloadUrl,
//       expiresIn,
//       recordCount: data.length,
//     };
//   }

//   async getReadingsByDeviceAndDate(queryDto: AnalyticsQueryDto, email?: string): Promise<any[]> {
//     let data;

//     if (email) {
//       const userDeviceIds = await this.getDeviceIdsForUser(email);
//       data = await this.getFilteredDataForUser(queryDto, userDeviceIds);
//     } else {
//       data = await this.getFilteredData(queryDto);
//     }

//     return data;
//   }

//   private async getFilteredDataForUser(queryDto: AnalyticsQueryDto, userDeviceIds: string[]): Promise<any[]> {
//     if (!userDeviceIds.length) {
//       console.warn('No valid device IDs provided for the user');
//       throw new NotFoundException('No valid device IDs provided for the user');
//     }

//     const query: any = {
//       deviceId: { $in: userDeviceIds },
//       $or: [
//         { temperatureValue: { $exists: true, $ne: null, $type: 'number' } },
//         { humidityValue: { $exists: true, $ne: null, $type: 'number' } },
//       ],
//     };

//     if (queryDto.deviceId) {
//       if (!userDeviceIds.includes(queryDto.deviceId)) {
//         throw new NotFoundException(`Device ID ${queryDto.deviceId} not associated with user`);
//       }
//       query.deviceId = queryDto.deviceId;
//     }

//     if (queryDto.temperatureValue != null) {
//       query.temperatureValue = queryDto.temperatureValue;
//     }
//     if (queryDto.humidityValue != null) {
//       query.humidityValue = queryDto.humidityValue;
//     }

//     if (queryDto.date || queryDto.startDate || queryDto.endDate) {
//       query.date = query.date || {};
//       if (queryDto.date) {
//         const targetDate = new Date(queryDto.date);
//         if (isNaN(targetDate.getTime())) {
//           throw new BadRequestException('Invalid date format provided');
//         }
//         const startDate = new Date(targetDate);
//         startDate.setHours(0, 0, 0, 0);
//         const endDate = new Date(targetDate);
//         endDate.setHours(23, 59, 59, 999);
//         query.date.$gte = startDate;
//         query.date.$lte = endDate;
//       } else {
//         if (queryDto.startDate) {
//           const startDate = new Date(queryDto.startDate);
//           if (isNaN(startDate.getTime())) {
//             throw new BadRequestException('Invalid startDate format provided');
//           }
//           startDate.setHours(0, 0, 0, 0);
//           query.date.$gte = startDate;
//         }
//         if (queryDto.endDate) {
//           const endDate = new Date(queryDto.endDate);
//           if (isNaN(endDate.getTime())) {
//             throw new BadRequestException('Invalid endDate format provided');
//           }
//           endDate.setHours(23, 59, 59, 999);
//           query.date.$lte = endDate;
//         }
//       }
//     }

//     console.log('Filtered query for user:', JSON.stringify(query));
//     try {
//       const devices = await this.deviceModel.find(query).lean().exec();
//       console.log(`Query returned ${devices.length} results for user`);
//       return devices.map((device) => {
//         const rawDevice = device as Record<string, any>;
//         const id = rawDevice._id ? rawDevice._id.toString() : null;
//         const { _id, __v, ...cleanDevice } = rawDevice;
//         if (cleanDevice.date) {
//           cleanDevice.date = new Date(cleanDevice.date).toISOString();
//         }
//         return { ...cleanDevice, id };
//       });
//     } catch (error) {
//       throw new InternalServerErrorException('Failed to fetch device data');
//     }
//   }

//   private async getFilteredData(queryDto: AnalyticsQueryDto): Promise<any[]> {
//     const query: any = {
//       $or: [
//         { temperatureValue: { $exists: true, $ne: null, $type: 'number' } },
//         { humidityValue: { $exists: true, $ne: null, $type: 'number' } },
//       ],
//     };

//     if (queryDto.deviceId) {
//       query.deviceId = queryDto.deviceId;
//     }
//     if (queryDto.temperatureValue != null) {
//       query.temperatureValue = queryDto.temperatureValue;
//     }
//     if (queryDto.humidityValue != null) {
//       query.humidityValue = queryDto.humidityValue;
//     }

//     if (queryDto.date || queryDto.startDate || queryDto.endDate) {
//       query.date = query.date || {};
//       if (queryDto.date) {
//         const targetDate = new Date(queryDto.date);
//         if (isNaN(targetDate.getTime())) {
//           throw new BadRequestException('Invalid date format provided');
//         }
//         const startDate = new Date(targetDate);
//         startDate.setHours(0, 0, 0, 0);
//         const endDate = new Date(targetDate);
//         endDate.setHours(23, 59, 59, 999);
//         query.date.$gte = startDate;
//         query.date.$lte = endDate;
//       } else {
//         if (queryDto.startDate) {
//           const startDate = new Date(queryDto.startDate);
//           if (isNaN(startDate.getTime())) {
//             throw new BadRequestException('Invalid startDate format provided');
//           }
//           startDate.setHours(0, 0, 0, 0);
//           query.date.$gte = startDate;
//         }
//         if (queryDto.endDate) {
//           const endDate = new Date(queryDto.endDate);
//           if (isNaN(endDate.getTime())) {
//             throw new BadRequestException('Invalid endDate format provided');
//           }
//           endDate.setHours(23, 59, 59, 999);
//           query.date.$lte = endDate;
//         }
//       }
//     }

//     try {
//       const devices = await this.deviceModel.find(query).lean().exec();
//       return devices.map((device) => {
//         const rawDevice = device as Record<string, any>;
//         const id = rawDevice._id ? rawDevice._id.toString() : null;
//         const { _id, __v, ...cleanDevice } = rawDevice;
//         if (cleanDevice.date) {
//           cleanDevice.date = new Date(cleanDevice.date).toISOString();
//         }
//         return { ...cleanDevice, id };
//       });
//     } catch (error) {
//       throw new InternalServerErrorException('Failed to fetch device data');
//     }
//   }

//   async deleteReportFile(s3Key: string): Promise<{ success: boolean; message: string }> {
//     try {
//       s3Key = decodeURIComponent(s3Key).trim();
//       await this.s3Service.deleteFile(s3Key);
//       return {
//         success: true,
//         message: `File "${s3Key}" deleted successfully`,
//       };
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         return {
//           success: false,
//           message: error.message,
//         };
//       }
//       console.error('Error deleting file:', error);
//       throw new InternalServerErrorException(
//         `Failed to delete file from storage: ${error.message}`,
//       );
//     }
//   }

//   async getRealtimeStats(deviceId: string, metric: string) {
//     console.log('SERVICE DEBUG: getRealtimeStats called', { deviceId, metric });
//     try {
//       const valueKey = (metric || '').toLowerCase() === 'humidity' ? 'humidityValue' : 'temperatureValue';
//       const latest = await this.deviceModel
//         .findOne({
//           deviceId,
//           [valueKey]: { $exists: true, $ne: null, $type: 'number' }
//         })
//         .sort({ date: -1, _id: -1 })
//         .select('-__v');
//       console.log('SERVICE DEBUG: getRealtimeStats latest', latest);
//       if (!latest) {
//         console.log('SERVICE DEBUG: No valid data found for device');
//         return {
//           deviceId: deviceId,
//           metric,
//           value: 0,
//           timestamp: new Date().toISOString(),
//         };
//       }
//       return {
//         deviceId: latest.deviceId,
//         metric,
//         value: latest[valueKey],
//         timestamp: latest.date ? latest.date.toISOString() : new Date().toISOString(),
//       };
//     } catch (err) {
//       console.error('SERVICE ERROR: getRealtimeStats', err);
//       throw err;
//     }
//   }

//   async getHistoricalStats(
//     deviceId: string,
//     metric: 'temperature' | 'humidity',
//     startDate: string,
//     endDate: string,
//   ) {
//     const metricField = metric === 'temperature' ? 'temperatureValue' : 'humidityValue';

//     const query = {
//       deviceId,
//       date: { $gte: new Date(startDate), $lte: new Date(endDate) },
//       [metricField]: { $exists: true, $ne: null, $type: 'number' },
//     };

//     console.log('DEBUG: getHistoricalStats query:', JSON.stringify(query));

//     try {
//       const data = await this.deviceModel
//         .find(query)
//         .sort({ date: 1 })
//         .select(`deviceId ${metricField} date`);

//       console.log('DEBUG: getHistoricalStats valid data count:', data.length);

//       return data.map(item => ({
//         deviceId: item.deviceId,
//         metric,
//         value: item[metricField],
//         timestamp: item.date?.toISOString() || new Date().toISOString(),
//       }));
//     } catch (err) {
//       console.error('SERVICE ERROR: getHistoricalStats', err);
//       throw err;
//     }
//   }

//   async getStats(deviceId: string, metric: 'temperature' | 'humidity', timeRange: string) {
//     const now = new Date();
//     const startDate = new Date(
//       now.getTime() - (timeRange === 'lastHour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
//     );
//     const query = {
//       deviceId,
//       date: { $gte: startDate, $lte: now },
//       $or: [
//         { temperatureValue: { $exists: true, $ne: null, $type: 'number' } },
//         { humidityValue: { $exists: true, $ne: null, $type: 'number' } },
//       ],
//     };
//     console.log('DEBUG: getStats query:', JSON.stringify(query));
//     try {
//       const data = await this.deviceModel
//         .find(query)
//         .select('temperatureValue humidityValue');
//       console.log('DEBUG: getStats results:', data.length);
//       const values = data
//         .map(item => (metric === 'temperature' ? item.temperatureValue : item.humidityValue))
//         .filter(v => typeof v === 'number' && !isNaN(v));
//       return {
//         min: values.length > 0 ? Math.min(...values) : 0,
//         max: values.length > 0 ? Math.max(...values) : 0,
//         avg: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
//       };
//     } catch (err) {
//       console.error('SERVICE ERROR: getStats', err);
//       throw err;
//     }
//   }

//   async getAvailableMetrics(deviceId: string) {
//     return ['temperature', 'humidity'];
//   }

//   async getDeviceIdsForUser(email: string): Promise<string[]> {
//     const userDevices = await this.deviceUserModel.find({ email }).lean();
//     return userDevices.map((d) => d.deviceId);
//   }

//   async getDeviceUserByDeviceIdAndEmail(deviceId: string, email: string) {
//     return this.deviceUserModel.findOne({ deviceId, email }).lean();
//   }

//   async getReadingsForDevices(deviceIds: string[], queryDto: AnalyticsQueryDto) {
//     const query: any = {
//       deviceId: { $in: deviceIds },
//       $or: [
//         { temperatureValue: { $exists: true, $ne: null, $type: 'number' } },
//         { humidityValue: { $exists: true, $ne: null, $type: 'number' } },
//       ],
//     };
//     if (queryDto.startDate || queryDto.endDate) {
//       query.date = {};
//       if (queryDto.startDate) {
//         query.date.$gte = new Date(queryDto.startDate);
//       }
//       if (queryDto.endDate) {
//         query.date.$lte = new Date(queryDto.endDate);
//       }
//     }
//     return this.deviceModel.find(query).lean();
//   }

//   async getAnomalies(deviceId: string, metric: 'temperature' | 'humidity', startDate: string, endDate: string) {
//     const query = {
//       deviceId,
//       date: { $gte: new Date(startDate), $lte: new Date(endDate) },
//       [metric === 'temperature' ? 'temperatureValue' : 'humidityValue']: { $exists: true, $ne: null, $type: 'number' },
//     };
//     console.log('DEBUG: getAnomalies query:', JSON.stringify(query));
//     const data = await this.deviceModel.find(query).select('date temperatureValue humidityValue').lean();
//     console.log('DEBUG: getAnomalies results:', data.length);
//     const values = data.map(item => metric === 'temperature' ? item.temperatureValue : item.humidityValue)
//       .filter(v => typeof v === 'number' && !isNaN(v));
//     if (values.length === 0) return [];
//     const mean = values.reduce((a, b) => a + b, 0) / values.length;
//     const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
//     const anomalies = data.filter((item, idx) => Math.abs(values[idx] - mean) > 2 * std).map(item => ({
//       timestamp: item.date,
//       value: metric === 'temperature' ? item.temperatureValue : item.humidityValue,
//     }));
//     return { anomalies, mean, std };
//   }

//   async compareDevicesOrPeriods(deviceA: string, deviceB: string, metric: 'temperature' | 'humidity', startDateA: string, endDateA: string, startDateB: string, endDateB: string) {
//     const getStats = async (deviceId: string, start: string, end: string) => {
//       const data = await this.deviceModel.find({
//         deviceId,
//         date: { $gte: new Date(start), $lte: new Date(end) },
//         [metric === 'temperature' ? 'temperatureValue' : 'humidityValue']: { $exists: true, $ne: null, $type: 'number' },
//       }).select('temperatureValue humidityValue');
//       const values = data.map(item => metric === 'temperature' ? item.temperatureValue : item.humidityValue)
//         .filter(v => typeof v === 'number' && !isNaN(v));
//       return {
//         min: values.length > 0 ? Math.min(...values) : 0,
//         max: values.length > 0 ? Math.max(...values) : 0,
//         avg: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
//       };
//     };
//     const statsA = await getStats(deviceA, startDateA, endDateA);
//     const statsB = await getStats(deviceB, startDateB, endDateB);
//     return { deviceA: statsA, deviceB: statsB };
//   }

//   async getCorrelation(deviceId: string, startDate: string, endDate: string) {
//     const data = await this.deviceModel.find({
//       deviceId,
//       date: { $gte: new Date(startDate), $lte: new Date(endDate) },
//       $or: [
//         { temperatureValue: { $exists: true, $ne: null, $type: 'number' } },
//         { humidityValue: { $exists: true, $ne: null, $type: 'number' } },
//       ],
//     }).select('temperatureValue humidityValue');
//     const tempsFiltered = data.map(item => item.temperatureValue)
//       .filter(v => typeof v === 'number' && !isNaN(v));
//     const humsFiltered = data.map(item => item.humidityValue)
//       .filter(v => typeof v === 'number' && !isNaN(v));
//     if (tempsFiltered.length === 0 || humsFiltered.length === 0) return { correlation: null, points: [] };
//     const meanT = tempsFiltered.reduce((a, b) => a + b, 0) / tempsFiltered.length;
//     const meanH = humsFiltered.reduce((a, b) => a + b, 0) / humsFiltered.length;
//     const numerator = tempsFiltered.reduce((sum, t, i) => sum + (t - meanT) * (humsFiltered[i] - meanH), 0);
//     const denominator = Math.sqrt(tempsFiltered.reduce((sum, t) => sum + Math.pow(t - meanT, 2), 0) * humsFiltered.reduce((sum, h) => sum + Math.pow(h - meanH, 2), 0));
//     const corr = denominator === 0 ? null : numerator / denominator;
//     const points = data
//       .filter(item => typeof item.temperatureValue === 'number' && !isNaN(item.temperatureValue) && typeof item.humidityValue === 'number' && !isNaN(item.humidityValue))
//       .map(item => ({ x: item.temperatureValue, y: item.humidityValue }));
//     return { correlation: corr, points };
//   }

//   async getPrediction(deviceId: string, metric: 'temperature' | 'humidity', futureWindow: number) {
//     const now = new Date();
//     const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
//     const actualData = await this.deviceModel.find({
//       deviceId,
//       date: { $gte: past, $lte: now },
//       [metric === 'temperature' ? 'temperatureValue' : 'humidityValue']: { $exists: true, $ne: null, $type: 'number' },
//     }).sort({ date: 1 }).select('date temperatureValue humidityValue');

//     const actualPoints = actualData.map(item => ({
//       timestamp: item.date.toISOString(),
//       actualValue: metric === 'temperature' ? item.temperatureValue : item.humidityValue,
//       predictedValue: null,
//     }));

//     let lastValue = actualPoints.length > 0 ? actualPoints[actualPoints.length - 1].actualValue : 0;
//     let slope = 0;
//     if (actualPoints.length > 1) {
//       const first = actualPoints[0].actualValue;
//       const last = actualPoints[actualPoints.length - 1].actualValue;
//       slope = (last - first) / (actualPoints.length - 1);
//     }
//     const intervalMs = 60 * 60 * 1000;
//     const predictionPoints = [];
//     for (let i = 1; i <= futureWindow; i++) {
//       const futureDate = new Date(now.getTime() + i * intervalMs);
//       const predictedValue = lastValue + slope * i;
//       predictionPoints.push({
//         timestamp: futureDate.toISOString(),
//         actualValue: null,
//         predictedValue,
//       });
//     }

//     return {
//       deviceId,
//       metric,
//       points: [...actualPoints, ...predictionPoints],
//     };
//   }

//   async getForecast(deviceId: string, metric: 'temperature' | 'humidity', futureWindow: number) {
//     const now = new Date();
//     const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
//     const actualData = await this.deviceModel.find({
//       deviceId,
//       date: { $gte: past, $lte: now },
//       [metric === 'temperature' ? 'temperatureValue' : 'humidityValue']: { $exists: true, $ne: null, $type: 'number' },
//     }).sort({ date: 1 }).select('date temperatureValue humidityValue');

//     const values = actualData.map(item => metric === 'temperature' ? item.temperatureValue : item.humidityValue)
//       .filter(v => typeof v === 'number' && !isNaN(v));
//     if (values.length === 0) values.push(0);

//     const windowSize = 6;
//     let maValues = [...values];
//     const alpha = 0.5;
//     let esValues = [values[0]];
//     for (let i = 1; i < values.length; i++) {
//       esValues.push(alpha * values[i] + (1 - alpha) * esValues[i - 1]);
//     }

//     const n = values.length;
//     let lrA = 0, lrB = 0;
//     if (n > 1) {
//       const x = Array.from({ length: n }, (_, i) => i);
//       const sumX = x.reduce((a, b) => a + b, 0);
//       const sumY = values.reduce((a, b) => a + b, 0);
//       const sumXY = x.reduce((a, b, i) => a + b * values[i], 0);
//       const sumX2 = x.reduce((a, b) => a + b * b, 0);
//       lrB = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
//       lrA = (sumY - lrB * sumX) / n;
//     } else {
//       lrA = values[0];
//       lrB = 0;
//     }

//     const forecastPoints = [];
//     let lastMA = maValues.slice(-windowSize);
//     let lastES = esValues[esValues.length - 1];
//     for (let i = 1; i <= futureWindow; i++) {
//       const ma = lastMA.reduce((sum, v) => sum + v, 0) / lastMA.length;
//       lastMA.push(ma);
//       if (lastMA.length > windowSize) lastMA.shift();
//       lastES = alpha * ma + (1 - alpha) * lastES;
//       const lr = lrA + lrB * (n + i - 1);
//       const hybrid = (ma + lastES + lr) / 3;
//       const futureDate = new Date(now.getTime() + i * 60 * 60 * 1000);
//       forecastPoints.push({
//         timestamp: futureDate.toISOString(),
//         forecastValue: hybrid,
//       });
//       maValues.push(ma);
//       esValues.push(lastES);
//     }
//     return {
//       deviceId,
//       metric,
//       forecast: forecastPoints,
//     };
//   }

//   async getUserDeviceList(email: string): Promise<{ deviceId: string; deviceName: string }[]> {
//     try {
//       const userDevices = await this.deviceUserModel
//         .find({ email })
//         .select('deviceId deviceName')
//         .exec();
//       return userDevices
//         .filter(device => device.deviceId && device.deviceName)
//         .map(device => ({
//           deviceId: device.deviceId,
//           deviceName: device.deviceName,
//         }));
//     } catch (error) {
//       console.error('Failed to fetch user device list:', error);
//       throw new InternalServerErrorException('Failed to fetch user device list');
//     }
//   }
// }

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeviceData, DeviceDataDocument } from './schemas/analytics.schema';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { ExcelService } from './excel.service';
import { S3Service } from './s3.service';
import { KafkaContext } from '@nestjs/microservices';
import { DeviceUser, DeviceUserDocument } from './schemas/device-user.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(DeviceData.name)
    private deviceModel: Model<DeviceDataDocument>,
    @InjectModel(DeviceUser.name)
    private deviceUserModel: Model<DeviceUserDocument>,
    private excelService: ExcelService,
    private s3Service: S3Service,
  ) {}

  async processIoTData(data: any, context: KafkaContext) {
    const topic = context.getTopic();
    console.log(`Received message from topic ${topic}:`, data);

    // Support both flat and readings object
    let readings: Record<string, number> = {};
    if (typeof data.readings === 'object' && data.readings !== null) {
      readings = { ...data.readings };
    } else {
      const reserved = ['deviceId', 'isActive', 'date', 'topic', 'userId', 'timestamp'];
      for (const key of Object.keys(data)) {
        if (!reserved.includes(key) && typeof data[key] === 'number' && !isNaN(data[key])) {
          readings[key] = data[key];
        }
      }
    }
    // Skip documents with no readings
    if (!readings || Object.keys(readings).length === 0) {
      console.warn('Skipping document: no valid sensor readings found.', data);
      return { status: 'skipped', reason: 'No valid sensor readings', data };
    }

    const deviceData = new this.deviceModel({
      deviceId: data.deviceId,
      readings,
      isActive: data.isActive ?? true,
      date: data.date ? new Date(data.date) : new Date(),
      topic: topic,
    });

    await deviceData.save();
    return { status: 'processed', data: deviceData };
  }

  async getDeviceNamesForUser(email: string): Promise<string[]> {
    try {
      console.log('Fetching device names for user email:', email);
      const userDevices = await this.deviceUserModel
        .find({ email })
        .select('deviceName')
        .exec();

      const deviceNames = userDevices
        .filter(device => device.deviceName && typeof device.deviceName === 'string')
        .map(device => device.deviceName)
        .sort((a, b) => a.localeCompare(b));
      console.log('Found device names for user:', deviceNames);

      if (deviceNames.length === 0) {
        console.warn(`No valid device names found for email: ${email}`);
      }
      return deviceNames;
    } catch (error) {
      console.error('Failed to fetch user device names:', error);
      throw new InternalServerErrorException('Failed to fetch user device names');
    }
  }

  async generateAndUploadReport(
    queryDto: AnalyticsQueryDto,
    email?: string,
  ): Promise<{ downloadUrl: string; expiresIn: number; recordCount: number }> {
    let data;
    let deviceId = queryDto.deviceId;
    let deviceName = 'Device Report';
    let fieldsToInclude: string[] = queryDto.fields || ['date', 'deviceId'];

    if (email) {
      const userDeviceIds = await this.getDeviceIdsForUser(email);
      if (!userDeviceIds.length) {
        throw new NotFoundException('No devices found for the user');
      }
      if (deviceId && !userDeviceIds.includes(deviceId)) {
        throw new NotFoundException(`Device ID ${deviceId} not associated with user`);
      }

      if (deviceId) {
        const deviceUser = await this.deviceUserModel
          .findOne({ deviceId, email })
          .select('deviceName deviceTypes')
          .lean();
        if (!deviceUser) {
          throw new NotFoundException(`Device ID ${deviceId} not found for user`);
        }
        deviceName = (deviceUser.deviceName?.trim() || `Device ${deviceId}`).substring(0, 31);

        if (!queryDto.fields?.length && Array.isArray(deviceUser.deviceTypes)) {
          try {
            fieldsToInclude = [
              ...deviceUser.deviceTypes.map((t: any) => t.type.toLowerCase()),
              'date',
              'deviceId',
            ];
          } catch (error) {
            console.warn(`Invalid deviceTypes for deviceId: ${deviceId}, falling back to defaults`);
            fieldsToInclude = ['date', 'deviceId'];
          }
        }
      } else {
        const userDevices = await this.deviceUserModel
          .find({ email })
          .select('deviceName')
          .lean();
        deviceName = userDevices.length === 1 && userDevices[0].deviceName?.trim()
          ? userDevices[0].deviceName.trim().substring(0, 31)
          : 'Multiple Devices';
      }

      data = await this.getFilteredDataForUser(queryDto, userDeviceIds);
    } else {
      data = await this.getFilteredData(queryDto);
    }

    if (data.length === 0) {
      throw new NotFoundException('No data found for the given criteria');
    }

    if (data[0].date) {
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const deviceInfo = deviceId ? `-${deviceId.replace(/[\\/*[\]?:]/g, '-')}` : '';
    const dateInfo = queryDto.date ? `-${queryDto.date.replace(/[\\/*[\]?:]/g, '-')}` : '';
    const filename = `device-report${deviceInfo}${dateInfo}-${timestamp}.xlsx`.substring(0, 255);
    const s3Key = `analytics/${filename}`;

    console.log(`Generating report for deviceName: ${deviceName}, deviceId: ${deviceId}, email: ${email}`);

    const excelBuffer = await this.excelService.generateExcel(
      data.map(item => ({
        ...item,
        readings: Object.fromEntries(
          Object.entries(item.readings || {}).map(([k, v]) => [k.toLowerCase(), v])
        )
      })),
      deviceName,
      fieldsToInclude
    );

    try {
      await this.s3Service.uploadFile(
        excelBuffer,
        s3Key,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    } catch (error) {
      console.error('Failed to upload to S3:', error);
      throw new InternalServerErrorException('Failed to upload report to storage');
    }

    const expiresIn = 1800;
    const downloadUrl = this.s3Service.getSignedUrl(s3Key, expiresIn);
    return {
      downloadUrl,
      expiresIn,
      recordCount: data.length,
    };
  }

  async getReadingsByDeviceAndDate(queryDto: AnalyticsQueryDto, email?: string): Promise<any[]> {
    let data;

    if (email) {
      const userDeviceIds = await this.getDeviceIdsForUser(email);
      data = await this.getFilteredDataForUser(queryDto, userDeviceIds);
    } else {
      data = await this.getFilteredData(queryDto);
    }

    return data;
  }

  private async getFilteredDataForUser(queryDto: AnalyticsQueryDto, userDeviceIds: string[]): Promise<any[]> {
    if (!userDeviceIds.length) {
      console.warn('No valid device IDs provided for the user');
      throw new NotFoundException('No valid device IDs provided for the user');
    }
    const query: any = {
      deviceId: { $in: userDeviceIds },
      'readings': { $exists: true, $ne: {} },
    };
    if (queryDto.deviceId) {
      if (!userDeviceIds.includes(queryDto.deviceId)) {
        throw new NotFoundException(`Device ID ${queryDto.deviceId} not associated with user`);
      }
      query.deviceId = queryDto.deviceId;
    }
    if (queryDto.readings) {
      for (const [key, value] of Object.entries(queryDto.readings)) {
        query[`readings.${key}`] = value;
      }
    }
    if (queryDto.date || queryDto.startDate || queryDto.endDate) {
      query.date = query.date || {};
      if (queryDto.date) {
        const targetDate = new Date(queryDto.date);
        if (isNaN(targetDate.getTime())) {
          throw new BadRequestException('Invalid date format provided');
        }
        const startDate = new Date(targetDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);
        query.date.$gte = startDate;
        query.date.$lte = endDate;
      } else {
        if (queryDto.startDate) {
          const startDate = new Date(queryDto.startDate);
          if (isNaN(startDate.getTime())) {
            throw new BadRequestException('Invalid startDate format provided');
          }
          startDate.setHours(0, 0, 0, 0);
          query.date.$gte = startDate;
        }
        if (queryDto.endDate) {
          const endDate = new Date(queryDto.endDate);
          if (isNaN(endDate.getTime())) {
            throw new BadRequestException('Invalid endDate format provided');
          }
          endDate.setHours(23, 59, 59, 999);
          query.date.$lte = endDate;
        }
      }
    }
    try {
      const devices = await this.deviceModel.find(query).lean().exec();
      return devices.filter(d => d.readings && Object.keys(d.readings).length > 0).map((device) => {
        const rawDevice = device as Record<string, any>;
        const id = rawDevice._id ? rawDevice._id.toString() : null;
        const { _id, __v, ...cleanDevice } = rawDevice;
        if (cleanDevice.date) {
          cleanDevice.date = new Date(cleanDevice.date).toISOString();
        }
        return { ...cleanDevice, id };
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch device data');
    }
  }

  private async getFilteredData(queryDto: AnalyticsQueryDto): Promise<any[]> {
    const query: any = {
      'readings': { $exists: true, $ne: {} },
    };
    if (queryDto.deviceId) {
      query.deviceId = queryDto.deviceId;
    }
    if (queryDto.readings) {
      for (const [key, value] of Object.entries(queryDto.readings)) {
        query[`readings.${key}`] = value;
      }
    }
    if (queryDto.date || queryDto.startDate || queryDto.endDate) {
      query.date = query.date || {};
      if (queryDto.date) {
        const targetDate = new Date(queryDto.date);
        if (isNaN(targetDate.getTime())) {
          throw new BadRequestException('Invalid date format provided');
        }
        const startDate = new Date(targetDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);
        query.date.$gte = startDate;
        query.date.$lte = endDate;
      } else {
        if (queryDto.startDate) {
          const startDate = new Date(queryDto.startDate);
          if (isNaN(startDate.getTime())) {
            throw new BadRequestException('Invalid startDate format provided');
          }
          startDate.setHours(0, 0, 0, 0);
          query.date.$gte = startDate;
        }
        if (queryDto.endDate) {
          const endDate = new Date(queryDto.endDate);
          if (isNaN(endDate.getTime())) {
            throw new BadRequestException('Invalid endDate format provided');
          }
          endDate.setHours(23, 59, 59, 999);
          query.date.$lte = endDate;
        }
      }
    }
    try {
      const devices = await this.deviceModel.find(query).lean().exec();
      return devices.filter(d => d.readings && Object.keys(d.readings).length > 0).map((device) => {
        const rawDevice = device as Record<string, any>;
        const id = rawDevice._id ? rawDevice._id.toString() : null;
        const { _id, __v, ...cleanDevice } = rawDevice;
        if (cleanDevice.date) {
          cleanDevice.date = new Date(cleanDevice.date).toISOString();
        }
        return { ...cleanDevice, id };
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch device data');
    }
  }

  async deleteReportFile(s3Key: string): Promise<{ success: boolean; message: string }> {
    try {
      s3Key = decodeURIComponent(s3Key).trim();
      await this.s3Service.deleteFile(s3Key);
      return {
        success: true,
        message: `File "${s3Key}" deleted successfully`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          success: false,
          message: error.message,
        };
      }
      console.error('Error deleting file:', error);
      throw new InternalServerErrorException(
        `Failed to delete file from storage: ${error.message}`,
      );
    }
  }

  async saveDownloadHistory(
    userEmail: string,
    filename: string,
    downloadUrl: string,
    recordCount: number,
    s3Key: string,
  ): Promise<any> {
    const historyKey = `analytics/history/${userEmail}.json`;
    const history = await this.s3Service.readJsonFile(historyKey);

    const newEntry = {
      id: Date.now().toString(),
      filename,
      downloadUrl,
      createdAt: new Date().toISOString(),
      recordCount,
      s3Key,
    };

    const updatedHistory = [newEntry, ...history].slice(0, 10);
    await this.s3Service.writeJsonFile(historyKey, updatedHistory);
    return newEntry;
  }

  async getDownloadHistory(userEmail: string): Promise<any[]> {
    const historyKey = `analytics/history/${userEmail}.json`;
    return this.s3Service.readJsonFile(historyKey);
  }

  async deleteDownloadHistory(id: string, userEmail: string): Promise<void> {
    const historyKey = `analytics/history/${userEmail}.json`;
    const history = await this.s3Service.readJsonFile(historyKey);

    const entry = history.find((item: any) => item.id === id);
    if (!entry) {
      throw new NotFoundException('Download history entry not found');
    }

    await this.s3Service.deleteFile(entry.s3Key);
    const updatedHistory = history.filter((item: any) => item.id !== id);
    await this.s3Service.writeJsonFile(historyKey, updatedHistory);
  }


  // Visualization Methods
// Retrieves the latest real-time stats for a device by name and metric (temperature or humidity)
  async getRealtimeStats(deviceId: string, metric: string) {
    console.log('SERVICE DEBUG: getRealtimeStats called', { deviceId, metric });
    try {
      const latest = await this.deviceModel
        .findOne({
          deviceId,
          [`readings.${metric}`]: { $exists: true, $ne: null, $type: 'number' }
        })
        .sort({ date: -1, _id: -1 })
        .select('-__v');
      if (!latest || !latest.readings || latest.readings[metric] === undefined) {
        return {
          deviceId: deviceId,
          metric,
          value: 0,
          timestamp: new Date().toISOString(),
        };
      }
      return {
        deviceId: latest.deviceId,
        metric,
        value: latest.readings[metric],
        timestamp: latest.date ? latest.date.toISOString() : new Date().toISOString(),
      };
    } catch (err) {
      console.error('SERVICE ERROR: getRealtimeStats', err);
      throw err;
    }
  }




  async getHistoricalStats(
    deviceId: string,
    metric: string,
    startDate: string,
    endDate: string,
  ) {
    const query = {
      deviceId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      [`readings.${metric}`]: { $exists: true, $ne: null, $type: 'number' },
    };
    try {
      const data = await this.deviceModel
        .find(query)
        .sort({ date: 1 })
        .select(`deviceId readings date`);
      return data.map(item => ({
        deviceId: item.deviceId,
        metric,
        value: item.readings[metric],
        timestamp: item.date?.toISOString() || new Date().toISOString(),
      }));
    } catch (err) {
      console.error('SERVICE ERROR: getHistoricalStats', err);
      throw err;
    }
  }

  async getStats(deviceId: string, metric: string, timeRange: string) {
    const now = new Date();
    const startDate = new Date(
      now.getTime() - (timeRange === 'lastHour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
    );
    const query = {
      deviceId,
      date: { $gte: startDate, $lte: now },
      [`readings.${metric}`]: { $exists: true, $ne: null, $type: 'number' },
    };
    try {
      const data = await this.deviceModel
        .find(query)
        .select('readings');
      const values = data
        .map(item => item.readings[metric])
        .filter(v => typeof v === 'number' && !isNaN(v));
      return {
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
        avg: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
      };
    } catch (err) {
      console.error('SERVICE ERROR: getStats', err);
      throw err;
    }
  }

  async getAvailableMetrics(deviceId: string) {
    // Find the latest document for the device and return all keys in readings
    const latest = await this.deviceModel
      .findOne({ deviceId, readings: { $exists: true, $ne: {} } })
      .sort({ date: -1, _id: -1 })
      .select('readings');
    if (!latest || !latest.readings) return [];
    return Object.keys(latest.readings);
  }

  async getDeviceIdsForUser(email: string): Promise<string[]> {
    const userDevices = await this.deviceUserModel.find({ email }).lean();
    return userDevices.map((d) => d.deviceId);
  }

  async getDeviceUserByDeviceIdAndEmail(deviceId: string, email: string) {
    return this.deviceUserModel.findOne({ deviceId, email }).lean();
  }

  async getReadingsForDevices(deviceIds: string[], queryDto: AnalyticsQueryDto) {
    const query: any = {
      deviceId: { $in: deviceIds },
      'readings': { $exists: true, $ne: {} },
    };
    if (queryDto.startDate || queryDto.endDate) {
      query.date = {};
      if (queryDto.startDate) {
        query.date.$gte = new Date(queryDto.startDate);
      }
      if (queryDto.endDate) {
        query.date.$lte = new Date(queryDto.endDate);
      }
    }
    return this.deviceModel.find(query).lean();
  }

  async getAnomalies(deviceId: string, metric: 'temperature' | 'humidity', startDate: string, endDate: string) {
    const query = {
      deviceId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      [`readings.${metric}`]: { $exists: true, $ne: null, $type: 'number' },
    };
    console.log('DEBUG: getAnomalies query:', JSON.stringify(query));
    const data = await this.deviceModel.find(query).select('date readings').lean();
    console.log('DEBUG: getAnomalies results:', data.length);
    const values = data.map(item => item.readings[metric])
      .filter(v => typeof v === 'number' && !isNaN(v));
    if (values.length === 0) return [];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
    const anomalies = data.filter((item, idx) => Math.abs(values[idx] - mean) > 2 * std).map(item => ({
      timestamp: item.date,
      value: item.readings[metric],
    }));
    return { anomalies, mean, std };
  }

  async compareDevicesOrPeriods(deviceA: string, deviceB: string, metric: 'temperature' | 'humidity', startDateA: string, endDateA: string, startDateB: string, endDateB: string) {
    const getStats = async (deviceId: string, start: string, end: string) => {
      const data = await this.deviceModel.find({
        deviceId,
        date: { $gte: new Date(start), $lte: new Date(end) },
        [`readings.${metric}`]: { $exists: true, $ne: null, $type: 'number' },
      }).select('readings');
      const values = data.map(item => item.readings[metric])
        .filter(v => typeof v === 'number' && !isNaN(v));
      return {
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
        avg: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
      };
    };
    const statsA = await getStats(deviceA, startDateA, endDateA);
    const statsB = await getStats(deviceB, startDateB, endDateB);
    return { deviceA: statsA, deviceB: statsB };
  }

  async getCorrelation(deviceId: string, startDate: string, endDate: string, xType: string, yType: string) {
    const data = await this.deviceModel.find({
      deviceId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      'readings': { $exists: true, $ne: {} },
    }).select('readings');
    const points: { x: number; y: number }[] = [];
    for (const item of data) {
      const x = item.readings?.[xType];
      const y = item.readings?.[yType];
      if (typeof x === 'number' && !isNaN(x) && typeof y === 'number' && !isNaN(y)) {
        points.push({ x, y });
      }
    }
    if (points.length === 0) return { correlation: null, points: [] };
    const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const numerator = points.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0);
    const denominator = Math.sqrt(points.reduce((sum, p) => sum + Math.pow(p.x - meanX, 2), 0) * points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0));
    const corr = denominator === 0 ? null : numerator / denominator;
    return { correlation: corr, points };
  }

  async getPrediction(deviceId: string, metric: 'temperature' | 'humidity', futureWindow: number) {
    const now = new Date();
    const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const actualData = await this.deviceModel.find({
      deviceId,
      date: { $gte: past, $lte: now },
      [`readings.${metric}`]: { $exists: true, $ne: null, $type: 'number' },
    }).sort({ date: 1 }).select('date readings');

    const actualPoints = actualData.map(item => ({
      timestamp: item.date.toISOString(),
      actualValue: item.readings[metric],
      predictedValue: null,
    }));

    let lastValue = actualPoints.length > 0 ? actualPoints[actualPoints.length - 1].actualValue : 0;
    let slope = 0;
    if (actualPoints.length > 1) {
      const first = actualPoints[0].actualValue;
      const last = actualPoints[actualPoints.length - 1].actualValue;
      slope = (last - first) / (actualPoints.length - 1);
    }
    const intervalMs = 60 * 60 * 1000;
    const predictionPoints = [];
    for (let i = 1; i <= futureWindow; i++) {
      const futureDate = new Date(now.getTime() + i * intervalMs);
      const predictedValue = lastValue + slope * i;
      predictionPoints.push({
        timestamp: futureDate.toISOString(),
        actualValue: null,
        predictedValue,
      });
    }

    return {
      deviceId,
      metric,
      points: [...actualPoints, ...predictionPoints],
    };
  }

  async getForecast(deviceId: string, metric: 'temperature' | 'humidity', futureWindow: number) {
    const now = new Date();
    const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const actualData = await this.deviceModel.find({
      deviceId,
      date: { $gte: past, $lte: now },
      [`readings.${metric}`]: { $exists: true, $ne: null, $type: 'number' },
    }).sort({ date: 1 }).select('date readings');

    const values = actualData.map(item => item.readings[metric])
      .filter(v => typeof v === 'number' && !isNaN(v));
    if (values.length === 0) values.push(0);

    const windowSize = 6;
    let maValues = [...values];
    const alpha = 0.5;
    let esValues = [values[0]];
    for (let i = 1; i < values.length; i++) {
      esValues.push(alpha * values[i] + (1 - alpha) * esValues[i - 1]);
    }

    const n = values.length;
    let lrA = 0, lrB = 0;
    if (n > 1) {
      const x = Array.from({ length: n }, (_, i) => i);
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((a, b, i) => a + b * values[i], 0);
      const sumX2 = x.reduce((a, b) => a + b * b, 0);
      lrB = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
      lrA = (sumY - lrB * sumX) / n;
    } else {
      lrA = values[0];
      lrB = 0;
    }

    const forecastPoints = [];
    let lastMA = maValues.slice(-windowSize);
    let lastES = esValues[esValues.length - 1];
    for (let i = 1; i <= futureWindow; i++) {
      const ma = lastMA.reduce((sum, v) => sum + v, 0) / lastMA.length;
      lastMA.push(ma);
      if (lastMA.length > windowSize) lastMA.shift();
      lastES = alpha * ma + (1 - alpha) * lastES;
      const lr = lrA + lrB * (n + i - 1);
      const hybrid = (ma + lastES + lr) / 3;
      const futureDate = new Date(now.getTime() + i * 60 * 60 * 1000);
      forecastPoints.push({
        timestamp: futureDate.toISOString(),
        forecastValue: hybrid,
      });
      maValues.push(ma);
      esValues.push(lastES);
    }
    return {
      deviceId,
      metric,
      forecast: forecastPoints,
    };
  }

  async getUserDeviceList(email: string): Promise<{ deviceId: string; deviceName: string }[]> {
    try {
      const userDevices = await this.deviceUserModel
        .find({ email })
        .select('deviceId deviceName')
        .exec();
      return userDevices
        .filter(device => device.deviceId && device.deviceName)
        .map(device => ({
          deviceId: device.deviceId,
          deviceName: device.deviceName,
        }));
    } catch (error) {
      console.error('Failed to fetch user device list:', error);
      throw new InternalServerErrorException('Failed to fetch user device list');
    }
  }
}