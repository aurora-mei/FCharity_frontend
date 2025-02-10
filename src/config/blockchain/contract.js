import web3 from "./web3";
import CharityFundABI from "./CharityFundABI.json";

const contractAddress = import.meta.env.REACT_APP_CONTRACT_ADDRESS; 
const contract = new web3.eth.Contract(CharityFundABI, contractAddress);

export default contract;
