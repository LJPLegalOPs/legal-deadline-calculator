import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { DeadlineService } from '../services/deadlineService';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const calculateSchema = z.object({
  caseId: z.number(),
  baseDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  jurisdiction: z.string().default('louisiana'),
  practiceArea: z.string().optional(),
});

router.post('/calculate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { caseId, baseDate, jurisdiction, practiceArea } = calculateSchema.parse(req.body);
    
    console.log('📥 Calculate endpoint called with:', { caseId, baseDate, jurisdiction, practiceArea });

    const deadlines = await DeadlineService.calculateAndSaveDeadlines(
      req.userId!,
      caseId,
      new Date(baseDate),
      jurisdiction,
      practiceArea
    );

    console.log('📊 Deadlines returned:', deadlines);
    res.status(200).json(deadlines);
  } catch (error: any) {
    console.error('❌ Calculate error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/cases/:caseId/deadlines', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { caseId } = req.params;
    
    const caseRecord = await prisma.case.findUnique({
      where: { id: parseInt(caseId) },
    });

    if (!caseRecord || caseRecord.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const deadlines = await prisma.deadline.findMany({
      where: { caseId: parseInt(caseId) },
      orderBy: { calculatedDate: 'asc' },
    });

    res.status(200).json(deadlines);
  } catch (error: any) {
    console.error('Error fetching deadlines:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
