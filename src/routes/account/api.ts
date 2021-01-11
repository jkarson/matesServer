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
    console.log('hello from inside get account info');
    console.log(user);
    //to do: use populate's path/select options to only get the fields that the client needs
    User.findOne({ _id: user.id })
        .populate({
            path: 'apartments',
            select: 'profile tenants',
        })
        .populate({
            path: 'requestedApartments',
            select: 'profile tenants',
        })
        .exec(function (err, result) {
            if (err) {
                console.error(err);
            } else if (!result) {
                console.error('User Not Found');
            } else {
                console.log('user after population:');
                console.log(result);
                const resultApartments = (result.apartments as unknown) as ApartmentType[];

                const formattedApartments = resultApartments.map((apartment) => {
                    const tenants = apartment.tenants as TenantType[];
                    console.log('tenants here:');
                    console.log(tenants);
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
                res.send({
                    ...res.locals,
                    user: {
                        //id: user.id,
                        username: result.username,
                        apartments: formattedApartments,
                        requestedApartments: formattedRequestedApartments,
                    },
                });
                console.log('Attempting user look up post population');
                User.findOne({ _id: user.id }, function (err, user) {
                    if (err || !user) {
                        console.log(err || 'Unknown Error: User not found');
                        return;
                    }
                    console.log('found user:');
                    console.log(user);
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
                userId: user.id,
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
            return;
        }
        console.log('new apartment:');
        console.log(apartment);
        console.log('adding apartment to user');
        user.apartments.push(apartment._id);
        console.log('attempting to save user');
        user.save(function (err, updatedUser) {
            if (err || !updatedUser) {
                console.error(err || 'Unknown Error: Could not save updated user');
                return;
            }
            console.log('updated user:');
            console.log(user);
            console.log('attempting user lookup');
            getAccountInfo(req, res);
        });
    });
};

const searchCode = (req: express.Request, res: express.Response): void => {
    const { code } = req.body;
    //extension: display more than one if there is more than one w that code
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

export { getAccountInfo, createApartment, searchCode, requestToJoin, viewApartment };
