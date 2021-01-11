import express from 'express';
import Apartment from '../../../objects/apartment/models/Apartment';

const createBillGenerator = (req: express.Request, res: express.Response): void => {
    const { apartmentId, newBillGenerator, generatedBills } = req.body;
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
        const billGenerator = { ...newBillGenerator };
        console.log('new bill generator: ');
        console.log(billGenerator);
        userApartment.billsInfo.billGenerators.push(billGenerator);
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('bill generator saved');
            const savedBillGenerators = savedUserApartment.billsInfo.billGenerators;

            //to do: can we guarantee accuracy (via atomicity) here? is it already guaranteed?
            const savedBillGenerator = savedBillGenerators[savedBillGenerators.length - 1];
            console.log('saved bill generator: ');
            console.log(savedBillGenerator);
            const generatedBillsWithBillGeneratorId = generatedBills.map((generatedBill: any) => {
                return { ...generatedBill, billGeneratorId: savedBillGenerator._id };
            });
            console.log('generated bills with bg id:');
            console.log(generatedBillsWithBillGeneratorId);
            savedUserApartment.billsInfo.bills = savedUserApartment.billsInfo.bills.concat(
                generatedBillsWithBillGeneratorId,
            );
            savedUserApartment.save(function (err, savedUserApartmentWithBills) {
                if (err) {
                    console.error(err);
                    res.json({ ...res.locals, success: false });
                    return;
                }
                console.log('bills saved');
                console.log('saved final apartment:');
                console.log(savedUserApartmentWithBills);
                res.json({
                    ...res.locals,
                    success: true,
                    billsInfo: savedUserApartmentWithBills.billsInfo,
                });
            });
        });
    });
};

const updateAmountsOwed = (req: express.Request, res: express.Response): void => {
    const { apartmentId, billId, amountsOwed } = req.body;
    console.log('hi from update amounts owed');
    console.log('request body:');
    console.log(req.body);
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
        const bill = userApartment.billsInfo.bills.find((bill) => bill._id.toString() === billId.toString());
        if (!bill) {
            console.log('bill not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('bill found');
        console.log('updating amounts owed');
        bill.amountsOwed = amountsOwed;
        console.log('saving bill');
        userApartment.save(function (err, savedApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('apartment saved');
            res.json({ ...res.locals, success: true, billsInfo: savedApartment.billsInfo });
        });
    });
};

const deleteBill = (req: express.Request, res: express.Response): void => {
    const { apartmentId, billId } = req.body;
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
        const billIndex = userApartment.billsInfo.bills.findIndex((bill) => bill._id.toString() === billId.toString());
        if (billIndex === -1) {
            console.log('bill not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('bill found');
        userApartment.billsInfo.bills.splice(billIndex, 1);
        console.log('bill deleted');
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
            res.json({ ...res.locals, success: true, billsInfo: savedUserApartment.billsInfo });
        });
    });
};

const deleteBillSeries = (req: express.Request, res: express.Response): void => {
    const { apartmentId, billGeneratorId } = req.body;
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
        const billGeneratorIndex = userApartment.billsInfo.billGenerators.findIndex(
            (bg) => bg._id.toString() === billGeneratorId.toString(),
        );
        if (billGeneratorIndex === -1) {
            console.log('bill generator not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        const billsInSeries = userApartment.billsInfo.bills.filter(
            (bill) => bill.billGeneratorId.toString() === billGeneratorId.toString(),
        );
        billsInSeries.forEach((bill) =>
            userApartment.billsInfo.bills.splice(userApartment.billsInfo.bills.indexOf(bill), 1),
        );
        console.log('relevant bills deleted');

        userApartment.billsInfo.billGenerators.splice(billGeneratorIndex, 1);
        console.log('relevant bill generator deleted');
        userApartment.save(function (err, savedApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('apartment saved');
            res.json({ ...res.locals, success: true, billsInfo: savedApartment.billsInfo });
        });
    });
};

const addBillsAndUpdateBillGenerators = (req: express.Request, res: express.Response): void => {
    const { updatedThrough, newBills, apartmentId } = req.body;
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
        console.log('adding new bills and updating bill generators');
        userApartment.billsInfo.bills.push(...newBills);
        userApartment.billsInfo.billGenerators.forEach(
            (billGenerator) => (billGenerator.updatedThrough = updatedThrough),
        );
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
            const billsInfo = savedUserApartment.billsInfo;
            res.json({ ...res.locals, success: true, billsInfo: billsInfo });
        });
    });
};

const deleteOldBills = (req: express.Request, res: express.Response): void => {
    const { apartmentId, billDeletionIds } = req.body;
    console.log('hi from delete old bills');
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
        billDeletionIds.forEach((id: string) => {
            const billIndex = userApartment.billsInfo.bills.findIndex((bill) => bill._id.toString() === id);
            if (billIndex === -1) {
                console.log('old bill not found!');
            } else {
                userApartment.billsInfo.bills.splice(billIndex, 1);
                console.log('old bill deleted');
            }
        });
        console.log('old bills deleted');
        userApartment.save(function (err, savedApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
            res.json({ ...res.locals, success: true, billsInfo: savedApartment.billsInfo });
        });
    });
};

export {
    createBillGenerator,
    addBillsAndUpdateBillGenerators,
    updateAmountsOwed,
    deleteBill,
    deleteBillSeries,
    deleteOldBills,
};
