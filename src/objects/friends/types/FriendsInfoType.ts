import { Schema } from 'mongoose';

export interface FriendsInfoType {
    friends: Schema.Types.ObjectId[];
    outgoingRequests: Schema.Types.ObjectId[];
    incomingRequests: Schema.Types.ObjectId[];
}
