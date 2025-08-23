import { View, Text } from "react-native";
import { Society } from "@/types";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import {
  Target,
  Heart,
  Mail,
  FileText,
  Telescope,
  LucideIcon,
} from "lucide-react-native";

interface SocietyInfoProps {
  society: Society;
}

interface InfoRowProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  content?: string;
  isLast?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({
  icon: IconComponent,
  iconColor,
  title,
  content,
  isLast = false,
}) => (
  <View
    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${
      !isLast ? "mb-4" : ""
    }`}
  >
    <HStack className="items-start" space="md">
      <View
        className="rounded-full items-center justify-center mt-1"
        style={{
          width: 40,
          height: 40,
          backgroundColor: `${iconColor}15`, // 15% opacity
        }}
      >
        <IconComponent size={20} color={iconColor} />
      </View>

      <VStack className="flex-1" space="sm">
        <Text className="text-lg font-bold text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-600 leading-5">
          {content || "N/A"}
        </Text>
      </VStack>
    </HStack>
  </View>
);

export const SocietyInfo = ({ society }: SocietyInfoProps) => {
  const infoItems = [
    {
      icon: Telescope,
      iconColor: "#a475f9", // purple-600 (secondary-600)
      title: "Vision",
      content: society.description,
    },
    {
      icon: FileText,
      iconColor: "#e85aad", // (accent-500)
      title: "Statement of Purpose",
      content: society.statementOfPurpose,
    },
    {
      icon: Mail,
      iconColor: "#f59e0b", // amber-500
      title: "Faculty Advisor Message",
      content: society.advisorMessage,
    },
    {
      icon: Target,
      iconColor: "#10b981", // emerald-500
      title: "Mission",
      content: society.mission,
    },
    {
      icon: Heart,
      iconColor: "#218bff", // primary-500
      title: "Core Values",
      content: society.coreValues,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <VStack space="md">
        {infoItems.map((item, index) => (
          <InfoRow
            key={item.title}
            icon={item.icon}
            iconColor={item.iconColor}
            title={item.title}
            content={item.content}
            isLast={index === infoItems.length - 1}
          />
        ))}
      </VStack>
    </View>
  );
};
