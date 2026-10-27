import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all cases for authenticated user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const cases = await prisma.case.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(cases);
  } catch (error: any) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new case
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, caseNumber, baseDate, jurisdiction, practiceArea } = req.body;

    if (!name || !baseDate) {
      return res.status(400).json({ error: 'Name and baseDate are required' });
    }

    const newCase = await prisma.case.create({
      data: {
        name,
        caseNumber: caseNumber || null,
        baseDate: new Date(baseDate),
        jurisdiction: jurisdiction || 'louisiana',
        practiceArea: practiceArea || 'appeal',
        userId: req.userId!,
      },
    });

    res.status(201).json(newCase);
  } catch (error: any) {
    console.error('Error creating case:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
