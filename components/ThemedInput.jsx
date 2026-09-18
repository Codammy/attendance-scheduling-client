import { useColorScheme, TextInput } from "react-native";
import Colors from "../constants/Color";

const ThemedInput = ({
  styles,
  onKeyPress,
  secure = false,
  full,
  ...props
}) => {
  const theme = Colors[useColorScheme() ?? "light"];
  return (
    <TextInput
      style={[
        {
          width: full ? "80%" : "50%",
          padding: 13,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 5,
          backgroundColor: theme.uiBackground,
          color: theme.text,
        },
        styles,
      ]}
      placeholderTextColor={theme.iconColor}
      onKeyPress={onKeyPress}
      secureTextEntry={secure}
      {...props}
    />
  );
};

export default ThemedInput;
