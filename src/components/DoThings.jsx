import React, { useState } from 'react';
import { connect, sign } from '@kadena/spirekey-sdk';
import { createClient, createTransactionBuilder } from '@kadena/client';

const DoThings = () => {
  const [chainId, setChainId] = useState('');
  const [message, setMessage] = useState('');
  const client = createClient(`https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/${chainId}/pact`);

  const handleSign = async () => {
    try {
      const account = await connect('testnet04', chainId);
      console.log("Account: ", account);

      // Use a string to test second message for easier testing
      const message1 = `"${message}"`; 
      const message2 = '"hello world"'; 

      // Create two quick tx to test batch signing
      const txb1 = createTransactionBuilder()
        .execution(message1)
        .setMeta({
          chainId: String(chainId),
          gasLimit: 2000,
          gasPrice: 0.00000001,
          ttl: 1000,
          senderAccount: account.accountName,
        })
        .setNetworkId(account.networkId);

      const txb2 = createTransactionBuilder()
        .execution(message2)
        .setMeta({
          chainId: String(chainId),
          gasLimit: 2000,
          gasPrice: 0.00000001,
          ttl: 1000,
          senderAccount: account.accountName,
        })
        .setNetworkId(account.networkId);

      // Trying to match add signers here
      const addSigners = (txb) => {
        account.devices.flatMap((device) =>
          device.guard.keys.map((key) =>
            txb.addSigner(
              {
                pubKey: key,
                scheme: /^WEBAUTHN-/.test(key) ? 'WebAuthn' : 'ED25519',
              },
              (withCap) => [withCap('coin.GAS')]
            )
          )
        );
      };

      addSigners(txb1);
      addSigners(txb2);

      // Create the transactions
      const tx1 = txb1.createTransaction();
      const tx2 = txb2.createTransaction();
      console.log("Transaction 1: ", tx1);
      console.log("Transaction 2: ", tx2);

      // Batch sign both transactions
      const { transactions, isReady } = await sign([tx1, tx2], [
        {
          accountName: account.accountName,
          networkId: account.networkId,
          chainIds: [chainId],
        },
      ]);
      console.log("Signed transactions returned:", transactions);
      console.log("Number of transactions signed:", transactions.length);
      await isReady();

      // Process each signed transaction
      await Promise.all(
        transactions.map(async (tx, index) => {
          console.log(`Processing Transaction ${index + 1}:`, tx);
          const res = await client.local(tx, {
            preflight: false,
            signatureVerification: false,
          });
          console.log(`Preflight result for Transaction ${index + 1}:`, res);

          if (res.result.status === 'success') {
            console.log(`Preflight success for Transaction ${index + 1}`);
            const txDescriptor = await client.submit(tx);
            console.log(`Transaction ${index + 1} descriptor:`, txDescriptor);
            const txRes = await client.listen(txDescriptor);
            console.log(`Transaction ${index + 1} result:`, txRes);
          } else {
            console.warn(`Preflight failed for Transaction ${index + 1}:`, res.result.error);
          }
        })
      );
    } catch (e) {
      console.warn("Error: ", e);
    }
  };

  return (
    <div className="flex justify-center w-1/2 items-center p-4 bg-gray-50">
      <div className="max-w-lg w-full bg-white p-6 rounded-lg shadow-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Chain ID
          </label>
          <input
            type="text"
            value={chainId}
            onChange={(e) => setChainId(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter Chain ID (e.g., 5)"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter message to sign"
          />
        </div>
        <button
          onClick={handleSign}
          className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign
        </button>
      </div>
    </div>
  );
};

export default DoThings;