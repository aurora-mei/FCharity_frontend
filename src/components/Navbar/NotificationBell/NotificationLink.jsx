import clsx from "clsx";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../../../config/API/notification";
NotificationLink.propTypes = {
  notification: PropTypes.object.isRequired,
};

export default function NotificationLink({ notification }) {
  const [isRead, setIsRead] = useState(notification.read);

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return dateString;
    }
  };

  const clientQuery = useQueryClient();

  const { mutate: markAsRead } = useMutation({
    mutationFn: (notificationId) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleClick = () => {
    setIsRead(true);
    markAsRead(notification.id);
  };

  useEffect(() => {
    setIsRead(notification.read);
  }, [notification.read]);

  return (
    <li
      className={clsx("px-2 py-1 border-b border-gray-100 hover:bg-gray-50", {
        "bg-blue-50": !isRead,
      })}
    >
      <Link to={notification.link} className="block" onClick={handleClick}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <div
              className={clsx("w-2 h-2 rounded-full mt-2", {
                "bg-blue-500": !isRead,
                "bg-gray-300": isRead,
              })}
            />
          </div>
          <div className="flex-1 gap-1 flex flex-col w-full">
            <p className="font-medium text-gray-900 !m-0">
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 mt-1 !m-0">
              {notification.content}
            </p>
            <p className="text-xs text-gray-400 mt-1 !m-0">
              {formatDate(notification.createdAt)}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
