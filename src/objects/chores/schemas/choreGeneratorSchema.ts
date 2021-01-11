import mongoose from 'mongoose';
import { choreFrequencies } from '../../../../client/src/App/pages/mates/Chores/models/ChoreFrequency';

const { Schema } = mongoose;
const choreGeneratorSchema = new Schema({
    name: String,
    assigneeIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    frequency: { type: String, enum: choreFrequencies },
    starting: Date,
    updatedThrough: Date,
    showUntilCompleted: Boolean,
});

export default choreGeneratorSchema;
