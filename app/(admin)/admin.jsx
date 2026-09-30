import { Link } from "expo-router";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import Spacer from "../../components/Spacer";
import ActionCard from "../../components/ActionCard";
import useAuth from "../../hooks/useAuth";

const NAV_CARDS = [
  {
    href: "/admin-invite",
    icon: "\u{1F4E8}",
    label: "Invite Lecturer or Student",
    hint: "Send an invite to a new lecturer or student",
    primary: true,
  },
  {
    href: "/admin-sessions",
    icon: "\u{1F5D3}\uFE0F",
    label: "Manage Attendance Sessions",
    hint: "View, edit and close class sessions",
  },
  {
    href: "/admin-devices",
    icon: "\u{1F4E1}",
    label: "Manage BLE Devices",
    hint: "Register and keep track of classroom beacons",
  },
  {
    href: "/admin-profile",
    icon: "\u{1F464}",
    label: "Profile",
    hint: "Your account details and settings",
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <ThemedView style={{ justifyContent: "flex-start", paddingHorizontal: 16 }}>
      <Spacer />
      <ThemedText isHeader styles={{ fontSize: 22 }}>
        Welcome{user?.username ? `, ${user.username}` : ""}
      </ThemedText>
      <ThemedText styles={{ fontSize: 14, marginTop: 4 }}>
        Here&apos;s everything you can manage today.
      </ThemedText>
      <Spacer />
      {NAV_CARDS.map((card) => (
        <Link key={card.href} href={card.href} asChild>
          <ActionCard
            icon={card.icon}
            title={card.label}
            subtitle={card.hint}
            primary={card.primary}
          />
        </Link>
      ))}
    </ThemedView>
  );
}
