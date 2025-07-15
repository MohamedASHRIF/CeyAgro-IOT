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

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(DeviceData.name)
    private deviceModel: Model<DeviceDataDocument>,
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
    if (queryDto.location) {
      query.location = queryDto.location;
    }
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
  const latest = await this.deviceModel
    .findOne({ deviceId })
    .sort({ date: -1, _id: -1 })
    .select('name deviceId temperatureValue humidityValue date');
  if (!latest) {
    return {
      deviceId: deviceId,
      metric,
      value: 0,
      timestamp: new Date().toISOString(),
    };
  }
  return {
    deviceId: latest.deviceId,
    name: latest.name,
    metric,
    value: metric === 'temperature' ? latest.temperatureValue ?? 0 : latest.humidityValue ?? 0,
    timestamp: latest.date ? latest.date.toISOString() : new Date().toISOString(),
  };
}

// Retrieves historical stats for a device within a specified date range
async getHistoricalStats(deviceId: string, metric: 'temperature' | 'humidity', startDate: string, endDate: string) {
  const data = await this.deviceModel
    .find({
      deviceId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    })
    .select('name deviceId temperatureValue humidityValue date');
  if (!data || data.length === 0) {
    return [];
  }
  return data.map(item => ({
    deviceId: item.deviceId,
    name: item.name,
    metric,
    value: metric === 'temperature' ? item.temperatureValue ?? 0 : item.humidityValue ?? 0,
    timestamp: item.date ? item.date.toISOString() : new Date().toISOString(),
  }));
}

// Retrieves aggregated stats (min, max, avg) for a device over a time range (lastHour or lastDay)
async getStats(deviceId: string, metric: 'temperature' | 'humidity', timeRange: string) {
  const now = new Date();
  const startDate = new Date(
    now.getTime() - (timeRange === 'lastHour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
  );
  const data = await this.deviceModel
    .find({
      deviceId,
      date: { $gte: startDate, $lte: now },
    })
    .select('temperatureValue humidityValue');
  const values = data
    .map(item => (metric === 'temperature' ? item.temperatureValue : item.humidityValue))
    .filter((value): value is number => value !== undefined);
  return {
    min: values.length > 0 ? Math.min(...values) : 0,
    max: values.length > 0 ? Math.max(...values) : 0,
    avg: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
  };
}

// Returns the available metrics for a device 
async getAvailableMetrics(deviceId: string) {
  // Optionally, you could check if the device exists by deviceId
  return ['temperature', 'humidity'];
}
}
