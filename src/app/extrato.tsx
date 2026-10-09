import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { MonthSwitcher } from "@/components/month-switcher";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TransactionEditModal } from "@/components/transaction-edit-modal";
import { Spacing } from "@/constants/theme";
import { useFinance, type FinanceTransaction } from "@/hooks/use-finance";
import {
  belongsToMonth,
  currentYearMonth,
  filterTransactions,
  formatTransactionDate,
  groupTransactionsByDate,
  isoDateToday,
  transactionsToCsv,
  type YearMonth,
} from "@/utils/finance";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function sectionDateLabel(date: string): string {
  const today = isoDateToday();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = isoDateToday(yesterdayDate);
  if (date === today) return "Hoje";
  if (date === yesterday) return "Ontem";
  return formatTransactionDate(date);
}

export default function StatementScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [month, setMonth] = useState<YearMonth>(currentYearMonth);
  const [selectedTransaction, setSelectedTransaction] =
    useState<FinanceTransaction | null>(null);
  const [exportError, setExportError] = useState("");
  const {
    transactions,
    updateTransaction,
    deleteTransaction,
  } = useFinance();
  const monthlyTransactions = transactions
    .filter((item) => belongsToMonth(item, month))
    .sort((first, second) =>
      second.transactionDate.localeCompare(first.transactionDate),
    );
  const filteredTransactions = filterTransactions(
    monthlyTransactions,
    filter,
    query,
  );
  const groups = groupTransactionsByDate(filteredTransactions);

  async function exportCsv() {
    setExportError("");
    const csv = transactionsToCsv(monthlyTransactions);
    const fileName = `fintrack-${month.year}-${String(month.month).padStart(2, "0")}.csv`;

    try {
      if (Platform.OS === "web") {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
      }

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("O compartilhamento de arquivos não está disponível.");
      }

      const file = new File(Paths.cache, fileName);
      file.create({ overwrite: true });
      file.write(csv);
      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        dialogTitle: "Exportar lançamentos",
        UTI: "public.comma-separated-values-text",
      });
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "O arquivo CSV não pôde ser compartilhado.",
      );
    }
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heading}>
          <View style={styles.headingCopy}>
            <ThemedText type="title">Extrato</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Busque, filtre e edite seus lançamentos.
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={exportCsv}
            style={styles.exportButton}
          >
            <ThemedText type="smallBold" style={styles.exportLabel}>
              Exportar CSV
            </ThemedText>
          </Pressable>
        </View>
        {!!exportError && (
          <ThemedText accessibilityRole="alert" style={styles.exportError}>
            {exportError}
          </ThemedText>
        )}

        <MonthSwitcher value={month} onChange={setMonth} />

        <ThemedView style={styles.panel} type="backgroundElement">
          <TextInput
            accessibilityLabel="Buscar lançamentos"
            onChangeText={setQuery}
            placeholder="Buscar descrição ou categoria"
            returnKeyType="search"
            style={styles.searchInput}
            value={query}
          />
          <View style={styles.filters}>
            {(
              [
                ["all", "Todos"],
                ["income", "Receitas"],
                ["expense", "Despesas"],
              ] as const
            ).map(([value, label]) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: filter === value }}
                onPress={() => setFilter(value)}
                style={[
                  styles.filterButton,
                  filter === value && styles.filterSelected,
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={filter === value && styles.filterSelectedText}
                >
                  {label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {groups.length ? (
            groups.map((group) => (
              <View key={group.date} style={styles.dayGroup}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  {sectionDateLabel(group.date)}
                </ThemedText>
                {group.transactions.map((item) => {
                  const expected = item.incomeStatus === "expected";
                  const details = [
                    item.category,
                    item.paymentMethod,
                    item.recurring ? "Recorrente" : null,
                    expected ? "A receber" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar ${item.title}, ${currency.format(item.amount)}`}
                      onPress={() => setSelectedTransaction(item)}
                      style={styles.transactionRow}
                    >
                      <View style={styles.transactionDetails}>
                        <ThemedText type="smallBold" numberOfLines={1}>
                          {item.title}
                        </ThemedText>
                        <ThemedText
                          type="small"
                          themeColor="textSecondary"
                          numberOfLines={2}
                        >
                          {details}
                        </ThemedText>
                      </View>
                      <ThemedText
                        type="smallBold"
                        style={
                          expected
                            ? styles.expectedValue
                            : item.type === "income"
                              ? styles.positiveValue
                              : styles.negativeValue
                        }
                      >
                        {item.type === "income" ? "+" : "-"}
                        {currency.format(item.amount)}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            ))
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              Nenhum lançamento encontrado neste mês.
            </ThemedText>
          )}
        </ThemedView>
      </ScrollView>
      <TransactionEditModal
        key={selectedTransaction?.id ?? "closed"}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onSave={updateTransaction}
        onDelete={deleteTransaction}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  headingCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  exportButton: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
    borderRadius: 10,
    backgroundColor: "#166534",
  },
  exportLabel: {
    color: "#ffffff",
  },
  exportError: {
    color: "#dc2626",
  },
  panel: {
    borderRadius: 24,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  searchInput: {
    minHeight: 46,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 10,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  filterButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  filterSelected: {
    backgroundColor: "#166534",
  },
  filterSelectedText: {
    color: "#ffffff",
  },
  dayGroup: {
    gap: Spacing.two,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: Spacing.two,
  },
  transactionDetails: {
    flex: 1,
    gap: Spacing.one,
  },
  positiveValue: {
    color: "#10b981",
  },
  negativeValue: {
    color: "#ef4444",
  },
  expectedValue: {
    color: "#2563eb",
  },
});
