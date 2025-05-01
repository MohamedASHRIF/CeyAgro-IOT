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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schema/user.schema");
let UserService = class UserService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findOrCreateUser(email, name) {
        const normalizedEmail = email.toLowerCase();
        try {
            console.log(`Finding user for email: ${normalizedEmail}`);
            const existingUser = await this.userModel
                .findOne({ email: normalizedEmail })
                .exec();
            if (existingUser) {
                console.log(`Found user: email=${normalizedEmail}, sns_subscription_status=${existingUser.sns_subscription_status}, login_count=${existingUser.login_count}, user_id=${existingUser.user_id}`);
                const updateData = {
                    name,
                    updated_at: new Date(),
                    last_login: new Date(),
                };
                if (!existingUser.sns_subscription_status) {
                    updateData.sns_subscription_status = 'unsubscribed';
                    updateData.last_sns_subscription_attempt = null;
                }
                if (existingUser.sns_subscription_status === 'subscribed') {
                    console.log(`Preserving sns_subscription_status: subscribed for ${normalizedEmail}`);
                }
                if (!existingUser.login_count) {
                    updateData.login_count = 0;
                }
                const updatedUser = await this.userModel
                    .findOneAndUpdate({ email: normalizedEmail }, { $set: updateData }, { new: true })
                    .exec();
                if (!updatedUser) {
                    throw new Error(`Failed to update user for ${normalizedEmail}`);
                }
                console.log(`Updated user: email=${normalizedEmail}, sns_subscription_status=${updatedUser.sns_subscription_status}, login_count=${updatedUser.login_count}, user_id=${updatedUser.user_id}`);
                return updatedUser;
            }
            console.log(`Creating new user for ${normalizedEmail}`);
            const newUser = new this.userModel({
                email: normalizedEmail,
                name,
                user_id: `manual|${normalizedEmail}`,
                login_count: 0,
                created_at: new Date(),
                updated_at: new Date(),
                last_login: new Date(),
                identities: [],
                user_metadata: {},
                sns_subscription_status: 'unsubscribed',
                last_sns_subscription_attempt: null,
            });
            const savedUser = await newUser.save();
            console.log(`Created user: email=${normalizedEmail}, sns_subscription_status=${savedUser.sns_subscription_status}, user_id=${savedUser.user_id}`);
            return savedUser;
        }
        catch (error) {
            console.error(`Failed to find or create user for ${normalizedEmail}: ${error.message}`);
            throw new Error(`Failed to find or create user: ${error.message}`);
        }
    }
    async incrementLoginCount(email) {
        const normalizedEmail = email.toLowerCase();
        try {
            console.log(`Incrementing login_count for ${normalizedEmail}`);
            const user = await this.userModel
                .findOneAndUpdate({ email: normalizedEmail }, {
                $inc: { login_count: 1 },
                $set: { last_login: new Date(), updated_at: new Date() },
            }, { new: true })
                .exec();
            if (!user) {
                throw new Error(`User with email ${normalizedEmail} not found`);
            }
            console.log(`User after increment: email=${normalizedEmail}, sns_subscription_status=${user.sns_subscription_status}, login_count=${user.login_count}, user_id=${user.user_id}`);
            return user;
        }
        catch (error) {
            console.error(`Failed to increment login count for ${normalizedEmail}: ${error.message}`);
            throw new Error(`Failed to increment login count: ${error.message}`);
        }
    }
    async updateSubscriptionStatus(email, status, attempt) {
        const normalizedEmail = email.toLowerCase();
        try {
            console.log(`Updating subscription status for ${normalizedEmail} to ${status}`);
            const update = { sns_subscription_status: status };
            if (attempt) {
                update.last_sns_subscription_attempt = attempt;
            }
            const user = await this.userModel
                .findOneAndUpdate({ email: normalizedEmail }, { $set: update }, { new: true })
                .exec();
            if (!user) {
                console.error(`User with email ${normalizedEmail} not found in database`);
                throw new Error(`User with email ${normalizedEmail} not found`);
            }
            console.log(`Successfully updated subscription status: email=${normalizedEmail}, sns_subscription_status=${user.sns_subscription_status}, user_id=${user.user_id}`);
            return user;
        }
        catch (error) {
            console.error(`Failed to update subscription status for ${normalizedEmail}: ${error.message}`);
            throw new Error(`Failed to update subscription status: ${error.message}`);
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserService);
//# sourceMappingURL=user.service.js.map