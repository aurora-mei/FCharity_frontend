import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { IoIosWarning } from "react-icons/io";
import { FaCircleInfo } from "react-icons/fa6";

const showSuccess = (message) => {
  toast.success(
    <div className="flex gap-2 items-center justify-between text-green-500">
      {message}
    </div>
  );
};

const showError = (message) => {
  toast.error(
    <div className="flex gap-2 items-center justify-between text-red-600">
      {message}
    </div>
  );
};

const showWarning = (message) => {
  toast.warning(
    <div className="flex gap-2 items-center justify-between text-yellow-400">
      {message}
    </div>
  );
};

const showInfo = (message) => {
  toast.info(
    <div className="flex gap-2 items-center justify-between text-gray-800">
      {message}
    </div>
  );
};

export { showSuccess, showError, showWarning, showInfo };
