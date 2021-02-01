import passport from 'passport';
import passportLocal from 'passport-local';
import User from '../objects/user/models/User';
import { UserType } from '../objects/user/types/UserType';
import bcrypt from 'bcrypt';

const configurePassport = (): void => {
    console.log('configuring passport');
    const LocalStrategy = passportLocal.Strategy;
    passport.use(
        new LocalStrategy(function (username, password, done) {
            User.findOne({ username: username }, async function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Invalid username' });
                }
                bcrypt.compare(password, user.password, function (error, valid) {
                    if (error) {
                        console.error(error);
                        return done(null, false, { message: 'Internal server error' });
                    }
                    if (!valid) {
                        return done(null, false, { message: 'Incorrect password' });
                    }
                    return done(null, user);
                });
            });
        }),
    );
    passport.serializeUser(function (user: UserType, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};

export default configurePassport;
