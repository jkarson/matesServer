import { Schema } from 'mongoose';

export interface ProfileType {
    code: string;
    name: string;
    address: string;
    quote: string;
    requests: Schema.Types.ObjectId[];
}
