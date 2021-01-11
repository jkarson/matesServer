import { Schema } from 'mongoose';
import { ApartmentType } from '../apartment/ApartmentType';

export interface FriendsInfoType {
    friends: Schema.Types.ObjectId[];
    outgoingRequests: Schema.Types.ObjectId[];
    incomingRequests: Schema.Types.ObjectId[];
}
