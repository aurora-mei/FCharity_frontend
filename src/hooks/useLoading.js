import { useState, useEffect } from "react";

const useLoading = (delay = 2000) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), delay);
        return () => clearTimeout(timer); // Dọn dẹp timer khi component bị unmount
    }, [delay]);

    return loading;
};

export default useLoading;
