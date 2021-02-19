import { Schema } from 'mongoose';
import { AmountWithPercentOwedType } from './AmountWithPercentOwedType';
import { BillFrequency } from './BillFrequency';

export interface BillGeneratorType {
    _id: Schema.Types.ObjectId;
    name: string;
    payableTo: string;
    isPrivate: boolean;
    privateTenantId: Schema.Types.ObjectId;
    frequency: BillFrequency;
    amountsWithPercentOwed: AmountWithPercentOwedType[];
    starting: Date;
    updatedThrough: Date;
}
