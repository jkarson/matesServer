import express from 'express';
import accountRouter from './account/accountRouter';
import homeRouter from './home/homeRouter';
import signupRouter from './signup/signupRouter';
import matesRouter from './mates/matesRouter';
import accountSettingsRouter from './accountSettings/accountSettingsRouter';
const router = express.Router();

router.use('/', homeRouter);
router.use('/signup', signupRouter);
router.use('/account', accountRouter);
router.use('/mates', matesRouter);
router.use('/account-settings', accountSettingsRouter);

export default router;
