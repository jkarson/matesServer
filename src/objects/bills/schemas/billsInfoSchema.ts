import mongoose from 'mongoose';
import billGeneratorSchema from './billGeneratorSchema';
import billSchema from './billSchema';

const { Schema } = mongoose;
const billsInfoSchema = new Schema({
    billGenerators: [billGeneratorSchema],
    bills: [billSchema],
});

export default billsInfoSchema;
