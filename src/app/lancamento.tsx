import { router } from "expo-router";
import { useState } from "react";
import {
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

export default function NewTransactionScreen() {
  const [type, setType] = useState<TransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amountText, setAmountText] = useState("");
  const [category, setCategory] = useState("Alimentação");
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [recurring, setRecurring] = useState(false);
  const [incomeStatus, setIncomeStatus] = useState<"received" | "expected">(
    "received",
  );
  const [error, setError] = useState("");
  const { addTransaction } = useFinance();

  function selectType(nextType: TransactionType) {
    setType(nextType);
    setCategory(options[nextType][0]);
    setError("");
  }

  function save() {
    const normalizedAmount = amountText
      .trim()
      .replace(/\.(?=\d{3}(?:,|$))/g, "")
      .replace(",", ".");
    const amount = Number(normalizedAmount);

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
      type === "expense" ? { paymentMethod, recurring } : { incomeStatus },
    );
    router.back();
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
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
            <ThemedText type="smallBold">
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
            : "Anote um valor que entrou ou que você espera receber. A receita será somada ao seu saldo e ficará identificada na carteira."}
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
        <ThemedText type="smallBold">
          {type === "expense" ? "Quanto custou?" : "Quanto recebeu?"}
        </ThemedText>
        <TextInput
          accessibilityLabel="Valor em reais"
          keyboardType="decimal-pad"
          onChangeText={setAmountText}
          placeholder="R$ 0,00"
          style={styles.input}
          value={amountText}
        />
        <ThemedText type="small" themeColor="textSecondary">
          Use vírgula ou ponto para os centavos.
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
                category === item && styles.optionSelected,
              ]}
            >
              <ThemedText type="small">{item}</ThemedText>
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
                  paymentMethod === item && styles.optionSelected,
                ]}
              >
                <ThemedText type="small">{item}</ThemedText>
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
              <ThemedText type="smallBold">Despesa recorrente</ThemedText>
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
                  incomeStatus === item && styles.optionSelected,
                ]}
              >
                <ThemedText type="small">
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
  );
}

const styles = StyleSheet.create({
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
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.two,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
  },
  expenseSelected: {
    backgroundColor: "#fee2e2",
  },
  incomeSelected: {
    backgroundColor: "#dcfce7",
  },
  explanation: {
    padding: Spacing.three,
    gap: Spacing.one,
    borderRadius: 12,
  },
  field: {
    gap: Spacing.two,
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
  optionSelected: {
    borderColor: "#166534",
    backgroundColor: "#dcfce7",
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
    backgroundColor: "#166534",
    borderColor: "#166534",
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
  },
});
