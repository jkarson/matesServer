import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import logger from 'morgan';
import { secret } from './constants';
import configureMongoose from './configs/configureMongoose';
import configurePassport from './configs/configurePassport';
import passport from 'passport';
import router from './routes/router';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const app = express();
const port = process.env.PORT || 8080; // default port to listen

(async function configureApp() {
    console.log('configuring app');
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

    app.use(express.static('client/build'));
    app.get('/*', (_, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });

    //to do: this soon won't be localhost
    app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`);
    });
})();

export default app;
