import { router } from "expo-router";
import { useState } from "react";
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
import { FinanceTransaction, useFinance } from "@/hooks/use-finance";

type TransactionType = FinanceTransaction["type"];

const options: Record<TransactionType, string[]> = {
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
};

const paymentMethods = [
  "Pix",
  "Débito",
  "Crédito",
  "Dinheiro",
  "Boleto",
  "Transferência",
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isSameDate(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export default function NewTransactionScreen() {
  const [type, setType] = useState<TransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amountDigits, setAmountDigits] = useState("");
  const [centsDigits, setCentsDigits] = useState("");
  const [transactionDate, setTransactionDate] = useState(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [category, setCategory] = useState("Alimentação");
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [recurring, setRecurring] = useState(false);
  const [incomeStatus, setIncomeStatus] = useState<"received" | "expected">(
    "received",
  );
  const [error, setError] = useState("");
  const { addTransaction } = useFinance();
  const calendarMonthLabel = calendarMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const calendarStartDay = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1,
  ).getDay();
  const calendarDaysCount = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0,
  ).getDate();
  const calendarCells = Array.from(
    { length: calendarStartDay + calendarDaysCount },
    (_, index) => index - calendarStartDay + 1,
  );

  function selectType(nextType: TransactionType) {
    setType(nextType);
    setCategory(options[nextType][0]);
  }

  function save() {
    const amount =
      Number(amountDigits || 0) +
      Number(centsDigits.padStart(2, "0").slice(0, 2)) / 100;

    if (!title.trim()) {
      setError(
        type === "expense"
          ? "Dê um nome para essa despesa."
          : "Informe de onde vem essa receita.",
      );
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Digite um valor válido maior que zero.");
      return;
    }

    addTransaction(
      title.trim(),
      amount,
      type,
      category,
      type === "expense"
        ? {
            paymentMethod,
            recurring,
            transactionDate: formatDateKey(transactionDate),
          }
        : { incomeStatus, transactionDate: formatDateKey(transactionDate) },
    );
    setTitle("");
    setAmountDigits("");
    setCentsDigits("");
    setTransactionDate(new Date());
    setType("expense");
    setCategory(options.expense[0]);
    setPaymentMethod(paymentMethods[0]);
    setRecurring(false);
    setIncomeStatus("received");
    setError("");
    router.navigate("/");
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate("/")}
            style={styles.backButton}
          >
            <ThemedText type="subtitle">‹</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Novo lançamento</ThemedText>
        </View>

        <View style={styles.typeSelector}>
          {(["expense", "income"] as const).map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: type === item }}
              onPress={() => selectType(item)}
              style={[
                styles.typeButton,
                type === item &&
                  (item === "expense"
                    ? styles.expenseSelected
                    : styles.incomeSelected),
              ]}
            >
              <ThemedText
                type="smallBold"
                style={[
                  styles.typeLabel,
                  type === item && styles.typeSelectedText,
                ]}
              >
                {item === "expense" ? "Despesa" : "Receita"}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedView style={styles.explanation} type="backgroundElement">
          <ThemedText type="smallBold">
            {type === "expense"
              ? "Registrar uma despesa"
              : "Registrar uma receita"}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {type === "expense"
              ? "Anote o que você pagou ou ainda vai pagar. A despesa será descontada do seu saldo e aparecerá nos seus gastos por categoria."
              : incomeStatus === "expected"
                ? "Registre um valor que ainda vai entrar. Ele aparecerá como previsto na carteira, sem alterar seu saldo até o recebimento."
                : "Registre um valor que já entrou. Ele será somado ao seu saldo e ficará identificado na carteira."}
          </ThemedText>
        </ThemedView>

        <View style={styles.field}>
          <ThemedText type="smallBold">
            {type === "expense"
              ? "O que você pagou?"
              : "De onde veio esse dinheiro?"}
          </ThemedText>
          <TextInput
            accessibilityLabel={
              type === "expense" ? "Descrição da despesa" : "Origem da receita"
            }
            onChangeText={setTitle}
            placeholder={
              type === "expense"
                ? "Ex.: compra do mercado"
                : "Ex.: pagamento do trabalho"
            }
            style={styles.input}
            value={title}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold">Data do lançamento</ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setCalendarMonth(
                new Date(
                  transactionDate.getFullYear(),
                  transactionDate.getMonth(),
                  1,
                ),
              );
              setCalendarVisible(true);
            }}
            style={styles.datePickerButton}
          >
            <ThemedText type="smallBold" style={styles.datePickerLabel}>
              {transactionDate.toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </ThemedText>
            <ThemedText type="smallBold" style={styles.datePickerLabel}>
              Escolher data
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold">
            {type === "expense" ? "Quanto custou?" : "Quanto recebeu?"}
          </ThemedText>
          <View style={styles.amountInputs}>
            <View style={styles.reaisInput}>
              <ThemedText type="smallBold">Reais</ThemedText>
              <TextInput
                accessibilityLabel="Valor em reais"
                keyboardType="number-pad"
                onChangeText={(value) =>
                  setAmountDigits(
                    value
                      .replace(/\D/g, "")
                      .replace(/^0+(?=\d)/, "")
                      .slice(0, 12),
                  )
                }
                placeholder="0"
                style={styles.input}
                value={amountDigits}
              />
            </View>
            <View style={styles.centsInput}>
              <ThemedText type="smallBold">Centavos</ThemedText>
              <TextInput
                accessibilityLabel="Centavos"
                keyboardType="number-pad"
                maxLength={2}
                onChangeText={(value) =>
                  setCentsDigits(value.replace(/\D/g, "").slice(0, 2))
                }
                placeholder="00"
                style={styles.input}
                value={centsDigits}
              />
            </View>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Centavos são opcionais. Exemplo: 50 reais e 75 centavos.
          </ThemedText>
          <ThemedText type="smallBold" style={styles.amountPreview}>
            Total:{" "}
            {currency.format(
              Number(amountDigits || 0) +
                Number(centsDigits.padStart(2, "0").slice(0, 2)) / 100,
            )}
          </ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold">
            {type === "expense" ? "Em qual categoria?" : "Qual é a origem?"}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {type === "expense"
              ? "A categoria ajuda a entender para onde seu dinheiro está indo."
              : "A origem ajuda a comparar seus diferentes tipos de entrada."}
          </ThemedText>
          <View style={styles.options}>
            {options[type].map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: category === item }}
                onPress={() => setCategory(item)}
                style={[
                  styles.option,
                  type === "expense"
                    ? styles.expenseOption
                    : styles.incomeOption,
                  category === item && styles.optionSelected,
                ]}
              >
                <ThemedText type="smallBold" style={styles.optionLabel}>
                  {item}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {type === "expense" ? (
          <View style={styles.field}>
            <ThemedText type="smallBold">Como foi pago?</ThemedText>
            <View style={styles.options}>
              {paymentMethods.map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityState={{ selected: paymentMethod === item }}
                  onPress={() => setPaymentMethod(item)}
                  style={[
                    styles.option,
                    styles.expenseOption,
                    paymentMethod === item && styles.optionSelected,
                  ]}
                >
                  <ThemedText type="smallBold" style={styles.optionLabel}>
                    {item}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: recurring }}
              onPress={() => setRecurring((value) => !value)}
              style={styles.toggleRow}
            >
              <View style={[styles.checkbox, recurring && styles.checkboxOn]} />
              <View style={styles.toggleCopy}>
                <ThemedText type="smallBold" style={styles.buttonLabel}>
                  Despesa recorrente
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Marque para identificar uma conta que se repete.
                </ThemedText>
              </View>
            </Pressable>
          </View>
        ) : (
          <View style={styles.field}>
            <ThemedText type="smallBold">Situação do recebimento</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Escolha se o dinheiro já entrou ou ainda está previsto.
            </ThemedText>
            <View style={styles.options}>
              {(["received", "expected"] as const).map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityState={{ selected: incomeStatus === item }}
                  onPress={() => setIncomeStatus(item)}
                  style={[
                    styles.option,
                    styles.incomeOption,
                    incomeStatus === item && styles.optionSelected,
                  ]}
                >
                  <ThemedText type="smallBold" style={styles.optionLabel}>
                    {item === "received" ? "Já recebi" : "Vou receber"}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {!!error && <ThemedText style={styles.error}>{error}</ThemedText>}

        <Pressable
          accessibilityRole="button"
          onPress={save}
          style={[
            styles.saveButton,
            type === "income" && styles.incomeSaveButton,
          ]}
        >
          <ThemedText type="smallBold" style={styles.saveText}>
            {type === "expense" ? "Salvar despesa" : "Salvar receita"}
          </ThemedText>
        </Pressable>
      </ScrollView>
      <Modal
        visible={calendarVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.calendarBackdrop}>
          <ThemedView style={styles.calendarSheet} type="backgroundElement">
            <View style={styles.calendarHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mês anterior"
                onPress={() =>
                  setCalendarMonth(
                    (current) =>
                      new Date(
                        current.getFullYear(),
                        current.getMonth() - 1,
                        1,
                      ),
                  )
                }
                style={styles.calendarNavigation}
              >
                <ThemedText
                  type="subtitle"
                  style={styles.calendarNavigationText}
                >
                  ‹
                </ThemedText>
              </Pressable>
              <ThemedText type="smallBold" style={styles.calendarMonth}>
                {calendarMonthLabel}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Próximo mês"
                onPress={() =>
                  setCalendarMonth(
                    (current) =>
                      new Date(
                        current.getFullYear(),
                        current.getMonth() + 1,
                        1,
                      ),
                  )
                }
                style={styles.calendarNavigation}
              >
                <ThemedText
                  type="subtitle"
                  style={styles.calendarNavigationText}
                >
                  ›
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.calendarGrid}>
              {weekDays.map((day, index) => (
                <View key={`${day}-${index}`} style={styles.calendarCell}>
                  <ThemedText type="smallBold" style={styles.calendarWeekDay}>
                    {day}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarCells.map((day, index) => {
                if (day < 1) {
                  return (
                    <View key={`empty-${index}`} style={styles.calendarCell} />
                  );
                }

                const date = new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth(),
                  day,
                  12,
                );
                const selected = isSameDate(date, transactionDate);

                return (
                  <Pressable
                    key={day}
                    accessibilityRole="button"
                    accessibilityLabel={date.toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setTransactionDate(date);
                      setCalendarVisible(false);
                    }}
                    style={[
                      styles.calendarCell,
                      styles.calendarDay,
                      selected &&
                        (type === "expense"
                          ? styles.calendarDayExpense
                          : styles.calendarDayIncome),
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={selected && styles.calendarSelectedText}
                    >
                      {day}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setCalendarVisible(false)}
              style={styles.calendarCloseButton}
            >
              <ThemedText type="smallBold" style={styles.calendarCloseText}>
                Fechar
              </ThemedText>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  calendarBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  calendarSheet: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  calendarNavigation: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#334155",
  },
  calendarNavigationText: {
    color: "#ffffff",
  },
  calendarMonth: {
    flex: 1,
    textAlign: "center",
    textTransform: "capitalize",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: "14.2857%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarWeekDay: {
    color: "#64748b",
  },
  calendarDay: {
    borderRadius: 999,
  },
  calendarDayExpense: {
    backgroundColor: "#b91c1c",
  },
  calendarDayIncome: {
    backgroundColor: "#166534",
  },
  calendarSelectedText: {
    color: "#ffffff",
  },
  calendarCloseButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#334155",
  },
  calendarCloseText: {
    color: "#ffffff",
  },
  container: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
  },
  typeSelector: {
    flexDirection: "row",
    gap: Spacing.two,
    padding: Spacing.one,
    borderRadius: 12,
    backgroundColor: "#1f2937",
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.two,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  expenseSelected: {
    backgroundColor: "#b91c1c",
  },
  incomeSelected: {
    backgroundColor: "#166534",
  },
  typeSelectedText: {
    color: "#ffffff",
  },
  typeLabel: {
    color: "#ffffff",
    fontWeight: "700",
  },
  buttonLabel: {
    color: "#111827",
    fontWeight: "700",
  },
  optionLabel: {
    color: "#ffffff",
    fontWeight: "700",
  },
  explanation: {
    padding: Spacing.three,
    gap: Spacing.one,
    borderRadius: 12,
  },
  field: {
    gap: Spacing.two,
  },
  datePickerButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderColor: "#64748b",
    borderRadius: 10,
    backgroundColor: "#334155",
  },
  datePickerLabel: {
    color: "#ffffff",
  },
  input: {
    minHeight: 50,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 10,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  amountInputs: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  reaisInput: {
    flex: 1,
    gap: Spacing.one,
  },
  centsInput: {
    width: 112,
    gap: Spacing.one,
  },
  amountPreview: {
    color: "#166534",
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.one,
  },
  option: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 8,
  },
  expenseOption: {
    backgroundColor: "#b91c1c",
    borderColor: "#b91c1c",
  },
  incomeOption: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },
  optionSelected: {
    borderColor: "#ffffff",
    borderWidth: 2,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#64748b",
    borderRadius: 5,
  },
  checkboxOn: {
    backgroundColor: "#b91c1c",
    borderColor: "#b91c1c",
  },
  toggleCopy: {
    flex: 1,
    gap: 2,
  },
  error: {
    color: "#dc2626",
  },
  saveButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#b91c1c",
  },
  incomeSaveButton: {
    backgroundColor: "#166534",
  },
  saveText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
