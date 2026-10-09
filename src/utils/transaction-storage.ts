import type { FinanceTransaction } from "@/hooks/use-finance";

export type AsyncKeyValueStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

const storageKey = "fintrack.transactions.v1";
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!isoDatePattern.test(value)) return false;
  const date = new Date(`${value}T12:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function isTransaction(value: unknown): value is FinanceTransaction {
  if (typeof value !== "object" || value === null) return false;
  const transaction = value as Record<string, unknown>;
  const validOptionalFields =
    (transaction.paymentMethod === undefined ||
      typeof transaction.paymentMethod === "string") &&
    (transaction.recurring === undefined ||
      typeof transaction.recurring === "boolean") &&
    (transaction.incomeStatus === undefined ||
      transaction.incomeStatus === "received" ||
      transaction.incomeStatus === "expected");

  return (
    typeof transaction.id === "string" &&
    typeof transaction.title === "string" &&
    typeof transaction.detail === "string" &&
    typeof transaction.amount === "number" &&
    Number.isFinite(transaction.amount) &&
    transaction.amount > 0 &&
    (transaction.type === "income" || transaction.type === "expense") &&
    typeof transaction.category === "string" &&
    typeof transaction.transactionDate === "string" &&
    isValidIsoDate(transaction.transactionDate) &&
    validOptionalFields
  );
}

export function parseStoredTransactions(
  serialized: string | null,
): FinanceTransaction[] {
  if (serialized === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new Error(
      "Os lançamentos salvos estão corrompidos. Os dados foram preservados; tente novamente ou exporte um backup do armazenamento.",
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("version" in parsed) ||
    parsed.version !== 1 ||
    !("transactions" in parsed) ||
    !Array.isArray(parsed.transactions) ||
    !parsed.transactions.every(isTransaction)
  ) {
    throw new Error(
      "O formato dos lançamentos salvos não é reconhecido. Os dados foram preservados.",
    );
  }

  return parsed.transactions;
}

export function createTransactionStorage(
  storage: AsyncKeyValueStorage,
  key = storageKey,
) {
  return {
    async load(): Promise<FinanceTransaction[]> {
      return parseStoredTransactions(await storage.getItem(key));
    },
    async save(transactions: FinanceTransaction[]): Promise<void> {
      await storage.setItem(
        key,
        JSON.stringify({ version: 1, transactions }),
      );
    },
  };
}
