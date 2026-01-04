import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64, decodeUTF8, encodeUTF8 } from 'tweetnacl-util';

export const generateKeyPair = () => nacl.box.keyPair();

export const encryptMessage = (secretKey, peerPublicKey, message) => {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const encrypted = nacl.box(decodeUTF8(message), nonce, decodeBase64(peerPublicKey), secretKey);
    return { encrypted: encodeBase64(encrypted), nonce: encodeBase64(nonce) };
};

export const decryptMessage = (secretKey, peerPublicKey, encryptedData, nonce) => {
    try {
        const decrypted = nacl.box.open(decodeBase64(encryptedData), decodeBase64(nonce), decodeBase64(peerPublicKey), secretKey);
        return decrypted ? encodeUTF8(decrypted) : "Decryption failed";
    } catch (e) {
        console.log(e);
        return "Decryption error";
    }
};