import mongoose from 'mongoose';
const { Schema } = mongoose;

const messageSchema = new Schema({
    sender: String,
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    time: Date,
    content: String,
});

export default messageSchema;
