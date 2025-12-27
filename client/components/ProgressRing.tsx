import { View, Text, StyleSheet } from "react-native"
import Svg, { Circle } from "react-native-svg"
import { useTheme } from "@/hooks/useTheme"

interface ProgressRingProps {
  progress: number // 0 to 1
  size?: number
  strokeWidth?: number
  current: number
  goal: number
}

export function ProgressRing({ progress, size = 200, strokeWidth = 16, current, goal }: ProgressRingProps) {
  const { colors } = useTheme()
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - progress * circumference

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle stroke={colors.border} fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        {/* Progress circle */}
        <Circle
          stroke={colors.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.currentText, { color: colors.text }]}>{current}</Text>
        <Text style={[styles.goalText, { color: colors.textSecondary }]}>/ {goal} cal</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
  },
  currentText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  goalText: {
    fontSize: 16,
    marginTop: 4,
  },
})
