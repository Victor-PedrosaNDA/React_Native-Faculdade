import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { monthLabel, shiftMonth, type YearMonth } from "@/utils/finance";

export function MonthSwitcher({
  value,
  onChange,
}: {
  value: YearMonth;
  onChange: (next: YearMonth) => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mês anterior"
        hitSlop={12}
        onPress={() => onChange(shiftMonth(value, -1))}
        style={styles.arrow}
      >
        <ThemedText type="subtitle">‹</ThemedText>
      </Pressable>
      <ThemedText type="subtitle" style={styles.label}>
        {monthLabel(value)}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Próximo mês"
        hitSlop={12}
        onPress={() => onChange(shiftMonth(value, 1))}
        style={styles.arrow}
      >
        <ThemedText type="subtitle">›</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  arrow: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
  },
  label: {
    flex: 1,
    textAlign: "center",
    textTransform: "capitalize",
  },
});
