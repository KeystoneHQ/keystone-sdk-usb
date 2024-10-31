import React, { useCallback, useEffect, useState } from 'react';
import Bitcoin from '@keystonehq/hw-app-bitcoin'
import { Button } from 'antd';
import { createKeystoneTransport, TransportWebUSB } from '@keystonehq/hw-transport-webusb';

export default function BtcPage() {
  const [transport, setTransport] = useState<TransportWebUSB | null>(null)
  const [app, setApp] = React.useState<Bitcoin | null>(null);
  const [appData, setAppData] = useState({
    mfp: ''
  })

  const connect = useCallback(async () => {
    const transport = await createKeystoneTransport();
    setTransport(transport);

    const bitcoinApp = new Bitcoin(transport);

    setApp(bitcoinApp);

    const mfp = await bitcoinApp.getMasterFingerprint();

    bitcoinApp.setMasterFingerprint(mfp)

    setAppData(data => ({
      ...data,
      mfp
    }))
  }, [])

  const signMessage = useCallback(async () => {
    await connect();

    if (!app) throw new Error('not connect app');

    const message = prompt('message')
    const path = `m/86'/0'/0'/0/0`

    if (!message) throw new Error('message is required');


    const sig = await app.signMessage(message, path)
    console.warn("DEBUGPRINT[1]: Btc.tsx:34: sig=", sig)

  }, [app, connect])

  return <div>
    <div>
      <div>mfp: {appData.mfp}</div>
      <Button onClick={connect}>Connect</Button>

    </div>
    <div>
      <Button onClick={signMessage}>Sign Message</Button>
    </div>
  </div>
}
