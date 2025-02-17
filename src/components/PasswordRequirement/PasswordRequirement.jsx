import React from "react";
import { Card, Typography } from "antd";
import "./PasswordRequirement.pcss";
const { Text } = Typography;

const PasswordRequirement = () => {
    return (
        <Card className='.card'>
            <Text strong>Your password must have at least:</Text>
            <ul className='.list'>
                <li>Minimum 12 characters</li>
                <li>1 uppercase letter</li>
                <li>1 lowercase letter</li>
                <li>1 number</li>
                <li>1 symbol</li>
            </ul>
        </Card>
    );
};

export default PasswordRequirement;
