import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
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
    private deviceUserModel: Model<DeviceUserDocument>, // Inject DeviceUser model
    private excelService: ExcelService,
    private s3Service: S3Service,
  ) {}

  //kafka code
  async processIoTData(data: any, context: KafkaContext) {
    // Get the Kafka topic name from the context
    const topic = context.getTopic();
    console.log(`Received message from topic ${topic}:`, data);

    // Create a new DeviceData document with fields from the Kafka message
    const deviceData = new this.deviceModel({
      name: data.name,
      deviceId: data.deviceId, // new field
      temperatureValue: data.temperatureValue,
      humidityValue: data.humidityValue,
      // location: data.location, // removed
      isActive: data.isActive ?? true,
      date: data.date ? new Date(data.date) : new Date(),
      topic: topic,
    });

    //Save in MongoDB
    await deviceData.save();
    return { status: 'processed', data: deviceData };
  }

  //Retrieves all data records for a specific device by name, sorted by creation date (newest first)
  async getDeviceData(name: string) {
    return this.deviceModel.find({ name }).sort({ createdAt: -1 }).exec();
  }

  //Retrieves the most recent data record for a specific device by name
  async getLatestDeviceData(name: string) {
    return this.deviceModel.findOne({ name }).sort({ createdAt: -1 }).exec();
  }

  //Retrieves a sorted list of unique device names from the database
  async getDeviceNames(): Promise<string[]> {
    try {
      const deviceNames = await this.deviceModel.distinct('name').exec();
      return deviceNames
        .filter((name): name is string => name != null)
        .sort((a, b) => a.localeCompare(b));
    } catch (error) {
      console.error('Failed to fetch device names:', error);
      throw new InternalServerErrorException('Failed to fetch device names');
    }
  }

  //Generates an Excel report from filtered data and uploads it to S3
  async generateAndUploadReport(
    queryDto: AnalyticsQueryDto,
  ): Promise<{ downloadUrl: string; expiresIn: number; recordCount: number }> {
    // Fetch filtered data based on query parameters
    const data = await this.getFilteredData(queryDto);
    if (data.length === 0) {
      throw new NotFoundException('No data found for the given criteria');
    }
    if (data[0].date) {
      data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    }
    let fieldsToInclude = queryDto.fields;
    if (!fieldsToInclude || fieldsToInclude.length === 0) {
      fieldsToInclude = ['name', 'value', 'date', 'location', 'status'];
    }
    // Generate an Excel file from the data
    const excelBuffer = await this.excelService.generateExcel(
      data,
      fieldsToInclude,
    );
    // Create a unique filename with timestamp and device info
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const deviceInfo = queryDto.name
      ? `-${queryDto.name.replace(/\s+/g, '-')}`
      : '';
    const dateInfo = queryDto.date ? `-${queryDto.date}` : '';
    const filename = `device-report${deviceInfo}${dateInfo}-${timestamp}.xlsx`;
    const s3Key = `analytics/${filename}`;
    try {
      // Upload the Excel file to AWS S3
      await this.s3Service.uploadFile(
        excelBuffer,
        s3Key,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    } catch (error) {
      console.error('Failed to upload to S3:', error);
      throw new InternalServerErrorException(
        'Failed to upload report to storage',
      );
    }

    // Set the expiration time for the signed URL (30 minutes)
    const expiresIn = 1800;
    // Generate a pre-signed URL for downloading the file
    const downloadUrl = this.s3Service.getSignedUrl(s3Key, expiresIn);
    return {
      downloadUrl,
      expiresIn,
      recordCount: data.length,
    };
  }
  //Retrieves filtered device data based on query parameters
  async getReadingsByDeviceAndDate(
    queryDto: AnalyticsQueryDto,
  ): Promise<any[]> {
    const data = await this.getFilteredData(queryDto);
    if (data.length === 0) {
      throw new NotFoundException('No readings found for the given criteria');
    }
    return data;
  }

  //Builds and executes a MongoDB query to filter device data
  private async getFilteredData(queryDto: AnalyticsQueryDto): Promise<any[]> {
    const query: any = {};
    if (queryDto.name) {
      query.name = queryDto.name;
    }
    if (queryDto.temperatureValue) {
      query.tempValue = queryDto.temperatureValue;
    }
    if (queryDto.humidityValue) {
      query.humidityValue = queryDto.humidityValue;
    }
    // if (queryDto.location) {
    //   query.location = queryDto.location;
    // }
    // Add single-day date filter if provided
    if (queryDto.date) {
      const startDate = new Date(queryDto.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(queryDto.date);
      endDate.setHours(23, 59, 59, 999);
      if (this.hasDateField('date')) {
        query.date = {
          $gte: startDate,
          $lte: endDate,
        };
      } else if (this.hasDateField('createdAt')) {
        query.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }
    }
    // Add date range filter if startDate or endDate is provided
    else if (queryDto.startDate || queryDto.endDate) {
      const dateField = this.hasDateField('date') ? 'date' : 'createdAt';
      query[dateField] = {};

      if (queryDto.startDate) {
        const startDate = new Date(queryDto.startDate);
        startDate.setHours(0, 0, 0, 0);
        query[dateField].$gte = startDate;
      }
      if (queryDto.endDate) {
        const endDate = new Date(queryDto.endDate);
        endDate.setHours(23, 59, 59, 999);
        query[dateField].$lte = endDate;
      }
    }
    console.log('Final query:', JSON.stringify(query));
    const devices = await this.deviceModel.find(query).lean().exec();
    console.log(`Query returned ${devices.length} results`);
    // Clean and format the results
    return devices.map((device) => {
      const rawDevice = device as Record<string, any>;
      const id = rawDevice._id ? rawDevice._id.toString() : null;
      const { _id, __v, ...cleanDevice } = rawDevice;
      if (cleanDevice.date) {
        cleanDevice.date = new Date(cleanDevice.date);
      }
      return { ...cleanDevice, id };
    });
  }

  
  //Checks if a field is a valid date field in the schema
  private hasDateField(fieldName: string): boolean {
    const schemaFields = ['date', 'createdAt', 'updatedAt'];
    return schemaFields.includes(fieldName);
  }

  // Deletes an Excel report from the S3 bucket
  async deleteReportFile(
    s3Key: string,
  ): Promise<{ success: boolean; message: string }> {
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
  // Visualization Methods
// Retrieves the latest real-time stats for a device by name and metric (temperature or humidity)
async getRealtimeStats(deviceId: string, metric: 'temperature' | 'humidity') {
  console.log('SERVICE DEBUG: getRealtimeStats called', { deviceId, metric });
  try {
    const latest = await this.deviceModel
      .findOne({ deviceId })
      .sort({ date: -1, _id: -1 })
      .select('name deviceId temperatureValue humidityValue date');
    console.log('SERVICE DEBUG: getRealtimeStats latest', latest);
    if (!latest) {
      console.log('SERVICE DEBUG: No data found for device');
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
      value: metric === 'temperature' ? latest.temperatureValue ?? 0 : latest.humidityValue ?? 0,
      timestamp: latest.date ? latest.date.toISOString() : new Date().toISOString(),
    };
  } catch (err) {
    console.error('SERVICE ERROR: getRealtimeStats', err);
    throw err;
  }
}

// Retrieves historical stats for a device within a specified date range
async getHistoricalStats(deviceId: string, metric: 'temperature' | 'humidity', startDate: string, endDate: string) {
  const query = {
    deviceId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  };
  console.log('DEBUG: getHistoricalStats query:', JSON.stringify(query));
  try {
    const data = await this.deviceModel
      .find(query)
      .select('name deviceId temperatureValue humidityValue date');
    console.log('DEBUG: getHistoricalStats results:', data.length);
    if (!data || data.length === 0) {
      console.log('SERVICE DEBUG: No historical data found');
      return [];
    }
    return data.map(item => ({
      name: item.name,
      metric,
      value: metric === 'temperature' ? item.temperatureValue ?? 0 : item.humidityValue ?? 0,
      timestamp: item.date ? item.date.toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error('SERVICE ERROR: getHistoricalStats', err);
    throw err;
  }
}

// Retrieves aggregated stats (min, max, avg) for a device over a time range (lastHour or lastDay)
async getStats(deviceId: string, metric: 'temperature' | 'humidity', timeRange: string) {
  const now = new Date();
  const startDate = new Date(
    now.getTime() - (timeRange === 'lastHour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
  );
  const query = {
    deviceId,
    date: { $gte: startDate, $lte: now },
  };
  console.log('DEBUG: getStats query:', JSON.stringify(query));
  try {
    const data = await this.deviceModel
      .find(query)
      .select('temperatureValue humidityValue');
    console.log('DEBUG: getStats results:', data.length);
    const values = data
      .map(item => (metric === 'temperature' ? item.temperatureValue : item.humidityValue));
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

// Returns the available metrics for a device 
async getAvailableMetrics(deviceId: string) {
  // Optionally, you could check if the device exists by deviceId
  return ['temperature', 'humidity'];
}

  // Helper: Get all deviceIds for a user by email
  async getDeviceIdsForUser(email: string): Promise<string[]> {
    const userDevices = await this.deviceUserModel.find({ email }).lean();
    return userDevices.map((d) => d.deviceId);
  }

  // Fetch readings for multiple deviceIds with filtering
  async getReadingsForDevices(deviceIds: string[], queryDto: AnalyticsQueryDto) {
    const query: any = { deviceId: { $in: deviceIds } };
    if (queryDto.startDate || queryDto.endDate) {
      query.date = {};
      if (queryDto.startDate) {
        query.date.$gte = new Date(queryDto.startDate);
      }
      if (queryDto.endDate) {
        query.date.$lte = new Date(queryDto.endDate);
      }
    }
    // Add more filters as needed from queryDto
    return this.deviceModel.find(query).lean();
  }

// --- Advanced Analytics Methods ---
// Anomaly Detection (simple z-score or threshold based)
async getAnomalies(deviceId: string, metric: 'temperature' | 'humidity', startDate: string, endDate: string) {
  const query = {
    deviceId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  };
  console.log('DEBUG: getAnomalies query:', JSON.stringify(query));
  const data = await this.deviceModel.find(query).select('date temperatureValue humidityValue').lean();
  console.log('DEBUG: getAnomalies results:', data.length);
  const values = data.map(item => metric === 'temperature' ? item.temperatureValue : item.humidityValue);
  if (values.length === 0) return [];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
  // Mark as anomaly if value is >2 std from mean
  const anomalies = data.filter((item, idx) => Math.abs(values[idx] - mean) > 2 * std).map(item => ({
    timestamp: item.date,
    value: metric === 'temperature' ? item.temperatureValue : item.humidityValue,
  }));
  return { anomalies, mean, std };
}
// Device/Period Comparison (returns stats for each)
async compareDevicesOrPeriods(deviceA: string, deviceB: string, metric: 'temperature' | 'humidity', startDateA: string, endDateA: string, startDateB: string, endDateB: string) {
  const getStats = async (deviceId: string, start: string, end: string) => {
    const data = await this.deviceModel.find({
      deviceId,
      date: { $gte: new Date(start), $lte: new Date(end) },
    }).select('temperatureValue humidityValue');
    const values = data.map(item => metric === 'temperature' ? item.temperatureValue : item.humidityValue);
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
// Correlation (Pearson correlation between temp and humidity)
async getCorrelation(deviceId: string, startDate: string, endDate: string) {
  const data = await this.deviceModel.find({
    deviceId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).select('temperatureValue humidityValue');
  const temps = data.map(item => item.temperatureValue);
  const hums = data.map(item => item.humidityValue);
  if (temps.length === 0 || hums.length === 0) return { correlation: null, points: [] };
  const meanT = temps.reduce((a, b) => a + b, 0) / temps.length;
  const meanH = hums.reduce((a, b) => a + b, 0) / hums.length;
  const numerator = temps.reduce((sum, t, i) => sum + (t - meanT) * (hums[i] - meanH), 0);
  const denominator = Math.sqrt(temps.reduce((sum, t) => sum + Math.pow(t - meanT, 2), 0) * hums.reduce((sum, h) => sum + Math.pow(h - meanH, 2), 0));
  const corr = denominator === 0 ? null : numerator / denominator;
  // Return points as {x, y} for scatter plot compatibility
  const points = data.map(item => ({ x: item.temperatureValue, y: item.humidityValue }));
  return { correlation: corr, points };
}
// Prediction: returns actual and predicted values for a device/metric
async getPrediction(deviceId: string, metric: 'temperature' | 'humidity', futureWindow: number) {
  // 1. Get recent actual data (last 24h)
  const now = new Date();
  const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const actualData = await this.deviceModel.find({
    deviceId,
    date: { $gte: past, $lte: now },
  }).sort({ date: 1 }).select('date temperatureValue humidityValue');

  // 2. Prepare actual values for chart
  const actualPoints = actualData.map(item => ({
    timestamp: item.date.toISOString(),
    actualValue: metric === 'temperature' ? item.temperatureValue : item.humidityValue,
    predictedValue: null,
  }));

  // 3. Generate mock predictions (simple linear extrapolation)
  let lastValue = actualPoints.length > 0 ? actualPoints[actualPoints.length - 1].actualValue : 0;
  let slope = 0;
  if (actualPoints.length > 1) {
    const first = actualPoints[0].actualValue;
    const last = actualPoints[actualPoints.length - 1].actualValue;
    slope = (last - first) / (actualPoints.length - 1);
  }
  const intervalMs = 60 * 60 * 1000; // 1 hour intervals
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

  // 4. Combine actual and predicted
  return {
    deviceId,
    metric,
    points: [...actualPoints, ...predictionPoints],
  };
}
// Forecast: returns forecasted values for a device/metric for the next N hours using a hybrid of moving average, exponential smoothing, and linear regression
async getForecast(deviceId: string, metric: 'temperature' | 'humidity', futureWindow: number) {
  // 1. Get recent actual data (last 24h)
  const now = new Date();
  const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const actualData = await this.deviceModel.find({
    deviceId,
    date: { $gte: past, $lte: now },
  }).sort({ date: 1 }).select('date temperatureValue humidityValue');

  // Prepare values
  const values = actualData.map(item => metric === 'temperature' ? item.temperatureValue : item.humidityValue);
  if (values.length === 0) values.push(0);

  // --- Moving Average ---
  const windowSize = 6;
  let maValues = [...values];

  // --- Exponential Smoothing ---
  const alpha = 0.5; // smoothing factor (0 < alpha <= 1)
  let esValues = [values[0]];
  for (let i = 1; i < values.length; i++) {
    esValues.push(alpha * values[i] + (1 - alpha) * esValues[i - 1]);
  }

  // --- Linear Regression (trend) ---
  // Fit y = a + b*x to the last N points
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

  // --- Forecast future points ---
  const forecastPoints = [];
  let lastMA = maValues.slice(-windowSize);
  let lastES = esValues[esValues.length - 1];
  for (let i = 1; i <= futureWindow; i++) {
    // Moving Average
    const ma = lastMA.reduce((sum, v) => sum + v, 0) / lastMA.length;
    lastMA.push(ma);
    if (lastMA.length > windowSize) lastMA.shift();
    // Exponential Smoothing
    lastES = alpha * ma + (1 - alpha) * lastES;
    // Linear Regression
    const lr = lrA + lrB * (n + i - 1);
    // Hybrid: average of all three
    const hybrid = (ma + lastES + lr) / 3;
    const futureDate = new Date(now.getTime() + i * 60 * 60 * 1000);
    forecastPoints.push({
      timestamp: futureDate.toISOString(),
      forecastValue: hybrid,
    });
    // For next step
    maValues.push(ma);
    esValues.push(lastES);
  }
  return {
    deviceId,
    metric,
    forecast: forecastPoints,
  };
}
}
