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

const createCaseSchema = z.object({
  name: z.string().min(1),
  caseNumber: z.string().optional(),
  description: z.string().optional(),
  baseDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  jurisdiction: z.string().default('louisiana'),
  practiceArea: z.string().optional(),
});

// Create a case
router.post('/cases', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, caseNumber, description, baseDate, jurisdiction, practiceArea } = createCaseSchema.parse(req.body);
    
    const caseRecord = await prisma.case.create({
      data: {
        name,
        caseNumber,
        description,
        baseDate: new Date(baseDate),
        jurisdiction,
        practiceArea,
        userId: req.userId!,
      },
    });

    res.status(201).json(caseRecord);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's cases
router.get('/cases', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const cases = await prisma.case.findMany({
      where: { userId: req.userId },
      include: { deadlines: true },
    });
    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate deadlines for a case
router.post('/calculate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { caseId, baseDate, jurisdiction, practiceArea } = calculateSchema.parse(req.body);
    
    const deadlines = await DeadlineService.calculateAndSaveDeadlines(
      req.userId!,
      caseId,
      new Date(baseDate),
      jurisdiction,
      practiceArea
    );

    res.json(deadlines);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get deadlines for a case
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

    res.json(deadlines);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
