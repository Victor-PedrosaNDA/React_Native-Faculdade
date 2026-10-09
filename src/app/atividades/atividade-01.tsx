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
import { DonutChart } from "@/components/donut-chart";
import { MonthSwitcher } from "@/components/month-switcher";
import { Spacing } from "@/constants/theme";
import { useFinance } from "@/hooks/use-finance";
import {
  belongsToMonth,
  currentYearMonth,
  filterTransactions,
  summarizeTransactions,
} from "@/utils/finance";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function DashboardScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [month, setMonth] = useState(currentYearMonth);
  const { transactions } = useFinance();
  const monthlyTransactions = transactions.filter((item) =>
    belongsToMonth(item, month),
  ).sort((first, second) =>
    second.transactionDate.localeCompare(first.transactionDate),
  );
  const summary = summarizeTransactions(monthlyTransactions);
  const expectedIncome = monthlyTransactions
    .filter(
      (item) => item.type === "income" && item.incomeStatus === "expected",
    )
    .reduce((total, item) => total + item.amount, 0);
  const filteredTransactions = filterTransactions(
    monthlyTransactions,
    filter,
    query,
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.heroCard} type="backgroundElement">
          <View style={styles.heroHeader}>
            <View>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Carteira
              </ThemedText>
              <ThemedText type="title">Movimentações</ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate("/lancamento")}
              style={styles.primaryButton}
            >
              <ThemedText type="smallBold" themeColor="text">
                + Novo
              </ThemedText>
            </Pressable>
          </View>
          <ThemedText style={styles.balanceLabel} themeColor="textSecondary">
            Saldo do mês
          </ThemedText>
          <ThemedText type="title">
            {currency.format(summary.balance)}
          </ThemedText>
        </ThemedView>

        <MonthSwitcher value={month} onChange={setMonth} />

        <View style={styles.summaryGrid}>
          {[
            { label: "Receitas", value: summary.income, accent: "#10b981" },
            { label: "A receber", value: expectedIncome, accent: "#3b82f6" },
            { label: "Despesas", value: summary.expenses, accent: "#f59e0b" },
          ].map((card) => (
            <ThemedView
              key={card.label}
              style={styles.summaryCard}
              type="backgroundElement"
            >
              <View style={[styles.dot, { backgroundColor: card.accent }]} />
              <ThemedText style={styles.cardLabel} themeColor="textSecondary">
                {card.label}
              </ThemedText>
              <ThemedText type="subtitle">
                {currency.format(card.value)}
              </ThemedText>
            </ThemedView>
          ))}
        </View>

        <ThemedView style={styles.panel} type="backgroundElement">
          <ThemedText type="subtitle">Despesas por categoria</ThemedText>
          {summary.byCategory.length ? (
            <View style={styles.chartRow}>
              <DonutChart
                data={summary.byCategory.map((item) => ({
                  value: item.total,
                  color: item.color,
                }))}
              >
                <ThemedText type="small" themeColor="textSecondary">
                  Total
                </ThemedText>
                <ThemedText type="smallBold">
                  {currency.format(summary.expenses)}
                </ThemedText>
              </DonutChart>
              <View style={styles.legend}>
                {summary.byCategory.slice(0, 6).map((item) => (
                  <View key={item.category} style={styles.legendRow}>
                    <View
                      style={[styles.dot, { backgroundColor: item.color }]}
                    />
                    <ThemedText
                      type="small"
                      numberOfLines={1}
                      style={styles.legendName}
                    >
                      {item.category}
                    </ThemedText>
                    <ThemedText type="smallBold">
                      {Math.round(item.percent)}%
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              Sem despesas neste mês.
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.panel} type="backgroundElement">
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Lançamentos do mês</ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate("/extrato")}
            >
              <ThemedText type="smallBold" themeColor="textSecondary">
                Ver todos
              </ThemedText>
            </Pressable>
          </View>
          <TextInput
            accessibilityLabel="Buscar movimentações"
            onChangeText={setQuery}
            placeholder="Buscar descrição ou categoria"
            style={styles.searchInput}
            value={query}
          />
          <View style={styles.filters}>
            {(
              [
                ["all", "Todas"],
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
                <ThemedText type="smallBold">{label}</ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={styles.transactions}>
            {filteredTransactions.length ? (
              filteredTransactions.slice(0, 5).map((item) => {
                const expected = item.incomeStatus === "expected";
                const detail = [
                  item.category,
                  item.paymentMethod,
                  item.recurring ? "Recorrente" : null,
                  expected ? "A receber" : null,
                  item.detail,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <View key={item.id} style={styles.transactionRow}>
                    <View style={styles.transactionDetails}>
                      <ThemedText type="smallBold">{item.title}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {detail}
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
                  </View>
                );
              })
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                Nenhum lançamento encontrado.
              </ThemedText>
            )}
          </View>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  heroCard: {
    borderRadius: 28,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.two,
  },
  primaryButton: {
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  balanceLabel: {
    marginTop: Spacing.one,
  },
  successText: {
    marginTop: Spacing.one,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.three,
  },
  legend: {
    flex: 1,
    minWidth: 150,
    gap: Spacing.two,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  legendName: {
    flex: 1,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  summaryCard: {
    flexBasis: "48%",
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  cardLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
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
    gap: Spacing.two,
  },
  filterButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  filterSelected: {
    backgroundColor: "#bbf7d0",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listContainer: {
    gap: Spacing.two,
  },
  categoryRow: {
    gap: Spacing.one,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
  },
  transactions: {
    gap: Spacing.two,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: Spacing.one,
  },
  transactionDetails: {
    flex: 1,
    gap: 2,
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
