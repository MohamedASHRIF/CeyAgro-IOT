import { Schema, Document } from 'mongoose';

export const NotificationSchema = new Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        date: { type: String, required: true },
    },
    { timestamps: true },
);

export interface Notification extends Document {
    title: string;
    message: string;
    date: string;
}
