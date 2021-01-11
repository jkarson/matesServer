import { BillGeneratorType } from './BillGeneratorType';
import { BillType } from './BillType';

export interface BillsInfoType {
    billGenerators: BillGeneratorType[];
    bills: BillType[];
}
