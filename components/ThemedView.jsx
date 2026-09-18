import { View, useColorScheme } from "react-native";
import Colors from "../constants/Color";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ThemedView = ({ style, ...props }) => {
  const theme = Colors[useColorScheme() ?? "light"];
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.background,
          alignItems: "center",
          paddingTop: insets.top,
          paddingBottom: insets.bottom
        },
        style,
      ]}
      {...props}
    />
  );
};


export default ThemedView;
