import { Flex, Spin } from "antd";
import "./LoadingModal.pcss";
const LoadingModal = () => {
    return (
        <Flex justify="center" align="center" style={{ minHeight: "100vh" }}>
            <Spin size="large" className="custom-spin" />
        </Flex>
    );
};
export default LoadingModal;