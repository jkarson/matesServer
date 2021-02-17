import express from 'express';
import Apartment from '../../objects/apartment/models/Apartment';
import { ApartmentType } from '../../objects/apartment/types/ApartmentType';
import { TenantType } from '../../objects/tenant/types/TenantType';
import User from '../../objects/user/models/User';
import { UserType } from '../../objects/user/types/UserType';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sh = require('shorthash');

const getAccountInfo = (req: express.Request, res: express.Response): void => {
    const user = req.user as UserType;
    User.findOne({ _id: user.id })
        .populate({
            path: 'apartments',
            select: 'profile.name tenants.name',
        })
        .populate({
            path: 'requestedApartments',
            select: 'profile.name tenants.name',
        })
        .populate({
            path: 'selectedApartment',
            select: 'profile.name',
        })
        .exec(function (err, result) {
            if (err) {
                console.error(err);
            } else if (!result) {
                console.error('User Not Found');
            } else {
                const resultApartments = (result.apartments as unknown) as ApartmentType[];

                const formattedApartments = resultApartments.map((apartment) => {
                    const tenants = apartment.tenants as TenantType[];
                    const tenantNames = tenants.map((tenant) => tenant.name);
                    return {
                        apartmentId: apartment.id,
                        name: apartment.profile.name,
                        tenantNames: tenantNames,
                    };
                });

                const resultRequestedApartments = (result.requestedApartments as unknown) as ApartmentType[];

                const formattedRequestedApartments = resultRequestedApartments.map((apartment) => {
                    const tenants = apartment.tenants as TenantType[];
                    const tenantNames = tenants.map((tenant) => tenant.name);
                    return {
                        apartmentId: apartment.id,
                        name: apartment.profile.name,
                        tenantNames: tenantNames,
                    };
                });

                let selectedApartmentName: string | null = null;
                if (result.selectedApartment) {
                    const selectedApartment = (result.selectedApartment as unknown) as ApartmentType;
                    selectedApartmentName = selectedApartment.profile.name;
                }

                res.json({
                    ...res.locals,
                    user: {
                        _id: result._id,
                        username: result.username,
                        apartments: formattedApartments,
                        requestedApartments: formattedRequestedApartments,
                        selectedApartmentName: selectedApartmentName,
                    },
                });
            }
        });
};

const createApartment = (req: express.Request, res: express.Response): void => {
    const { apartmentName, address, quote, tenantName, age, email, number } = req.body;
    const user = req.user as UserType;
    const newApartment: ApartmentType = new Apartment({
        tenants: [
            {
                userId: user._id,
                name: tenantName,
                age: age,
                email: email,
                number: number,
            },
        ],
        profile: {
            code: 'TBD',
            name: apartmentName,
            address: address,
            quote: quote,
            requests: [],
        },
        friendsInfo: {
            friends: [],
            outgoingRequests: [],
            incomingRequests: [],
        },
        eventsInfo: {
            events: [],
            invitations: [],
        },
        messages: [],
        manuallyAddedContacts: [],
        choresInfo: {
            choreGenerators: [],
            chores: [],
        },
        billsInfo: {
            billGenerators: [],
            bills: [],
        },
    });
    newApartment.profile.code = sh.unique(newApartment.id);
    newApartment.save(function (err, apartment) {
        if (err || !apartment) {
            console.error(err || 'Unknown Error: Could not save new apartment');
            res.json({ ...res.locals, success: false });
            return;
        }
        user.apartments.push(apartment._id);
        user.save(function (err, updatedUser) {
            if (err || !updatedUser) {
                console.error(err || 'Unknown Error: Could not save updated user');
                res.json({ ...res.locals, success: false });
                return;
            }
            res.locals.success = true;
            getAccountInfo(req, res);
        });
    });
};

const searchCode = (req: express.Request, res: express.Response): void => {
    const { code } = req.body;
    Apartment.findOne({ 'profile.code': code })
        .select('tenants profile')
        .exec(function (err, apartment) {
            if (err) {
                console.log(err);
                res.json({ ...res.locals, apartment: false });
                return;
            }
            if (!apartment) {
                console.log('code not found');
                res.json({ ...res.locals, apartment: false });
                return;
            }
            const user = req.user as UserType;
            if (user.apartments.includes(apartment._id) || user.requestedApartments.includes(apartment._id)) {
                res.json({ ...res.locals, apartment: false });
                return;
            }
            const tenantNames = apartment.tenants.map((tenant) => {
                const tenant_type = tenant as TenantType;
                return tenant_type.name;
            });
            res.json({
                ...res.locals,
                apartment: {
                    apartmentId: apartment.id,
                    name: apartment.profile.name,
                    tenantNames: tenantNames,
                },
            });
            return;
        });
};

const requestToJoin = (req: express.Request, res: express.Response): void => {
    const { apartmentId } = req.body;
    const user = req.user as UserType;
    Apartment.findOne({ _id: apartmentId }, function (err, apartment) {
        if (err) {
            console.error(err);
            res.json({ success: false, message: err });
            return;
        }
        if (!apartment) {
            res.json({ success: false, message: 'Apartment not found' });
            return;
        }
        apartment.profile.requests.push(user._id);
        apartment.save(function (err, savedApartment) {
            if (err) {
                console.error(err);
                res.json({ sucess: false, message: err });
                return;
            }
            user.requestedApartments.push(savedApartment._id);
            user.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ success: false, message: err });
                    return;
                }
                res.locals.success = true;
                getAccountInfo(req, res);
            });
        });
    });
};

const viewApartment = (req: express.Request, res: express.Response): void => {
    const { apartmentId } = req.body;
    const user = req.user as UserType;
    Apartment.findOne({ _id: apartmentId }, function (err, apartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false, message: err });
            return;
        }
        if (!apartment) {
            res.json({ ...res.locals, success: false, message: 'Apartment not found' });
            return;
        }
        user.selectedApartment = apartment._id;
        user.save(function (err) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false, message: err });
                return;
            }
            res.json({ ...res.locals, success: true, user: user });
        });
    });
};

const cancelJoinRequest = (req: express.Request, res: express.Response): void => {
    const { userId, requestedApartmentId } = req.body;
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
        Apartment.findOne({ _id: requestedApartmentId }, function (err, requestedApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            if (!requestedApartment) {
                console.log('requested apartment not found');
                res.json({ ...res.locals, success: false });
                return;
            }

            const userIndex = requestedApartment.profile.requests.findIndex(
                (id) => id.toString() === user._id.toString(),
            );
            const joinRequestIndex = user.requestedApartments.findIndex(
                (id) => id.toString() === requestedApartment._id.toString(),
            );
            if (userIndex === -1 || joinRequestIndex === -1) {
                console.log('user request not found on requested apartment or vice versa');
                res.json({ ...res.locals, success: false });
                return;
            } else {
                requestedApartment.profile.requests.splice(userIndex, 1);
                user.requestedApartments.splice(joinRequestIndex, 1);
            }
            requestedApartment.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                user.save(function (err) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    res.locals.success = true;
                    getAccountInfo(req, res);
                });
            });
        });
    });
};

const leaveApartment = (req: express.Request, res: express.Response): void => {
    const { userId, apartmentId } = req.body;
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
        Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            if (!userApartment) {
                console.log('user apartment not found');
                res.json({ ...res.locals, success: false });
                return;
            }
            const apartmentIndex = user.apartments.findIndex((id) => id.toString() === userApartment._id.toString());
            const userTenantIndex = userApartment.tenants.findIndex(
                (tenant) => tenant.userId.toString() === user._id.toString(),
            );
            if (apartmentIndex === -1 || userTenantIndex === -1) {
                console.log('apartment not found on user or vice versa');
                res.json({ ...res.locals, success: false });
                return;
            } else {
                user.apartments.splice(apartmentIndex, 1);
                userApartment.tenants.splice(userTenantIndex, 1);
            }

            if (user.selectedApartment && user.selectedApartment.toString() === userApartment._id.toString()) {
                user.selectedApartment = undefined;
            }

            userApartment.save(function (err, savedUserApartment) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                user.save(function (err) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    res.locals.success = true;
                    getAccountInfo(req, res);
                    deleteApartmentIfEmpty(savedUserApartment);
                });
            });
        });
    });
};

export const deleteApartmentIfEmpty = (apartment: ApartmentType): void => {
    if (apartment.tenants.length === 0) {
        Apartment.findOneAndDelete({ _id: apartment._id }, function (err, result) {
            if (err) {
                console.error(err);
                return;
            }
            if (!result) {
                console.log('apartment not found for deletion');
                return;
            }
            deletePointersToDeletedApartment(result);
        });
    }
};

const deletePointersToDeletedApartment = (apartment: ApartmentType) => {
    apartment.profile.requests.forEach((requesterId) => {
        User.findOne({ _id: requesterId }, function (err, user) {
            if (err) {
                console.error(err);
                return;
            }
            if (!user) {
                console.log('user not found');
                return;
            }
            const apartmentIndex = user.requestedApartments.findIndex(
                (apartmentId) => apartmentId.toString() === apartment._id.toString(),
            );
            if (apartmentIndex === -1) {
                console.log('request not found on user');
            } else {
                user.requestedApartments.splice(apartmentIndex, 1);
            }
            user.save(function (err) {
                if (err) {
                    console.error(err);
                }
            });
        });
    });
    apartment.friendsInfo.friends.forEach((friendId) => {
        Apartment.findOne({ _id: friendId }, function (err, friend) {
            if (err) {
                console.error(err);
                return;
            }
            if (!friend) {
                console.log('friend not found');
                return;
            }
            const friendIndex = friend.friendsInfo.friends.findIndex(
                (id) => id.toString() === apartment._id.toString(),
            );
            if (friendIndex === -1) {
                console.log('apartment not found on friend');
            } else {
                friend.friendsInfo.friends.splice(friendIndex, 1);
            }
            friend.save(function (err) {
                if (err) {
                    console.error(err);
                }
            });
        });
    });
    apartment.friendsInfo.incomingRequests.forEach((incomingRequest) => {
        Apartment.findOne({ _id: incomingRequest }, function (err, requester) {
            if (err) {
                console.error(err);
                return;
            }
            if (!requester) {
                console.log('requester not found');
                return;
            }
            const apartmentIndex = requester.friendsInfo.outgoingRequests.findIndex(
                (id) => id.toString() === apartment._id.toString(),
            );
            if (apartmentIndex === -1) {
                console.log('apartment not found on requester');
            } else {
                requester.friendsInfo.outgoingRequests.splice(apartmentIndex, 1);
            }
            requester.save(function (err) {
                if (err) {
                    console.error(err);
                }
            });
        });
    });
    apartment.friendsInfo.outgoingRequests.forEach((outgoingRequest) => {
        Apartment.findOne({ _id: outgoingRequest }, function (err, requested) {
            if (err) {
                console.error(err);
                return;
            }
            if (!requested) {
                console.log('requested apartment not found');
                return;
            }
            const apartmentIndex = requested.friendsInfo.incomingRequests.findIndex(
                (id) => id.toString() === apartment._id.toString(),
            );
            if (apartmentIndex === -1) {
                console.log('apartment not found on requested');
            } else {
                requested.friendsInfo.incomingRequests.splice(apartmentIndex, 1);
            }
            requested.save(function (err) {
                if (err) {
                    console.error(err);
                }
            });
        });
    });
};

export { getAccountInfo, createApartment, searchCode, requestToJoin, viewApartment, cancelJoinRequest, leaveApartment };
