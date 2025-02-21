import React, { useState } from "react";
import { Input, Button, Typography, Flex, Form, Statistic } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import store from "../../redux/store";
import { verifyEmail, sendOTPCode } from "../../redux/auth/authSlice";
import LoadingModal from "../../components/LoadingModal";
import './OtpVerification.pcss';
import OTPForm from "../../components/OTPForm/OTPForm";
import EmailForm from "../../components/EmailForm/EmailForm";

const OtpVerification = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [deadline, setDeadline] = useState(Date.now() + 1000 * 60);
    const [email, setEmail] = useState(useSelector((state) => state.auth.newUser.email) ?? "");
    const [error, setError] = useState("");
    const loading = useSelector((state) => state.auth.loading);
    const sendOTPRequest = async (values) => {
        await dispatch(sendOTPCode(values)).unwrap();
        setEmail(values.email);
    }
    const verifyRequest = async (values) => {
        try {
            console.log("Form Values:", values);
            values.email = email;
            await dispatch(verifyEmail(values)).unwrap();
            const verified = store.getState().auth.verified;
            console.log("Verified:", verified);
            if (verified) navigate('/auth/login', { replace: true });
        } catch (error) {
            setError(error.message);
        };
    }
    const onFinishCountDown = () => {
        setError("OTP expired. Please request a new one.")
    }
    const resendOtpRequest = async () => {
        try {
            await dispatch(sendOTPCode({ email, msg: "Verify your email address" })).unwrap();
            setDeadline(Date.now() + 1000 * 60);
        } catch (error) {
            console.error(error.message);
        }
    }
    if (loading) return <LoadingModal />;
    return (
        <div className="otp-container">
            {!email && <EmailForm onFinishForm={sendOTPRequest} />}
            {email && <OTPForm deadline={deadline} onFinishForm={verifyRequest} onFinishCountDown={onFinishCountDown} onResendOTPCode={resendOtpRequest} error={error} email={email} />}

        </div>
    );
};

export default OtpVerification;
