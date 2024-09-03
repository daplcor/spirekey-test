
# Simple SpireKey Signing Example

This project demonstrates how to sign transactions using SpireKey with dynamic signer management. It is built using `pnpm`.

## Installation and Development

To set up and run the project:

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run the development server**:
   ```bash
   pnpm run dev
   ```

## Key Differences in Signing

The key difference in this example, compared to standard signing methods, is in the `addSigner` section of the code.

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
```

### Explanation:

- **Dynamic Signer Addition**:
  - The code iterates over the devices associated with the account.
  - For each device, it maps over the associated keys.
  - The `addSigner` function adds the signer's public key and determines the signing scheme (either `WebAuthn` or `ED25519`).

- **Gas Capability**:
  - The signer is granted the `coin.GAS` capability to pay for the transaction's gas costs.

This pattern ensures that all relevant keys from all devices are included as signers in the transaction, with the appropriate signing scheme and permissions.
