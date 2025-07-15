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
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
let UserService = class UserService {
    userModel;
    uploadsDir;
    constructor(userModel) {
        this.userModel = userModel;
        this.uploadsDir = path.join(process.cwd(), 'uploads');
        console.log(' Uploads directory path:', this.uploadsDir);
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
            console.log('✅ Created uploads directory:', this.uploadsDir);
        }
        else {
            console.log('✅ Uploads directory already exists:', this.uploadsDir);
        }
    }
    async getProfile(email) {
        const user = await this.userModel
            .findOne({ email })
            .select('name email nic gender telephone address picture -_id')
            .exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateProfile(email, updateUserDto, picture, removePicture) {
        const user = await this.userModel.findOne({ email });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        console.log(' Update DTO received:', updateUserDto);
        console.log(' Email:', email);
        console.log(' Current user name:', user.name);
        console.log(' Remove picture flag:', removePicture);
        if (removePicture === 'true') {
            console.log(' Removing existing picture...');
            if (user.picture && user.picture.startsWith('/uploads/')) {
                const fileName = user.picture.replace('/uploads/', '');
                const oldFilePath = path.join(this.uploadsDir, fileName);
                if (fs.existsSync(oldFilePath)) {
                    try {
                        fs.unlinkSync(oldFilePath);
                        console.log(' Old picture file deleted:', oldFilePath);
                    }
                    catch (error) {
                        console.error('❌ Error deleting old picture file:', error);
                    }
                }
            }
            user.picture = null;
            console.log('✅ Picture removed from user profile');
        }
        if (picture && removePicture !== 'true') {
            console.log(' Uploading new picture...');
            console.log(' Picture buffer size:', picture.buffer.length);
            console.log(' Picture original name:', picture.originalname);
            if (user.picture && user.picture.startsWith('/uploads/')) {
                const fileName = user.picture.replace('/uploads/', '');
                const oldFilePath = path.join(this.uploadsDir, fileName);
                if (fs.existsSync(oldFilePath)) {
                    try {
                        fs.unlinkSync(oldFilePath);
                        console.log(' Old picture file replaced:', oldFilePath);
                    }
                    catch (error) {
                        console.error('❌ Error deleting old picture file:', error);
                    }
                }
            }
            const fileName = `${uuid.v4()}${path.extname(picture.originalname)}`;
            const filePath = path.join(this.uploadsDir, fileName);
            console.log('💾 Saving picture to:', filePath);
            try {
                if (!fs.existsSync(this.uploadsDir)) {
                    fs.mkdirSync(this.uploadsDir, { recursive: true });
                    console.log('✅ Re-created uploads directory:', this.uploadsDir);
                }
                fs.writeFileSync(filePath, picture.buffer);
                user.picture = `/uploads/${fileName}`;
                console.log('✅ New picture uploaded successfully:', fileName);
                console.log('✅ File saved at:', filePath);
                console.log('✅ File exists check:', fs.existsSync(filePath));
                const stats = fs.statSync(filePath);
                console.log('File size:', stats.size, 'bytes');
            }
            catch (error) {
                console.error('❌ Error saving new picture:', error);
                console.error('❌ Upload directory:', this.uploadsDir);
                console.error('❌ File path:', filePath);
                throw new Error(`Failed to save picture: ${error.message}`);
            }
        }
        if (updateUserDto.name !== undefined) {
            console.log(' Name update requested:', `"${updateUserDto.name}"`);
            console.log(' Name after trim:', `"${updateUserDto.name.trim()}"`);
            console.log(' Is name empty after trim?', updateUserDto.name.trim() === '');
            if (updateUserDto.name.trim() !== '') {
                console.log('✅ Setting new name:', updateUserDto.name);
                user.name = updateUserDto.name;
            }
            else if (!user.name) {
                console.log(' Setting default name from email');
                user.name = user.email.split('@')[0];
            }
            else {
                console.log(' Keeping existing name:', user.name);
            }
        }
        console.log(' Final name before save:', user.name);
        console.log(' Final picture before save:', user.picture);
        if (updateUserDto.nic !== undefined)
            user.nic = updateUserDto.nic;
        if (updateUserDto.gender !== undefined)
            user.gender = updateUserDto.gender;
        if (updateUserDto.telephone !== undefined)
            user.telephone = updateUserDto.telephone;
        if (updateUserDto.address !== undefined)
            user.address = updateUserDto.address;
        user.updated_at = new Date();
        const savedUser = await user.save();
        console.log('✅ User saved with name:', savedUser.name);
        console.log('✅ User saved with picture:', savedUser.picture);
        return savedUser;
    }
    async getProfileShort(email) {
        const user = await this.userModel.findOne({ email });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return {
            name: user.name,
            picture: user.picture,
        };
    }
    async getUserIdByEmail(email) {
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user.user_id;
    }
    async getUserByEmail(email) {
        const normalizedEmail = email.toLowerCase();
        try {
            const user = await this.userModel.findOne({ email: normalizedEmail }).exec();
            if (!user) {
                throw new Error(`User with email ${normalizedEmail} not found`);
            }
            return user;
        }
        catch (error) {
            console.error(`Error getting user by email ${normalizedEmail}: ${error.message}`);
            throw new Error(`Error getting user: ${error.message}`);
        }
    }
    async updateUserByEmail(email, updateDto) {
        const normalizedEmail = email.toLowerCase();
        try {
            const updatedUser = await this.userModel
                .findOneAndUpdate({ email: normalizedEmail }, { $set: { ...updateDto, updated_at: new Date() } }, { new: true })
                .exec();
            if (!updatedUser) {
                throw new Error(`Failed to update user for ${normalizedEmail}`);
            }
            return updatedUser;
        }
        catch (error) {
            console.error(`Error updating user ${normalizedEmail}: ${error.message}`);
            throw new Error(`Error updating user: ${error.message}`);
        }
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