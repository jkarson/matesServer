import mongoose from 'mongoose';

const { Schema } = mongoose;
const tenantSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: String,
    age: Number,
    email: String,
    number: String,
});

export default tenantSchema;
