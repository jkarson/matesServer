import mongoose from 'mongoose';
const { Schema } = mongoose;

const amountWithPercentOwedSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    amount: String,
    amountValue: Number,
    percent: String,
    percentValue: Number,
});

export default amountWithPercentOwedSchema;
