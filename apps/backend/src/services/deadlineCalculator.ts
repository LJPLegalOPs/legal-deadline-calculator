import { HolidayEngine, Holiday } from './holidayEngine';

export interface DeadlineRule {
  id: string;
  name: string;
  description: string;
  baseDateField: string;
  offsetDays: number;
  adjustForWeekends: boolean;
  adjustForHolidays: boolean;
  citation?: string;
}

export interface DeadlineCalculation {
  rule: DeadlineRule;
  baseDate: Date;
  calculatedDate: Date;
  daysFromBase: number;
  adjustments: string[];
  citation?: string;
}

export class DeadlineCalculator {
  
  private holidays: Holiday[];
  private jurisdiction: string;
  
  constructor(year: number, jurisdiction: string = 'louisiana') {
    this.jurisdiction = jurisdiction;
    this.holidays = HolidayEngine.getHolidays(year, jurisdiction);
  }
  
  /**
   * Calculate a deadline based on a rule
   */
  calculateDeadline(baseDate: Date, rule: DeadlineRule): DeadlineCalculation {
    const adjustments: string[] = [];
    let calculatedDate = new Date(baseDate);
    
    // Add the offset days
    calculatedDate.setDate(calculatedDate.getDate() + rule.offsetDays);
    
    // Adjust for weekends
    if (rule.adjustForWeekends) {
      const beforeAdjust = new Date(calculatedDate);
      calculatedDate = this.adjustForWeekend(calculatedDate);
      
      if (calculatedDate.getTime() !== beforeAdjust.getTime()) {
        adjustments.push(`Adjusted from ${this.formatDate(beforeAdjust)} (weekend)`);
      }
    }
    
    // Adjust for holidays
    if (rule.adjustForHolidays) {
      const beforeAdjust = new Date(calculatedDate);
      calculatedDate = this.adjustForHoliday(calculatedDate);
      
      if (calculatedDate.getTime() !== beforeAdjust.getTime()) {
        adjustments.push(`Adjusted from ${this.formatDate(beforeAdjust)} (holiday)`);
      }
    }
    
    return {
      rule,
      baseDate,
      calculatedDate,
      daysFromBase: Math.floor((calculatedDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)),
      adjustments,
      citation: rule.citation,
    };
  }
  
  private adjustForWeekend(date: Date): Date {
    const adjusted = new Date(date);
    while (this.isWeekend(adjusted)) {
      adjusted.setDate(adjusted.getDate() + 1);
    }
    return adjusted;
  }
  
  private adjustForHoliday(date: Date): Date {
    const adjusted = new Date(date);
    while (this.isHoliday(adjusted) || this.isWeekend(adjusted)) {
      adjusted.setDate(adjusted.getDate() + 1);
    }
    return adjusted;
  }
  
  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }
  
  private isHoliday(date: Date): boolean {
    return this.holidays.some(h => 
      h.date.toDateString() === date.toDateString()
    );
  }
  
  private formatDate(date: Date): string {
    return date.toLocaleDateString();
  }
}
