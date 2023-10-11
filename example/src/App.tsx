import React from 'react';
import { Button, Space, Spin, message } from 'antd';
import { ApiOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import createTransport from '@keystonehq/hw-transport-webusb';
import Eth from '@keystonehq/hw-app-eth';
import './App.css';

const mockTxUR = 'UR:ETH-SIGN-REQUEST/OLADTPDAGDWMZTFTZORNGEFGWNNLGAIACSSBIYEHFNAOHDDLAOWEAHAOLRHKISDLAELRHKISDLBTLFGMAYMWGAGYFLASPLMDMYBGNDATEEISPLLGBABEFXLSIMVALNASCSGLJPNBAELARTAXAAAAAHAHTAADDYOEADLECSDWYKCSFNYKAEYKAEWKAEWKAOCYBNHEGSHYAMGHIHSNEOKTVWHDVSJETIWDTYPLVYGYKBFNNSVAWMNEFHLADWBB';

function App() {
  const [loading, setLoading] = React.useState(false);
  const [eth, setEth] = React.useState<Eth | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const success = (content: React.ReactNode) => {
    messageApi.open({
      type: 'success',
      content,
    });
  };

  const error = (content: React.ReactNode) => {
    messageApi.open({
      type: 'error',
      content,
    });
  }

  const handleLink2Device = React.useCallback(async () => {
    setLoading(true);
    const transport = await createTransport().catch((err) => error(err?.message ?? 'unknow error')).finally(() => setLoading(false));
    if (!transport) return;
    setEth(new Eth(transport));
    success('🎉 Link to Keystone3 Device Success!');
  }, [eth]);

  const handleSignTx = React.useCallback(async () => {
    if (!eth) {
      error('Please link to Keystone3 Device first!');
      return;
    }
    setLoading(true);
    try {
      const txResult = await eth?.signTransaction(mockTxUR);
      alert(txResult.data);
    } catch (e: any) {
      error(e?.message ?? 'Sign ETH tx failed!');
    }
    setLoading(false)
  }, [eth, error]);

  const handleCheckDeviceLockStatus = React.useCallback(async () => {
    if (!eth) {
      error('Please link to Keystone3 Device first!');
      return;
    }
    setLoading(true);
    const checkResult = await eth?.checkLockStatus().catch((err) => error(err?.message ?? '')).finally(() => setLoading(false));
    console.log(checkResult?.data);
  }, [eth]);

  return (
    <div className='App'>
      <Spin spinning={loading}>
        <Space direction='vertical' style={{
          gap: '20px',
        }}>
          <Button icon={<ApiOutlined />} onClick={handleLink2Device}>Link to Keystone3 Device</Button>
          <Button icon={<EditOutlined />} onClick={handleSignTx}>Sign ETH tx</Button>
          <Button icon={<LockOutlined />} onClick={handleCheckDeviceLockStatus}>Check Device Lock Status</Button>
        </Space>
      </Spin>
      {contextHolder}
    </div>
  );
}

export default App;
