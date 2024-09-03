# React + Vite

Built using pnpm
pnpm install
pnpm run dev


The key differences noted in here vs normal signing is in the addSigner section.  

### Adding Signers to a Transaction

The following code snippet demonstrates how to dynamically add signers to a transaction based on the devices associated with an account. This is particularly useful when working with multiple authentication schemes, such as WebAuthn and ED25519.

```javascript
account.devices.flatMap((device) =>
  device.guard.keys.map((key) =>
    txb.addSigner(
      {
        pubKey: key,
        scheme: /^WEBAUTHN-/.test(key) ? 'WebAuthn' : 'ED25519',
      },
      (withCap) => [
        withCap('coin.GAS'),
      ]
    )
  )
);
