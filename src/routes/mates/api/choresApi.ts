import express from 'express';
import Apartment from '../../../objects/apartment/models/Apartment';

//TO DO: Huge requests are causing server crashes. This is good healthy progress but I may need to
//use a buffer or something or figure out another way to send less data back and forth

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
        console.log('user apartment found');
        console.log('adding chore generator');
        userApartment.choresInfo.choreGenerators.push(newChoreGenerator);
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
            const savedChoreGenerators = savedUserApartment.choresInfo.choreGenerators;
            //to do: can we guarantee accuracy (via atomicity) here? is it already guaranteed?
            const savedChoreGenerator = savedChoreGenerators[savedChoreGenerators.length - 1];
            console.log('saved chore generator:');
            console.log(savedChoreGenerator);
            console.log('adding cgID to new chores');
            const generatedChoresWithChoreGeneratorId = generatedChores.map((chore: any) => {
                return { ...chore, choreGeneratorId: savedChoreGenerator._id };
            });
            console.log('generated chores w cgId:');
            console.log(generatedChoresWithChoreGeneratorId);
            console.log('adding chores to apartment');
            savedUserApartment.choresInfo.chores = savedUserApartment.choresInfo.chores.concat(
                generatedChoresWithChoreGeneratorId,
            );
            savedUserApartment.save(function (err, finalApartment) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                console.log('user apartment saved');
                res.json({ ...res.locals, success: true, choresInfo: finalApartment.choresInfo });
            });
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
