import { Schema } from 'mongoose';

export interface EventsInfoType {
    events: Schema.Types.ObjectId[];
    invitations: Schema.Types.ObjectId[];
}
