//to do: what version of ecmascript am i using on mates client?
// i use Object.values... is it really the 2015 one i should use here?

import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import logger from 'morgan';
import { secret } from './constants';
import configureMongoose from './configs/configureMongoose';
import configurePassport from './configs/configurePassport';
import passport from 'passport';
import router from './routes/router';

//TO DO: Types can and should be shared between front-end and back-end,
//so that both are tied to identical models.

//TO DO / EXTENSION: more secure password storage.

const app = express();
const port = process.env.PORT || 8080; // default port to listen

(async function configureApp() {
    await configureMongoose();
    configurePassport();
    app.use(logger('dev'));
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(
        session({
            secret: secret,
            resave: false,
            saveUninitialized: false,
        }),
    );
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(router);

    app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`);
    });
})();

export default app;
