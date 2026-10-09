import {
  belongsToMonth,
  filterTransactions,
  groupTransactionsByDate,
  shiftMonth,
  summarizeTransactions,
  transactionsToCsv,
} from "@/utils/finance";
import type { FinanceTransaction } from "@/hooks/use-finance";

const transactions: FinanceTransaction[] = [
  {
    id: "expense-1",
    title: "Almoço",
    detail: "08/10/2026",
    amount: 45.9,
    type: "expense",
    category: "Alimentação",
    transactionDate: "2026-10-08",
  },
  {
    id: "income-1",
    title: "Salário",
    detail: "07/10/2026",
    amount: 1250,
    type: "income",
    category: "Salário",
    transactionDate: "2026-10-07",
  },
  {
    id: "income-expected",
    title: "Bônus previsto",
    detail: "06/10/2026",
    amount: 100,
    type: "income",
    category: "Salário",
    transactionDate: "2026-10-06",
    incomeStatus: "expected",
  },
  {
    id: "expense-september",
    title: "Mercado",
    detail: "30/09/2026",
    amount: 10.1,
    type: "expense",
    category: "Alimentação",
    transactionDate: "2026-09-30",
  },
];

describe("monthly finance utilities", () => {
  it("calculates monthly totals in cents and excludes expected income from balance", () => {
    const october = transactions.filter((transaction) =>
      belongsToMonth(transaction, { year: 2026, month: 10 }),
    );
    const summary = summarizeTransactions(october);

    expect(summary).toMatchObject({
      income: 1250,
      expenses: 45.9,
      balance: 1204.1,
    });
    expect(summary.byCategory[0]).toMatchObject({
      category: "Alimentação",
      total: 45.9,
      percent: 100,
    });
  });

  it("shifts months across year boundaries", () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({
      year: 2027,
      month: 1,
    });
    expect(shiftMonth({ year: 2027, month: 1 }, -1)).toEqual({
      year: 2026,
      month: 12,
    });
  });

  it("searches without accent sensitivity and filters transaction type", () => {
    expect(filterTransactions(transactions, "all", "aliment")).toHaveLength(2);
    expect(filterTransactions(transactions, "expense", "ALMOCO")).toHaveLength(
      1,
    );
    expect(filterTransactions(transactions, "income", "mercado")).toHaveLength(
      0,
    );
  });

  it("groups transactions by date in reverse chronological order", () => {
    expect(groupTransactionsByDate(transactions).map((group) => group.date)).toEqual([
      "2026-10-08",
      "2026-10-07",
      "2026-10-06",
      "2026-09-30",
    ]);
  });

  it("quotes CSV fields and neutralizes spreadsheet formulas", () => {
    const csv = transactionsToCsv([
      {
        ...transactions[0],
        title: '=HYPERLINK("https://example.com")',
      },
    ]);

    expect(csv).toContain('"\'=HYPERLINK(""https://example.com"")"');
    expect(csv.startsWith("\uFEFF")).toBe(true);
  });
});
