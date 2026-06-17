import { z } from 'zod';

export const createResidentSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.string().transform((str) => new Date(str)),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    roomNumber: z.string().min(1),
    admissionDate: z.string().transform((str) => new Date(str)),
    allergies: z.array(z.string()).optional(),
    medicalHistory: z.array(z.object({
      condition: z.string(),
      diagnosedDate: z.string().transform((str) => new Date(str)).optional(),
      notes: z.string().optional(),
    })).optional(),
    emergencyContact: z.object({
      name: z.string().min(1),
      phone: z.string().min(1),
      relationship: z.string().min(1),
    }),
  }),
});

export const updateResidentSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    roomNumber: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    emergencyContact: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relationship: z.string().optional(),
    }).optional(),
  }),
});

export const getResidentSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const queryResidentSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  }),
});
