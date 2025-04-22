import { useGetNotifications } from "@/hooks/query/notification.hook";
import { useCallback, useState } from "react";
import { BellOutlined } from "@ant-design/icons";
import { Badge, Popover } from "antd";
import { useSubscription } from "react-stomp-hooks";
import { useCurrentUser } from "@/hooks/userCurrentUser";
import NotificationLink from "./NotificationLink";
import { useMutation } from "@tanstack/react-query";
import { notificationApi } from "../../../config/API/notification";

export default function NotificationBell() {
  const currentUser = useCurrentUser();
  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useGetNotifications();
  const [visible, setVisible] = useState(false);

  // Count unread notifications
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Format date to relative time (e.g., "2 hours ago")

  const onMessage = useCallback(() => {
    refetch();
  }, [refetch]);

  // Subscribe to the topic
  useSubscription(
    `/topic/help-notifications/${currentUser?.id || ""}`,
    onMessage
  );

  // Function to mark all notifications as read
  const { mutate: markAllAsRead } = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(currentUser?.id || ""),
    onSuccess: () => {
      refetch();
      setVisible(false);
    },
  });

  return (
    <Popover
      trigger={"click"}
      placement="bottom"
      open={visible}
      onOpenChange={setVisible}
      classNames={{
        body: "!p-0 w-full",
      }}
      content={
        <div className="mt-2 w-80 bg-white">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold !m-0">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <ul onClick={() => setVisible(false)}>
                {notifications.map((notification) => (
                  <NotificationLink
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </ul>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-200 text-center">
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      }
    >
      <Badge count={unreadCount} color="red" className="cursor-pointer">
        <BellOutlined className="text-2xl" />
      </Badge>
    </Popover>
  );
}
