"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const express_jwt_1 = require("express-jwt");
const cookieParser = require("cookie-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: 'http://localhost:3000',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization',
    });
    app.use(cookieParser());
    app.use((0, express_jwt_1.expressjwt)({
        secret: configService.get('AUTH0_CLIENT_SECRET') || 'fallback-secret',
        issuer: `https://${configService.get('AUTH0_DOMAIN')}/`,
        algorithms: ['HS256'],
    }).unless({
        path: ['/auth/login', '/auth/confirm-subscription'],
    }));
    await app.listen(3001);
}
bootstrap();
//# sourceMappingURL=main.js.map