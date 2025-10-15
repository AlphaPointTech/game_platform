import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TOKEN_ABI from "../utils/TokenABI.json"; // make sure ABI is here

const tokenAddress = "0xYourTokenContractAddress"; // replace with your contract address

async function getTokenBalance(userAddress) {
  if (!window.ethereum) return 0;

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);

  try {
    const balance = await contract.balanceOf(userAddress);
    return ethers.utils.formatUnits(balance, 18); // assuming 18 decimals
  } catch (err) {
    console.error("Error fetching balance:", err);
    return 0;
  }
}

async function sendTokens(toAddress, amount, updateBalanceCallback) {
  if (!window.ethereum) return alert("Wallet not connected");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);

  try {
    const decimals = await contract.decimals();
    const tx = await contract.transfer(toAddress, ethers.utils.parseUnits(amount, decimals));

    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.transactionHash);

    const userAddress = await signer.getAddress();
    const updatedBalance = await getTokenBalance(userAddress);

    updateBalanceCallback(updatedBalance);

  } catch (err) {
    console.error("Transaction failed:", err);
  }
}

export default function Dashboard() {
  const [balance, setBalance] = useState("0");
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    async function init() {
      if (!window.ethereum) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);

      const bal = await getTokenBalance(address);
      setBalance(bal);
    }
    init();
  }, []);

  const handleSend = async () => {
    const to = "0xRecipientAddress"; // replace with recipient
    const amount = "10"; // tokens to send
    await sendTokens(to, amount, setBalance);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Your Wallet: {userAddress}</h2>
      <h3>Token Balance: {balance}</h3>
      <button onClick={handleSend} style={{ padding: "10px 20px", marginTop: "10px" }}>
        Send 10 Tokens
      </button>
    </div>
  );
}
