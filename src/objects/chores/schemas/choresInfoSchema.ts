import mongoose from 'mongoose';
import choreGeneratorSchema from './choreGeneratorSchema';
import choreSchema from './choreSchema';

const { Schema } = mongoose;
const choresInfoSchema = new Schema({
    choreGenerators: [choreGeneratorSchema],
    chores: [choreSchema],
});

export default choresInfoSchema;
