import { Schema } from 'mongoose';
import { BillFrequency } from '../../../../client/src/App/pages/mates/Bills/models/BillFrequency';
import { AmountWithPercentOwedType } from './AmountWithPercentOwedType';

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
