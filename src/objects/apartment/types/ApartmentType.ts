import mongoose from 'mongoose';
import { BillsInfoType } from '../../bills/types/BillsInfoType';
import { ChoresInfoType } from '../../chores/types/ChoresInfoType';
import { ContactType } from '../../contact/types/ContactType';
import { EventsInfoType } from '../../events/types/EventsInfoType';
import { FriendsInfoType } from '../../friends/types/FriendsInfoType';
import { MessageType } from '../../message/types/MessageType';
import { ProfileType } from '../../profile/types/ProfileType';
import { TenantType } from '../../tenant/types/TenantType';

export interface ApartmentType extends mongoose.Document {
    tenants: TenantType[];
    profile: ProfileType;
    friendsInfo: FriendsInfoType;
    eventsInfo: EventsInfoType;
    messages: MessageType[];
    manuallyAddedContacts: ContactType[];
    choresInfo: ChoresInfoType;
    billsInfo: BillsInfoType;
}
