import _sodium from 'libsodium-wrappers';

export const encryptGitHubSecret = (secret: string, publicKey: string): string => {
  const publicKeyBinary = Buffer.from(publicKey, 'base64');
  const encryptedMessage = _sodium.crypto_box_seal(Buffer.from(secret), publicKeyBinary);

  return Buffer.from(encryptedMessage).toString('base64');
};
