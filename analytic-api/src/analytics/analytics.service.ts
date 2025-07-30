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
        timestamp: latest.date ? new Date(latest.date).toISOString() : new Date().toISOString(),
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

  async getAnomalies(deviceId: string, metric: string, startDate: string, endDate: string, sensitivity: number = 3) {
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
    
    if (values.length === 0) return { anomalies: [], mean: 0, std: 0 };
    
    // Calculate basic statistics
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
    
    // Improved anomaly detection with multiple criteria:
    // 1. Statistical outlier detection with configurable sensitivity (default: 3 std devs)
    // 2. Local window analysis for sudden spikes/drops
    // 3. Range validation based on metric type (temperature: -50 to 100°C, humidity: 0-100%)
    // 4. Detection of sensor malfunctions (repeated identical values)
    const anomalies = [];
    
    for (let i = 0; i < data.length; i++) {
      const value = values[i];
      const item = data[i];
      
      // Skip if value is not a valid number
      if (typeof value !== 'number' || isNaN(value)) continue;
      
      let isAnomaly = false;
      
      // Criterion 1: Statistical outlier (configurable sensitivity)
      const zScore = Math.abs(value - mean) / std;
      if (zScore > sensitivity) {
        isAnomaly = true;
      }
      
      // Criterion 2: Check for sudden spikes or drops (if we have enough data)
      if (values.length > 10) {
        const windowSize = Math.min(5, Math.floor(values.length / 4));
        const startIdx = Math.max(0, i - windowSize);
        const endIdx = Math.min(values.length, i + windowSize + 1);
        
        const windowValues = values.slice(startIdx, endIdx);
        const windowMean = windowValues.reduce((a, b) => a + b, 0) / windowValues.length;
        const windowStd = Math.sqrt(windowValues.reduce((a, b) => a + Math.pow(b - windowMean, 2), 0) / windowValues.length);
        
        // If the value is significantly different from its local window
        if (windowStd > 0 && Math.abs(value - windowMean) > 2.5 * windowStd) {
          isAnomaly = true;
        }
      }
      
      // Criterion 3: Check for values outside reasonable ranges based on metric type
      if (metric.toLowerCase() === 'temperature') {
        // Temperature should typically be between -50 and 100 degrees Celsius
        if (value < -50 || value > 100) {
          isAnomaly = true;
        }
      } else if (metric.toLowerCase() === 'humidity') {
        // Humidity should be between 0 and 100 percent
        if (value < 0 || value > 100) {
          isAnomaly = true;
        }
      }
      
      // Criterion 4: Check for repeated identical values (potential sensor malfunction)
      if (i > 0 && i < values.length - 1) {
        const prevValue = values[i - 1];
        const nextValue = values[i + 1];
        if (value === prevValue && value === nextValue && Math.abs(value - mean) < std) {
          // If we have 3 consecutive identical values and they're close to the mean, 
          // it's likely not an anomaly but normal stable readings
          isAnomaly = false;
        }
      }
      
      if (isAnomaly) {
        anomalies.push({
          timestamp: item.date,
          value: value,
        });
      }
    }
    
    console.log('DEBUG: Anomaly detection stats:', {
      totalValues: values.length,
      mean: mean.toFixed(2),
      std: std.toFixed(2),
      anomaliesFound: anomalies.length,
      anomalyPercentage: (anomalies.length / values.length * 100).toFixed(2) + '%',
      sampleValues: values.slice(0, 5).map(v => v.toFixed(2)),
      sampleAnomalies: anomalies.slice(0, 3).map(a => ({ timestamp: a.timestamp, value: a.value.toFixed(2) }))
    });
    
    // Prepare all data points for frontend visualization
    const allData = data.map(item => ({
      timestamp: item.date,
      value: item.readings[metric],
    }));
    
    return { anomalies, mean, std, allData };
  }

  async compareDevicesOrPeriods(deviceA: string, deviceB: string, metric: string, startDateA: string, endDateA: string, startDateB: string, endDateB: string) {
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
    console.log('DEBUG: getCorrelation called with:', { deviceId, startDate, endDate, xType, yType });
    
    // Convert dates to Sri Lankan time for debugging
    const startDateColombo = new Date(new Date(startDate).getTime() + (5.5 * 60 * 60 * 1000));
    const endDateColombo = new Date(new Date(endDate).getTime() + (5.5 * 60 * 60 * 1000));
    console.log('DEBUG: getCorrelation time range (Sri Lankan):', {
      startDateColombo: startDateColombo.toISOString(),
      endDateColombo: endDateColombo.toISOString(),
      startDateLocal: startDateColombo.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }),
      endDateLocal: endDateColombo.toLocaleString('en-US', { timeZone: 'Asia/Colombo' })
    });
    
    const data = await this.deviceModel.find({
      deviceId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      'readings': { $exists: true, $ne: {} },
    }).select('readings date');
    
    console.log('DEBUG: getCorrelation found data points:', data.length);
    console.log('DEBUG: getCorrelation sample data:', data.slice(0, 2).map(item => ({
      date: item.date,
      dateColombo: new Date(item.date.getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-US', { timeZone: 'Asia/Colombo' }),
      readings: item.readings
    })));
    
    const points: { x: number; y: number }[] = [];
    for (const item of data) {
      const x = item.readings?.[xType];
      const y = item.readings?.[yType];
      console.log('DEBUG: Processing item:', { 
        x, 
        y, 
        xType, 
        yType, 
        date: item.date,
        dateColombo: new Date(item.date.getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-US', { timeZone: 'Asia/Colombo' }),
        readings: item.readings 
      });
      if (typeof x === 'number' && !isNaN(x) && typeof y === 'number' && !isNaN(y)) {
        points.push({ x, y });
      }
    }
    
    console.log('DEBUG: getCorrelation valid points found:', points.length);
    console.log('DEBUG: getCorrelation sample points:', points.slice(0, 3));
    
    if (points.length === 0) {
      console.log('DEBUG: getCorrelation returning empty result');
      return { correlation: null, points: [] };
    }
    
    const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const numerator = points.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0);
    const denominator = Math.sqrt(points.reduce((sum, p) => sum + Math.pow(p.x - meanX, 2), 0) * points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0));
    const corr = denominator === 0 ? null : numerator / denominator;
    
    console.log('DEBUG: getCorrelation calculated correlation:', corr);
    
    return { correlation: corr, points };
  }

  async getPrediction(deviceId: string, metric: string, futureWindow: number) {
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
      actual: actualPoints,
      predicted: predictionPoints,
    };
  }

  async getForecast(deviceId: string, metric: string, futureWindow: number) {
    const now = new Date();
    const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const actualData = await this.deviceModel.find({
      deviceId,
      date: { $gte: past, $lte: now },
      [`readings.${metric}`]: { $exists: true, $ne: null, $type: 'number' },
    }).sort({ date: 1 }).select('date readings');

    if (actualData.length === 0) {
      return {
        deviceId,
        metric,
        forecast: [],
        rmse: null,
        r2: null,
        modelQuality: 'No data available',
      };
    }

    const values = actualData.map(item => item.readings[metric]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);

    // Simple linear trend calculation
    let trend = 0;
    if (values.length > 1) {
      const firstValue = values[0];
      const lastValue = values[values.length - 1];
      trend = (lastValue - firstValue) / (values.length - 1);
    }

    const intervalMs = 60 * 60 * 1000;
    const forecast = [];
    let currentValue = values[values.length - 1];

    for (let i = 1; i <= futureWindow; i++) {
      const futureDate = new Date(now.getTime() + i * intervalMs);
      const forecastValue = currentValue + trend * i;
      const confidenceInterval = std * 1.96; // 95% confidence interval

      forecast.push({
        timestamp: futureDate.toISOString(),
        forecastValue: Math.round(forecastValue * 100) / 100,
        lower: Math.round((forecastValue - confidenceInterval) * 100) / 100,
        upper: Math.round((forecastValue + confidenceInterval) * 100) / 100,
      });
    }

    // Calculate model quality metrics
    const predictions = values.slice(1).map((_, i) => values[i] + trend);
    const actuals = values.slice(1);
    const mse = actuals.reduce((sum, actual, i) => sum + Math.pow(actual - predictions[i], 2), 0) / actuals.length;
    const rmse = Math.sqrt(mse);
    const r2 = 1 - (mse / (std * std));

    return {
      deviceId,
      metric,
      forecast,
      rmse: Math.round(rmse * 100) / 100,
      r2: Math.round(r2 * 100) / 100,
      modelQuality: r2 > 0.7 ? 'Good' : r2 > 0.5 ? 'Fair' : 'Poor',
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