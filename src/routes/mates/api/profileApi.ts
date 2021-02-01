import express from 'express';
import Apartment from '../../../objects/apartment/models/Apartment';
import { TenantType } from '../../../objects/tenant/types/TenantType';
import User from '../../../objects/user/models/User';

const updateApartmentProfile = (req: express.Request, res: express.Response): void => {
    console.log(req.body);
    const { apartmentId, name, address, quote } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, apartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!apartment) {
            console.log('Could Not Find Apartment');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('apartment found');
        apartment.profile.name = name;
        apartment.profile.address = address;
        apartment.profile.quote = quote;
        apartment.save(function (err, newApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('new apartment:');
            console.log(newApartment);
            res.json({ ...res.locals, success: true, newProfile: newApartment.profile });
        });
    });
};

const updateTenantProfile = (req: express.Request, res: express.Response): void => {
    console.log(req.body);
    const { apartmentId, ...tenantInput } = req.body;
    const inputTenant = tenantInput as TenantType;
    console.log('input tenant:');
    console.log(inputTenant);
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
        const scopedTenant = apartment.tenants.find((tenant) => {
            return tenant.userId.toString() === inputTenant.userId.toString();
        });
        if (!scopedTenant) {
            res.json({ ...res.locals, success: false, message: 'Tenant not found' });
            return;
        }
        scopedTenant.name = inputTenant.name;
        scopedTenant.age = inputTenant.age;
        scopedTenant.email = inputTenant.email;
        scopedTenant.number = inputTenant.number;
        apartment.save(function (err, savedApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false, message: err });
                return;
            }
            console.log('apartment saved:');
            console.log(savedApartment);
            res.json({ ...res.locals, success: true, resultTenants: savedApartment.tenants });
        });
    });
};

const acceptJoinRequest = (req: express.Request, res: express.Response): void => {
    console.log(req.body);
    const { apartmentId, joineeId } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, apartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!apartment) {
            console.log('no apartment');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('found apartment');
        User.findOne({ _id: joineeId }, function (err, user) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            if (!user) {
                console.log('no user');
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('made it here');
            if (user.requestedApartments.includes(apartment._id)) {
                console.log('made it here #2');
                const requestIndex = user.requestedApartments.findIndex(
                    (reqApartmentId) => reqApartmentId === apartment._id,
                );
                user.requestedApartments.splice(requestIndex, 1);
                user.apartments.push(apartment._id);
                user.save(function (err) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                    }
                    const requestIndex = apartment.profile.requests.findIndex((reqUserId) => reqUserId === user._id);
                    apartment.tenants.push({ userId: user._id, name: user.username });
                    apartment.profile.requests.splice(requestIndex, 1);
                    apartment.save(function (err, resultApartment) {
                        if (err) {
                            console.error(err);
                            res.json({ ...res.locals, success: false });
                            return;
                        }
                        res.json({
                            ...res.locals,
                            success: true,
                            resultTenants: resultApartment.tenants,
                            resultRequests: resultApartment.profile.requests,
                        });
                    });
                });
            } else {
                res.json({ ...res.locals, success: false });
            }
        });
    });
};

const deleteJoinRequest = (req: express.Request, res: express.Response): void => {
    const { apartmentId, requesteeId } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, apartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!apartment) {
            console.log('apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        const requestIndex = apartment.profile.requests.findIndex(
            (request) => request.toString() === requesteeId.toString(),
        );
        apartment.profile.requests.splice(requestIndex, 1);
        apartment.save(function (err, resultApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
            }
            res.json({ ...res.locals, success: true, requests: resultApartment.profile.requests });
            User.findOne({ _id: requesteeId }, function (err, user) {
                if (err) {
                    console.error(err);
                    return;
                }
                if (!user) {
                    console.log('user not found');
                    return;
                }
                const requestIndex = user.requestedApartments.findIndex(
                    (aptId) => aptId.toString() === apartmentId.toString(),
                );
                user.requestedApartments.splice(requestIndex, 1);
                user.save(function (err, resultUser) {
                    if (err) {
                        console.error(err);
                    }
                    console.log('user updated and saved as:');
                    console.log(resultUser);
                });
            });
        });
    });
};

export { updateApartmentProfile, updateTenantProfile, acceptJoinRequest, deleteJoinRequest };
