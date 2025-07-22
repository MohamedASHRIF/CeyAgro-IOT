import { KafkaOptions, Transport } from '@nestjs/microservices';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'device-api-v2',
      brokers: [
        'b-1.uomproject.wr3wd9.c2.kafka.eu-north-1.amazonaws.com:9096', 
        'b-2.uomproject.wr3wd9.c2.kafka.eu-north-1.amazonaws.com:9096'
      ], // Use container name instead of localhost
      ssl: true,
      sasl: {
        mechanism: 'scram-sha-512',
        username: process.env.KAFKA_USER,
        password: process.env.KAFKA_PASS,
      },
      authenticationTimeout: 5000,
      connectionTimeout: 10000,
      requestTimeout: 25000,
    },
    consumer: {
      groupId: 'device-consumer-group-v3', // Changed from v2 to v3
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      allowAutoTopicCreation: true,
    },
    subscribe: {
      fromBeginning: false, // Start from the latest message, not the beginning
    },
  },
};
