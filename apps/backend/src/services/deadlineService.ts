import { DeadlineCalculator } from './deadlineCalculator';
import { LOUISIANA_WRIT_RULES, LOUISIANA_APPEAL_RULES, LOUISIANA_DISCOVERY_RULES } from './louisianaWritRules';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DeadlineService {
  static async calculateAndSaveDeadlines(
    userId: number,
    caseId: number,
    baseDate: Date,
    jurisdiction: string = 'louisiana',
    practiceArea?: string
  ) {
    // Get the case to verify ownership
    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseRecord || caseRecord.userId !== userId) {
      throw new Error('Case not found or unauthorized');
    }

    // Calculate deadlines
    const calculator = new DeadlineCalculator(baseDate.getFullYear(), jurisdiction);
    
    // Get rules based on practice area
    const rules = this.getRulesByPracticeArea(practiceArea, jurisdiction);
    
    // Calculate each deadline
    const deadlines = [];
    for (const rule of rules) {
      try {
        const calculation = calculator.calculateDeadline(baseDate, rule);
        
        // Save to database
        const deadline = await prisma.deadline.create({
          data: {
            caseId,
            ruleId: rule.id,
            ruleName: rule.name,
            description: rule.description,
            calculatedDate: calculation.calculatedDate,
            adjustments: calculation.adjustments,
            citation: rule.citation,
          },
        });

        deadlines.push(deadline);
      } catch (error) {
        console.error(`Failed to calculate ${rule.name}:`, error);
      }
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CALCULATE_DEADLINES',
        resource: 'case',
        resourceId: caseId,
        details: { jurisdiction, practiceArea, count: deadlines.length },
      },
    });

    return deadlines;
  }

  private static getRulesByPracticeArea(practiceArea?: string, jurisdiction: string = 'louisiana') {
    const allRules = [
      ...LOUISIANA_WRIT_RULES,
      ...LOUISIANA_APPEAL_RULES,
      ...LOUISIANA_DISCOVERY_RULES,
    ];

    if (practiceArea) {
      return allRules.filter((rule: any) => rule.id.includes(practiceArea));
    }

    return allRules;
  }
}
