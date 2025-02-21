import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { store } from "../../redux/store";
import { verifyResetPasswordOTPCode, sendResetPasswordOTPCode, resetPassword } from "../../redux/auth/authSlice";
import LoadingModal from "../../components/LoadingModal";
import OTPForm from "../../components/OTPForm/OTPForm";
import EmailForm from "../../components/EmailForm/EmailForm";
import ResetPwdForm from "../../components/ResetPwdForm/ResetPwdForm";
import { useNavigate } from "react-router-dom";
const OtpResetPwd = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [deadline, setDeadline] = useState(Date.now() + 1000 * 60);

    const [email, setEmail] = useState(useSelector((state) => state.auth.newUser.email) ?? "");
    let canResetPwd = store.getState().auth.canResetPwd;
    const [error, setError] = useState("");
    const loading = useSelector((state) => state.auth.loading);

    useEffect(() => {
        console.log("Can reset password:", canResetPwd);
        console.log("email:", email);
    }, []);
    const sendResetPasswordOTPCodeRequest = async (values) => {
        try {
            console.log("Form Values:", values);
            await dispatch(sendResetPasswordOTPCode(values)).unwrap();
            canResetPwd = store.getState().auth.canResetPwd;
            setEmail(values.email);
        } catch (error) {
            alert(error.message);
        }
    }
    const verifyResetPasswordOTPCodeRequest = async (values) => {
        try {
            console.log("Form Values:", values);
            values.email = email;
            await dispatch(verifyResetPasswordOTPCode(values)).unwrap();
        } catch (error) {
            alert(error.message);
        }
    }
    const onFinishCountDown = () => {
        setError("OTP expired. Please request a new one.")
    }
    const resendResetPasswordOTPCodeRequest = async () => {
        try {
            await dispatch(sendResetPasswordOTPCode({ email, msg: "Reset your FCHARITY password" })).unwrap();
            setDeadline(Date.now() + 1000 * 60);
        } catch (error) {
            alert(error.message);
        }
    }
    const resetPasswordRequest = async (values) => {
        try {
            console.log("Form Values :", values);
            await dispatch(resetPassword({ email: email, newPassword: values.password })).unwrap();
            navigate('/auth/login', { replace: true });
        } catch (error) {
            alert(error.message);
        }
    }
    if (loading) return <LoadingModal />;
    return (
        <div className="otp-container">
            {!email && <EmailForm onFinishForm={sendResetPasswordOTPCodeRequest} />}
            {(!canResetPwd && email) && <OTPForm deadline={deadline} onFinishForm={verifyResetPasswordOTPCodeRequest} onFinishCountDown={onFinishCountDown} onResendOTPCode={resendResetPasswordOTPCodeRequest} error={error} email={email} />}
            {(canResetPwd && email) && <ResetPwdForm onFinishForm={resetPasswordRequest} />}
        </div>
    );
};

export default OtpResetPwd;
