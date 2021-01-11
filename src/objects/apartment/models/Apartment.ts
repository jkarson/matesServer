import mongoose from 'mongoose';
import apartmentSchema from '../schemas/apartmentSchema';
import { ApartmentType } from '../types/ApartmentType';

const Apartment = mongoose.model<ApartmentType>('Apartment', apartmentSchema);
export default Apartment;
