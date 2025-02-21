import React, { useState } from "react";
// import web3 from "../../config/blockchain/web3";
// import contract from "../../config/blockchain/contract";

const Donate = () => {
    // const [amount, setAmount] = useState("");

    // const handleDonate = async () => {
    //     if (!amount || isNaN(amount)) {
    //         alert("Vui lòng nhập số tiền hợp lệ!");
    //         return;
    //     }

    //     try {
    //         const accounts = await web3.eth.requestAccounts(); // Yêu cầu kết nối MetaMask
    //         await contract.methods.donate().send({
    //             from: accounts[0],
    //             value: web3.utils.toWei(amount, "ether"),
    //         });

    //         alert(`Quyên góp thành công ${amount} ETH!`);
    //     } catch (error) {
    //         console.error("Lỗi khi quyên góp:", error);
    //         alert("Giao dịch thất bại!");
    //     }
    // };

    return (
        <div>
            <h2>Quyên góp từ thiện</h2>
            {/* <input
                type="number"
                placeholder="Nhập số ETH"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={handleDonate}>Gửi quyên góp</button> */}
        </div>
    );
};

export default Donate;
