import { createContext, ReactNode, useContext, useState } from "react";

export type FinanceTransaction = {
  id: string;
  title: string;
  detail: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  paymentMethod?: string;
  recurring?: boolean;
  incomeStatus?: "received" | "expected";
};

export type TransactionDetails = {
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

const initialTransactions: FinanceTransaction[] = [
  {
    id: "1",
    title: "Salário",
    detail: "Hoje · 10:18",
    amount: 2400,
    type: "income",
    category: "Renda",
  },
  {
    id: "2",
    title: "Supermercado",
    detail: "Hoje · 08:20",
    amount: 238,
    type: "expense",
    category: "Alimentação",
  },
  {
    id: "3",
    title: "Academia",
    detail: "Ontem · 19:05",
    amount: 89,
    type: "expense",
    category: "Saúde",
  },
  {
    id: "4",
    title: "Freelance",
    detail: "Ontem · 16:40",
    amount: 780,
    type: "income",
    category: "Renda",
  },
];

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [balance, setBalance] = useState(7840);
  const [income, setIncome] = useState(4200);
  const [expectedIncome, setExpectedIncome] = useState(0);
  const [expenses, setExpenses] = useState(2980);

  function addTransaction(
    title: string,
    amount: number,
    type: "income" | "expense",
    category: string,
    details?: TransactionDetails,
  ) {
    const now = new Date();
    const detail = `Hoje · ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

    setTransactions((current) => [
      {
        id: `${Date.now()}`,
        title,
        detail,
        amount,
        type,
        category,
        ...details,
      },
      ...current,
    ]);
    if (type === "income") {
      if (details?.incomeStatus === "expected") {
        setExpectedIncome((current) => current + amount);
      } else {
        setBalance((current) => current + amount);
        setIncome((current) => current + amount);
      }
    } else {
      setBalance((current) => current - amount);
      setExpenses((current) => current + amount);
    }
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
