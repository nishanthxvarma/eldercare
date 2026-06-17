import { z } from 'zod';

export const createMedicationSchema = z.object({
  body: z.object({
    residentId: z.string(),
    name: z.string().min(1),
    dosage: z.string().min(1),
    instructions: z.string().optional(),
    prescribedBy: z.string().min(1),
    startDate: z.string().transform((str) => new Date(str)),
    endDate: z.string().transform((str) => new Date(str)).optional(),
  }),
});

export const updateMedicationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().optional(),
    dosage: z.string().optional(),
    instructions: z.string().optional(),
    endDate: z.string().transform((str) => new Date(str)).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getMedicationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const queryMedicationSchema = z.object({
  query: z.object({
    residentId: z.string().optional(),
  }),
});
