import express from 'express';
import Apartment from '../../../objects/apartment/models/Apartment';
import { TenantType } from '../../../objects/tenant/types/TenantType';
import User from '../../../objects/user/models/User';

const updateApartmentProfile = (req: express.Request, res: express.Response): void => {
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
        apartment.profile.name = name;
        apartment.profile.address = address;
        apartment.profile.quote = quote;
        apartment.save(function (err, newApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            res.json({ ...res.locals, success: true, newProfile: newApartment.profile });
        });
    });
};

const updateTenantProfile = (req: express.Request, res: express.Response): void => {
    const { apartmentId, ...tenantInput } = req.body;
    const inputTenant = tenantInput as TenantType;
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
            res.json({ ...res.locals, success: true, resultTenants: savedApartment.tenants });
        });
    });
};

const acceptJoinRequest = (req: express.Request, res: express.Response): void => {
    const { apartmentId, joineeId } = req.body;
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
        User.findOne({ _id: joineeId }, function (err, user) {
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
            if (user.requestedApartments.includes(apartment._id)) {
                const userRequestIndex = user.requestedApartments.findIndex(
                    (reqApartmentId) => reqApartmentId.toString() === apartment._id.toString(),
                );
                user.requestedApartments.splice(userRequestIndex, 1);
                user.apartments.push(apartment._id);
                user.save(function (err) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                    }
                    const apartmentRequestIndex = apartment.profile.requests.findIndex(
                        (reqUserId) => reqUserId.toString() === user._id.toString(),
                    );
                    if (apartmentRequestIndex === -1) {
                        console.log('request not found on apartment');
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    apartment.profile.requests.splice(apartmentRequestIndex, 1);
                    apartment.tenants.push({ userId: user._id, name: user.username });
                    apartment.save(function (err, resultApartment) {
                        if (err) {
                            console.error(err);
                            res.json({ ...res.locals, success: false });
                            return;
                        }
                        resultApartment
                            .populate({ path: 'profile.requests', select: 'username' })
                            .execPopulate(function (err, populatedApartment) {
                                if (err) {
                                    console.error(err);
                                    res.json({ ...res.locals, success: false });
                                    return;
                                }
                                res.json({
                                    ...res.locals,
                                    success: true,
                                    resultTenants: populatedApartment.tenants,
                                    resultRequests: populatedApartment.profile.requests,
                                });
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
    User.findOne({ _id: requesteeId }, function (err, user) {
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
        const requestIndex = user.requestedApartments.findIndex((id) => id.toString() === apartmentId);
        if (requestIndex === -1) {
            console.log('request not found on user');
            res.json({ ...res.locals, success: false });
            return;
        }
        user.requestedApartments.splice(requestIndex, 1);
        user.save(function (err) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
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
                const requestingIndex = apartment.profile.requests.findIndex(
                    (id) => id.toString() === requesteeId.toString(),
                );
                if (requestingIndex === -1) {
                    console.log('request not found on apartment');
                    res.json({ ...res.locals, success: false });
                    return;
                }
                apartment.profile.requests.splice(requestingIndex, 1);
                apartment.save(function (err, savedApartment) {
                    if (err) {
                        console.error(err);
                        res.json({ ...res.locals, success: false });
                        return;
                    }
                    savedApartment
                        .populate({ path: 'profile.requests', select: 'username' })
                        .execPopulate(function (err, populatedApartment) {
                            if (err) {
                                console.error(err);
                                res.json({ ...res.locals, success: false });
                                return;
                            }
                            res.json({ ...res.locals, success: true, requests: populatedApartment.profile.requests });
                        });
                });
            });
        });
    });
};

export { updateApartmentProfile, updateTenantProfile, acceptJoinRequest, deleteJoinRequest };
