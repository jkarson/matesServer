import mongoose from 'mongoose';

const { Schema } = mongoose;
const eventSchema = new Schema({
    creator: String,
    creatorId: { type: Schema.Types.ObjectId, ref: 'User' },
    hostApartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment' },
    time: Date,
    invitees: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
    attendees: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
    title: String,
    description: String,
});

export default eventSchema;
