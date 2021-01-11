import mongoose from 'mongoose';
import billsInfoSchema from '../../bills/schemas/billsInfoSchema';
import choresInfoSchema from '../../chores/schemas/choresInfoSchema';
import contactSchema from '../../contact/schemas/contactSchema';
import eventsInfoSchema from '../../events/schemas/eventsInfoSchema';
import friendsInfoSchema from '../../friends/schemas/friendsInfoSchema';
import messageSchema from '../../message/schemas/messageSchema';
import profileSchema from '../../profile/schemas/profileSchema';
import tenantSchema from '../../tenant/schemas/tenantSchema';

const { Schema } = mongoose;
const apartmentSchema = new Schema({
    tenants: [tenantSchema],
    profile: profileSchema,
    friendsInfo: friendsInfoSchema,
    eventsInfo: eventsInfoSchema,
    messages: [messageSchema],
    manuallyAddedContacts: [contactSchema],
    choresInfo: choresInfoSchema,
    billsInfo: billsInfoSchema,
});

export default apartmentSchema;
