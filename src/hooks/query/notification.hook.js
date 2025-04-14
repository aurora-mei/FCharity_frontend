import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../../config/API/notification";
import { useCurrentUser } from "../userCurrentUser";
const queryKey = "notifications";

export const useGetNotifications = () => {
  const currentUser = useCurrentUser();

  return useQuery({
    queryKey: [queryKey, currentUser],
    queryFn: () =>
      notificationApi.getNotifications({
        userId: currentUser.id,
        role: currentUser.userRole,
      }),
    enabled: Boolean(currentUser),
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation(
    {
      mutationFn: (notificationId) =>
        notificationApi.markAsRead(notificationId),
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    }
  );
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation(
    {
      mutationFn: notificationApi.markAllAsRead,
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    }
  );
};
