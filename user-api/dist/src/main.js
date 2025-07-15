"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const express_jwt_1 = require("express-jwt");
const cookieParser = require("cookie-parser");
const path_1 = require("path");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: 'http://localhost:3000',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization',
    });
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.use(cookieParser());
    const uploadsPath = (0, path_1.join)(process.cwd(), 'uploads');
    console.log('Serving static files from:', uploadsPath);
    app.use('/uploads', express.static(uploadsPath, {
        maxAge: '1d',
        etag: false,
        setHeaders: (res, path) => {
            if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
                res.setHeader('Content-Type', 'image/jpeg');
            }
            else if (path.endsWith('.png')) {
                res.setHeader('Content-Type', 'image/png');
            }
            else if (path.endsWith('.gif')) {
                res.setHeader('Content-Type', 'image/gif');
            }
            else if (path.endsWith('.webp')) {
                res.setHeader('Content-Type', 'image/webp');
            }
        }
    }));
    app.use((0, express_jwt_1.expressjwt)({
        secret: configService.get('AUTH0_CLIENT_SECRET') || 'fallback-secret',
        issuer: `https://${configService.get('AUTH0_DOMAIN')}/`,
        algorithms: ['HS256'],
    }).unless({
        path: [
            '/auth/login',
            '/auth/confirm-subscription',
            /^\/user\/profile.*/,
            /^\/uploads\/.*/,
            /^\/user\/id-by-email.*/,
        ],
    }));
    await app.listen(3001);
    console.log(`Application is running on: http://localhost:3001`);
    console.log('Images accessible at: http://localhost:3001/uploads/filename.jpg');
}
bootstrap();
//# sourceMappingURL=main.js.map