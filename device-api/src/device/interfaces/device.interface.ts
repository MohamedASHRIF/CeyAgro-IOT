export interface Device {
  temperatureValue: number;

  humidityValue: number;

  location: string;

  isActive: boolean;

  date: Date;

  userId: string;

  topic: string;
}
