"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SnsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnsService = void 0;
const common_1 = require("@nestjs/common");
const aws_sdk_1 = require("aws-sdk");
let SnsService = SnsService_1 = class SnsService {
    sns;
    logger = new common_1.Logger(SnsService_1.name);
    constructor() {
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        if (!accessKeyId || !secretAccessKey) {
            this.logger.error('AWS credentials are missing. Ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in .env');
            throw new Error('AWS credentials are missing');
        }
        this.sns = new aws_sdk_1.SNS({
            region: 'eu-north-1',
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
        this.logger.log('SNS client initialized successfully');
    }
    async subscribeEmail(email) {
        try {
            this.logger.log(`Subscribing ${email} to SNS topic`);
            const params = {
                Protocol: 'email',
                TopicArn: 'arn:aws:sns:eu-north-1:911167929681:aws-sns-auth',
                Endpoint: email,
            };
            const response = await this.sns.subscribe(params).promise();
            this.logger.log(`SNS subscription requested for ${email}: ${JSON.stringify(response)}`);
        }
        catch (error) {
            this.logger.error(`Failed to subscribe ${email} to SNS: ${error.message}`);
            throw error;
        }
    }
    async sendSubscriptionEmail(email, name) {
        try {
            this.logger.log(`Sending subscription email to ${email}`);
            const params = {
                TopicArn: 'arn:aws:sns:eu-north-1:911167929681:aws-sns-auth',
                Message: JSON.stringify({
                    default: `Welcome ${name}!`,
                    email: {
                        subject: 'Confirm Your Subscription',
                        body: `Hello ${name},\n\nThank you for signing up! Please confirm your subscription to receive login notifications.`,
                    },
                }),
                MessageStructure: 'json',
                MessageAttributes: {
                    email: {
                        DataType: 'String',
                        StringValue: email,
                    },
                },
            };
            const response = await this.sns.publish(params).promise();
            this.logger.log(`Subscription email sent to ${email}: ${JSON.stringify(response)}`);
        }
        catch (error) {
            this.logger.error(`Failed to send subscription email to ${email}: ${error.message}`);
            throw error;
        }
    }
    async sendLoginSuccessEmail(email, name) {
        try {
            this.logger.log(`Sending login success email to ${email}`);
            const params = {
                TopicArn: 'arn:aws:sns:eu-north-1:911167929681:aws-sns-auth',
                Message: JSON.stringify({
                    default: `Login Successful for ${name}`,
                    email: {
                        subject: 'Login Successful',
                        body: `Hello ${name},\n\nYou have successfully logged in to your account.`,
                    },
                }),
                MessageStructure: 'json',
                MessageAttributes: {
                    email: {
                        DataType: 'String',
                        StringValue: email,
                    },
                },
            };
            const response = await this.sns.publish(params).promise();
            this.logger.log(`Login success email sent to ${email}: ${JSON.stringify(response)}`);
        }
        catch (error) {
            this.logger.error(`Failed to send login success email to ${email}: ${error.message}`);
            throw error;
        }
    }
};
exports.SnsService = SnsService;
exports.SnsService = SnsService = SnsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SnsService);
//# sourceMappingURL=sns.service.js.map