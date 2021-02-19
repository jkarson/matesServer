export const choreFrequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Once'] as const;
export type ChoreFrequency = typeof choreFrequencies[number];
