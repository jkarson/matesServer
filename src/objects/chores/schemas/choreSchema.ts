import mongoose from 'mongoose';

const { Schema } = mongoose;
const choreSchema = new Schema({
    choreGeneratorId: Schema.Types.ObjectId,
    name: String,
    assigneeIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    date: Date,
    completed: Boolean,
    completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    showUntilCompleted: Boolean,
});

export default choreSchema;
