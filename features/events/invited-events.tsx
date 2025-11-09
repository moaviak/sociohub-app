import { VStack } from "@/components/ui/vstack";
import {
  useCreateCheckoutSessionMutation,
  useGetMyInvitesQuery,
  useRegisterForEventMutation,
  useRejectInviteMutation,
} from "@/features/events/api";
import {
  View,
  ActivityIndicator,
  ScrollView,
  Text,
  Platform,
} from "react-native";
import { EventCard } from "./components/event-card";
import { useToastUtility } from "@/hooks/useToastUtility";
import ApiError from "@/store/api-error";
import { useState } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

export const InvitedEvents = () => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { data: events, isLoading } = useGetMyInvitesQuery();
  const [rejectInvite, { isLoading: isRejecting }] = useRejectInviteMutation();
  const [registerForEvent, { isLoading: isRegistering }] =
    useRegisterForEventMutation();
  const [createCheckoutSession, { isLoading: isCreatingCheckout }] =
    useCreateCheckoutSessionMutation();

  const toast = useToastUtility();

  const handleReject = async (eventId: string) => {
    try {
      await rejectInvite({ eventId }).unwrap();
      toast.showSuccessToast("Invite rejected successfully");
    } catch (error) {
      const message = (error as ApiError).errorMessage;
      toast.showErrorToast(message || "An unexpected error occurred");
    }
  };

  const APP_SCHEME = "sociohub";
  const BASE_URL = `${APP_SCHEME}://`;

  const handleRegistration = async (eventId: string) => {
    setIsProcessingPayment(true);

    try {
      const registrationResponse = await registerForEvent(eventId).unwrap();

      if (registrationResponse.paymentRequired) {
        const successUrl = `${BASE_URL}payment-success?sesion_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${BASE_URL}payment-cancelled?eventId=${eventId}&payment_cancelled=true`;

        const checkoutResponse = await createCheckoutSession({
          eventId: eventId,
          registrationId: registrationResponse.registration.id,
          successUrl,
          cancelUrl,
        }).unwrap();

        if (Platform.OS === "web") {
          window.location.href = checkoutResponse.checkoutUrl;
          Linking.openURL(checkoutResponse.checkoutUrl);
        } else {
          const result = await WebBrowser.openBrowserAsync(
            checkoutResponse.checkoutUrl,
            {
              dismissButtonStyle: "cancel",
              readerMode: false,
              // This ensures the browser closes when redirecting back to app
              createTask: false,
            }
          );

          if (result.type === "cancel") {
            // User manually cancelled
            setIsProcessingPayment(false);
            toast.showWarningToast("Payment was cancelled");
          }
        }
      } else {
        toast.showSuccessToast("Successfully registered for the event");
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage ||
        (error as Error).message ||
        "Unexpected error occurred. Please try again!";

      toast.showErrorToast(message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <View className="p-6">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!events || events.length === 0) {
    return (
      <View className="p-6">
        <Text>No invited events</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="p-6"
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <VStack space="md">
        {events?.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            variant="invited"
            onReject={() => handleReject(event.id)}
            onAccept={() => handleRegistration(event.id)}
            isAccepting={isProcessingPayment}
            isRejecting={isRejecting}
          />
        ))}
      </VStack>
    </ScrollView>
  );
};
