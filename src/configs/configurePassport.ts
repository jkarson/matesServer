import passport from 'passport';
import passportLocal from 'passport-local';
import User from '../objects/user/models/User';
import { UserType } from '../objects/user/types/UserType';

const configurePassport = (): void => {
    console.log('configuring passport');
    const LocalStrategy = passportLocal.Strategy;
    passport.use(
        new LocalStrategy(function (username, password, done) {
            User.findOne({ username: username }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Invalid username.' });
                }
                if (!user.validatePassword(password)) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
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
