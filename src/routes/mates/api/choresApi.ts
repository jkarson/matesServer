import express from 'express';
import Apartment from '../../../objects/apartment/models/Apartment';
import mongoose from 'mongoose';
import { ChoreType } from '../../../objects/chores/types/ChoreType';

const createChoreGenerator = (req: express.Request, res: express.Response): void => {
    const { apartmentId, newChoreGenerator, generatedChores } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('user apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        const choreGenerator = { ...newChoreGenerator, _id: mongoose.Types.ObjectId() };
        console.log('user apartment found');
        userApartment.choresInfo.choreGenerators.push(choreGenerator);
        console.log('chore generator added to user');
        const generatedChoresWithChoreGeneratorId = generatedChores.map((chore: ChoreType) => {
            return { ...chore, choreGeneratorId: choreGenerator._id };
        });
        console.log('new chores tagged with chore generator ID');
        userApartment.choresInfo.chores = userApartment.choresInfo.chores.concat(generatedChoresWithChoreGeneratorId);
        console.log('new chores added to user');
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
            res.json({ ...res.locals, success: true, choresInfo: savedUserApartment.choresInfo });
        });
    });
};

const markChoreCompleted = (req: express.Request, res: express.Response): void => {
    const { apartmentId, choreId, userId } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('user apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('user apartment found');
        const chore = userApartment.choresInfo.chores.find((chore) => chore._id.toString() === choreId.toString());
        if (!chore) {
            console.log('chore not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('chore found');
        console.log('marking chore completed by user');
        chore.completed = true;
        chore.completedBy = userId;
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
            res.json({ ...res.locals, success: true, choresInfo: savedUserApartment.choresInfo });
        });
    });
};

const markChoreUncompleted = (req: express.Request, res: express.Response): void => {
    const { apartmentId, choreId } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('user apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('user apartment found');
        const chore = userApartment.choresInfo.chores.find((chore) => chore._id.toString() === choreId.toString());
        if (!chore) {
            console.log('chore not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('chore found');
        console.log('marking chore uncompleted');
        chore.completed = false;
        chore.completedBy = undefined;
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
            res.json({ ...res.locals, success: true, choresInfo: savedUserApartment.choresInfo });
        });
    });
};

const deleteChore = (req: express.Request, res: express.Response): void => {
    const { apartmentId, choreId } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('user apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('user apartment found');
        const choreIndex = userApartment.choresInfo.chores.findIndex(
            (chore) => chore._id.toString() === choreId.toString(),
        );
        if (choreIndex === -1) {
            console.log('chore not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('chore found');
        userApartment.choresInfo.chores.splice(choreIndex, 1);
        console.log('chore deleted');
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('apartment saved');
            res.json({ ...res.locals, success: true, choresInfo: savedUserApartment.choresInfo });
        });
    });
};

const deleteChoreSeries = (req: express.Request, res: express.Response): void => {
    const { apartmentId, choreGeneratorId } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('user apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('user apartment found');
        const choreGeneratorIndex = userApartment.choresInfo.choreGenerators.findIndex(
            (choreGenerator) => choreGenerator._id.toString() === choreGeneratorId.toString(),
        );
        if (choreGeneratorIndex === -1) {
            console.log('chore generator not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        const choresInSeries = userApartment.choresInfo.chores.filter(
            (chore) => chore.choreGeneratorId.toString() === choreGeneratorId.toString(),
        );
        choresInSeries.forEach((chore) =>
            userApartment.choresInfo.chores.splice(userApartment.choresInfo.chores.indexOf(chore), 1),
        );
        userApartment.choresInfo.choreGenerators.splice(choreGeneratorIndex, 1);
        console.log('chores and chore generator deleted');
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('apartment saved');
            res.json({ ...res.locals, success: true, choresInfo: savedUserApartment.choresInfo });
        });
    });
};

const addChoresAndUpdateChoreGenerators = (req: express.Request, res: express.Response): void => {
    const { apartmentId, updatedThrough, newChores } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('user apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('user apartment found');
        userApartment.choresInfo.chores.push(...newChores);
        userApartment.choresInfo.choreGenerators.forEach(
            (choreGenerator) => (choreGenerator.updatedThrough = updatedThrough),
        );
        console.log('chores added and chore generators updated');
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
            res.json({ ...res.locals, success: true, choresInfo: savedUserApartment.choresInfo });
        });
    });
};

const deleteOldChores = (req: express.Request, res: express.Response): void => {
    const { apartmentId, choreDeletionIds } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('user apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('user apartment found');
        choreDeletionIds.forEach((choreId: string) => {
            const choreToDelete = userApartment.choresInfo.chores.find((chore) => chore._id.toString() === choreId);
            if (!choreToDelete) {
                console.log('a chore is missing!');
            } else {
                userApartment.choresInfo.chores.splice(userApartment.choresInfo.chores.indexOf(choreToDelete), 1);
                console.log('old chore deleted');
            }
        });
        userApartment.save(function (err, savedApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
            res.json({ ...res.locals, success: true, choresInfo: savedApartment.choresInfo });
        });
    });
};

export {
    createChoreGenerator,
    markChoreCompleted,
    markChoreUncompleted,
    deleteChore,
    deleteChoreSeries,
    addChoresAndUpdateChoreGenerators,
    deleteOldChores,
};
