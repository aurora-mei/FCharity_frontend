import React, { useEffect } from "react";
import "./LoginScreen.pcss";
import OtpResetPwd from "../../containers/OtpResetPwd/OtpResetPwd";
// import store from "../../redux/store";
const ResetPwdScreen = () => {
    return (
        <div className="login">
            <OtpResetPwd />
        </div>
    )
};
export default ResetPwdScreen;