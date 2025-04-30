import { Model } from 'mongoose';
import { User } from './schema/user.schema';
export declare class UserService {
    private userModel;
    constructor(userModel: Model<User>);
    findOrCreateUser(email: string, name: string): Promise<User>;
    incrementLoginCount(email: string): Promise<User>;
    updateSubscriptionStatus(email: string, status: string, attempt?: Date): Promise<User>;
}
