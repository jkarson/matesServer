import express from 'express';
import Apartment from '../../../objects/apartment/models/Apartment';
import { UserType } from '../../../objects/user/types/UserType';

const getMatesUser = (req: express.Request, res: express.Response): void => {
    console.log('hi from get');
    const user = req.user as UserType;
    const selectedApartment = user.selectedApartment;
    if (!selectedApartment) {
        console.log('no selected apartment');
        res.json({ ...res.locals, success: false, message: 'No apartment was selected' });
        return;
    }
    //to do: populate events info as needed
    Apartment.findOne({ _id: selectedApartment })
        .populate('profile.requests', 'username')
        .populate('friendsInfo.friends', 'profile tenants')
        .populate('friendsInfo.incomingRequests', 'profile.name tenants.name')
        .populate('friendsInfo.outgoingRequests', 'profile.name tenants.name')
        .populate({
            path: 'eventsInfo.events',
            populate: {
                path: 'invitees attendees',
                select: 'profile.name tenants.name',
            },
        })

        // .populate('eventsInfo.events.invitees', 'profile.name tenants.name')
        //.populate('eventsInfo.events.attendees', 'profile.name tenants.name')
        .populate({
            path: 'eventsInfo.invitations',
            populate: {
                path: 'invitees attendees',
                select: 'profile.name tenants.name',
            },
        })
        //.populate('eventsInfo.invitations.invitees', 'profile.name tenants.name')
        //.populate('eventsInfo.invitations.attendees', 'profile.name tenants.name')
        .exec(function (err, apartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false, message: err });
                return;
            }
            if (!apartment) {
                console.log('apartment not found');
                res.json({ ...res.locals, success: false, message: 'Apartment not found' });
                return;
            }
            console.log('sending json');
            console.log('apartment.eventsInfo.events:');
            console.log(apartment.eventsInfo.events);
            res.json({ ...res.locals, success: true, userId: user.id, apartment: apartment });
            return;
        });
};

export { getMatesUser };
