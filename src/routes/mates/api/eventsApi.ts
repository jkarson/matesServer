import express from 'express';
import { Schema } from 'mongoose';
import Apartment from '../../../objects/apartment/models/Apartment';
import Event from '../../../objects/events/models/Event';
import { EventType } from '../../../objects/events/types/EventType';

const createEvent = (req: express.Request, res: express.Response): void => {
    const { apartmentId, newEvent, inviteeIds } = req.body;
    const event = new Event({ ...newEvent, invitees: inviteeIds });
    event.save(function (err, savedEvent) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        inviteeIds.forEach((id: any) => {
            Apartment.findOne({ _id: id }, function (err, invitee) {
                if (err) {
                    console.error(err);
                    return;
                }
                if (!invitee) {
                    console.log('invitee not found');
                    return;
                }
                console.log('invitee found');
                invitee.eventsInfo.invitations.push(savedEvent._id);
                invitee.save(function (err) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('event invitation saved on invitee');
                });
            });
        });
        console.log('event created');
        console.log('event:');
        console.log(savedEvent);
        console.log('searching for user apartment');
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
            console.log('adding new event');
            userApartment.eventsInfo.events.push(savedEvent._id);
            console.log('saving apartment');
            userApartment.save(function (err, savedApartment) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                console.log('user apartment saved');
                console.log('populating events');
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
                        console.log('apartment populated:');
                        console.log(populatedApartment);
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
        console.log('event was deleted:');
        console.log(deletedEvent);
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
        console.log('user apartment found');
        const deletedEventIndex = userApartment.eventsInfo.events.findIndex(
            (id) => id.toString() === eventId.toString(),
        );
        if (deletedEventIndex === -1) {
            console.log('deleted event not found');
        } else {
            userApartment.eventsInfo.events.splice(deletedEventIndex, 1);
            console.log('event id removed');
        }
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
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
                    console.log('apartment populated');
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
        console.log('non-user apartment found');
        const deletedEventIndex = apartment.eventsInfo.events.findIndex((id) => id.toString() === eventId.toString());
        if (deletedEventIndex === -1) {
            console.log('deleted event not found');
        } else {
            apartment.eventsInfo.events.splice(deletedEventIndex, 1);
            console.log('event id removed');
        }
        apartment.save(function (err) {
            if (err) {
                console.error(err);
                return;
            }
            console.log('apartment successfully updated');
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
        console.log('invitee apartment found');
        console.log('looking for event');
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
            console.log('event found');
            event.invitees.push(inviteeApartment._id);
            inviteeApartment.eventsInfo.invitations.push(event._id);
            console.log('invitee added to event, and event added to invitee');
            event.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                console.log('event saved');
                inviteeApartment.save(function (err) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    console.log('invitee apartment saved');
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
                                console.log('apartment populated');
                                console.log(populatedApartment);
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
        console.log('event found');
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
            console.log('invitee apartment found');
            const eventInvitationIndex = inviteeApartment.eventsInfo.invitations.findIndex(
                (id) => id.toString() === event._id.toString(),
            );
            if (eventInvitationIndex === -1) {
                console.log('event not found on invitee');
            } else {
                inviteeApartment.eventsInfo.invitations.splice(eventInvitationIndex, 1);
                console.log('event removed from invitee');
            }
            const inviteeIndex = event.invitees.findIndex((id) => id.toString() === inviteeApartment._id.toString());
            if (inviteeIndex === -1) {
                console.log('invitee not found on event');
            } else {
                event.invitees.splice(inviteeIndex, 1);
                console.log('invitee removed from event');
            }
            inviteeApartment.save(function (err, savedInviteeApartment) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                console.log('invitee apartment saved:');
                console.log(savedInviteeApartment);
                event.save(function (err, savedEvent) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    console.log('event saved:');
                    console.log(savedEvent);
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
                            console.log('user apartment saved and populated:');
                            console.log(populatedUserApartment);
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
        console.log('event found');
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
            const userApartmentIndex = event.invitees.findIndex((id) => id.toString() === userApartment._id.toString());
            if (userApartmentIndex === -1) {
                console.log('user apartment not found in event invitee list');
            } else {
                event.invitees.splice(userApartmentIndex, 1);
                console.log('user apartment removed from invitee list');
            }
            const eventInvitationIndex = userApartment.eventsInfo.invitations.findIndex(
                (id) => id.toString() === event._id.toString(),
            );
            if (eventInvitationIndex === -1) {
                console.log('event not found in invitations list');
            } else {
                userApartment.eventsInfo.invitations.splice(eventInvitationIndex, 1);
                console.log('event removed from invitations list');
            }

            event.attendees.push(userApartment._id);
            userApartment.eventsInfo.events.push(event._id);
            event.save(function (err, savedEvent) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                console.log('event saved');
                userApartment.save(function (err, savedUserApartment) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    console.log('user apartment saved');
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
                            console.log('user apartment populated');
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
        console.log('event found');
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

            const apartmentInvitationIndex = event.invitees.findIndex(
                (id) => id.toString() === userApartment._id.toString(),
            );
            if (apartmentInvitationIndex === -1) {
                console.log('user apartment not found on event');
            } else {
                event.invitees.splice(apartmentInvitationIndex, 1);
                console.log('user apartment deleted from invitees');
            }

            const eventIndex = userApartment.eventsInfo.invitations.findIndex(
                (id) => id.toString() === event._id.toString(),
            );
            if (eventIndex === -1) {
                console.log('event not found on user');
            } else {
                userApartment.eventsInfo.invitations.splice(eventIndex, 1);
                console.log('event deleted from apartment');
            }

            event.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                console.log('event saved');
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
                            console.log('user apartment populated');
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
        console.log('event found');
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
            const userApartmentIndex = event.attendees.findIndex(
                (id) => id.toString() === userApartment._id.toString(),
            );
            if (userApartmentIndex === -1) {
                console.log('user apartment not found on event');
            } else {
                event.attendees.splice(userApartmentIndex, 1);
                console.log('user apartment deleted from event');
            }

            const eventIndex = userApartment.eventsInfo.events.findIndex(
                (id) => id.toString() === event._id.toString(),
            );
            if (eventIndex === -1) {
                console.log('event not found on user');
            } else {
                userApartment.eventsInfo.events.splice(eventIndex, 1);
                console.log('event deleted from user apartment');
            }

            event.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                console.log('event saved');
                userApartment.save(function (err, savedUserApartment) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    console.log('user apartment saved');
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
                            console.log('user apartment populated');
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
        console.log('event found');
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
            console.log('attendee apartment found');

            const eventIndex = attendeeApartment.eventsInfo.events.findIndex(
                (id) => id.toString() === event._id.toString(),
            );
            if (eventIndex === -1) {
                console.log('event not found on attendee');
            } else {
                attendeeApartment.eventsInfo.events.splice(eventIndex, 1);
                console.log('event removed from attendee');
            }

            const attendeeIndex = event.attendees.findIndex((id) => id.toString() === attendeeApartment._id.toString());
            if (attendeeIndex === -1) {
                console.log('attendee not found on event');
            } else {
                event.attendees.splice(attendeeIndex, 1);
                console.log('attendee removed from event');
            }
            attendeeApartment.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                console.log('attendee apartment saved');
                event.save(function (err) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    console.log('event saved');
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
                            console.log('user apartment populated');
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
