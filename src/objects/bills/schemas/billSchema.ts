import mongoose from 'mongoose';
import amountOwedSchema from './amountOwedSchema';
const { Schema } = mongoose;

const billSchema = new Schema({
    billGeneratorId: Schema.Types.ObjectId, //note: no ref to BillGenerator bc it is not a compiled model
    name: String,
    payableTo: String,
    isPrivate: Boolean,
    privateTenantId: { type: Schema.Types.ObjectId, ref: 'User' },
    amountsOwed: [amountOwedSchema],
    date: Date,
});
export default billSchema;
