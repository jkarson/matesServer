import { Schema } from 'mongoose';

export interface MessageType {
    _id: Schema.Types.ObjectId;
    sender: string;
    senderId: Schema.Types.ObjectId;
    time: Date;
    content: string;
}
