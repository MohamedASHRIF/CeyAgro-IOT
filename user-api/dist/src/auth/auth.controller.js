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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../../src/user/user.service");
const sns_service_1 = require("../../src/sns/sns.service");
let AuthController = AuthController_1 = class AuthController {
    userService;
    snsService;
    logger = new common_1.Logger(AuthController_1.name);
    constructor(userService, snsService) {
        this.userService = userService;
        this.snsService = snsService;
    }
    async handleLogin(body) {
        this.logger.log(`Received login request: ${JSON.stringify(body)}`);
        const { email, name } = body;
        const normalizedEmail = email.toLowerCase();
        let user = await this.userService.findOrCreateUser(normalizedEmail, name);
        this.logger.log(`User before increment: email=${user.email}, sns_subscription_status=${user.sns_subscription_status}, login_count=${user.login_count}, user_id=${user.user_id}`);
        user = await this.userService.incrementLoginCount(normalizedEmail);
        this.logger.log(`User after increment: email=${user.email}, sns_subscription_status=${user.sns_subscription_status}, login_count=${user.login_count}, user_id=${user.user_id}`);
        if (user.login_count === 1 &&
            user.sns_subscription_status === 'unsubscribed') {
            try {
                this.logger.log(`Initiating SNS subscription for ${normalizedEmail}`);
                await this.snsService.subscribeEmail(normalizedEmail);
                user = await this.userService.updateSubscriptionStatus(normalizedEmail, 'pending', new Date());
                this.logger.log(`SNS subscription status set to pending for ${normalizedEmail}`);
                await this.snsService.sendSubscriptionEmail(normalizedEmail, name);
                this.logger.log(`Subscription email sent successfully to ${normalizedEmail}`);
            }
            catch (error) {
                this.logger.error(`Failed to initiate SNS subscription or send email for ${normalizedEmail}: ${error.message}`);
                throw error;
            }
        }
        const isSubscribed = user.sns_subscription_status === 'subscribed';
        this.logger.log(`Returning response: isSubscribed=${isSubscribed}, sns_subscription_status=${user.sns_subscription_status}, email=${normalizedEmail}, login_count=${user.login_count}`);
        if (user.login_count >= 1 && isSubscribed) {
            try {
                this.logger.log(`Sending login success email to ${normalizedEmail}`);
                await this.snsService.sendLoginSuccessEmail(normalizedEmail, name);
                this.logger.log(`Login success email sent successfully to ${normalizedEmail}`);
            }
            catch (error) {
                this.logger.error(`Failed to send login success email to ${normalizedEmail}: ${error.message}`);
            }
        }
        else {
            this.logger.log(`No login success email sent. Conditions not met: isSubscribed=${isSubscribed}, login_count=${user.login_count}`);
        }
        return { message: 'Login processed successfully', isSubscribed };
    }
    async confirmSubscription(body) {
        const normalizedEmail = body.email.toLowerCase();
        this.logger.log(`Confirming SNS subscription for ${normalizedEmail}`);
        const user = await this.userService.updateSubscriptionStatus(normalizedEmail, 'subscribed');
        this.logger.log(`SNS subscription confirmed for ${normalizedEmail}: sns_subscription_status=${user.sns_subscription_status}, user_id=${user.user_id}`);
        return { message: `Subscription confirmed for ${normalizedEmail}` };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handleLogin", null);
__decorate([
    (0, common_1.Post)('confirm-subscription'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "confirmSubscription", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        sns_service_1.SnsService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map