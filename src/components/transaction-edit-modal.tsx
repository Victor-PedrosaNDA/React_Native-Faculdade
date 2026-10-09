import { useState, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import type { FinanceTransaction } from "@/hooks/use-finance";

const categories = {
  expense: [
    "Moradia",
    "Alimentação",
    "Transporte",
    "Saúde",
    "Lazer",
    "Contas",
    "Outros",
  ],
  income: [
    "Salário",
    "Freelance",
    "Investimentos",
    "Vendas",
    "Benefícios",
    "Outros",
  ],
} as const;

const paymentMethods = [
  "Pix",
  "Débito",
  "Crédito",
  "Dinheiro",
  "Boleto",
  "Transferência",
];

function isoToBr(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function brToIso(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }
  return `${year}-${month}-${day}`;
}

function parseAmount(value: string): number {
  const normalized = value
    .trim()
    .replace(/^R\$\s*/i, "")
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(?:,|$))/g, "")
    .replace(",", ".");
  return Number(normalized);
}

export function TransactionEditModal({
  transaction,
  onClose,
  onSave,
  onDelete,
}: {
  transaction: FinanceTransaction | null;
  onClose: () => void;
  onSave: (
    id: string,
    updates: Pick<
      FinanceTransaction,
      "title" | "amount" | "type" | "category" | "transactionDate"
    > &
      Partial<
        Pick<
          FinanceTransaction,
          "paymentMethod" | "recurring" | "incomeStatus"
        >
      >,
  ) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(() => transaction?.title ?? "");
  const [amountText, setAmountText] = useState(
    () =>
      transaction?.amount.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) ?? "",
  );
  const [type, setType] = useState<FinanceTransaction["type"]>(
    () => transaction?.type ?? "expense",
  );
  const [category, setCategory] = useState<string>(
    () => transaction?.category ?? categories.expense[1],
  );
  const [dateText, setDateText] = useState(() =>
    transaction ? isoToBr(transaction.transactionDate) : "",
  );
  const [paymentMethod, setPaymentMethod] = useState(
    () => transaction?.paymentMethod ?? paymentMethods[0],
  );
  const [recurring, setRecurring] = useState(
    () => transaction?.recurring ?? false,
  );
  const [incomeStatus, setIncomeStatus] =
    useState<NonNullable<FinanceTransaction["incomeStatus"]>>(
      () => transaction?.incomeStatus ?? "received",
    );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  function save() {
    if (!transaction) return;
    const amount = parseAmount(amountText);
    const transactionDate = brToIso(dateText);
    if (!title.trim()) {
      setError("Informe uma descrição para o lançamento.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Informe um valor válido maior que zero.");
      return;
    }
    if (!transactionDate) {
      setError("Informe uma data válida no formato DD/MM/AAAA.");
      return;
    }

    onSave(transaction.id, {
      title: title.trim(),
      amount,
      type,
      category,
      transactionDate,
      ...(type === "expense"
        ? { paymentMethod, recurring }
        : { incomeStatus }),
    });
    onClose();
  }

  function selectType(nextType: FinanceTransaction["type"]) {
    setType(nextType);
    setCategory(categories[nextType][0]);
  }

  return (
    <Modal
      visible={transaction !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <ThemedView style={styles.sheet} type="backgroundElement">
          {confirmDelete ? (
            <>
              <ThemedText type="subtitle">Excluir lançamento?</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Essa ação não pode ser desfeita.
              </ThemedText>
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setConfirmDelete(false)}
                  style={styles.secondaryButton}
                >
                  <ThemedText type="smallBold">Cancelar</ThemedText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    if (transaction) onDelete(transaction.id);
                    onClose();
                  }}
                  style={styles.deleteButton}
                >
                  <ThemedText type="smallBold" style={styles.buttonText}>
                    Excluir
                  </ThemedText>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={styles.header}>
                <ThemedText type="subtitle">Editar lançamento</ThemedText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fechar edição"
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <ThemedText type="subtitle">×</ThemedText>
                </Pressable>
              </View>
              <ScrollView
                contentContainerStyle={styles.fields}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.types}>
                  {(["expense", "income"] as const).map((item) => (
                    <Pressable
                      key={item}
                      accessibilityRole="button"
                      accessibilityState={{ selected: type === item }}
                      onPress={() => selectType(item)}
                      style={[
                        styles.typeButton,
                        type === item && styles.typeSelected,
                      ]}
                    >
                      <ThemedText
                        type="smallBold"
                        style={type === item && styles.buttonText}
                      >
                        {item === "expense" ? "Despesa" : "Receita"}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
                <Field label="Descrição">
                  <TextInput
                    accessibilityLabel="Descrição do lançamento"
                    onChangeText={setTitle}
                    style={styles.input}
                    value={title}
                  />
                </Field>
                <Field label="Valor (R$)">
                  <TextInput
                    accessibilityLabel="Valor do lançamento"
                    keyboardType="decimal-pad"
                    onChangeText={setAmountText}
                    style={styles.input}
                    value={amountText}
                  />
                </Field>
                <Field label="Data (DD/MM/AAAA)">
                  <TextInput
                    accessibilityLabel="Data do lançamento"
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                    onChangeText={(value) => {
                      const digits = value.replace(/\D/g, "").slice(0, 8);
                      setDateText(
                        digits.length > 4
                          ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
                          : digits.length > 2
                            ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                            : digits,
                      );
                    }}
                    style={styles.input}
                    value={dateText}
                  />
                </Field>
                <ThemedText type="smallBold">Categoria</ThemedText>
                <View style={styles.options}>
                  {categories[type].map((item) => (
                    <Option
                      key={item}
                      label={item}
                      selected={category === item}
                      onPress={() => setCategory(item)}
                    />
                  ))}
                </View>
                {type === "expense" ? (
                  <>
                    <ThemedText type="smallBold">Forma de pagamento</ThemedText>
                    <View style={styles.options}>
                      {paymentMethods.map((item) => (
                        <Option
                          key={item}
                          label={item}
                          selected={paymentMethod === item}
                          onPress={() => setPaymentMethod(item)}
                        />
                      ))}
                    </View>
                    <Pressable
                      accessibilityRole="switch"
                      accessibilityState={{ checked: recurring }}
                      onPress={() => setRecurring((value) => !value)}
                      style={styles.toggleRow}
                    >
                      <ThemedText type="small">
                        {recurring ? "☑" : "☐"} Despesa recorrente
                      </ThemedText>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <ThemedText type="smallBold">Recebimento</ThemedText>
                    <View style={styles.options}>
                      <Option
                        label="Já recebi"
                        selected={incomeStatus === "received"}
                        onPress={() => setIncomeStatus("received")}
                      />
                      <Option
                        label="Vou receber"
                        selected={incomeStatus === "expected"}
                        onPress={() => setIncomeStatus("expected")}
                      />
                    </View>
                  </>
                )}
                {!!error && <ThemedText style={styles.error}>{error}</ThemedText>}
                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setConfirmDelete(true)}
                    style={styles.deleteButton}
                  >
                    <ThemedText type="smallBold" style={styles.buttonText}>
                      Excluir
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={save}
                    style={styles.saveButton}
                  >
                    <ThemedText type="smallBold" style={styles.buttonText}>
                      Salvar alterações
                    </ThemedText>
                  </Pressable>
                </View>
              </ScrollView>
            </>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      {children}
    </View>
  );
}

function Option({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <ThemedText
        type="smallBold"
        style={selected ? styles.buttonText : styles.optionText}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "92%",
    alignSelf: "center",
    padding: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  fields: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 46,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 10,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  types: {
    flexDirection: "row",
    gap: Spacing.two,
    padding: Spacing.one,
    borderRadius: 12,
    backgroundColor: "#1f2937",
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  typeSelected: {
    backgroundColor: "#166534",
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.one,
  },
  option: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  optionSelected: {
    backgroundColor: "#166534",
  },
  optionText: {
    color: "#111827",
  },
  toggleRow: {
    paddingVertical: Spacing.one,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  secondaryButton: {
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
  },
  saveButton: {
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
    backgroundColor: "#166534",
  },
  deleteButton: {
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.two,
    borderRadius: 10,
    backgroundColor: "#b91c1c",
  },
  buttonText: {
    color: "#ffffff",
  },
  error: {
    color: "#dc2626",
  },
});
