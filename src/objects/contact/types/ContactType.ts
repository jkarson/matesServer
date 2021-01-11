import { Schema } from 'mongoose';

export interface ContactType {
    _id: Schema.Types.ObjectId;
    name: string;
    number: string;
    email: string;
}
