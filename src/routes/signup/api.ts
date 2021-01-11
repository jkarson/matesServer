import express from 'express';
import { Schema } from 'mongoose';
import User from '../../objects/user/models/User';

const signup = (req: express.Request, res: express.Response): void => {
    console.log(req.body);
    const { username, password } = req.body;
    User.findOne({ username: req.body.username }, function (err, doc) {
        if (err) {
            console.error(err);
        } else {
            if (!doc) {
                const apartments: Schema.Types.ObjectId[] = [];
                const requestedApartments: Schema.Types.ObjectId[] = [];
                const newUser = new User({
                    username: username,
                    password: password,
                    apartments: apartments,
                    requestedApartments: requestedApartments,
                    selectedApartment: null,
                });
                newUser
                    .save()
                    .then((newUser) => {
                        const clientUser = {
                            username: newUser.username,
                            apartments: newUser.apartments,
                            requestedApartments: newUser.requestedApartments,
                            selectedApartment: newUser.selectedApartment,
                        };
                        res.json({ created: true, ...clientUser });
                    })
                    .catch((error) => console.error(error));
            } else {
                res.json({ created: false, message: 'Username is already taken.' });
            }
        }
    });
};

const checkUsernameAvailability = (req: express.Request, res: express.Response): void => {
    const { username } = req.body;
    User.findOne({ username: username }, function (err, doc) {
        if (err) {
            console.error(err);
            return;
        }
        if (doc) {
            res.json({ available: false });
            return;
        }
        res.json({ available: true });
        return;
    });
};

export { signup, checkUsernameAvailability };
