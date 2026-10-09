import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { DonutChart } from "@/components/donut-chart";
import { MonthSwitcher } from "@/components/month-switcher";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useFinance } from "@/hooks/use-finance";
import {
  belongsToMonth,
  currentYearMonth,
  summarizeTransactions,
} from "@/utils/finance";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function DashboardScreen() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [month, setMonth] = useState(currentYearMonth);
  const today = new Date();
  const dateParts = [
    { label: "Dia", value: String(today.getDate()).padStart(2, "0") },
    {
      label: "Mês",
      value: today.toLocaleDateString("pt-BR", { month: "long" }),
    },
    { label: "Ano", value: String(today.getFullYear()) },
  ];
  const { transactions } = useFinance();
  const monthlyTransactions = transactions
    .filter((item) => belongsToMonth(item, month))
    .sort((first, second) =>
      second.transactionDate.localeCompare(first.transactionDate),
    );
  const summary = summarizeTransactions(monthlyTransactions);
  const expectedIncome = monthlyTransactions
    .filter(
      (item) => item.type === "income" && item.incomeStatus === "expected",
    )
    .reduce((total, item) => total + item.amount, 0);
  const summaryCards = [
    {
      label: "Saldo",
      value: currency.format(summary.balance),
      accent: "#7c3aed",
    },
    {
      label: "Receitas",
      value: currency.format(summary.income),
      accent: "#10b981",
    },
    {
      label: "Despesas",
      value: currency.format(summary.expenses),
      accent: "#f59e0b",
    },
    {
      label: "A receber",
      value: currency.format(expectedIncome),
      accent: "#3b82f6",
    },
  ];
  if (showWelcome) {
    return (
      <ScrollView contentContainerStyle={styles.welcomeContainer}>
        <View style={styles.welcomeBrand}>
          <View style={styles.brandMark}>
            <ThemedText type="subtitle" style={styles.brandMarkText}>
              M
            </ThemedText>
          </View>
          <ThemedText type="smallBold">MEU BOLSO</ThemedText>
        </View>

        <ThemedView style={styles.welcomeHero} type="backgroundElement">
          <ThemedText type="smallBold" themeColor="textSecondary">
            FINANÇAS DO SEU JEITO
          </ThemedText>
          <ThemedText style={styles.welcomeTitle}>
            Mais clareza para cuidar do seu dinheiro.
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            Reúna seu saldo, acompanhe o que entra e sai e avance nas metas em
            um só lugar.
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowWelcome(false)}
            style={styles.welcomeButton}
          >
            <ThemedText type="smallBold" style={styles.welcomeButtonText}>
              Abrir meu painel
            </ThemedText>
          </Pressable>
        </ThemedView>

        <View style={styles.welcomeFeatures}>
          <ThemedText type="subtitle">Seu dia a dia financeiro</ThemedText>
          {[
            ["01", "Acompanhe", "Veja receitas, despesas e saldo atualizado."],
            ["02", "Organize", "Classifique movimentações por categoria."],
            ["03", "Planeje", "Registre metas e acompanhe seus aportes."],
          ].map(([number, title, detail]) => (
            <View key={number} style={styles.welcomeFeature}>
              <ThemedText type="smallBold" style={styles.featureNumber}>
                {number}
              </ThemedText>
              <View style={styles.featureCopy}>
                <ThemedText type="smallBold">{title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {detail}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.sampleNotice}
        >
          Seu painel começa zerado. Registre receitas e despesas para ver os
          valores aparecerem aqui.
        </ThemedText>
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.calendarPanel} type="backgroundElement">
          <ThemedText type="smallBold" themeColor="textSecondary">
            DATA DE HOJE
          </ThemedText>
          <View style={styles.dateParts}>
            {dateParts.map((part) => (
              <View key={part.label} style={styles.datePart}>
                <ThemedText type="small" themeColor="textSecondary">
                  {part.label}
                </ThemedText>
                <ThemedText
                  type="subtitle"
                  style={
                    part.label === "Mês" ? styles.dateMonth : styles.dateValue
                  }
                >
                  {part.value}
                </ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>

        <MonthSwitcher value={month} onChange={setMonth} />

        <ThemedView style={styles.heroCard} type="backgroundElement">
          <View style={styles.heroHeader}>
            <View>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Olá, Victor
              </ThemedText>
              <ThemedText type="title">Resumo do mês</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.balanceLabel} themeColor="textSecondary">
            Saldo do mês
          </ThemedText>
          <ThemedText type="title">
            {currency.format(summary.balance)}
          </ThemedText>
          <ThemedText style={styles.successText} themeColor="textSecondary">
            {monthlyTransactions.length === 0
              ? "Adicione seu primeiro lançamento para começar"
              : `${monthlyTransactions.length} lançamento${monthlyTransactions.length === 1 ? "" : "s"} neste mês`}
          </ThemedText>
        </ThemedView>

        <View style={styles.summaryActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate("/lancamento")}
            style={styles.primaryButton}
          >
            <ThemedText type="smallBold" style={styles.actionButtonText}>
              + Novo lançamento
            </ThemedText>
          </Pressable>
        </View>

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
              {currency.format(summary.expenses)}
            </ThemedText>
          </View>

          {summary.byCategory.length ? (
            <View style={styles.chartRow}>
              <DonutChart
                data={summary.byCategory.map((item) => ({
                  value: item.total,
                  color: item.color,
                }))}
              >
                <ThemedText type="small" themeColor="textSecondary">
                  Despesas
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
            <ThemedText type="subtitle">Últimas movimentações</ThemedText>
          </View>

          <View style={styles.transactions}>
            {monthlyTransactions.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Nenhuma movimentação ainda. Use “+ Novo” para registrar a
                primeira.
              </ThemedText>
            ) : (
              monthlyTransactions.slice(0, 5).map((item) => (
                <View
                  key={item.id}
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
                      item.incomeStatus === "expected"
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
              ))
            )}
          </View>
        </ThemedView>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate("/extrato")}
          style={styles.secondaryButton}
        >
          <ThemedText type="smallBold" style={styles.actionButtonText}>
            Ver tudo
          </ThemedText>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  calendarPanel: {
    borderRadius: 18,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  dateParts: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  datePart: {
    flex: 1,
    gap: Spacing.one,
  },
  dateValue: {
    fontSize: 24,
    lineHeight: 30,
  },
  dateMonth: {
    fontSize: 20,
    lineHeight: 30,
    textTransform: "capitalize",
  },
  welcomeContainer: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    justifyContent: "center",
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  welcomeBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  brandMark: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#166534",
  },
  brandMarkText: {
    color: "#ffffff",
  },
  welcomeHero: {
    borderRadius: 22,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  welcomeTitle: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "700",
  },
  welcomeButton: {
    alignSelf: "flex-start",
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    backgroundColor: "#166534",
  },
  welcomeButtonText: {
    color: "#ffffff",
  },
  welcomeFeatures: {
    gap: Spacing.three,
  },
  welcomeFeature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  featureNumber: {
    minWidth: 32,
    color: "#15803d",
  },
  featureCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  sampleNotice: {
    lineHeight: 20,
  },
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
    flex: 1,
    backgroundColor: "#166534",
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#ffffff",
  },
  summaryActions: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  secondaryButton: {
    alignSelf: "flex-end",
    minWidth: 128,
    backgroundColor: "#166534",
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
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
  expectedValue: {
    color: "#2563eb",
  },
});
