import { z } from 'zod';

export const createHealthRecordSchema = z.object({
  body: z.object({
    residentId: z.string(),
    vitals: z.object({
      bloodPressure: z.object({
        systolic: z.number(),
        diastolic: z.number(),
      }).optional(),
      heartRate: z.number().optional(),
      temperature: z.number().optional(),
      bloodSugar: z.number().optional(),
      oxygenLevel: z.number().optional(),
    }),
    notes: z.string().optional(),
    recordedAt: z.string().transform((str) => new Date(str)),
    source: z.enum(['MANUAL', 'DEVICE']).default('MANUAL'),
  }),
});

export const getHealthRecordSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const queryHealthRecordSchema = z.object({
  query: z.object({
    residentId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
