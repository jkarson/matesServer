import mongoose from 'mongoose';
import amountOwedSchema from './amountOwedSchema';
const { Schema } = mongoose;

const billSchema = new Schema({
    billGeneratorId: Schema.Types.ObjectId,
    name: String,
    payableTo: String,
    isPrivate: Boolean,
    privateTenantId: { type: Schema.Types.ObjectId, ref: 'User' },
    amountsOwed: [amountOwedSchema],
    date: Date,
});
export default billSchema;
