import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { createTransactionStorage } from "@/utils/transaction-storage";

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
  updateTransaction: (
    id: string,
    updates: Pick<
      FinanceTransaction,
      "title" | "amount" | "type" | "category" | "transactionDate"
    > &
      Partial<Pick<FinanceTransaction, "paymentMethod" | "recurring" | "incomeStatus">>,
  ) => void;
  deleteTransaction: (id: string) => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);
const transactionStorage = createTransactionStorage(AsyncStorage);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    transactionStorage
      .load()
      .then((savedTransactions) => {
        if (!active) return;
        setTransactions(savedTransactions);
        setLoadError(null);
        setIsReady(true);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os lançamentos salvos.",
        );
      });

    return () => {
      active = false;
    };
  }, [loadAttempt]);

  useEffect(() => {
    if (!isReady) return;
    const snapshot = transactions;
    saveQueue.current = saveQueue.current.then(async () => {
      try {
        await transactionStorage.save(snapshot);
        setSaveError(null);
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : "Não foi possível salvar os lançamentos neste aparelho.",
        );
      }
    });
  }, [isReady, transactions]);
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
    if (!isReady) return;
    const now = new Date();
    const transactionDate =
      details?.transactionDate ??
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const detail = new Date(`${transactionDate}T12:00:00`).toLocaleDateString(
      "pt-BR",
    );

    setTransactions((current) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      return [
        {
          id,
          title,
          detail,
          amount,
          type,
          category,
          transactionDate,
          ...details,
          incomeStatus:
            type === "income"
              ? (details?.incomeStatus ?? "received")
              : undefined,
          paymentMethod:
            type === "expense" ? details?.paymentMethod : undefined,
          recurring: type === "expense" ? details?.recurring : undefined,
        },
        ...current,
      ];
    });
  }

  function updateTransaction(
    id: string,
    updates: Pick<
      FinanceTransaction,
      "title" | "amount" | "type" | "category" | "transactionDate"
    > &
      Partial<Pick<FinanceTransaction, "paymentMethod" | "recurring" | "incomeStatus">>,
  ) {
    if (!isReady) return;
    const detail = new Date(`${updates.transactionDate}T12:00:00`).toLocaleDateString(
      "pt-BR",
    );
    setTransactions((current) =>
      current.map((transaction) => {
        if (transaction.id !== id) return transaction;
        return {
          ...transaction,
          ...updates,
          incomeStatus:
            updates.type === "income"
              ? (updates.incomeStatus ?? "received")
              : undefined,
          paymentMethod:
            updates.type === "expense" ? updates.paymentMethod : undefined,
          recurring:
            updates.type === "expense" ? updates.recurring : undefined,
          detail,
        };
      }),
    );
  }

  function deleteTransaction(id: string) {
    if (!isReady) return;
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id),
    );
  }

  function retrySave() {
    const snapshot = transactions;
    saveQueue.current = saveQueue.current.then(async () => {
      try {
        await transactionStorage.save(snapshot);
        setSaveError(null);
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : "Não foi possível salvar os lançamentos neste aparelho.",
        );
      }
    });
  }

  if (!isReady) {
    return (
      <View style={styles.statusScreen}>
        <ThemedView style={styles.statusCard} type="backgroundElement">
          {loadError ? (
            <>
              <ThemedText type="subtitle">
                Não foi possível abrir seus dados
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {loadError}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setLoadError(null);
                  setLoadAttempt((attempt) => attempt + 1);
                }}
                style={styles.retryButton}
              >
                <ThemedText type="smallBold" style={styles.retryText}>
                  Tentar novamente
                </ThemedText>
              </Pressable>
            </>
          ) : (
            <>
              <ActivityIndicator accessibilityLabel="Carregando lançamentos" />
              <ThemedText type="small" themeColor="textSecondary">
                Carregando seus lançamentos salvos…
              </ThemedText>
            </>
          )}
        </ThemedView>
      </View>
    );
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
        updateTransaction,
        deleteTransaction,
      }}
    >
      <View style={styles.app}>
        {saveError ? (
          <View accessibilityRole="alert" style={styles.errorBanner}>
            <ThemedText type="small" style={styles.errorText}>
              {`Não foi possível salvar os dados: ${saveError}`}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={retrySave}
              style={styles.retrySaveButton}
            >
              <ThemedText type="smallBold" style={styles.retryText}>
                Tentar novamente
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
        {children}
      </View>
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

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  statusScreen: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.four,
  },
  statusCard: {
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: 20,
  },
  retryButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    backgroundColor: "#166534",
  },
  retrySaveButton: {
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
  },
  retryText: {
    color: "#ffffff",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    padding: Spacing.two,
    backgroundColor: "#fee2e2",
  },
  errorText: {
    flex: 1,
    color: "#991b1b",
  },
});
