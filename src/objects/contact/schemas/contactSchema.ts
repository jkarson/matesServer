import mongoose from 'mongoose';

const { Schema } = mongoose;
const contactSchema = new Schema({
    name: String,
    number: String,
    email: String,
});

export default contactSchema;
