"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtGuard = void 0;
const common_1 = require("@nestjs/common");
const express_oauth2_jwt_bearer_1 = require("express-oauth2-jwt-bearer");
const util_1 = require("util");
let JwtGuard = class JwtGuard {
    authorizeMiddleware = (0, express_oauth2_jwt_bearer_1.auth)({
        audience: 'https://nestjs.demo.com',
        issuerBaseURL: 'https://dev-qd6kxifl4h1xzmzw.us.auth0.com/',
        tokenSigningAlg: 'RS256',
    });
    async canActivate(context) {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const response = httpContext.getResponse();
        try {
            const promisifiedMiddleware = (0, util_1.promisify)(this.authorizeMiddleware);
            await promisifiedMiddleware(request, response);
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.JwtGuard = JwtGuard;
exports.JwtGuard = JwtGuard = __decorate([
    (0, common_1.Injectable)()
], JwtGuard);
//# sourceMappingURL=jwt.guard.js.map