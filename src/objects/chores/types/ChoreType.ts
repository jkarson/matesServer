import { Schema } from 'mongoose';

export interface ChoreType {
    _id: Schema.Types.ObjectId;
    choreGeneratorId: Schema.Types.ObjectId;
    name: string;
    assigneeIds: Schema.Types.ObjectId[];
    date: Date;
    completed: boolean;
    completedBy: Schema.Types.ObjectId | undefined;
    showUntilCompleted: boolean;
}
