import { Schema } from 'mongoose';
import { EventType } from './EventType';

export interface EventsInfoType {
    events: Schema.Types.ObjectId[]; //EventType[];
    invitations: Schema.Types.ObjectId[]; //EventType[];
}
