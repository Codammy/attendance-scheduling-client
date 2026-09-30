import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import Colors from "../constants/Color";
import ThemedText from "./ThemedText";

// Dashboard navigation tile: an icon badge, a label with a short hint of what
// the screen does, and a chevron. Used with <Link asChild>, so all extra
// props (onPress, href, …) are forwarded straight to the Pressable.
// `primary` gives the card the filled-green treatment for the main action of
// a screen (white label is 7.9:1 on Colors.secondary).
const ActionCard = ({ icon, title, subtitle, primary, style, ...props }) => {
  const theme = Colors[useColorScheme() ?? "light"];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: primary ? Colors.secondary : theme.uiBackground,
          borderColor: primary ? Colors.secondary : theme.border,
        },
        pressed && { opacity: 0.7 },
        style,
      ]}
      {...props}
    >
      <View
        style={[
          styles.badge,
          { backgroundColor: primary ? "#FFFFFF" : Colors.primary },
        ]}
      >
        <Text style={styles.badgeIcon}>{icon}</Text>
      </View>

      <View style={styles.body}>
        <ThemedText
          isHeader
          styles={{ fontSize: 16, color: primary ? "#FFFFFF" : theme.title }}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            styles={{
              fontSize: 13,
              marginTop: 2,
              color: primary ? "#D7ECDA" : theme.iconColor,
            }}
          >
            {subtitle}
          </ThemedText>
        ) : null}
      </View>

      <ThemedText
        styles={{
          fontSize: 24,
          lineHeight: 26,
          color: primary ? "#FFFFFF" : theme.iconColorFocused,
        }}
      >
        ›
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIcon: {
    fontSize: 20,
  },
  body: {
    flex: 1,
    marginHorizontal: 12,
  },
});

export default ActionCard;
