export const billFrequencies = [
    'Weekly',
    'Monthly',
    'Every 2 Months',
    'Every 3 Months',
    'Every 4 Months',
    'Every 6 Months',
    'Yearly',
    'Once',
] as const;
export type BillFrequency = typeof billFrequencies[number];
