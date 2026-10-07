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

const initialGoals = [
  { name: "Viagem para Santos", saved: 1500, target: 2200, color: "#8b5cf6" },
  { name: "Fundo de emergência", saved: 8400, target: 10000, color: "#10b981" },
  { name: "Curso de design", saved: 650, target: 1250, color: "#f59e0b" },
];

const habits = [
  "Economizar 10% da renda",
  "Revisar gastos toda segunda",
  "Manter reserva de emergência",
  "Investir 1h por semana",
];

export default function GoalsScreen() {
  const [goals, setGoals] = useState(initialGoals);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [amountText, setAmountText] = useState("");
  const [error, setError] = useState("");

  function addContribution() {
    const amount = Number(
      amountText
        .trim()
        .replace(/\.(?=\d{3}(?:,|$))/g, "")
        .replace(",", "."),
    );
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    setGoals((current) =>
      current.map((goal) =>
        goal.name === selectedGoal
          ? { ...goal, saved: Math.min(goal.target, goal.saved + amount) }
          : goal,
      ),
    );
    setSelectedGoal(null);
    setAmountText("");
    setError("");
  }

  function toggleHabit(habit: string) {
    setCompletedHabits((current) =>
      current.includes(habit)
        ? current.filter((item) => item !== habit)
        : [...current, habit],
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.heroCard} type="backgroundElement">
          <ThemedText type="title">Metas e hábitos</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Seus objetivos financeiros estão no caminho certo. Continue focado.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.panel} type="backgroundElement">
          <ThemedText type="subtitle">Objetivos</ThemedText>
          <View style={styles.goalList}>
            {goals.map((goal) => (
              <View key={goal.name} style={styles.goalCard}>
                {(() => {
                  const progress = Math.round((goal.saved / goal.target) * 100);
                  return (
                    <>
                      <View style={styles.goalHeader}>
                        <ThemedText type="smallBold">{goal.name}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {progress}%
                        </ThemedText>
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">
                        {`R$ ${goal.saved.toLocaleString("pt-BR")} / R$ ${goal.target.toLocaleString("pt-BR")}`}
                      </ThemedText>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${progress}%`,
                              backgroundColor: goal.color,
                            },
                          ]}
                        />
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setSelectedGoal(goal.name)}
                        style={styles.contributeButton}
                      >
                        <ThemedText type="smallBold">
                          Registrar aporte
                        </ThemedText>
                      </Pressable>
                    </>
                  );
                })()}
              </View>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.panel} type="backgroundElement">
          <ThemedText type="subtitle">Hábitos do mês</ThemedText>
          <View style={styles.habitList}>
            {habits.map((habit) => (
              <Pressable
                key={habit}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked: completedHabits.includes(habit),
                }}
                onPress={() => toggleHabit(habit)}
                style={styles.habitItem}
              >
                <View
                  style={[
                    styles.checkCircle,
                    completedHabits.includes(habit) && styles.checkCircleDone,
                  ]}
                />
                <ThemedText type="small">{habit}</ThemedText>
              </Pressable>
            ))}
          </View>
        </ThemedView>
      </ScrollView>
      <Modal
        visible={selectedGoal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedGoal(null)}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalSheet} type="backgroundElement">
            <ThemedText type="subtitle">Aporte para a meta</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {selectedGoal}
            </ThemedText>
            <TextInput
              accessibilityLabel="Valor do aporte"
              keyboardType="decimal-pad"
              onChangeText={setAmountText}
              placeholder="Valor em reais"
              style={styles.amountInput}
              value={amountText}
            />
            {!!error && <ThemedText style={styles.error}>{error}</ThemedText>}
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSelectedGoal(null)}
              >
                <ThemedText type="smallBold">Cancelar</ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={addContribution}
                style={styles.confirmButton}
              >
                <ThemedText type="smallBold" style={styles.confirmText}>
                  Adicionar aporte
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
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
    borderRadius: 24,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  subtitle: {
    lineHeight: 22,
  },
  panel: {
    borderRadius: 24,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  goalList: {
    gap: Spacing.two,
  },
  goalCard: {
    gap: Spacing.one,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  contributeButton: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
  },
  habitList: {
    gap: Spacing.two,
  },
  habitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    minHeight: 40,
  },
  checkCircle: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#10b981",
  },
  checkCircleDone: {
    backgroundColor: "#10b981",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },
  modalSheet: {
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  amountInput: {
    minHeight: 48,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 10,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  error: {
    color: "#dc2626",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.three,
  },
  confirmButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    backgroundColor: "#166534",
  },
  confirmText: {
    color: "#ffffff",
  },
});
