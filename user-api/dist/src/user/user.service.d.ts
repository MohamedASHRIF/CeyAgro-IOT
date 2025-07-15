import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { UpdateUserDto } from './dto/user.dto';
export declare class UserService {
    private userModel;
    private uploadsDir;
    constructor(userModel: Model<User>);
    getProfile(email: string): Promise<Partial<User>>;
    updateProfile(email: string, updateUserDto: UpdateUserDto, picture?: Express.Multer.File, removePicture?: string): Promise<User>;
    getProfileShort(email: string): Promise<{
        name: string;
        picture: string | null;
    }>;
    getUserIdByEmail(email: string): Promise<string>;
    getUserByEmail(email: string): Promise<User>;
    updateUserByEmail(email: string, updateDto: Partial<User>): Promise<User>;
    findOrCreateUser(email: string, name: string): Promise<User>;
    incrementLoginCount(email: string): Promise<User>;
    updateSubscriptionStatus(email: string, status: string, attempt?: Date): Promise<User>;
}
