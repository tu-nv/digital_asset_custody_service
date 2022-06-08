import './App.css';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';


function App() {

  const [wallets, setWallets] = useState([]);
  const [walletWithBalances, setWalletWithBalances] = useState([]);
  const [transmitter, setTransmitter] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [ethToSend, setEthToSend] = useState(0);

  const [ethPassword, setEthPassword] = useState(null);
  const [wallet, setWallet] = useState(null);

  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [user, setUser] = useState();
  const [token, setToken] = useState();

  axios.defaults.baseURL = "http://141.223.181.151:3001";

  // get the wallet lists and balances when the page is loaded/refresh
  useEffect(() => {
    async function getWallets() {
      const _wallets = await axios.get(`/wallets/${user}`);
      setWalletWithBalances(_wallets.data);
      setWallets(_wallets.data.map(e => e.wallet));
    }

    getWallets();
  }, [user]);

  // listen on the change of transitter
  const onTransmitterChange = useCallback(async e => {
    setTransmitter(e.target.value);
  }, []);

  // listen on the change of recipient
  const onRecipientChange = useCallback(async e => {
    setRecipient(e.target.value);
  }, []);

  // listen on the change of amount of eth to send
  const onEthToSendChange = useCallback(async e => {
    setEthToSend(e.target.value);
  }, []);

  // listen on the change of ethPassword input
  const onEthPasswordChange = useCallback(async e => {
    setEthPassword(e.target.value);
  }, []);

  const onWalletChange = useCallback(async e => {
    setWallet(e.target.value);
  }, []);

  const onUsernameChange = useCallback(async e => {
    setUsername(e.target.value);
  }, []);

  const onPasswordChange = useCallback(async e => {
    setPassword(e.target.value);
  }, []);

  const handleSignup = useCallback(async e => {
    axios.post('/signup', {username: username, password: password})
    .then(response => {
      alert("Account created!");
    })
    .catch(err => {
      alert(err.response.data.msg);
    })

  }, [username, password]);

  const handleLogin = useCallback(async e => {
    axios.post('/login', { username: username, password: password })
    .then(res => {
      console.log(res.data.token);
      setUser(username);
      setToken(res.data.token);
    })
    .catch(err => {
      alert(err.response.data.msg);
    })
  }, [username, password]);

  const addWallet = useCallback(async e => {
    console.log(user);
    axios.post(`/add-wallet/${user}`, { wallet: wallet, ethPassword: ethPassword })
      .then(response => {
        alert("wallet added!");
      })
      .catch(err => {
        alert(err.response.data.msg);
      })

  }, [wallet, ethPassword]);

  // Send eth and display the result in a popup
  const sendEth = async () => {
    // if (transmitter === null || recipient === null || ethToSend <= 0 || ethPassword === null) {
    //   alert("wrong input. Please check again!", transmitter);
    //   return;
    // }

    // web3.eth.personal.sendTransaction({
    //     from: transmitter,
    //     to: recipient,
    //     value: web3.utils.toWei(ethToSend, 'ether'),
    //   }, ethPassword)
    //   .then(alert)
    //   .catch(alert);
  };
  // login UI
  if (!user) {
    return (
      <div className="App">
        <label >Username
          <input type="text" required onInput={onUsernameChange} />
        </label>
        <label >Password
          <input type="password" required onInput={onPasswordChange} /> </label>
        <button type="submit" onClick={handleLogin}>Login</button>
        <button type="submit" onClick={handleSignup}>Sign Up</button>
      </div>
    );
  };

  // The logged in UI for user
  return (
    <div className="App">
      <label> Wallet address
        <input type="text" required onInput={onWalletChange} />
      </label>
      <label> Eth Password
        <input type="password" required onInput={onEthPasswordChange} />
      </label>

      <button onClick={addWallet}>
        Add Wallet
      </button>

        {/* Wallet table */}
        <table>
          <thead>
            <tr>
              <th>Wallet</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
          {walletWithBalances.map((val, key) => {
              return (
                <tr key={key}>
                  <td>{val.wallet}</td>
                  <td>{val.balance}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <label className='label'> Transmitter
        <select onChange={onTransmitterChange}>
            <option value={null} selected disabled hidden>Choose here</option>
            { wallets.map(e => <option key={e}>{e}</option>) }
          </select>
        </label>

        <label className='label'> Recipient
        <input className='EthAddr' type="text" onInput={onRecipientChange}/>
        </label>

        <label> Amount of ETH
          <input type="number" step="any" required onInput={onEthToSendChange}/>
        </label>

        <button onClick={sendEth}>
          Send
        </button>

      </div>
  );
}

export default App;
