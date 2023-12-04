import React, { useEffect } from 'react';
import { Button, Space, Spin, message, Select } from 'antd';
import { ApiOutlined, EditOutlined, LockOutlined, DatabaseOutlined } from '@ant-design/icons';
import { TransportWebUSB, getKeystoneDevices } from '@keystonehq/hw-transport-webusb';
import Eth, { HDPathType } from '@keystonehq/hw-app-eth';
import './App.css';

// const mockTxUR = 'UR:ETH-SIGN-REQUEST/OLADTPDAGDWMZTFTZORNGEFGWNNLGAIACSSBIYEHFNAOHDDLAOWEAHAOLRHKISDLAELRHKISDLBTLFGMAYMWGAGYFLASPLMDMYBGNDATEEISPLLGBABEFXLSIMVALNASCSGLJPNBAELARTAXAAAAAHAHTAADDYOEADLECSDWYKCSFNYKAEYKAEWKAEWKAOCYBNHEGSHYAMGHIHSNEOKTVWHDVSJETIWDTYPLVYGYKBFNNSVAWMNEFHLADWBB';
const mockTxUR = 'UR:ETH-SIGN-REQUEST/ONADTPDAGDEESFCTIHKGTYGECWLGZSSGCAFXCYHPGSAOHDIOYAIHAXLALSADDMJPMWHDJKBKVTZSOYBTJKPFSNUYHYKGLTSRHKGWKNCXSBLAROFYPTAHNSRKAEAEAEAEAEAEAEAEAEAEAEAEHPTODPYAFYKBCKCTKPRLIHIEHSIMWKAEBEHHLUSNAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAECHFDKOVSAEETLALAAXADAACSETAHTAADDYOEADLECSDWYKCSFNYKAEYKAEWKAEWKAOCYWMCMJKCTQDADTBCL';

function App() {
  const [loading, setLoading] = React.useState(false);
  const [eth, setEth] = React.useState<Eth | null>(null);
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
        await TransportWebUSB.requestPermission();
      }
      /**
       * 2. Connect to the device.
       */
      const transport = await TransportWebUSB.connect({
        timeout: 5000,
      });
      await transport.close();
      setEth(new Eth(transport!));
      success('🎉 Link to Keystone3 Device Success!');
    } catch (e: any) {
      error(e?.message ?? 'Link to Keystone3 Device failed!');
    } finally {
      setLoading(false);
    }
  }, [error, success, setEth, setLoading]);

  useEffect(() => {
    if (eth) {
      (window as any).keystoneEth = eth;
    }
  }, [eth]);

  const handleSignTx = React.useCallback(async () => {
    if (!eth) {
      error('Please link to Keystone3 Device first!');
      return;
    }
    setLoading(true);
    try {
      const txResult = await eth?.signTransactionFromUr(mockTxUR);
      alert(txResult.payload);
    } catch (e: any) {
      error(e?.message ?? 'Sign ETH tx failed!');
    }
    setLoading(false)
  }, [eth, error, setLoading]);

  const handleCheckDeviceLockStatus = React.useCallback(async () => {
    if (!eth) {
      error('Please link to Keystone3 Device first!');
      return;
    }
    setLoading(true);
    const checkResult = await eth?.checkLockStatus().catch((err: any) => error(err?.message ?? '')).finally(() => setLoading(false));
    console.log(checkResult?.payload);
  }, [error, eth, setLoading]);

  const handleExportAddress = React.useCallback(async () => {
    if (!eth) {
      error('Please link to Keystone3 Device first!');
      return;
    }
    setLoading(true);
    const checkResult = await eth?.exportPubKeyFromUr({
      type: accountType,
    }).catch((err: any) => {
      error(err?.message ?? '');
      console.error(err);
    }).finally(() => setLoading(false));
    console.log(checkResult);
  }, [error, eth, setLoading, accountType]);

  return (
    <div className='App'>
      <Spin spinning={loading}>
        <Space direction='vertical' style={{
          gap: '20px',
        }}>
          <Button icon={<ApiOutlined />} onClick={handleLink2Device}>Link to Keystone3 Device</Button>
          <Button icon={<EditOutlined />} onClick={handleSignTx}>Sign ETH tx</Button>
          <Button icon={<LockOutlined />} onClick={handleCheckDeviceLockStatus}>Check Device Lock Status</Button>
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
