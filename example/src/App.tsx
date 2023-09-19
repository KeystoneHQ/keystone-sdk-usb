import React from 'react';
import { Button, notification } from 'antd';
import type { NotificationPlacement } from 'antd/es/notification/interface';
import TransportWebUSB, { Actions, getFirstKeystoneDevice, requestKeystoneDevice } from '@keystonehq/hw-transport-webusb';
import './App.css';

function App() {
  const [api, contextHolder] = notification.useNotification();
  const [result, setResult] = React.useState<string>('');
  const device = React.useRef<USBDevice | null>(null);

  const openNotification = React.useCallback(() => {
    api.info({
      message: `USB result`,
      description: <div>{result}</div>,
      placement: 'topRight',
    });
  }, [api, result]);

  return (
    <div className="App">
      <Button onClick={async () => {
        if (!device.current) {
          try {
            device.current = await TransportWebUSB.request();
          } catch (e) {
            console.log(e);
            return;
          }
        }
        const transport = new TransportWebUSB(device.current);
        const result = await transport.send(Actions.SIGN_ETH_TX, 'UR:ETH-SIGN-REQUEST/OLADTPDAGDWMZTFTZORNGEFGWNNLGAIACSSBIYEHFNAOHDDLAOWEAHAOLRHKISDLAELRHKISDLBTLFGMAYMWGAGYFLASPLMDMYBGNDATEEISPLLGBABEFXLSIMVALNASCSGLJPNBAELARTAXAAAAAHAHTAADDYOEADLECSDWYKCSFNYKAEYKAEWKAEWKAOCYBNHEGSHYAMGHIHSNEOKTVWHDVSJETIWDTYPLVYGYKBFNNSVAWMNEFHLADWBB');
        console.log(result);
        setResult(result ?? '');
        openNotification();
      }}>Click me</Button>
      {contextHolder}
    </div>
  );
}

export default App;
