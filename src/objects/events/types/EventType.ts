import mongoose from 'mongoose';
import { Schema } from 'mongoose';

export interface EventType extends mongoose.Document {
    _id: Schema.Types.ObjectId;
    creator: string;
    creatorId: Schema.Types.ObjectId;
    hostApartmentId: Schema.Types.ObjectId;
    time: Date;
    invitees: Schema.Types.ObjectId[];
    attendees: Schema.Types.ObjectId[];
    title: string;
    description: string;
}
