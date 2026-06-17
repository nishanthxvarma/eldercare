import { z } from 'zod';

export const createCareLogSchema = z.object({
  body: z.object({
    residentId: z.string(),
    type: z.enum(['MEAL', 'HYGIENE', 'ACTIVITY', 'MOOD', 'OTHER']),
    description: z.string().min(1),
    timestamp: z.string().transform((str) => new Date(str)),
  }),
});

export const getCareLogSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const queryCareLogSchema = z.object({
  query: z.object({
    residentId: z.string().optional(),
    type: z.enum(['MEAL', 'HYGIENE', 'ACTIVITY', 'MOOD', 'OTHER']).optional(),
  }),
});
