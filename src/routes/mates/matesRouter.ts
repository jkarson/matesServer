import express from 'express';
import authenticateUser from '../../middleware/authenticateUser';
import {
    addBillsAndUpdateBillGenerators,
    createBillGenerator,
    deleteBill,
    deleteBillSeries,
    deleteOldBills,
    updateAmountsOwed,
} from './api/billsApi';
import {
    addChoresAndUpdateChoreGenerators,
    createChoreGenerator,
    deleteChore,
    deleteChoreSeries,
    deleteOldChores,
    markChoreCompleted,
    markChoreUncompleted,
} from './api/choresApi';
import { addNewContact, deleteContact } from './api/contactsApi';
import {
    acceptEventInvitation,
    createEvent,
    deleteEvent,
    inviteFriendToEvent,
    leaveEvent,
    rejectEventInvitation,
    removeEventAttendee,
    removeEventInvitation,
} from './api/eventsApi';
import {
    acceptFriendRequest,
    deleteFriend,
    deleteIncomingFriendRequest,
    deleteOutgoingFriendRequest,
    searchCodeFriends,
    sendFriendRequest,
} from './api/friendsApi';
import { getMatesUser } from './api/matesApi';
import { deleteMessage, postNewMessage } from './api/messagesApi';
import { updateApartmentProfile, updateTenantProfile, acceptJoinRequest, deleteJoinRequest } from './api/profileApi';
const matesRouter = express.Router();

//Middleware
matesRouter.use(authenticateUser);

//Mates
matesRouter.get('/', getMatesUser);

//Profile
matesRouter.put('/updateApartmentProfile', updateApartmentProfile);
matesRouter.put('/updateTenantProfile', updateTenantProfile);
matesRouter.post('/acceptJoinRequest', acceptJoinRequest);
matesRouter.delete('/deleteJoinRequest', deleteJoinRequest);

//Messages
matesRouter.post('/postNewMessage', postNewMessage);
matesRouter.delete('/deleteMessage', deleteMessage);

//Contacts
matesRouter.post('/addNewContact', addNewContact);
matesRouter.delete('/deleteContact', deleteContact);

//Friends
matesRouter.post('/searchCodeFriends', searchCodeFriends);
matesRouter.post('/sendFriendRequest', sendFriendRequest);
matesRouter.post('/acceptFriendRequest', acceptFriendRequest);
matesRouter.delete('/deleteIncomingFriendRequest', deleteIncomingFriendRequest);
matesRouter.delete('/deleteOutgoingFriendRequest', deleteOutgoingFriendRequest);
matesRouter.delete('/deleteFriend', deleteFriend);

//Bills
matesRouter.post('/createBillGenerator', createBillGenerator);
matesRouter.put('/updateAmountsOwed', updateAmountsOwed);
matesRouter.delete('/deleteBill', deleteBill);
matesRouter.delete('/deleteBillSeries', deleteBillSeries);
matesRouter.post('/addBillsAndUpdateBillGenerators', addBillsAndUpdateBillGenerators);
matesRouter.delete('/deleteOldBills', deleteOldBills);

//Chores
matesRouter.post('/createChoreGenerator', createChoreGenerator);
matesRouter.put('/markChoreCompleted', markChoreCompleted);
matesRouter.put('/markChoreUncompleted', markChoreUncompleted);
matesRouter.delete('/deleteChore', deleteChore);
matesRouter.delete('/deleteChoreSeries', deleteChoreSeries);
matesRouter.post('/addChoresAndUpdateChoreGenerators', addChoresAndUpdateChoreGenerators);
matesRouter.delete('/deleteOldChores', deleteOldChores);

//Events
matesRouter.post('/createEvent', createEvent);
matesRouter.delete('/deleteEvent', deleteEvent);
matesRouter.put('/inviteFriendToEvent', inviteFriendToEvent);
matesRouter.put('/removeEventInvitation', removeEventInvitation);
matesRouter.put('/acceptEventInvitation', acceptEventInvitation);
matesRouter.put('/rejectEventInvitation', rejectEventInvitation);
matesRouter.put('/leaveEvent', leaveEvent);
matesRouter.put('/removeEventAttendee', removeEventAttendee);

export default matesRouter;
