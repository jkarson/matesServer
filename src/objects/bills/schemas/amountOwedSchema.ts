import mongoose from 'mongoose';

const { Schema } = mongoose;
const amountOwedSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    initialAmount: Number,
    currentAmount: Number,
});
export default amountOwedSchema;
