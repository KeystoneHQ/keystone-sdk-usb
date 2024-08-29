import React, { useEffect } from 'react';
import { Button, Space, Spin, message, Select } from 'antd';
import { ApiOutlined, EditOutlined, LockOutlined, DatabaseOutlined } from '@ant-design/icons';
import { TransportWebUSB, getKeystoneDevices } from '@keystonehq/hw-transport-webusb';
import EthLeagcy, { HDPathType, Eth } from '@keystonehq/hw-app-eth';
import Solana from '@keystonehq/hw-app-sol';
import { PublicKey } from "@solana/web3.js";
import './App.css';

const mockTxUR = 'UR:ETH-SIGN-REQUEST/ONADTPDAGDGEJKFXCSVANTFDPLMTCWEYVYWDKOWZZMAOHDIYYAIEGYLALFOEASMWROSTJYLFVEHECTFYUECHFEYKDWJYFWJZIACWUTGMLAROFYPTAHNSRKAEAEAEAEAEAEAEAEAEAEAEAEHDCXTTKSWKLADAFHOYCFSBZEVLGASORPNDYAWMRHAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAXLGKBOXSWLAAEADLALAAXADAAADAHTAADDYOEADLECSDWYKCSFNYKAEYKAEWKAEWKAOCYGMJYFLAXPAUEFEIS';


const solTxHex = "010001035eb9862fe23e544a2a0969cc157cb31fd72901cc2824d536a67fb8ee911e02363b9ba3a2ebaf40c1cd672a80a8e1932b982cca8264be33c39359701e113c3da20000000000000000000000000000000000000000000000000000000000000000030303030303030303030303030303030303030303030303030303030303030301020200010c020000002a00000000000000"

const solMsg = "ff736f6c616e61206f6666636861696e00001c004c6f6e67204f66662d436861696e2054657374204d6573736167652e"

const ethTx = "02ee016d843b9aca0084ca0b23568252089449ab56b91fc982fd6ec1ec7bb87d74efa6da30ab87038d7ea4c6800080c0"

function App() {
  const [loading, setLoading] = React.useState(false);
  const [ethLeagcy, setEthLeagcy] = React.useState<EthLeagcy | null>(null);
  const [eth, setEth] = React.useState<Eth | null>(null);
  const [solana, setSolana] = React.useState<Solana | null>(null);
  const [index, setIndex] = React.useState(0);
  const [solAddress, setSolAddress] = React.useState<string>('');
  const [mfp, setMfp] = React.useState<string>('');
  const [messageApi, contextHolder] = message.useMessage();
  const [accountType, setAccountType] = React.useState<HDPathType>(HDPathType.LedgerLive);

  const success = React.useCallback((content: React.ReactNode) => {
    messageApi.open({
      type: 'success',
      content,
    });
  }, [messageApi]);

  const error = React.useCallback((content: React.ReactNode) => {
    messageApi.open({
      type: 'error',
      content,
    });
  }, [messageApi])

  const handleLink2Device = React.useCallback(async () => {
    setLoading(true);
    try {
      /**
       * 1. Request permission to access the device.
       */
      if ((await getKeystoneDevices()).length <= 0) {
        console.log('no device')
        await TransportWebUSB.requestPermission();
      }
      /**
       * 2. Connect to the device.
       */
      const transport = await TransportWebUSB.connect({
        timeout: 100000,
      });
      await transport.close();
      setEthLeagcy(new EthLeagcy(transport!));
      setEth(new Eth(transport!));
      setSolana(new Solana(transport!));
      success('🎉 Link to Keystone3 Device Success!');
    } catch (e: any) {
      error(e?.message ?? 'Link to Keystone3 Device failed!');
    } finally {
      setLoading(false);
    }
  }, [error, success, setEth, setLoading]);

  useEffect(() => {
    if (ethLeagcy) {
      (window as any).keystoneEth = ethLeagcy;
    }
  }, [ethLeagcy]);

  const handleSignTx = React.useCallback(async () => {
    if (!ethLeagcy) {
      error('Please link to Keystone3 Device first!');
      return;
    }
    setLoading(true);
    try {
      const txResult = await ethLeagcy?.signTransactionFromUr(mockTxUR);
      alert(txResult?.payload);
    } catch (e: any) {
      error(e?.message ?? 'Sign ETH tx failed!');
    }
    setLoading(false)
  }, [eth, error, setLoading]);



  const handleSignTxNew = React.useCallback(async () => {
    if (!eth) {
      error('Please link to Keystone3 Device first!');
      return;
    }
    setLoading(true);
    try {
      const path = "m/44'/60'/0'/0/0"
      const txResult = await eth?.signTransaction(path, ethTx);
      alert(txResult);
    } catch (e: any) {
      error(e?.message ?? 'Sign ETH tx failed!');
    }
    setLoading(false)
  }, [eth, error, setLoading]);


  const handleCheckDeviceLockStatus = React.useCallback(async () => {
    if (!eth) {
      error('Please connect to Keystone3 Device first!');
      return;
    }
    setLoading(true);
    const checkResult = await ethLeagcy?.checkLockStatus().catch((err: any) => error(err?.message ?? '')).finally(() => setLoading(false));
    console.log(checkResult?.payload);
  }, [error, ethLeagcy, setLoading]);

  const handleExportAddress = React.useCallback(async () => {
    if (!eth) {
      error('Please link to Keystone3 Device first!');
      return;
    }
    setLoading(true);
    const checkResult = await ethLeagcy?.exportPubKeyFromUr({
      type: accountType,
    }).catch((err: any) => {
      error(err?.message ?? '');
      console.error(err);
    }).finally(() => setLoading(false));
    console.log(checkResult);
  }, [error, ethLeagcy, setLoading, accountType]);

  const handleGetSolanaAddress = React.useCallback(async () => {
    if (!solana) {
      error('Please link to Keystone3 Device first!');
      return;
    }
    setLoading(true);

    console.log('path', `m/44'/501'/${index}'`)
    const path = `m/44'/501'/${index}'`
    try {
      const result = await solana?.getAddress(path);
      const pubkey = new PublicKey(result.address);
      const mfp = result.mfp;
      setMfp(mfp);
      console.log(pubkey.toString());
      setSolAddress(pubkey.toString());
    } catch (e) {
      console.error(e)
    }
    setIndex(index + 1);
    setLoading(false);
  }, [error, solana, setLoading, index]);

  const handleSolTx = React.useCallback(async () => {
    if (!solana) {
      error('Please link to Keystone3 Device first!');
      return;
    }
    setLoading(true);

    const path = "m/44'/501'/0'"
    try {
      const result = await solana.signTransaction(path, Buffer.from(solMsg, 'hex'));

      console.log(result.signature.toString('hex'))
    } catch (e) {
      console.error(e)
    }
    setLoading(false);
  }, [error, solana, setLoading]);

  const handleSolMsg = React.useCallback(async () => {
    if (!solana) {
      error('Please link to Keystone3 Device first!');
      return;
    }
    setLoading(true);

    const path = "m/44'/501'/0'"
    try {
      const result = await solana.signOffchainMessage(path, Buffer.from(solMsg, 'hex'));

      console.log(result.signature.toString('hex'))
    } catch (e) {
      console.error(e)
    }
    setLoading(false);
  }, [error, solana, setLoading]);

  const handleEthAddressNew = React.useCallback(async () => {
    if (!eth) {
      error('Please link to Keystone3 Device first!');
      return;
    }
    setLoading(true);

    const path = "44'/60'/0'/0/0"
    
    try {
      const result = await eth.getAddress(path, true, true, "17000")
      console.log(result)
    } catch (e) {
      console.error(e)
    }
    setLoading(false);

  }, [error, eth, setLoading]);


  return (
    <div className='App'>
      <Spin spinning={loading}>
        <Space direction='vertical' style={{
          gap: '20px',
        }}>
          <Button icon={<ApiOutlined />} onClick={handleLink2Device}>Link to Keystone3 Device</Button>
          <Button icon={<EditOutlined />} onClick={handleSignTx}>Sign ETH tx</Button>
          <Button icon={<LockOutlined />} onClick={handleCheckDeviceLockStatus}>Check Device Lock Status</Button>
          <Button icon={<LockOutlined />} onClick={handleGetSolanaAddress}>Get SOL Address</Button>
          <Button icon={<LockOutlined />} onClick={handleSolTx}>Sign SOL Tx</Button>
          <Button icon={<LockOutlined />} onClick={handleSolMsg}>Sign SOL Msg</Button>
          <Button icon={<LockOutlined />} onClick={handleEthAddressNew}>Get ETH Address New</Button>
          <Button icon={<LockOutlined />} onClick={handleSignTxNew}>Sign ETH tx New</Button>
          <div>{solAddress}</div>
          <Space>
            <Select value={accountType} onChange={setAccountType} style={{ width: 200 }} options={[
              {
                value: HDPathType.Bip44Standard,
                label: 'Bip44Standard',
              },
              {
                value: HDPathType.LedgerLegacy,
                label: 'LedgerLegacy',
              },
              {
                value: HDPathType.LedgerLive,
                label: 'LedgerLive',
              },
            ]} />
            <Button icon={<DatabaseOutlined />} onClick={handleExportAddress}>Export Address</Button>
          </Space>
        </Space>
      </Spin>
      {contextHolder}
    </div>
  );
}

export default App;
