import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    username: String,
    password: String,
    apartments: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
    requestedApartments: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
    selectedApartment: { type: Schema.Types.ObjectId, ref: 'Apartment' },
});

//to do: write this safer
userSchema.methods.validatePassword = function (pwd: string) {
    return this.password === pwd;
};

export default userSchema;
