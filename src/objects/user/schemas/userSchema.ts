import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    username: String,
    password: String,
    apartments: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
    requestedApartments: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
    selectedApartment: { type: Schema.Types.ObjectId, ref: 'Apartment' },
});

export default userSchema;
