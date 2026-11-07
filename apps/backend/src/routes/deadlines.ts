import express, { Router, Request, Response } from 'express';
import { DeadlineService } from '../services/deadlineService';

const router = Router();

router.post('/calculate', async (req: Request, res: Response) => {
  console.log('🔴 POST /api/calculate received');
  console.log('   Body:', JSON.stringify(req.body));
  console.log('   User ID:', (req as any).userId);
  
  try {
    const { caseId, baseDate, jurisdiction, practiceArea } = req.body;
    
    console.log('📥 Extracted params:', { caseId, baseDate, jurisdiction, practiceArea });
    
    const deadlines = await DeadlineService.calculateAndSaveDeadlines(
      (req as any).userId,
      caseId,
      new Date(baseDate),
      jurisdiction,
      practiceArea
    );
    
    console.log('✅ Deadlines calculated:', deadlines.length);
    res.json(deadlines);
  } catch (error: any) {
    console.error('❌ ERROR in /calculate:', error.message);
    console.error('   Stack:', error.stack);
    res.status(400).json({ error: error.message });
  }
});

router.get('/cases/:caseId/deadlines', async (req: Request, res: Response) => {
  console.log('🔴 GET /api/cases/:caseId/deadlines received');
  try {
    const deadlines = await DeadlineService.getDeadlinesByCase(parseInt(req.params.caseId));
    console.log('✅ Retrieved deadlines:', deadlines.length);
    res.json(deadlines);
  } catch (error: any) {
    console.error('❌ ERROR in GET deadlines:', error.message);
    res.status(400).json({ error: error.message });
  }
});

export default router;
