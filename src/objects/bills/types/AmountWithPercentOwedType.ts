import { Schema } from 'mongoose';

export interface AmountWithPercentOwedType {
    userId: Schema.Types.ObjectId;
    amount: string;
    amountValue: number;
    percent: string;
    percentValue: number;
}
