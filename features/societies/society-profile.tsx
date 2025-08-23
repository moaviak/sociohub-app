import { useAppSelector } from "@/store/hooks";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useCancelJoinRequestMutation, useGetSocietyQuery } from "./api";
import { checkPrivilege } from "@/lib/utils";
import { PRIVILEGES } from "@/constants";
import { Advisor } from "@/types";
import { useToastUtility } from "@/hooks/useToastUtility";
import ApiError from "@/store/api-error";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Edit,
  Users,
  Calendar,
  CalendarCheck,
  ClipboardList,
  Images,
  User,
  Crown,
  Building,
} from "lucide-react-native";
import { cn } from "@/lib/utils";
import { SocietyLogo } from "@/components/society-logo";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import SocietyEvents from "../events/society-events";
import { SocietyInfo } from "./components/society-info";
import SocietyPosts from "../posts/society-posts";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({
  title,
  children,
  className = "",
}) => (
  <View
    className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    style={{ marginHorizontal: 16 }}
  >
    <View className="px-4 py-3 border-b border-gray-200">
      <Heading className="text-lg font-bold text-gray-900">{title}</Heading>
    </View>
    <View className="px-4 py-4">{children}</View>
  </View>
);

interface PersonCardProps {
  person: {
    id: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatar?: string;
  };
  role?: string;
  onPress?: () => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, role, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <VStack className="items-center" space="sm">
      <Avatar
        className="bg-gradient-to-br from-primary-500 to-secondary-600"
        size="lg"
      >
        <AvatarFallbackText className="text-white">
          {person.displayName ||
            `${person.firstName} ${person.lastName}`.trim()}
        </AvatarFallbackText>
        <AvatarImage
          source={{
            uri: person.avatar || undefined,
          }}
        />
      </Avatar>
      <VStack className="items-center" space="xs">
        {role && (
          <Badge className="bg-primary-100/50 border-primary-200 rounded-lg px-2 py-1">
            <BadgeText className="text-primary-700 font-medium text-xs">
              {role}
            </BadgeText>
          </Badge>
        )}
        <Text className="text-sm font-medium text-gray-900 text-center">
          {person.displayName ||
            `${person.firstName} ${person.lastName}`.trim()}
        </Text>
      </VStack>
    </VStack>
  </TouchableOpacity>
);

interface TabButtonProps {
  title: string;
  icon: any;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  title,
  icon: IconComponent,
  isActive,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-1 flex-row justify-center items-center gap-2 py-3 px-2 border-b-primary-500"
    style={{
      borderBottomWidth: isActive ? 3 : 0,
    }}
    activeOpacity={0.8}
  >
    <IconComponent size={20} color={isActive ? "#218bff" : "#737373"} />
    <Text
      className={`text-center text-sm ${
        isActive ? "text-primary-500 font-semibold" : "text-neutral-500"
      }`}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const SocietyProfile: React.FC<{ societyId: string }> = ({ societyId }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: society, isLoading } = useGetSocietyQuery({ societyId });
  const [cancelJoinRequest, { isLoading: isCancelling }] =
    useCancelJoinRequestMutation();

  const toast = useToastUtility();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posts" | "events" | "info">(
    "posts"
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-500 mt-4">Loading profile...</Text>
      </View>
    );
  }

  if (!society) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500">Society not found</Text>
      </View>
    );
  }

  const isStudent = user && "registrationNumber" in user;
  const havePermissionToEdit = isStudent
    ? checkPrivilege(
        user.societies || [],
        society.id,
        PRIVILEGES.SOCIETY_SETTINGS_MANAGEMENT
      )
    : societyId === (user as Advisor).societyId;

  const onCancelRequest = async () => {
    try {
      await cancelJoinRequest({
        societyId: society.id,
      }).unwrap();

      toast.showSuccessToast("Request successfully cancelled.");
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Unexpected error occurred.";
      toast.showErrorToast(message);
    }
  };

  const handlePersonPress = (personId: string) => {
    router.push(`/profile/${personId}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <View className="flex-1 bg-white">
            <SocietyPosts societyId={societyId} />
          </View>
        );
      case "events":
        return (
          <View className="flex-1 bg-white">
            <SocietyEvents societyId={societyId} />
          </View>
        );
      case "info":
        return <SocietyInfo society={society} />;
      default:
        return null;
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <VStack space="lg" style={{ paddingVertical: 16 }}>
        {/* Society Header */}
        <View
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          style={{ marginHorizontal: 16 }}
        >
          <VStack className="items-center" space="md">
            <Avatar className="bg-primary-500" size="xl">
              <Icon
                as={Building}
                className="text-white"
                style={{ width: 32, height: 32 }}
              />
              <AvatarImage
                source={{
                  uri: society.logo,
                }}
              />
            </Avatar>

            <VStack space="sm">
              <Heading className="text-xl font-bold text-center text-gray-900">
                {society.name}
              </Heading>

              <HStack space="4xl" className="justify-center">
                <VStack className="items-center" space="xs">
                  <Text className="text-2xl font-bold text-primary-600">
                    {society._count?.members || 0}
                  </Text>
                  <Text className="text-xs text-gray-500">Members</Text>
                </VStack>

                <VStack className="items-center" space="xs">
                  <Text className="text-2xl font-bold text-primary-600">
                    {society._count?.events || 0}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Event{society._count?.events !== 1 ? "s" : ""}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>

          {/* Action Buttons */}
          <HStack className="mt-4 items-center justify-center" space="sm">
            {isStudent && society.acceptingNewMembers && (
              <>
                {society.hasRequestedToJoin ? (
                  <Button
                    variant={"outline"}
                    size="sm"
                    className={cn("flex-1 border-error-500")}
                    isDisabled={isCancelling}
                    onPress={onCancelRequest}
                  >
                    <ButtonText className={"text-error-500"}>
                      {"Cancel Request"}
                    </ButtonText>
                  </Button>
                ) : (
                  <Button
                    className="bg-primary-500 rounded-md flex-1"
                    onPress={() =>
                      router.push({
                        pathname: "/(student-tabs)/explore/registration-form",
                        params: { societyId: society.id },
                      })
                    }
                  >
                    <ButtonText className="text-white">Join</ButtonText>
                  </Button>
                )}
              </>
            )}

            {havePermissionToEdit && (
              <Button
                variant="outline"
                onPress={() => {
                  // Navigate to society settings
                  // router.push({
                  //   pathname: "/society/settings",
                  //   params: { societyId: society.id },
                  // });
                }}
              >
                <Icon as={Edit} className="text-primary-500 mr-2" />
                <ButtonText>Edit</ButtonText>
              </Button>
            )}
          </HStack>
        </View>

        {/* Society Advisor */}
        {society.advisor && (
          <Section title="Society Advisor">
            <PersonCard
              person={society.advisor}
              onPress={() => handlePersonPress(society.advisor!.id)}
            />
          </Section>
        )}

        {/* Office Bearers */}
        {society.officeBearers && society.officeBearers.length > 0 && (
          <Section title="Office Bearers">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 16, paddingHorizontal: 4 }}
            >
              {society.officeBearers.map((item) => (
                <PersonCard
                  key={item.role}
                  person={item.student}
                  role={item.role}
                  onPress={() => handlePersonPress(item.student.id)}
                />
              ))}
            </ScrollView>
          </Section>
        )}

        {/* Tab Navigation */}
        <View>
          <View className="bg-white border border-gray-200 px-4">
            <HStack space="sm">
              <TabButton
                title="Posts"
                icon={Images}
                isActive={activeTab === "posts"}
                onPress={() => setActiveTab("posts")}
              />
              <TabButton
                title="Events"
                icon={CalendarCheck}
                isActive={activeTab === "events"}
                onPress={() => setActiveTab("events")}
              />
              <TabButton
                title="Info"
                icon={ClipboardList}
                isActive={activeTab === "info"}
                onPress={() => setActiveTab("info")}
              />
            </HStack>
          </View>
          <View className="min-h-[400px]">{renderTabContent()}</View>
        </View>

        {/* Tab Content */}
      </VStack>
    </ScrollView>
  );
};

export default SocietyProfile;
