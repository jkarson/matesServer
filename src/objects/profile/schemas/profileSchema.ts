import mongoose from 'mongoose';

const { Schema } = mongoose;
const profileSchema = new Schema({
    code: String,
    name: String,
    address: String,
    quote: String,
    requests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export default profileSchema;
