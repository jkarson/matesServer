import mongoose from 'mongoose';
import eventSchema from '../schemas/eventSchema';
import { EventType } from '../types/EventType';

const Event = mongoose.model<EventType>('Event', eventSchema);

export default Event;
