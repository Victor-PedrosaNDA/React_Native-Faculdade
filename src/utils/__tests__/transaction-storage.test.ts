import {
  createTransactionStorage,
  parseStoredTransactions,
} from "@/utils/transaction-storage";
import type { AsyncKeyValueStorage } from "@/utils/transaction-storage";
import type { FinanceTransaction } from "@/hooks/use-finance";

const sampleTransaction: FinanceTransaction = {
  id: "tx-1",
  title: "Mercado",
  detail: "08/10/2026",
  amount: 125.5,
  type: "expense",
  category: "Alimentação",
  transactionDate: "2026-10-08",
  paymentMethod: "Pix",
  recurring: false,
};

function memoryStorage(initial: string | null = null) {
  let value = initial;
  const getItem = jest.fn(async (_key: string) => value);
  const setItem = jest.fn(async (_key: string, nextValue: string) => {
    value = nextValue;
  });
  const storage: AsyncKeyValueStorage = {
    getItem,
    setItem,
  };
  return { storage, getValue: () => value };
}

describe("local transaction storage", () => {
  it("loads an empty list when there is no previous data", async () => {
    const { storage } = memoryStorage();
    const store = createTransactionStorage(storage);

    await expect(store.load()).resolves.toEqual([]);
  });

  it("persists and restores transactions using the versioned envelope", async () => {
    const { storage, getValue } = memoryStorage();
    const store = createTransactionStorage(storage);

    await store.save([sampleTransaction]);

    expect(JSON.parse(getValue() as string)).toEqual({
      version: 1,
      transactions: [sampleTransaction],
    });
    await expect(store.load()).resolves.toEqual([sampleTransaction]);
  });

  it("uses the provided storage key", async () => {
    const { storage } = memoryStorage();
    const store = createTransactionStorage(storage, "test.transactions");

    await store.load();

    expect(storage.getItem).toHaveBeenCalledWith("test.transactions");
  });

  it("reports corrupt serialized data without replacing it", () => {
    expect(() => parseStoredTransactions("{invalid json")).toThrow(
      "Os lançamentos salvos estão corrompidos",
    );
    expect(() =>
      parseStoredTransactions(
        JSON.stringify({ version: 1, transactions: [{ id: "broken" }] }),
      ),
    ).toThrow("O formato dos lançamentos salvos não é reconhecido");
  });

  it("rejects transactions with impossible calendar dates", () => {
    expect(() =>
      parseStoredTransactions(
        JSON.stringify({
          version: 1,
          transactions: [
            { ...sampleTransaction, transactionDate: "2026-02-31" },
          ],
        }),
      ),
    ).toThrow("O formato dos lançamentos salvos não é reconhecido");
  });
});
