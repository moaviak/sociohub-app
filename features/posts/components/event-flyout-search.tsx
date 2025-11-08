import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { useDebounceCallback } from "usehooks-ts";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import { Search, X } from "lucide-react-native";
import { formatEventDateTime } from "@/lib/utils";
import { useGetSocietyEventsInfiniteQuery } from "@/features/events/api";
import { Event } from "@/features/events/types";

interface EventFlyoutSearchProps {
  societyId: string;
  selectedEvent?: Event | null;
  onSelect: (event: Event) => void;
  onClear: () => void;
}

export const EventFlyoutSearch: React.FC<EventFlyoutSearchProps> = ({
  societyId,
  selectedEvent,
  onSelect,
  onClear,
}) => {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const { data, isFetching } = useGetSocietyEventsInfiniteQuery(
    {
      societyId: societyId || "",
      search,
      status: "Past",
      limit: 5,
      page: 1,
    },
    { skip: !search }
  );

  const events =
    data?.pages.flat().flatMap((response) => response.events) ?? [];

  const handleInputChange = (text: string) => {
    setInput(text);
    debouncedSetSearch(text);
    if (!isOpen && text) {
      setIsOpen(true);
    }
  };

  const handleSelectEvent = (event: Event) => {
    onSelect(event);
    setInput("");
    setSearch("");
    setIsOpen(false);
  };

  const handleClearEvent = () => {
    onClear();
    setInput("");
    setSearch("");
    setIsOpen(false);
  };

  const renderEventItem = (item: Event, index: number) => (
    <TouchableOpacity
      key={item.id}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: index === events.length - 1 ? 0 : 1,
        borderBottomColor: "#f3f4f6",
        backgroundColor: "white",
      }}
      onPress={() => handleSelectEvent(item)}
      activeOpacity={0.7}
    >
      <Text className="text-sm font-medium text-gray-700" numberOfLines={1}>
        {item.title}
      </Text>
      <Text className="text-xs text-gray-500" numberOfLines={1}>
        {formatEventDateTime(
          item.startDate!,
          item.endDate!,
          item.startTime!,
          item.endTime!
        )}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 32,
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      {isFetching ? (
        <ActivityIndicator size="small" color="#6b7280" />
      ) : (
        <Text
          style={{
            textAlign: "center",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          No results found
        </Text>
      )}
    </View>
  );

  // If an event is already selected, show the selected event
  if (selectedEvent) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: "#f3f4f6",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#d1d5db",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text className="text-base font-medium text-gray-700">
            {selectedEvent.title}
          </Text>
          <Text className="text-sm text-gray-500">
            {formatEventDateTime(
              selectedEvent.startDate!,
              selectedEvent.endDate!,
              selectedEvent.startTime!,
              selectedEvent.endTime!
            )}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleClearEvent}
          style={{
            marginLeft: 8,
            padding: 4,
          }}
          activeOpacity={0.7}
        >
          <X size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ position: "relative" }}>
      <Input className="border border-neutral-300 rounded-lg px-4">
        <InputIcon as={Search} />
        <InputField
          placeholder="Search for an event..."
          value={input}
          onChangeText={handleInputChange}
          onFocus={() => {
            if (input) setIsOpen(true);
          }}
        />
      </Input>

      {/* Dropdown Results */}
      {isOpen && search && (
        <View
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            backgroundColor: "white",
            borderRadius: 8,
            maxHeight: 200,
            overflow: "hidden",
            zIndex: 99999,
            // Enhanced shadow styling
            ...Platform.select({
              ios: {
                shadowColor: "#000000",
                shadowOffset: {
                  width: 0,
                  height: 8,
                },
                shadowOpacity: 0.25,
                shadowRadius: 16,
              },
              android: {
                elevation: 16,
              },
            }),
            // Border for better definition
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <View
            style={{
              maxHeight: 200,
              backgroundColor: "white",
            }}
          >
            {events.length === 0 ? (
              renderEmptyState()
            ) : (
              <ScrollView style={{ flexGrow: 1 }}>
                {events
                  .slice(0, 5)
                  .map((event, index) => renderEventItem(event, index))}
              </ScrollView>
            )}
          </View>
        </View>
      )}
    </View>
  );
};
