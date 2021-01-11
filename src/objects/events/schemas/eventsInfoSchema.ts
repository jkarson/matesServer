import mongoose from 'mongoose';

const { Schema } = mongoose;
const eventsInfoSchema = new Schema({
    events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    invitations: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
});

export default eventsInfoSchema;
