import express from 'express';
import Apartment from '../../../objects/apartment/models/Apartment';

const searchCodeFriends = (req: express.Request, res: express.Response): void => {
    console.log(req.body);
    const { apartmentId, code } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log("cannot find user's apartment");
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('user apartment found');
        Apartment.findOne({ 'profile.code': code }, function (err, codeApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            if (!codeApartment) {
                console.log('Code not found');
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('code apartment found');
            const codeApartmentId = codeApartment._id.toString();
            if (codeApartmentId === userApartment._id.toString()) {
                console.log('cannot add your own apartment as friend');
                res.json({ ...res.locals, success: false });
                return;
            }
            if (userApartment.friendsInfo.friends.find((apartmentId) => apartmentId.toString() === codeApartmentId)) {
                console.log('cannot add a friend as a friend.');
                res.json({ ...res.locals, success: false });
                return;
            }
            if (
                userApartment.friendsInfo.incomingRequests.find(
                    (apartmentId) => apartmentId.toString() === codeApartmentId,
                )
            ) {
                console.log('apartment has already requested to be your friend');
                res.json({ ...res.locals, success: false });
                return;
            }
            if (
                userApartment.friendsInfo.outgoingRequests.find(
                    (apartmentId) => apartmentId.toString() === codeApartmentId,
                )
            ) {
                console.log('you have already requested this apartment as a friend');
                res.json({ ...res.locals, success: false });
                return;
            }
            const codeApartmentTenantNames = codeApartment.tenants.map((tenant) => tenant.name);
            const codeApartmentSummary = {
                apartmentId: codeApartment._id,
                name: codeApartment.profile.name,
                tenantNames: codeApartmentTenantNames,
            };
            res.json({ ...res.locals, success: true, apartmentSummary: codeApartmentSummary });
            return;
        });
    });
};

const sendFriendRequest = (req: express.Request, res: express.Response): void => {
    console.log('hi from send friend request');
    const { userApartmentId, requesteeApartmentId } = req.body;
    console.log(req.body);
    Apartment.findOne({ _id: userApartmentId }, function (err, userApartment) {
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
        console.log('user apartment found');
        Apartment.findOne({ _id: requesteeApartmentId }, function (err, requestedApartment) {
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
            console.log('requested apartment found');
            requestedApartment.friendsInfo.incomingRequests.push(userApartment._id);
            requestedApartment.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                }
                console.log('requested apartment saved');
                userApartment.friendsInfo.outgoingRequests.push(requestedApartment._id);
                userApartment.save(function (err, resultApartment) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    console.log('user apartment saved');
                    resultApartment
                        .populate({ path: 'friendsInfo.outgoingRequests', select: 'profile.name tenants.name' })
                        .execPopulate(function (err, populated) {
                            if (err) {
                                console.error(err);
                                res.json({ ...res.locals, success: false });
                                return;
                            }
                            res.json({
                                ...res.locals,
                                success: true,
                                newOutgoingRequests: populated.friendsInfo.outgoingRequests,
                            });
                        });
                });
            });
        });
    });
};

const acceptFriendRequest = (req: express.Request, res: express.Response): void => {
    const { userApartmentId, friendApartmentId } = req.body;
    console.log('searching for user apartment');
    Apartment.findOne({ _id: userApartmentId }, function (err, userApartment) {
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
        console.log('user apartment found');
        console.log('searching for friend apartment');
        Apartment.findOne({ _id: friendApartmentId }, function (err, friendApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            if (!friendApartment) {
                console.log('friend apartment not found');
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('friend apartment found');
            const requestIndex = friendApartment.friendsInfo.outgoingRequests.findIndex(
                (request) => request.toString() === userApartment._id.toString(),
            );
            if (requestIndex === -1) {
                console.log('Outgoing request not found');
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('adjusting friend apartment');
            friendApartment.friendsInfo.outgoingRequests.splice(requestIndex, 1);
            friendApartment.friendsInfo.friends.push(userApartment._id);
            console.log('attmepting to save friend apartment');
            friendApartment.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                console.log('friend apartment saved');
                const requestIndex = userApartment.friendsInfo.incomingRequests.findIndex(
                    (request) => request.toString() === friendApartment._id.toString(),
                );
                if (requestIndex === -1) {
                    console.log('incoming request that was accepted no longer found');
                    res.json({ ...res.locals, success: false });
                    return;
                }
                console.log('adjusting user apartment');
                userApartment.friendsInfo.incomingRequests.splice(requestIndex, 1);
                userApartment.friendsInfo.friends.push(friendApartment._id);
                console.log('attempting to save user apartment');
                userApartment.save(function (err, resultUserApartment) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    console.log('user apartment saved');
                    console.log('attempting to populate friendsInfo');
                    resultUserApartment
                        .populate({
                            path: 'friendsInfo.incomingRequests',
                            select: 'profile.name tenants.name',
                        })
                        .populate({
                            path: 'friendsInfo.friends',
                            select: 'profile tenants',
                        })
                        .execPopulate(function (err, result) {
                            if (err) {
                                console.error(err);
                                res.json({ ...res.locals, success: false });
                                return;
                            }
                            console.log('success, sending json');
                            res.json({
                                ...res.locals,
                                success: true,
                                friends: result.friendsInfo.friends,
                                incomingRequests: result.friendsInfo.incomingRequests,
                            });
                        });
                });
            });
        });
    });
};

const deleteIncomingFriendRequest = (req: express.Request, res: express.Response): void => {
    const { userApartmentId, requestApartmentId } = req.body;
    Apartment.findOne({ _id: userApartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('User Apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        const requestIndex = userApartment.friendsInfo.incomingRequests.findIndex(
            (request) => request.toString() === requestApartmentId,
        );
        if (requestIndex === -1) {
            console.log('request not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('updating user apartment');
        userApartment.friendsInfo.incomingRequests.splice(requestIndex, 1);
        userApartment.save(function (err, resultUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
            resultUserApartment.populate(
                {
                    path: 'friendsInfo.incomingRequests',
                    select: 'profile.name tenants.name',
                },
                function (err, populatedResult) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    res.json({
                        ...res.locals,
                        success: true,
                        incomingRequests: populatedResult.friendsInfo.incomingRequests,
                    });
                    Apartment.findOne({ _id: requestApartmentId }, function (err, requestingApartment) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        if (!requestingApartment) {
                            console.log('requesting apartment not found');
                            return;
                        }
                        console.log('requesting apartment found');
                        const requestIndex = requestingApartment.friendsInfo.outgoingRequests.findIndex(
                            (req) => req.toString() === userApartment._id.toString(),
                        );
                        if (requestIndex === -1) {
                            console.log('outgoing request no longer exists');
                            return;
                        }
                        requestingApartment.friendsInfo.outgoingRequests.splice(requestIndex, 1);
                        requestingApartment.save(function (err) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            console.log('requesting apartment updated as well');
                        });
                    });
                },
            );
        });
    });
};

const deleteOutgoingFriendRequest = (req: express.Request, res: express.Response): void => {
    const { userApartmentId, requestApartmentId } = req.body;
    Apartment.findOne({ _id: userApartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('User Apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        const requestIndex = userApartment.friendsInfo.outgoingRequests.findIndex(
            (request) => request.toString() === requestApartmentId.toString(),
        );
        if (requestIndex === -1) {
            console.log('request not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('updating user apartment');
        userApartment.friendsInfo.outgoingRequests.splice(requestIndex, 1);
        userApartment.save(function (err, resultUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
            resultUserApartment.populate(
                {
                    path: 'friendsInfo.outgoingRequests',
                    select: 'profile.name tenants.name',
                },
                function (err, populatedResult) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    res.json({
                        ...res.locals,
                        success: true,
                        outgoingRequests: populatedResult.friendsInfo.outgoingRequests,
                    });
                    Apartment.findOne({ _id: requestApartmentId }, function (err, requestedApartment) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        if (!requestedApartment) {
                            console.log('requested apartment not found');
                            return;
                        }
                        console.log('requested apartment found');
                        const requestIndex = requestedApartment.friendsInfo.incomingRequests.findIndex(
                            (req) => req.toString() === userApartment._id.toString(),
                        );
                        if (requestIndex === -1) {
                            console.log('outgoing request no longer exists');
                            return;
                        }
                        requestedApartment.friendsInfo.incomingRequests.splice(requestIndex, 1);
                        requestedApartment.save(function (err) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            console.log('requesting apartment updated as well');
                        });
                    });
                },
            );
        });
    });
};

const deleteFriend = (req: express.Request, res: express.Response): void => {
    const { apartmentId, friendApartmentId } = req.body;
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
        console.log('user apartment found');
        const friendshipIndex = userApartment.friendsInfo.friends.findIndex(
            (friend) => friend.toString() === friendApartmentId.toString(),
        );
        if (friendshipIndex === -1) {
            console.log('friendship not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        userApartment.friendsInfo.friends.splice(friendshipIndex, 1);
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            savedUserApartment
                .populate({
                    path: 'friendsInfo.friends',
                    select: 'profile tenants',
                })
                .execPopulate(function (err, populated) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    console.log('friend deleted from user, sending json');
                    res.json({ ...res.locals, success: true, friends: populated.friendsInfo.friends });
                    Apartment.findOne({ _id: friendApartmentId }, function (err, friendApartment) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        if (!friendApartment) {
                            console.log('friend apartment not found');
                            return;
                        }
                        console.log('friend apartment found');
                        const friendIndex = friendApartment.friendsInfo.friends.findIndex(
                            (friend) => friend.toString() === userApartment._id.toString(),
                        );
                        if (friendIndex === -1) {
                            console.log('friendship already does not exist on friend');
                            return;
                        }
                        friendApartment.friendsInfo.friends.splice(friendIndex, 1);
                        friendApartment.save(function (err) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            console.log('friendship removed from friend, too');
                        });
                    });
                });
        });
    });
};

export {
    searchCodeFriends,
    sendFriendRequest,
    acceptFriendRequest,
    deleteIncomingFriendRequest,
    deleteOutgoingFriendRequest,
    deleteFriend,
};
