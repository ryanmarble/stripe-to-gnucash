export const DefaultCurrencyGuid = "4a99222352d94e43afc12a472f3d6cb4";
export const unitDenominator = 100;

export const defaultEarnings = {
  Salary: undefined,
  "1099-NEC": undefined,
  Reimbursement: "@Liabilities:Accounts Payable:Employee Reimbursments",
  other: undefined,
};

export const defaultExpenses = {
  Medicare: undefined,
  "Social Security": undefined,
  "AZ Unemploy": undefined,
};

export const defaultCompanyTaxExpenseLiabilites = {
  Medicare:
    "Liabilities:Payroll Liabilities:Federal Employer Tax Payable:Employer Medicare Tax",
  "Social Security":
    "Liabilities:Payroll Liabilities:Federal Employer Tax Payable:Employer Social Security Tax",
  "AZ Unemploy":
    "Liabilities:Payroll Liabilities:Arizona Unemployment Insurance Tax",
};

export const defaultWithholdings = {
  Medicare:
    "@Liabilities:Payroll Liabilities:Federal Withholding Payable:Medicare Tax",
  "Social Security":
    "@Liabilities:Payroll Liabilities:Federal Withholding Payable:Social Security Tax",
  "Fed Income Tax":
    "@Liabilities:Payroll Liabilities:Federal Withholding Payable:Federal Income Tax",
  "AZ Income Tax":
    "@Liabilities:Payroll Liabilities:Arizona Withholding Payable",
};

export const Accounts = {
  charges: {
    debit: "Stripe Account",
    credit: "Individual USD Donations",
  },
  fees: {
    debit: "Donation Processing Fees",
    credit: "Stripe Account",
  },
  payouts: {
    debit: "Checking Account 1603",
    credit: "Stripe Account",
  },
  payrollFunding:
    "Assets:Current Assets:Checking Accounts:Checking Account 1603",
  payroll: {
    "121 NFC Officer Work": {
      prefix:
        "Expenses:Program Expenses:Navigating Fetal Concerns Program Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Officer Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "310 M&G Officer Work": {
      prefix: "Expenses:Management & General Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Officer Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "111 She Might Officer Work": {
      prefix: "Expenses:Program Expenses:She Might Program Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Officer Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "131 Wilberforce Officer Work": {
      prefix:
        "Expenses:Program Expenses:Wilberforce Project Program Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Officer Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "233 WP Fundraising Ofc. Work": {
      prefix:
        "Expenses:Fundraising Expenses:Wilberforce Project Fundraising Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Officer Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "210 Fundraising Officer Work": {
      prefix:
        "Expenses:Fundraising Expenses:General Fundraising Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Officer Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "101 General Programs Ofc. Work": {
      prefix: "Expenses:Program Expenses:General Program Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Officer Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "320 M&G Employee Work": {
      prefix: "Expenses:Management & General Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Employee Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "122 NFC Employee Work": {
      prefix:
        "Expenses:Program Expenses:Navigating Fetal Concerns Program Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Employee Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "112 She Might Employee Work": {
      prefix: "Expenses:Program Expenses:She Might Program Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Employee Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "132 Wilberforce Employee Work": {
      prefix:
        "Expenses:Program Expenses:Wilberforce Project Program Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Employee Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "234 WP Fundraising Emp. Work": {
      prefix:
        "Expenses:Fundraising Expenses:Wilberforce Project Fundraising Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Employee Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "102 General Programs Emp. Work": {
      prefix: "Expenses:Program Expenses:General Program Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Employee Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "220 Fundraising Employee Work": {
      prefix:
        "Expenses:Fundraising Expenses:General Fundraising Expenses:Payroll",
      earnings: {
        ...defaultEarnings,
        Salary: "Employee Salaries",
        other: "Employee Benefits",
      },
      expense: {
        ...defaultExpenses,
        Medicare: "Payroll Tax",
        "Social Security": "Payroll Tax",
        "AZ Unemploy": "Payroll Tax",
      },
      withholding: defaultWithholdings,
    },
    "331 M&G Other Contractor Work": {
      prefix: "Expenses:Management & General Expenses:Contractors",
      earnings: {
        ...defaultEarnings,
        "1099-NEC": "Other Contractors",
      },
      expense: {
        ...defaultExpenses,
      },
      withholding: defaultWithholdings,
    },
  },
};

export type ValidLaborAssignments = keyof typeof Accounts.payroll;

interface transactionDescriptionParameters {
  name: string | null;
}

export function transactionDescription({
  name,
}: transactionDescriptionParameters): string {
  return `Donation from ${name ?? "anonymous"} via Stripe`;
}
