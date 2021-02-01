import express from 'express';
import Apartment from '../../../objects/apartment/models/Apartment';
import { ApartmentType } from '../../../objects/apartment/types/ApartmentType';
import User from '../../../objects/user/models/User';
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
        .populate({
            path: 'eventsInfo.invitations',
            populate: {
                path: 'invitees attendees',
                select: 'profile.name tenants.name',
            },
        })
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
            res.json({ ...res.locals, success: true, userId: user.id, username: user.username, apartment: apartment });
            return;
        });
};

const logOutOfApartment = (req: express.Request, res: express.Response): void => {
    const { userId } = req.body;
    User.findOne({ _id: userId }, function (err, user) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!user) {
            console.log('user not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('user found');
        user.selectedApartment = undefined;
        user.save(function (err) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            res.json({ ...res.locals, success: true });
        });
    });
};

export { getMatesUser, logOutOfApartment };
