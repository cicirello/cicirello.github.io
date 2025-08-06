'use strict';

document.addEventListener('DOMContentLoaded', function ()
{
	const keyText = 'pMLlApm_NXTAYO7b56LSdZh0dWtVDbhI_acHatZPIw4';

	// TODO: change the keyText value (above)
	// Uncomment this next line to generate a new key:
	//Aes.newKeyText().then((keyText) => { console.log('keyText: ' + keyText); });

	// INSTRUCTIONS:
	// 1. Insert a raw email address into the HTML:
	//    <span class="email">email@example.com</span>
	// 2. Change "decode" to "encode" (below), and refresh the page
	// 3. Replace the raw email address with the encrypted version
	// 4. Change "encode" to "decode", and refresh the page

	const onGetKey = function (key)
	{
		const coder = new AesLinkCoder(key);

		document.querySelectorAll('.liame')
			.forEach(coder.decode.bind(coder));
	};

	if ('subtle' in window.crypto) {
		Aes.getKey(keyText).then(onGetKey);
	} else {
		console.log('AES encryption is only available in secure contexts (such as over https or localhost)');
	}
});


// Aes

const Aes = {
	'KEY_BITS': 256, // 128 (SECRET) | 192 (TOP SECRET) | 256 (TOP SECRET)
	'NONCE_BYTES': 3, // 3 bytes = 16,777,216 possible nonces
	'BLOCK_BYTES': 16, // Required by AES
	'BITS_PER_BYTE': 8 // Conversion factor
};

Aes.newKeyText = async function ()
{
	const options = {
		'name': 'AES-CTR',
		'length': Aes.KEY_BITS
	};

	const key = await window.crypto.subtle.generateKey(options, true, ['encrypt', 'decrypt']);
	const keyBuffer = await window.crypto.subtle.exportKey('raw', key);
	const keyBytes = new Uint8Array(keyBuffer);
	const keyText = Base64.text(keyBytes);

	return keyText;
}

Aes.getKey = async function (keyText)
{
	const options = {
		'name': 'AES-CTR'
	};

	const keyBytes = Base64.bytes(keyText);
	const key = window.crypto.subtle.importKey('raw', keyBytes, options, false, ['encrypt', 'decrypt']);

	return key;
}

Aes.encrypt = async function (plainText, key)
{
	const nonceBytes = Aes.__newNonce();
	const counterBytes = Aes.__newCounter(nonceBytes);
	const options = Aes.__newOptions(counterBytes);
	const encoder = new TextEncoder();
	const plainBytes = encoder.encode(plainText);
	const codeBuffer = await window.crypto.subtle.encrypt(options, key, plainBytes);
	const codeBytes = new Uint8Array(codeBuffer);
	const outputBytes = new Uint8Array(nonceBytes.length + codeBytes.length);
	outputBytes.set(nonceBytes);
	outputBytes.set(codeBytes, nonceBytes.length);
	const outputText = Base64.text(outputBytes);

	return outputText;
}

Aes.__newNonce = function ()
{
	const nonce = new Uint8Array(Aes.NONCE_BYTES);
	window.crypto.getRandomValues(nonce);

	return nonce;
}

Aes.__newCounter = function (nonce)
{
	const counter = new Uint8Array(Aes.BLOCK_BYTES);
	counter.set(nonce);

	return counter;
}

Aes.__newOptions = function (counter)
{
	return {
		'name': 'AES-CTR',
		'counter': counter,
		'length': (Aes.BLOCK_BYTES - Aes.NONCE_BYTES) * Aes.BITS_PER_BYTE
	};
}

Aes.decrypt = async function (inputText, key)
{
	const inputBytes = Base64.bytes(inputText);
	const nonceBytes = inputBytes.slice(0, Aes.NONCE_BYTES);
	const codeBytes = inputBytes.slice(Aes.NONCE_BYTES);
	const counterBytes = Aes.__newCounter(nonceBytes);
	const options = Aes.__newOptions(counterBytes);
	const plainBytes = await window.crypto.subtle.decrypt(options, key, codeBytes);
	const decoder = new TextDecoder();
	const plainText = decoder.decode(plainBytes);

	return plainText;
}


// Base64

const Base64 = {};

Base64.bytes = function (text)
{
	const values = Base64.__getValues(text);
	const bytes = Base64.__getBytes(values);

	return bytes;
}

Base64.__getValues = function (text)
{
	const values = new Uint8Array(text.length);

	for (let i = 0; i < text.length; ++i) {
		const code = text.charCodeAt(i);

		values[i] = Base64.__getValue(code);
	}

	return values;
}

Base64.__getValue = function (code)
{
	if (code === 45) {
		return 63;
	}

	if (code < 58) {
		return code - 48;
	}

	if (code < 91) {
		return code - 29;
	}

	if (code === 95) {
		return 62;
	}

	return code - 87;
}

Base64.__getBytes = function (values)
{
	const length = Math.floor(3 * values.length / 4);
	const bytes = new Uint8Array(length);

	for (let i = 0, j = 0; i < values.length; ++i) {
		const r = 2 * (i % 4);

		if (r !== 0) {
			bytes[j++] = ((values[i-1] << r) & 0xff) | (values[i] >> (6 - r));
		}
	}

	return bytes;
}

Base64.text = function (bytes)
{
	let text = '';

	for (let i = 0; i < bytes.length; ++i) {
		const r = i % 3;

		if (r === 0) {
			text += Base64.__getSymbol(bytes[i] >> 2) + Base64.__getSymbol(((bytes[i] << 4) & 63) | (bytes[i+1] >> 4));
		} else if (r === 1) {
			text += Base64.__getSymbol(((bytes[i] << 2) & 63) | (bytes[i+1] >> 6));
		} else {
			text += Base64.__getSymbol(bytes[i] & 63);
		}
	}

	return text;
}

Base64.__getSymbol = function (value)
{
	if (value < 10) {
		return String.fromCharCode(48 + value);
	}

	if (value < 36) {
		return String.fromCharCode(87 + value);
	}

	if (value < 62) {
		return String.fromCharCode(29 + value);
	}

	if (value === 62) {
		return '_';
	}

	return '-';
}


// AesLinkCoder

function AesLinkCoder (key)
{
	this.key = key;
}

AesLinkCoder.prototype.decode = function (node)
{
	Aes.decrypt(node.getAttribute('href'), this.key)
		.then(node.setAttribute.bind(node, 'href'));
}

AesLinkCoder.prototype.encode = function (node)
{
	Aes.encrypt(node.getAttribute('href'), this.key)
		.then(node.setAttribute.bind(node, 'href'));
}