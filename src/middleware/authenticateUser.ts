import { Request, Response, NextFunction } from 'express';

function authenticateUser(req: Request, res: Response, next: NextFunction): void {
    // passport adds this to the request object
    if (req.isAuthenticated()) {
        res.locals.authenticated = true;
        return next();
    } else {
        res.json({ authenticated: false });
        return;
    }
}

export default authenticateUser;
