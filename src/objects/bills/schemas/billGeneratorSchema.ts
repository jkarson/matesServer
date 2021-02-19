import mongoose from 'mongoose';
import { billFrequencies } from '../types/BillFrequency';
import amountWithPercentOwedSchema from './amountWithPercentOwedSchema';
const { Schema } = mongoose;

const billGeneratorSchema = new Schema({
    name: String,
    payableTo: String,
    isPrivate: Boolean,
    privateTenantId: { type: Schema.Types.ObjectId, ref: 'User' },
    frequency: { type: String, enum: billFrequencies },
    amountsWithPercentOwed: [amountWithPercentOwedSchema],
    starting: Date,
    updatedThrough: Date,
});

export default billGeneratorSchema;
