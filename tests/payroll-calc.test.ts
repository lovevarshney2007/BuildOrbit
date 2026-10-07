import { calculatePayrollImpact, calculateSalaryDeduction, LeaveDayEntry, PayrollPolicy } from "../src/lib/domain/payroll-calc";
import { WorkingCalendar } from "../src/lib/domain/leave-days";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

const mockCalendar: WorkingCalendar = {
  weeklyOffDays: [],
  holidays: new Set()
};

const defaultPolicy: PayrollPolicy = {
  divisorMode: "CALENDAR_DAYS",
  fixedDivisor: 30,
  rounding: "ROUND"
};

const monthlySalary = 60000;
const year = 2026;
const month = 10; // October, 31 days

// 1. 0 LWP days
let impact = calculatePayrollImpact({
  monthlySalary,
  year, month,
  entries: [],
  policy: defaultPolicy,
  calendar: mockCalendar
});
assert(impact.leaveDeduction === 0, "0 LWP days should have 0 deduction");
assert(impact.deductibleDays === 0, "0 LWP days should have 0 deductible days");

// 2. 1 LWP day
impact = calculatePayrollImpact({
  monthlySalary,
  year, month,
  entries: [{ date: "2026-10-01", fraction: 1, bucket: "UNPAID_LEAVE", deductionPercent: 100 }],
  policy: defaultPolicy,
  calendar: mockCalendar
});
assert(impact.unpaidLeaveDays === 1, "Should have 1 unpaid leave day");
assert(impact.leaveDeduction === Math.round(monthlySalary / 31), `1 LWP day deduction is wrong: ${impact.leaveDeduction}`);

// 3. 3 LWP days
impact = calculatePayrollImpact({
  monthlySalary,
  year, month,
  entries: [
    { date: "2026-10-01", fraction: 1, bucket: "UNPAID_LEAVE", deductionPercent: 100 },
    { date: "2026-10-02", fraction: 1, bucket: "UNPAID_LEAVE", deductionPercent: 100 },
    { date: "2026-10-03", fraction: 1, bucket: "UNPAID_LEAVE", deductionPercent: 100 }
  ],
  policy: defaultPolicy,
  calendar: mockCalendar
});
assert(impact.unpaidLeaveDays === 3, "Should have 3 unpaid leave days");
assert(impact.leaveDeduction === Math.round((monthlySalary / 31) * 3), "3 LWP days deduction is wrong");

// 4. multiple LWP days (5 days)
impact = calculatePayrollImpact({
  monthlySalary,
  year, month,
  entries: Array.from({ length: 5 }, (_, i) => ({ date: `2026-10-${(i + 1).toString().padStart(2, '0')}`, fraction: 1, bucket: "UNPAID_LEAVE", deductionPercent: 100 })),
  policy: defaultPolicy,
  calendar: mockCalendar
});
assert(impact.leaveDeduction === Math.round((monthlySalary / 31) * 5), "5 LWP days deduction is wrong");

// 5. full-month unpaid leave
impact = calculatePayrollImpact({
  monthlySalary,
  year, month,
  entries: Array.from({ length: 31 }, (_, i) => ({ date: `2026-10-${(i + 1).toString().padStart(2, '0')}`, fraction: 1, bucket: "UNPAID_LEAVE", deductionPercent: 100 })),
  policy: defaultPolicy,
  calendar: mockCalendar
});
assert(impact.leaveDeduction === monthlySalary, "Full month LWP should deduct full salary");

// 6. paid leave
impact = calculatePayrollImpact({
  monthlySalary,
  year, month,
  entries: [
    { date: "2026-10-01", fraction: 1, bucket: "PAID_LEAVE", deductionPercent: 0 }
  ],
  policy: defaultPolicy,
  calendar: mockCalendar
});
assert(impact.leaveDeduction === 0, "Paid leave should have 0 deduction");
assert(impact.paidLeaveDays === 1, "Should have 1 paid leave day");

// 7. mixed paid + unpaid leave
impact = calculatePayrollImpact({
  monthlySalary,
  year, month,
  entries: [
    { date: "2026-10-01", fraction: 1, bucket: "PAID_LEAVE", deductionPercent: 0 },
    { date: "2026-10-02", fraction: 1, bucket: "UNPAID_LEAVE", deductionPercent: 100 }
  ],
  policy: defaultPolicy,
  calendar: mockCalendar
});
assert(impact.leaveDeduction === Math.round(monthlySalary / 31), "Mixed leave deduction should only count unpaid");

// 8. medical leave (assuming 0% deduction)
impact = calculatePayrollImpact({
  monthlySalary,
  year, month,
  entries: [
    { date: "2026-10-01", fraction: 1, bucket: "MEDICAL_LEAVE", deductionPercent: 0 }
  ],
  policy: defaultPolicy,
  calendar: mockCalendar
});
assert(impact.leaveDeduction === 0, "Medical leave should have 0 deduction");
assert(impact.medicalLeaveDays === 1, "Should have 1 medical leave day");

// 11. half-day unpaid leave
impact = calculatePayrollImpact({
  monthlySalary,
  year, month,
  entries: [
    { date: "2026-10-01", fraction: 0.5, bucket: "UNPAID_LEAVE", deductionPercent: 100 }
  ],
  policy: defaultPolicy,
  calendar: mockCalendar
});
assert(impact.leaveDeduction === Math.round((monthlySalary / 31) * 0.5), "Half day LWP deduction is wrong");

// 12. salary change
impact = calculatePayrollImpact({
  monthlySalary: 120000,
  year, month,
  entries: [
    { date: "2026-10-01", fraction: 1, bucket: "UNPAID_LEAVE", deductionPercent: 100 }
  ],
  policy: defaultPolicy,
  calendar: mockCalendar
});
assert(impact.leaveDeduction === Math.round(120000 / 31), "Salary change LWP deduction is wrong");

// 13. different payroll months & varying days in month (14-17)
const testMonths = [
  { year: 2026, month: 2, days: 28 }, // February
  { year: 2024, month: 2, days: 29 }, // Leap February
  { year: 2026, month: 4, days: 30 }, // April
  { year: 2026, month: 10, days: 31 } // October
];

testMonths.forEach(({ year, month, days }) => {
  const mImpact = calculatePayrollImpact({
    monthlySalary,
    year, month,
    entries: [
      { date: `${year}-${month.toString().padStart(2, '0')}-01`, fraction: 1, bucket: "UNPAID_LEAVE", deductionPercent: 100 }
    ],
    policy: defaultPolicy,
    calendar: mockCalendar
  });
  assert(mImpact.leaveDeduction === Math.round(monthlySalary / days), `LWP deduction for ${days}-day month is wrong`);
});

console.log("✅ All Payroll Calculation Tests Passed successfully!");
