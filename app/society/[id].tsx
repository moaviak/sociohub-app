import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../_layout";
import SocietyProfile from "@/features/societies/society-profile";

export default function SocietyPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Header title="Society Profile" backButton />
      <SocietyProfile societyId={id} />
    </SafeAreaView>
  );
}
