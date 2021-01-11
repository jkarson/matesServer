import mongoose from 'mongoose';
import { mongo_uri } from '../constants';
import Apartment from '../objects/apartment/models/Apartment';
import Event from '../objects/events/models/Event';
import User from '../objects/user/models/User';

const configureMongoose = (): void => {
    console.log('configuring mongoose');
    mongoose
        .connect(mongo_uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('mongoose connected to remote mongo isntance');
            compileModels();
        })
        .catch((error) => console.error(error));
};

//Note: models are automatically compiled whenever they are
//imported, as their definitions contain the call to
//mongoose.model(). Listing models here guarantees that they are
//compiled, but this isn't strictly necessary if all models
//are namespaced organically, which I would imagine they would be
const compileModels = () => {
    console.log('compiling mongoose models');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const models = [Apartment, User, Event];
};

export default configureMongoose;
