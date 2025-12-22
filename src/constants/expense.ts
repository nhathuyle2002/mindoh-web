import type { ExpenseKind, ExpenseResource } from '../types/api';

export const EXPENSE_KINDS: ExpenseKind[] = ['expense', 'income'];

export const EXPENSE_RESOURCES: ExpenseResource[] = ['CASH', 'CAKE', 'VCB', 'VPBANK', 'BIDV', 'OTHER'];

export const DATETIME_WITH_TIMEZONE_FORMAT = "yyyy-MM-dd'T'HH:mm:ssXXX";
