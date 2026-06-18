import { z } from 'zod';

export const GigSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string(),
  budget: z.number().positive(),
  status: z.enum(['draft', 'open', 'in_progress', 'completed', 'cancelled', 'disputed']),
});

export type Gig = z.infer<typeof GigSchema>;
