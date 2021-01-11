import { Schema } from 'mongoose';

export interface AmountOwedType {
    tenantId: Schema.Types.ObjectId;
    initialAmount: number;
    currentAmount: number;
}
