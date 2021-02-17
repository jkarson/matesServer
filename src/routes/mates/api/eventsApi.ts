import express from 'express';
import { Schema } from 'mongoose';
import Apartment from '../../../objects/apartment/models/Apartment';
import Event from '../../../objects/events/models/Event';

const createEvent = (req: express.Request, res: express.Response): void => {
    const { apartmentId, newEvent, inviteeIds } = req.body;
    const event = new Event({ ...newEvent, invitees: inviteeIds });
    event.save(function (err, savedEvent) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        inviteeIds.forEach((id: string) => {
            Apartment.findOne({ _id: id }, function (err, invitee) {
                if (err) {
                    console.error(err);
                    return;
                }
                if (!invitee) {
                    console.log('invitee not found');
                    return;
                }
                invitee.eventsInfo.invitations.push(savedEvent._id);
                invitee.save(function (err) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
            });
        });
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
            userApartment.eventsInfo.events.push(savedEvent._id);
            userApartment.save(function (err, savedApartment) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                savedApartment
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
                    .execPopulate(function (err, populatedApartment) {
                        if (err) {
                            console.error(err);
                            res.json({ ...res.locals, success: false });
                            return;
                        }
                        res.json({
                            ...res.locals,
                            success: true,
                            eventsInfo: populatedApartment.eventsInfo,
                            newEventId: savedEvent._id,
                        });
                    });
            });
        });
    });
};

const deleteEvent = (req: express.Request, res: express.Response): void => {
    const { apartmentId, eventId } = req.body;
    Event.findOneAndDelete({ _id: eventId }, function (err, deletedEvent) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!deletedEvent) {
            console.log('event was not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        const { attendees, invitees, _id } = deletedEvent;

        deleteEventFromUserApartment(apartmentId, _id, res);
        attendees.map((attendee) => deleteEventFromApartment(attendee, _id));
        invitees.map((invitee) => deleteEventFromApartment(invitee, _id));
    });
};

const deleteEventFromUserApartment = (
    apartmentId: Schema.Types.ObjectId,
    eventId: Schema.Types.ObjectId,
    res: express.Response,
) => {
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
        const deletedEventIndex = userApartment.eventsInfo.events.findIndex(
            (id) => id.toString() === eventId.toString(),
        );
        if (deletedEventIndex === -1) {
            console.log('deleted event not found');
            res.json({ ...res.locals, success: false });
            return;
        } else {
            userApartment.eventsInfo.events.splice(deletedEventIndex, 1);
        }
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            savedUserApartment
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
                .execPopulate(function (err, populatedApartment) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    res.json({ ...res.locals, success: true, eventsInfo: populatedApartment.eventsInfo });
                });
        });
    });
};

const deleteEventFromApartment = (apartmentId: Schema.Types.ObjectId, eventId: Schema.Types.ObjectId) => {
    Apartment.findOne({ _id: apartmentId }, function (err, apartment) {
        if (err) {
            console.error(err);
            return;
        }
        if (!apartment) {
            console.log('non-user apartment not found');
            return;
        }
        const deletedEventIndex = apartment.eventsInfo.events.findIndex((id) => id.toString() === eventId.toString());
        if (deletedEventIndex === -1) {
            console.log('deleted event not found');
        } else {
            apartment.eventsInfo.events.splice(deletedEventIndex, 1);
        }
        apartment.save(function (err) {
            if (err) {
                console.error(err);
                return;
            }
            return true;
        });
    });
};

const inviteFriendToEvent = (req: express.Request, res: express.Response): void => {
    const { apartmentId, eventId, inviteeId } = req.body;
    Apartment.findOne({ _id: inviteeId }, function (err, inviteeApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!inviteeApartment) {
            console.log('invitee apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        Event.findOne({ _id: eventId }, function (err, event) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            if (!event) {
                console.log('event not found');
                res.json({ ...res.locals, success: false });
                return;
            }
            event.invitees.push(inviteeApartment._id);
            inviteeApartment.eventsInfo.invitations.push(event._id);
            event.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                inviteeApartment.save(function (err) {
                    if (err) {
                        console.error(err);
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
                        userApartment
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
                            .execPopulate(function (err, populatedApartment) {
                                if (err) {
                                    console.error(err);
                                    res.json({ ...res.locals, success: false });
                                    return;
                                }
                                res.json({ ...res.locals, success: true, eventsInfo: populatedApartment.eventsInfo });
                            });
                    });
                });
            });
        });
    });
};

const removeEventInvitation = (req: express.Request, res: express.Response): void => {
    const { apartmentId, eventId, inviteeId } = req.body;
    Event.findOne({ _id: eventId }, function (err, event) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!event) {
            console.log('event not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        Apartment.findOne({ _id: inviteeId }, function (err, inviteeApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            if (!inviteeApartment) {
                console.log('invitee apartment not found');
                res.json({ ...res.locals, success: false });
                return;
            }
            const eventInvitationIndex = inviteeApartment.eventsInfo.invitations.findIndex(
                (id) => id.toString() === event._id.toString(),
            );
            const inviteeIndex = event.invitees.findIndex((id) => id.toString() === inviteeApartment._id.toString());

            if (eventInvitationIndex === -1 || inviteeIndex === -1) {
                console.log('event not found on invitee or vice versa');
                res.json({ ...res.locals, success: false });
                return;
            } else {
                inviteeApartment.eventsInfo.invitations.splice(eventInvitationIndex, 1);
                event.invitees.splice(inviteeIndex, 1);
            }
            inviteeApartment.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                event.save(function (err) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    Apartment.findOne({ _id: apartmentId })
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
                        .exec(function (err, populatedUserApartment) {
                            if (err) {
                                console.error(err);
                                res.json({ ...res.locals, success: false });
                                return;
                            }
                            if (!populatedUserApartment) {
                                console.log('user apartment not found');
                                res.json({ ...res.locals, success: false });
                                return;
                            }
                            res.json({ ...res.locals, success: true, eventsInfo: populatedUserApartment.eventsInfo });
                        });
                });
            });
        });
    });
};

const acceptEventInvitation = (req: express.Request, res: express.Response): void => {
    const { apartmentId, eventId } = req.body;
    Event.findOne({ _id: eventId }, function (err, event) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!event) {
            console.log('event not found');
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
            const userApartmentIndex = event.invitees.findIndex((id) => id.toString() === userApartment._id.toString());
            const eventInvitationIndex = userApartment.eventsInfo.invitations.findIndex(
                (id) => id.toString() === event._id.toString(),
            );
            if (userApartmentIndex === -1 || eventInvitationIndex === -1) {
                console.log('user apartment not found on event invitee list or vice versa');
                res.json({ ...res.locals, success: false });
                return;
            } else {
                event.invitees.splice(userApartmentIndex, 1);
                userApartment.eventsInfo.invitations.splice(eventInvitationIndex, 1);
            }

            event.attendees.push(userApartment._id);
            userApartment.eventsInfo.events.push(event._id);
            event.save(function (err, savedEvent) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                userApartment.save(function (err, savedUserApartment) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    savedUserApartment
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
                        .execPopulate(function (err, populatedUserApartment) {
                            if (err) {
                                console.error(err);
                                res.json({ ...res.locals, success: false });
                                return;
                            }
                            res.json({
                                ...res.locals,
                                success: true,
                                eventsInfo: populatedUserApartment.eventsInfo,
                                newEventId: savedEvent._id,
                            });
                        });
                });
            });
        });
    });
};

const rejectEventInvitation = (req: express.Request, res: express.Response): void => {
    const { apartmentId, eventId } = req.body;
    Event.findOne({ _id: eventId }, function (err, event) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!event) {
            console.log('event not found');
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

            const apartmentInvitationIndex = event.invitees.findIndex(
                (id) => id.toString() === userApartment._id.toString(),
            );
            const eventIndex = userApartment.eventsInfo.invitations.findIndex(
                (id) => id.toString() === event._id.toString(),
            );
            if (apartmentInvitationIndex === -1 || eventIndex === -1) {
                console.log('user apartment not found on event or vice versa');
                res.json({ ...res.locals, success: false });
                return;
            } else {
                event.invitees.splice(apartmentInvitationIndex, 1);
                userApartment.eventsInfo.invitations.splice(eventIndex, 1);
            }

            event.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                userApartment.save(function (err, savedUserApartment) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    savedUserApartment
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
                        .execPopulate(function (err, populatedUserApartment) {
                            if (err) {
                                console.error(err);
                                res.json({ ...res.locals, success: false });
                                return;
                            }
                            res.json({ ...res.locals, success: true, eventsInfo: populatedUserApartment.eventsInfo });
                        });
                });
            });
        });
    });
};

const leaveEvent = (req: express.Request, res: express.Response): void => {
    const { apartmentId, eventId } = req.body;
    Event.findOne({ _id: eventId }, function (err, event) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!event) {
            console.log('event not found');
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
            const userApartmentIndex = event.attendees.findIndex(
                (id) => id.toString() === userApartment._id.toString(),
            );
            const eventIndex = userApartment.eventsInfo.events.findIndex(
                (id) => id.toString() === event._id.toString(),
            );
            if (userApartmentIndex === -1 || eventIndex === -1) {
                console.log('user apartment not found on event or vice versa');
                res.json({ ...res.locals, success: false });
                return;
            } else {
                event.attendees.splice(userApartmentIndex, 1);
                userApartment.eventsInfo.events.splice(eventIndex, 1);
            }

            event.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                userApartment.save(function (err, savedUserApartment) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    savedUserApartment
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
                        .execPopulate(function (err, populatedUserApartment) {
                            if (err) {
                                console.error(err);
                                res.json({ ...res.locals, success: false });
                                return;
                            }
                            res.json({ ...res.locals, success: true, eventsInfo: populatedUserApartment.eventsInfo });
                        });
                });
            });
        });
    });
};

const removeEventAttendee = async (req: express.Request, res: express.Response): Promise<void> => {
    const { apartmentId, eventId, attendeeId } = req.body;
    Event.findOne({ _id: eventId }, function (err, event) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!event) {
            console.log('event not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        Apartment.findOne({ _id: attendeeId }, function (err, attendeeApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            if (!attendeeApartment) {
                console.log('attendee apartment not found');
                res.json({ ...res.locals, success: false });
                return;
            }

            const eventIndex = attendeeApartment.eventsInfo.events.findIndex(
                (id) => id.toString() === event._id.toString(),
            );
            const attendeeIndex = event.attendees.findIndex((id) => id.toString() === attendeeApartment._id.toString());

            if (eventIndex === -1 || attendeeIndex === -1) {
                console.log('event not found on attendee or vice versa');
                res.json({ ...res.locals, success: false });
                return;
            } else {
                attendeeApartment.eventsInfo.events.splice(eventIndex, 1);
                event.attendees.splice(attendeeIndex, 1);
            }

            attendeeApartment.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                event.save(function (err) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    Apartment.findOne({ _id: apartmentId })
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
                        .exec(function (err, populatedUserApartment) {
                            if (err) {
                                console.error(err);
                                res.json({ ...res.locals, success: false });
                                return;
                            }
                            if (!populatedUserApartment) {
                                console.log('user apartment not found');
                                res.json({ ...res.locals, success: false });
                                return;
                            }
                            res.json({ ...res.locals, success: true, eventsInfo: populatedUserApartment.eventsInfo });
                        });
                });
            });
        });
    });
};

export {
    createEvent,
    deleteEvent,
    inviteFriendToEvent,
    removeEventInvitation,
    acceptEventInvitation,
    rejectEventInvitation,
    leaveEvent,
    removeEventAttendee,
};
