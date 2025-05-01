"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_sns_1 = require("@aws-sdk/client-sns");
const sns_service_1 = require("./../src/sns/sns.service");
let AwsModule = class AwsModule {
};
exports.AwsModule = AwsModule;
exports.AwsModule = AwsModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            sns_service_1.SnsService,
            {
                provide: 'SNS_CLIENT',
                useFactory: (configService) => {
                    const region = configService.get('AWS_REGION');
                    const accessKeyId = configService.get('AWS_ACCESS_KEY_ID');
                    const secretAccessKey = configService.get('AWS_SECRET_ACCESS_KEY');
                    if (!region || !accessKeyId || !secretAccessKey) {
                        throw new Error('AWS credentials or region not defined');
                    }
                    return new client_sns_1.SNSClient({
                        region,
                        credentials: {
                            accessKeyId,
                            secretAccessKey,
                        },
                    });
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: [sns_service_1.SnsService],
    })
], AwsModule);
//# sourceMappingURL=aws.module.js.map