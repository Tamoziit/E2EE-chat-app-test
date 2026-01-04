import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

export function generateKeyPair() {
    const kp = nacl.box.keyPair();
    return {
        publicKey: util.encodeBase64(kp.publicKey),
        privateKey: util.encodeBase64(kp.secretKey)
    };
}

export function encrypt(message, receiverPublicKey, senderPrivateKey) {
    const nonce = nacl.randomBytes(24);
    const box = nacl.box(
        util.decodeUTF8(message),
        nonce,
        util.decodeBase64(receiverPublicKey),
        util.decodeBase64(senderPrivateKey)
    );

    return {
        ciphertext: util.encodeBase64(box),
        nonce: util.encodeBase64(nonce)
    };
}

export function decrypt(ciphertext, nonce, senderPublicKey, privateKey) {
    const msg = nacl.box.open(
        util.decodeBase64(ciphertext),
        util.decodeBase64(nonce),
        util.decodeBase64(senderPublicKey),
        util.decodeBase64(privateKey)
    );
    return util.encodeUTF8(msg);
}