import { Document } from 'mongoose';
export declare class User extends Document {
    user_id: string;
    email: string;
    name: string;
    login_count: number;
    created_at: Date;
    updated_at: Date;
    last_login: Date;
    identities: any[];
    user_metadata: any;
    nickname: string;
    picture: string;
    sns_subscription_status: string;
    last_sns_subscription_attempt: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
