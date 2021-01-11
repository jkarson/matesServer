import mongoose from 'mongoose';
import userSchema from '../schemas/userSchema';
import { UserType } from '../types/UserType';

const User = mongoose.model<UserType>('User', userSchema);

export default User;
