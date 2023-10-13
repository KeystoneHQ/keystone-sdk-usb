import React from 'react';
import { Button, Space, Spin, message, Select } from 'antd';
import { ApiOutlined, EditOutlined, LockOutlined, DatabaseOutlined } from '@ant-design/icons';
import createTransport from '@keystonehq/hw-transport-webusb';
import Eth, { HDPathType } from '@keystonehq/hw-app-eth';
import './App.css';

const mockTxUR = 'UR:ETH-SIGN-REQUEST/OLADTPDAGDWMZTFTZORNGEFGWNNLGAIACSSBIYEHFNAOHDDLAOWEAHAOLRHKISDLAELRHKISDLBTLFGMAYMWGAGYFLASPLMDMYBGNDATEEISPLLGBABEFXLSIMVALNASCSGLJPNBAELARTAXAAAAAHAHTAADDYOEADLECSDWYKCSFNYKAEYKAEWKAEWKAOCYBNHEGSHYAMGHIHSNEOKTVWHDVSJETIWDTYPLVYGYKBFNNSVAWMNEFHLADWBB';

function App() {
  const [loading, setLoading] = React.useState(false);
  const [eth, setEth] = React.useState<Eth | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [accountType, setAccountType] = React.useState<HDPathType>(HDPathType.Bip44Standard);

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
    const transport = await createTransport().catch((err) => {
      console.error(err);
      error(err?.message ?? 'unknow error');
    }).finally(() => setLoading(false));
    if (!transport) return;
    setEth(new Eth(transport));
    success('🎉 Link to Keystone3 Device Success!');
  }, [error, success, setEth, setLoading]);

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
    const checkResult = await eth?.exportAddress({
      type: accountType,
    }).catch((err: any) => error(err?.message ?? '')).finally(() => setLoading(false));
    console.log(checkResult?.payload);
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
