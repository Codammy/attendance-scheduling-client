import { Text } from "react-native";
import { Link } from "expo-router";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import Spacer from "../../components/Spacer";
import useAuth from "../../hooks/useAuth";

const NAV_CARDS = [
  { href: "/admin-invite", label: "Invite Lecturer or Student" },
  { href: "/admin-sessions", label: "Manage Attendance Sessions" },
  { href: "/admin-devices", label: "Manage BLE Devices" },
  { href: "/admin-profile", label: "Profile" },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <ThemedView style={{ justifyContent: "flex-start", paddingHorizontal: 16 }}>
      <Spacer />
      <ThemedText isHeader styles={{ fontSize: 22 }}>
        Welcome{user?.username ? `, ${user.username}` : ""}
      </ThemedText>
      <Spacer />
      {NAV_CARDS.map((card) => (
        <Link key={card.href} href={card.href} asChild>
          <ThemedButton otherStyles={{ width: "100%", marginBottom: 10 }}>
            <Text style={{ color: "white" }}>{card.label}</Text>
          </ThemedButton>
        </Link>
      ))}
    </ThemedView>
  );
}
