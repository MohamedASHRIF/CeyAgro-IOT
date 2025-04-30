"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authConfig = void 0;
exports.authConfig = {
    auth0: {
        audience: process.env.AUTH0_AUDIENCE || 'https://nestjs.demo.com',
        issuerBaseURL: process.env.AUTH0_ISSUER_URL ||
            'https://dev-qd6kxifl4h1xzmzw.us.auth0.com/',
        tokenSigningAlg: 'RS256',
    },
};
//# sourceMappingURL=auth.config.js.map