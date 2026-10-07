import { createContext, ReactNode, useContext, useState } from "react";

export type FinanceTransaction = {
  id: string;
  title: string;
  detail: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  transactionDate: string;
  paymentMethod?: string;
  recurring?: boolean;
  incomeStatus?: "received" | "expected";
};

export type TransactionDetails = {
  transactionDate?: string;
  paymentMethod?: string;
  recurring?: boolean;
  incomeStatus?: "received" | "expected";
};

type FinanceContextValue = {
  transactions: FinanceTransaction[];
  balance: number;
  income: number;
  expectedIncome: number;
  expenses: number;
  addTransaction: (
    title: string,
    amount: number,
    type: "income" | "expense",
    category: string,
    details?: TransactionDetails,
  ) => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const income = transactions
    .filter(
      (item) => item.type === "income" && item.incomeStatus !== "expected",
    )
    .reduce((total, item) => total + item.amount, 0);
  const expectedIncome = transactions
    .filter(
      (item) => item.type === "income" && item.incomeStatus === "expected",
    )
    .reduce((total, item) => total + item.amount, 0);
  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);
  const balance = income - expenses;

  function addTransaction(
    title: string,
    amount: number,
    type: "income" | "expense",
    category: string,
    details?: TransactionDetails,
  ) {
    const now = new Date();
    const transactionDate =
      details?.transactionDate ??
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const detail = new Date(`${transactionDate}T12:00:00`).toLocaleDateString(
      "pt-BR",
    );

    setTransactions((current) => [
      {
        id: `${Date.now()}`,
        title,
        detail,
        amount,
        type,
        category,
        transactionDate,
        ...details,
      },
      ...current,
    ]);
  }

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        balance,
        income,
        expectedIncome,
        expenses,
        addTransaction,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error("useFinance precisa estar dentro de FinanceProvider.");
  }

  return context;
}
