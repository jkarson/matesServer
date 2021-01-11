import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

const login = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.send({ success: false, ...info });
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.send({ success: true });
        });
    })(req, res, next);
};

export { login };
