import mongoose from 'mongoose';
import { mongo_uri } from '../constants';

const configureMongoose = (): void => {
    console.log('configuring mongoose');
    mongoose
        .connect(mongo_uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('mongoose connected to remote mongo isntance');
        })
        .catch((error) => console.error(error));
};

export default configureMongoose;
