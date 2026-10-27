export interface Holiday {
  name: string;
  date: Date;
  type: 'federal' | 'state' | 'governor-proclaimed';
  jurisdiction: string;
}

export class HolidayEngine {
  
  static getHolidays(year: number, jurisdiction: string): Holiday[] {
    const holidays: Holiday[] = [];
    
    if (jurisdiction === 'louisiana') {
      holidays.push(...this.getLouisianaHolidays(year));
    } else {
      holidays.push(...this.getFederalHolidays(year));
    }
    
    holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
    return holidays;
  }
  
  private static getFederalHolidays(year: number): Holiday[] {
    return [
      { name: "New Year's Day", date: this.observeWeekend(new Date(year, 0, 1)), type: 'federal', jurisdiction: 'federal' },
      { name: "Martin Luther King Jr. Day", date: this.getNthWeekdayOfMonth(year, 0, 1, 3), type: 'federal', jurisdiction: 'federal' },
      { name: "Presidents' Day", date: this.getNthWeekdayOfMonth(year, 1, 1, 3), type: 'federal', jurisdiction: 'federal' },
      { name: "Memorial Day", date: this.getLastWeekdayOfMonth(year, 4, 1), type: 'federal', jurisdiction: 'federal' },
      { name: "Independence Day", date: this.observeWeekend(new Date(year, 6, 4)), type: 'federal', jurisdiction: 'federal' },
      { name: "Labor Day", date: this.getNthWeekdayOfMonth(year, 8, 1, 1), type: 'federal', jurisdiction: 'federal' },
      { name: "Veterans Day", date: this.observeWeekend(new Date(year, 10, 11)), type: 'federal', jurisdiction: 'federal' },
      { name: "Thanksgiving Day", date: this.getNthWeekdayOfMonth(year, 10, 4, 4), type: 'federal', jurisdiction: 'federal' },
      { name: "Christmas Day", date: this.observeWeekend(new Date(year, 11, 25)), type: 'federal', jurisdiction: 'federal' }
    ];
  }
  
  private static getLouisianaHolidays(year: number): Holiday[] {
    const holidays: Holiday[] = [];
    
    holidays.push(
      { name: "New Year's Day", date: this.observeWeekend(new Date(year, 0, 1)), type: 'state', jurisdiction: 'louisiana' },
      { name: "Martin Luther King Jr. Day", date: this.getNthWeekdayOfMonth(year, 0, 1, 3), type: 'state', jurisdiction: 'louisiana' },
      { name: "Washington's Birthday (Presidents' Day)", date: this.getNthWeekdayOfMonth(year, 1, 1, 3), type: 'state', jurisdiction: 'louisiana' },
      { name: "Good Friday", date: this.getGoodFriday(year), type: 'state', jurisdiction: 'louisiana' },
      { name: "Memorial Day", date: this.getLastWeekdayOfMonth(year, 4, 1), type: 'state', jurisdiction: 'louisiana' },
      { name: "Independence Day", date: this.observeWeekend(new Date(year, 6, 4)), type: 'state', jurisdiction: 'louisiana' },
      { name: "Labor Day", date: this.getNthWeekdayOfMonth(year, 8, 1, 1), type: 'state', jurisdiction: 'louisiana' },
      { name: "All Saints' Day", date: this.observeWeekend(new Date(year, 10, 1)), type: 'state', jurisdiction: 'louisiana' },
      { name: "Veterans Day", date: this.observeWeekend(new Date(year, 10, 11)), type: 'state', jurisdiction: 'louisiana' },
      { name: "Thanksgiving Day", date: this.getNthWeekdayOfMonth(year, 10, 4, 4), type: 'state', jurisdiction: 'louisiana' },
      { name: "Day After Thanksgiving", date: this.getDayAfterThanksgiving(year), type: 'state', jurisdiction: 'louisiana' },
      { name: "Christmas Eve", date: new Date(year, 11, 24), type: 'state', jurisdiction: 'louisiana' },
      { name: "Christmas Day", date: this.observeWeekend(new Date(year, 11, 25)), type: 'state', jurisdiction: 'louisiana' },
      { name: "New Year's Eve", date: new Date(year, 11, 31), type: 'state', jurisdiction: 'louisiana' }
    );
    
    if (year === 2026) {
      holidays.push(
        { name: "Lundi Gras", date: new Date(2026, 1, 16), type: 'governor-proclaimed', jurisdiction: 'louisiana' },
        { name: "Mardi Gras", date: new Date(2026, 1, 17), type: 'governor-proclaimed', jurisdiction: 'louisiana' }
      );
    } else {
      holidays.push(
        { name: "Lundi Gras", date: this.getLundiGras(year), type: 'governor-proclaimed', jurisdiction: 'louisiana' },
        { name: "Mardi Gras", date: this.getMardiGras(year), type: 'governor-proclaimed', jurisdiction: 'louisiana' }
      );
    }
    
    return holidays;
  }
  
  private static getNthWeekdayOfMonth(year: number, month: number, weekday: number, occurrence: number): Date {
    let date = new Date(year, month, 1);
    let count = 0;
    while (date.getMonth() === month) {
      if (date.getDay() === weekday) {
        count++;
        if (count === occurrence) return date;
      }
      date.setDate(date.getDate() + 1);
    }
    throw new Error(`Could not find occurrence ${occurrence}`);
  }
  
  private static getLastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
    let date = new Date(year, month + 1, 0);
    while (date.getDay() !== weekday) {
      date.setDate(date.getDate() - 1);
    }
    return date;
  }
  
  private static observeWeekend(date: Date): Date {
    const day = date.getDay();
    const observed = new Date(date);
    if (day === 0) observed.setDate(observed.getDate() + 1);
    else if (day === 6) observed.setDate(observed.getDate() - 1);
    return observed;
  }
  
  private static getDayAfterThanksgiving(year: number): Date {
    const thanksgiving = this.getNthWeekdayOfMonth(year, 10, 4, 4);
    const dayAfter = new Date(thanksgiving);
    dayAfter.setDate(dayAfter.getDate() + 1);
    return dayAfter;
  }
  
  private static getGoodFriday(year: number): Date {
    const easter = this.getEaster(year);
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    return goodFriday;
  }
  
  private static getLundiGras(year: number): Date {
    const easter = this.getEaster(year);
    const lundiGras = new Date(easter);
    lundiGras.setDate(easter.getDate() - 48);
    return lundiGras;
  }
  
  private static getMardiGras(year: number): Date {
    const easter = this.getEaster(year);
    const mardiGras = new Date(easter);
    mardiGras.setDate(easter.getDate() - 47);
    return mardiGras;
  }
  
  private static getEaster(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
  }
}