import { Schema } from 'mongoose';
import { ChoreFrequency } from '../../../../client/src/App/pages/mates/Chores/models/ChoreFrequency';

export interface ChoreGeneratorType {
    _id: Schema.Types.ObjectId;
    name: string;
    assigneeIds: Schema.Types.ObjectId[];
    frequency: ChoreFrequency;
    starting: Date;
    updatedThrough: Date;
    showUntilCompleted: boolean;
}
