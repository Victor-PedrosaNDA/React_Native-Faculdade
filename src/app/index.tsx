import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useFinance } from "@/hooks/use-finance";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const categoryColors: Record<string, string> = {
  Moradia: "#8b5cf6",
  Alimentação: "#10b981",
  Transporte: "#f59e0b",
  Lazer: "#ef4444",
  Saúde: "#06b6d4",
  Outros: "#64748b",
};

const initialCategories = [
  { name: "Moradia", value: 980 },
  { name: "Alimentação", value: 620 },
  { name: "Transporte", value: 440 },
  { name: "Lazer", value: 280 },
];

export default function DashboardScreen() {
  const { transactions, balance, income, expenses } = useFinance();
  const addedExpenses = transactions
    .slice(4)
    .filter((item) => item.type === "expense");
  const categories = initialCategories.map((category) => ({
    ...category,
    value:
      category.value +
      addedExpenses
        .filter((item) => item.category === category.name)
        .reduce((total, item) => total + item.amount, 0),
    color: categoryColors[category.name],
  }));
  const summaryCards = [
    { label: "Saldo", value: currency.format(balance), accent: "#7c3aed" },
    { label: "Receitas", value: currency.format(income), accent: "#10b981" },
    { label: "Despesas", value: currency.format(expenses), accent: "#f59e0b" },
    { label: "Meta", value: "82%", accent: "#3b82f6" },
  ];

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.heroCard} type="backgroundElement">
          <View style={styles.heroHeader}>
            <View>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Olá, Victor
              </ThemedText>
              <ThemedText type="title">Resumo do mês</ThemedText>
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
            Saldo disponível
          </ThemedText>
          <ThemedText type="title">{currency.format(balance)}</ThemedText>
          <ThemedText style={styles.successText} themeColor="textSecondary">
            + 12,4% em relação ao mês passado
          </ThemedText>
        </ThemedView>

        <View style={styles.summaryGrid}>
          {summaryCards.map((card) => (
            <ThemedView
              key={card.label}
              style={styles.summaryCard}
              type="backgroundElement"
            >
              <View style={[styles.dot, { backgroundColor: card.accent }]} />
              <ThemedText style={styles.cardLabel} themeColor="textSecondary">
                {card.label}
              </ThemedText>
              <ThemedText type="subtitle">{card.value}</ThemedText>
            </ThemedView>
          ))}
        </View>

        <ThemedView style={styles.panel} type="backgroundElement">
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Gastos por categoria</ThemedText>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {currency.format(
                categories.reduce((total, item) => total + item.value, 0),
              )}
            </ThemedText>
          </View>

          <View style={styles.listContainer}>
            {categories.map((item) => (
              <View key={item.name} style={styles.categoryRow}>
                <View style={styles.categoryHeader}>
                  <ThemedText type="smallBold">{item.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    R$ {item.value}
                  </ThemedText>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${(item.value / Math.max(...categories.map((category) => category.value))) * 100}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.panel} type="backgroundElement">
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Últimas movimentações</ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate("/atividades/atividade-01")}
            >
              <ThemedText type="smallBold" themeColor="textSecondary">
                Ver tudo
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.transactions}>
            {transactions.slice(0, 4).map((item) => (
              <View
                key={`${item.title}-${item.detail}`}
                style={styles.transactionRow}
              >
                <View>
                  <ThemedText type="smallBold">{item.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.detail}
                  </ThemedText>
                </View>
                <ThemedText
                  type="smallBold"
                  style={
                    item.type === "income"
                      ? styles.positiveValue
                      : styles.negativeValue
                  }
                >
                  {item.type === "income" ? "+" : "-"}
                  {currency.format(item.amount)}
                </ThemedText>
              </View>
            ))}
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
  positiveValue: {
    color: "#10b981",
  },
  negativeValue: {
    color: "#ef4444",
  },
});
