import { Schema } from 'mongoose';

export interface TenantType {
    userId: Schema.Types.ObjectId;
    name: string;
    age?: number;
    email?: string;
    number?: string;
}
