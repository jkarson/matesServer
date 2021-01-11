import mongoose from 'mongoose';

const { Schema } = mongoose;
const friendsInfoSchema = new Schema({
    friends: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
    outgoingRequests: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
    incomingRequests: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
});

export default friendsInfoSchema;
