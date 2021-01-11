import mongoose, { Schema } from 'mongoose';

export interface UserType extends mongoose.Document {
    username: string;
    password: string;
    apartments: Schema.Types.ObjectId[];
    requestedApartments: Schema.Types.ObjectId[];
    selectedApartment?: Schema.Types.ObjectId;
    validatePassword: (password: string) => boolean;
}
