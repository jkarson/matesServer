import express from 'express';
import Apartment from '../../objects/apartment/models/Apartment';
import { ApartmentType } from '../../objects/apartment/types/ApartmentType';
import User from '../../objects/user/models/User';
import { UserType } from '../../objects/user/types/UserType';

const getAccountSettingsInfo = (req: express.Request, res: express.Response): void => {
    const user = req.user as UserType;
    // User.findOne({ _id: user._id }, function (err, user) {
    //     if (err || !user) {
    //         console.error(err || 'User not found');
    //         return;
    //     }
    // });
    User.findOne({ _id: user._id })
        .populate('selectedApartment', 'profile.name')
        .exec(function (err, user) {
            if (err) {
                console.error(err);
                return;
            }
            if (!user) {
                console.log('user not found');
                return;
            }
            const selectedApartment = (user.selectedApartment as unknown) as ApartmentType | null;
            const selectedApartmentName = selectedApartment ? selectedApartment.profile.name : undefined;
            res.json({
                ...res.locals,
                username: user.username,
                userId: user._id,
                selectedApartmentName: selectedApartmentName,
            });
        });
};

const deleteAccount = (req: express.Request, res: express.Response): void => {
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
        console.log('user found:');
        console.log(user);
        user.apartments.forEach((apartmentId) => {
            Apartment.findOne({ _id: apartmentId }, function (err, apartment) {
                if (err) {
                    console.error(err);
                    return;
                }
                if (!apartment) {
                    console.log('apartment not found');
                    return;
                }
                console.log('user');
                console.log(apartment);
                const userIndex = apartment.tenants.findIndex(
                    (tenant) => tenant.userId.toString() === user._id.toString(),
                );
                if (userIndex === -1) {
                    console.log('user not found on apartment');
                } else {
                    apartment.tenants.splice(userIndex, 1);
                    console.log('user removed from apartment');
                }
                apartment.save(function (err) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('apartment saved');
                });
            });
        });
        User.deleteOne({ _id: user._id }, function (err) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user deleted');
            res.json({ ...res.locals, success: true });
        });
    });
};

export { getAccountSettingsInfo, deleteAccount };
