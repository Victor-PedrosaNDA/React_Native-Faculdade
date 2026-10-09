import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

type DonutSlice = {
  value: number;
  color: string;
};

export function DonutChart({
  data,
  children,
  size = 176,
  strokeWidth = 24,
}: {
  data: DonutSlice[];
  children?: ReactNode;
  size?: number;
  strokeWidth?: number;
}) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  const slices = data.map((slice, index) => {
    const length = total ? (slice.value / total) * circumference : 0;
    const offset = data
      .slice(0, index)
      .reduce(
        (sum, previous) =>
          sum + (total ? (previous.value / total) * circumference : 0),
        0,
      );
    return { ...slice, length, offset };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {slices.map((slice, index) => (
            <Circle
              key={`${slice.color}-${index}`}
              cx={center}
              cy={center}
              r={radius}
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${slice.length} ${circumference - slice.length}`}
              strokeDashoffset={-slice.offset}
              fill="none"
            />
          ))}
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
});
