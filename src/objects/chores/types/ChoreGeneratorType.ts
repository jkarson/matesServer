import { Schema } from 'mongoose';
import { ChoreFrequency } from './ChoreFrequency';

export interface ChoreGeneratorType {
    _id: Schema.Types.ObjectId;
    name: string;
    assigneeIds: Schema.Types.ObjectId[];
    frequency: ChoreFrequency;
    starting: Date;
    updatedThrough: Date;
    showUntilCompleted: boolean;
}
