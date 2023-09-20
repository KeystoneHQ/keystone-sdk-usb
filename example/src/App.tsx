import React from 'react';
import { Button, notification, Space } from 'antd';
import type { NotificationPlacement } from 'antd/es/notification/interface';
import createTransport from '@keystonehq/hw-transport-webusb';
import Eth from '@keystonehq/hw-app-eth';
import './App.css';

const mockTxUR = 'UR:ETH-SIGN-REQUEST/OLADTPDAGDWMZTFTZORNGEFGWNNLGAIACSSBIYEHFNAOHDDLAOWEAHAOLRHKISDLAELRHKISDLBTLFGMAYMWGAGYFLASPLMDMYBGNDATEEISPLLGBABEFXLSIMVALNASCSGLJPNBAELARTAXAAAAAHAHTAADDYOEADLECSDWYKCSFNYKAEYKAEWKAEWKAOCYBNHEGSHYAMGHIHSNEOKTVWHDVSJETIWDTYPLVYGYKBFNNSVAWMNEFHLADWBB';

function App() {
  const [api, contextHolder] = notification.useNotification();
  const [result, setResult] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const eth = React.useRef<Eth | null>(null);
  const device = React.useRef<USBDevice | null>(null);

  const handleLink2Device = React.useCallback(async () => {
    setLoading(true);
    try {
      const transport = await createTransport();
      eth.current = new Eth(transport);
      console.log('[result]: ', result);
    } catch (e) {
      console.log('[error]: ', e);
    } finally {
      setLoading(false);
    }
  }, [eth, result]);

  const handleSignTx = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await eth.current?.signTransaction(mockTxUR);
      console.log('[result]: ', result);
      setResult(result);
    } catch (e) {
      console.log('[error]: ', e);
    } finally {
      setLoading(false);
    }
  }, [eth, result]);

  const handleCheckDeviceLockStatus = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await eth.current?.checkLockStatus();
      console.log('[result]: ', result);
      setResult(result);
    } catch (e) {
      console.log('[error]: ', e);
    } finally {
      setLoading(false);
    }
  }, [eth, result]);

  return (
    <div className='App'>
      <Space>
        <Button loading={loading} onClick={handleLink2Device}>Link to Keystone3 Device</Button>
        <Button disabled={!eth.current} loading={loading} onClick={handleSignTx}>Sign ETH tx</Button>
        <Button disabled={!eth.current} loading={loading} onClick={handleCheckDeviceLockStatus}>Check Device Lock Status</Button>
        {contextHolder}
      </Space>
    </div>
  );
}

export default App;
