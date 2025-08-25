import React, { useState } from "react";
import { Announcement } from "../types";
import { HStack } from "@/components/ui/hstack";
import { SocietyLogo } from "@/components/society-logo";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { View, TouchableOpacity, Dimensions } from "react-native";
import { formatTimeShort } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { MoreVertical } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { AnnouncementOptions } from "./announcement-options";

const { width: screenWidth } = Dimensions.get("window");

export const AnnouncementCard = ({
  announcement,
  havePrivilege,
  variant = "default",
}: {
  announcement: Announcement;
  havePrivilege?: boolean;
  variant?: "default" | "horizontal";
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleTextLayout = (event: any) => {
    const { lines } = event.nativeEvent;
    const maxLines = variant === "horizontal" ? 3 : 5;
    if (lines.length > maxLines) {
      setShowSeeMore(true);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Horizontal variant - compact card for horizontal scrolling
  if (variant === "horizontal") {
    const cardWidth = screenWidth * 0.8; // 80% of screen width

    return (
      <>
        <View
          className="bg-white rounded-lg px-3 py-3"
          style={{
            width: cardWidth,
            minHeight: 140,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <VStack space="sm" className="flex-1">
            {/* Header */}
            <HStack className="items-center" space="sm">
              {announcement.society && (
                <SocietyLogo society={announcement.society} avatarOnly />
              )}
              <VStack className="flex-1">
                <Text
                  size="sm"
                  style={{ fontWeight: "500" }}
                  className="text-neutral-900"
                  numberOfLines={1}
                >
                  {announcement.society?.name || "Unknown Society"}
                </Text>
                <Text size="xs" className="text-neutral-500">
                  {announcement.publishDateTime || announcement.createdAt
                    ? formatTimeShort(
                        announcement.publishDateTime || announcement.createdAt!
                      )
                    : ""}
                </Text>
              </VStack>
              {havePrivilege && (
                <Button variant="link" onPress={() => setShowOptions(true)}>
                  <Icon as={MoreVertical} size="sm" />
                </Button>
              )}
            </HStack>

            {/* Content */}
            <VStack space="xs" className="flex-1">
              <Text className="font-bold text-base" numberOfLines={2}>
                {announcement.title}
              </Text>

              <VStack space="xs" className="flex-1">
                <Text
                  size="sm"
                  numberOfLines={isExpanded ? undefined : 3}
                  onTextLayout={handleTextLayout}
                  className="text-neutral-700"
                >
                  {announcement.content}
                </Text>
                {showSeeMore && (
                  <TouchableOpacity onPress={toggleExpanded}>
                    <Text
                      size="sm"
                      className="text-primary-500"
                      style={{ fontWeight: "500", color: "#218bff" }}
                    >
                      {isExpanded ? "See less" : "See more"}
                    </Text>
                  </TouchableOpacity>
                )}
              </VStack>
            </VStack>
          </VStack>
        </View>
        {showOptions && (
          <AnnouncementOptions
            announcement={announcement}
            open={showOptions}
            setOpen={setShowOptions}
          />
        )}
      </>
    );
  }

  // Default variant - original layout
  return (
    <>
      <HStack
        space="xs"
        className="bg-white rounded-lg drop-shadow-md px-3 py-2"
      >
        {announcement.society && (
          <SocietyLogo society={announcement.society} avatarOnly />
        )}
        <VStack space="xs" className="flex-1">
          <HStack className="items-center" space="sm">
            <Text
              size="sm"
              style={{ fontWeight: "500", flexShrink: 1 }}
              className="text-neutral-900"
              numberOfLines={1}
            >
              {announcement.society?.name || "Unknown Society"}
            </Text>
            <View
              style={{
                height: 4,
                width: 4,
                backgroundColor: "#737373",
                borderRadius: 999,
              }}
            />
            <Text
              size="xs"
              className="text-neutral-500"
              style={{ flexShrink: 1, flex: 1, flexGrow: 1 }}
            >
              {announcement.publishDateTime || announcement.createdAt
                ? formatTimeShort(
                    announcement.publishDateTime || announcement.createdAt!
                  )
                : ""}
            </Text>
            {havePrivilege && (
              <Button variant="link" onPress={() => setShowOptions(true)}>
                <Icon as={MoreVertical} />
              </Button>
            )}
          </HStack>
          <Text className="font-bold" numberOfLines={2}>
            {announcement.title}
          </Text>
          <VStack space="xs">
            <Text
              numberOfLines={isExpanded ? undefined : 5}
              onTextLayout={handleTextLayout}
            >
              {announcement.content}
            </Text>
            {showSeeMore && (
              <TouchableOpacity onPress={toggleExpanded}>
                <Text
                  size="sm"
                  className="text-primary-500"
                  style={{ fontWeight: "500", color: "#218bff" }}
                >
                  {isExpanded ? "See less" : "See more"}
                </Text>
              </TouchableOpacity>
            )}
          </VStack>
        </VStack>
      </HStack>
      {showOptions && (
        <AnnouncementOptions
          announcement={announcement}
          open={showOptions}
          setOpen={setShowOptions}
        />
      )}
    </>
  );
};
