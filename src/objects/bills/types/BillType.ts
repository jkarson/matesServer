import { Schema } from 'mongoose';
import { AmountOwedType } from './AmountOwedType';

export interface BillType {
    _id: Schema.Types.ObjectId;
    billGeneratorId: Schema.Types.ObjectId;
    name: string;
    payableTo: string;
    isPrivate: boolean;
    privateTenantId: Schema.Types.ObjectId;
    amountsOwed: AmountOwedType[];
    date: Date;
}
