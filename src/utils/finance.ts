import type { FinanceTransaction } from "@/hooks/use-finance";

export type YearMonth = {
  year: number;
  month: number;
};

export type CategoryTotal = {
  category: string;
  total: number;
  percent: number;
  color: string;
};

export type FinanceSummary = {
  income: number;
  expenses: number;
  balance: number;
  byCategory: CategoryTotal[];
};

export type TransactionGroup = {
  date: string;
  transactions: FinanceTransaction[];
};

const categoryColors: Record<string, string> = {
  Moradia: "#8b5cf6",
  Alimentação: "#f59e0b",
  Transporte: "#3b82f6",
  Saúde: "#ec4899",
  Lazer: "#06b6d4",
  Contas: "#64748b",
  Outros: "#10b981",
};

const monthNames = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function currentYearMonth(date = new Date()): YearMonth {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function shiftMonth(value: YearMonth, delta: number): YearMonth {
  const date = new Date(value.year, value.month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function monthLabel(value: YearMonth): string {
  return `${monthNames[value.month - 1]} ${value.year}`;
}

export function belongsToMonth(
  transaction: FinanceTransaction,
  value: YearMonth,
): boolean {
  const [year, month] = transaction.transactionDate.split("-").map(Number);
  return year === value.year && month === value.month;
}

export function summarizeTransactions(
  transactions: FinanceTransaction[],
): FinanceSummary {
  let incomeCents = 0;
  let expenseCents = 0;
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    const amountCents = Math.round(transaction.amount * 100);
    if (transaction.type === "income") {
      if (transaction.incomeStatus !== "expected") {
        incomeCents += amountCents;
      }
      continue;
    }

    expenseCents += amountCents;
    totals.set(
      transaction.category,
      (totals.get(transaction.category) ?? 0) + amountCents,
    );
  }

  const byCategory = Array.from(totals, ([category, cents]) => ({
    category,
    total: cents / 100,
    percent: expenseCents > 0 ? (cents / expenseCents) * 100 : 0,
    color: categoryColors[category] ?? "#94a3b8",
  })).sort((first, second) => second.total - first.total);

  return {
    income: incomeCents / 100,
    expenses: expenseCents / 100,
    balance: (incomeCents - expenseCents) / 100,
    byCategory,
  };
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function filterTransactions(
  transactions: FinanceTransaction[],
  filter: "all" | FinanceTransaction["type"],
  query: string,
): FinanceTransaction[] {
  const normalizedQuery = normalize(query.trim());
  return transactions.filter((transaction) => {
    if (filter !== "all" && transaction.type !== filter) return false;
    if (!normalizedQuery) return true;
    return normalize(`${transaction.title} ${transaction.category}`).includes(
      normalizedQuery,
    );
  });
}

export function groupTransactionsByDate(
  transactions: FinanceTransaction[],
): TransactionGroup[] {
  const groups = new Map<string, FinanceTransaction[]>();
  for (const transaction of transactions) {
    const group = groups.get(transaction.transactionDate) ?? [];
    group.push(transaction);
    groups.set(transaction.transactionDate, group);
  }

  return Array.from(groups, ([date, groupedTransactions]) => ({
    date,
    transactions: groupedTransactions,
  })).sort((first, second) => second.date.localeCompare(first.date));
}

function csvCell(value: string): string {
  const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export function transactionsToCsv(transactions: FinanceTransaction[]): string {
  const rows = [
    [
      "Data",
      "Tipo",
      "Descrição",
      "Categoria",
      "Valor",
      "Forma de pagamento",
      "Recorrente",
      "Situação",
    ],
    ...transactions.map((transaction) => [
      transaction.transactionDate,
      transaction.type === "income" ? "Receita" : "Despesa",
      transaction.title,
      transaction.category,
      transaction.amount.toFixed(2).replace(".", ","),
      transaction.paymentMethod ?? "",
      transaction.recurring ? "Sim" : "Não",
      transaction.incomeStatus === "expected" ? "A receber" : "Confirmado",
    ]),
  ];

  return `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
}

export function formatTransactionDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function isoDateToday(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
