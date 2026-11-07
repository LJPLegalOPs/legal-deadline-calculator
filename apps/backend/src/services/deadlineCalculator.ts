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
    
    // Adjust for weekends and holidays together (keep looping until we land on a business day)
    if (rule.adjustForWeekends || rule.adjustForHolidays) {
      const beforeAdjust = new Date(calculatedDate);
      calculatedDate = this.adjustToNextBusinessDay(calculatedDate, rule.adjustForWeekends, rule.adjustForHolidays);
      
      if (calculatedDate.getTime() !== beforeAdjust.getTime()) {
        adjustments.push(`Adjusted from ${this.formatDate(beforeAdjust)} to next business day`);
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
  
  /**
   * Adjust date to the next business day (skipping weekends and/or holidays)
   */
  private adjustToNextBusinessDay(date: Date, adjustForWeekends: boolean, adjustForHolidays: boolean): Date {
    const adjusted = new Date(date);
    let maxIterations = 365; // Prevent infinite loops
    let iterations = 0;
    
    while (iterations < maxIterations) {
      const isWeekend = this.isWeekend(adjusted);
      const isHoliday = adjustForHolidays ? this.isHoliday(adjusted) : false;
      
      // If it's a business day, we're done
      if (!(adjustForWeekends && isWeekend) && !isHoliday) {
        break;
      }
      
      // Move to next day
      adjusted.setDate(adjusted.getDate() + 1);
      iterations++;
    }
    
    return adjusted;
  }
  
  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
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
