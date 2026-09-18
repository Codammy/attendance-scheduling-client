import { Text, useColorScheme } from "react-native";
import Colors from "../constants/Color";

const ThemedText = ({ styles, children, isHeader, ...props }) => {
  const theme = Colors[useColorScheme() ?? "light"];

  return (
    <Text
      style={[
        {
          color: isHeader ? theme.title : theme.text,
          fontWeight: isHeader ? "700" : "400",
        },
        styles,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default ThemedText;
