import { KafkaOptions, Transport } from '@nestjs/microservices';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'device-api',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    },
    consumer: {
      groupId: 'device-consumer-group',
      allowAutoTopicCreation: true,
    },
    subscribe: {
      fromBeginning: true,
    },
  },
};