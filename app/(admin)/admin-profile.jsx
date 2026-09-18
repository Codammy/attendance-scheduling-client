import { Text } from "react-native";
import ThemedView from "../../components/ThemedView";
import ThemedButton from "../../components/ThemedButton";
import FieldRow from "../../components/FieldRow";
import Spacer from "../../components/Spacer";
import useAuth from "../../hooks/useAuth";
import Colors from "../../constants/Color";

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const fullName = [user?.firstname, user?.lastname].filter(Boolean).join(" ");

  return (
    <ThemedView style={{ justifyContent: "flex-start", paddingHorizontal: 16, paddingTop: 8 }}>
      <FieldRow label="Name" value={fullName} />
      <FieldRow label="Username" value={user?.username} />
      <FieldRow label="Email" value={user?.email} />
      <FieldRow label="Role" value={user?.role} />
      <Spacer />
      <ThemedButton otherStyles={{ width: "100%", backgroundColor: Colors.warning }} onPress={logout}>
        <Text style={{ color: "white" }}>Log Out</Text>
      </ThemedButton>
    </ThemedView>
  );
}
