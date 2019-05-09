import { Injectable } from '@angular/core';
import * as blake from 'blakejs';
import { BigNumber } from 'bignumber.js';

const nacl = window['nacl'];

@Injectable({
	providedIn: 'root'
})
export class UtilService {
	constructor() {}

	hex = {
		toUint4: hexToUint4,
		fromUint8: uint8ToHex,
		toUint8: hexToUint8
	};
	uint4 = {
		toUint5: uint4ToUint5,
		toUint8: uint4ToUint8
	};
	uint5 = {
		toString: uint5ToString
	};
	uint8 = {
		toUint4: uint8ToUint4,
		fromHex: hexToUint8,
		toHex: uint8ToHex
	};
	dec = {
		toHex: decToHex
	};
	account = {
		generateAccountSecretKeyBytes: generateAccountSecretKeyBytes,
		generateAccountKeyPair: generateAccountKeyPair,
		getPublicAccountID: getPublicAccountID,
		generateSeedBytes: generateSeedBytes,
		getAccountPublicKey: getAccountPublicKey
	};
	qlc = {
		mqlcToRaw: mqlcToRaw,
		kqlcToRaw: kqlcToRaw,
		qlcToRaw: qlcToRaw,
		rawToMqlc: rawToMqlc,
		rawToKqlc: rawToKqlc,
		rawToQlc: rawToQlc
	};
}

/** Hex Functions **/
function hexToUint4(hexValue) {
	const uint4 = new Uint8Array(hexValue.length);
	for (let i = 0; i < hexValue.length; i++) {
		uint4[i] = parseInt(hexValue.substr(i, 1), 16);
	}

	return uint4;
}
function hexToUint8(hexString) {
	if (hexString.length % 2 > 0) {
		hexString = '0' + hexString;
	}
	const byteArray = [];
	for (let i = 0; i < hexString.length; i += 2) {
		byteArray.push(parseInt(hexString.slice(i, i + 2), 16));
	}
	return Uint8Array.from(byteArray);
}

/** Uint4 Functions **/
function uint4ToUint8(uintValue) {
	const length = uintValue.length / 2;
	const uint8 = new Uint8Array(length);
	for (let i = 0; i < length; i++) {
		uint8[i] = uintValue[i * 2] * 16 + uintValue[i * 2 + 1];
	}

	return uint8;
}

function uint4ToUint5(uintValue) {
	const length = (uintValue.length / 5) * 4;
	const uint5 = new Uint8Array(length);
	for (let i = 1; i <= length; i++) {
		const n = i - 1;
		const m = i % 4;
		const z = n + (i - m) / 4;
		const right = uintValue[z] << m;
		let left;
		if ((length - i) % 4 === 0) {
			left = uintValue[z - 1] << 4;
		} else {
			left = uintValue[z + 1] >> (4 - m);
		}
		uint5[n] = (left + right) % 32;
	}
	return uint5;
}

function uint4ToHex(uint4) {
	let hex = '';
	for (let i = 0; i < uint4.length; i++) {
		hex += uint4[i].toString(16);
	}
	return hex;
}

/** Uint5 Functions **/
function uint5ToString(uint5) {
	const letter_list = '13456789abcdefghijkmnopqrstuwxyz'.split('');
	let string = '';
	for (let i = 0; i < uint5.length; i++) {
		string += letter_list[uint5[i]];
	}

	return string;
}

function uint5ToUint4(uint5) {
	const length = (uint5.length / 4) * 5;
	const uint4 = new Uint8Array(length);
	for (let i = 1; i <= length; i++) {
		const n = i - 1;
		const m = i % 5;
		const z = n - (i - m) / 5;
		const right = uint5[z - 1] << (5 - m);
		const left = uint5[z] >> m;
		uint4[n] = (left + right) % 16;
	}
	return uint4;
}

/** Uint8 Functions **/
function uint8ToHex(uintValue) {
	let hex = '';
	let aux;
	for (let i = 0; i < uintValue.length; i++) {
		aux = uintValue[i].toString(16);
		if (aux.length === 1) {
			aux = '0' + aux;
		}
		hex += aux;
		aux = '';
	}

	return hex;
}

function uint8ToUint4(uintValue) {
	const uint4 = new Uint8Array(uintValue.length * 2);
	for (let i = 0; i < uintValue.length; i++) {
		uint4[i * 2] = (uintValue[i] / 16) | 0;
		uint4[i * 2 + 1] = uintValue[i] % 16;
	}

	return uint4;
}

/** Dec Functions **/
function decToHex(decValue, bytes = null) {
	const dec = decValue.toString().split('');
	const sum = [];
	let hex = '';
	const hexArray = [];
	let i;
	let s;
	while (dec.length) {
		s = 1 * dec.shift();
		for (i = 0; s || i < sum.length; i++) {
			s += (sum[i] || 0) * 10;
			sum[i] = s % 16;
			s = (s - sum[i]) / 16;
		}
	}
	while (sum.length) {
		hexArray.push(sum.pop().toString(16));
	}

	hex = hexArray.join('');

	if (hex.length % 2 !== 0) {
		hex = '0' + hex;
	}
	if (bytes > hex.length / 2) {
		const diff = bytes - hex.length / 2;
		for (let j = 0; j < diff; j++) {
			hex = '00' + hex;
		}
	}

	return hex;
}

/** String Functions **/
function stringToUint5(string) {
	const letter_list = '13456789abcdefghijkmnopqrstuwxyz'.split('');
	const length = string.length;
	const string_array = string.split('');
	const uint5 = new Uint8Array(length);
	for (let i = 0; i < length; i++) {
		uint5[i] = letter_list.indexOf(string_array[i]);
	}
	return uint5;
}

/** Account Functions **/
function generateAccountSecretKeyBytes(seedBytes, accountIndex) {
	const accountBytes = hexToUint8(decToHex(accountIndex, 4));
	const context = blake.blake2bInit(32);
	blake.blake2bUpdate(context, seedBytes);
	blake.blake2bUpdate(context, accountBytes);
	const newKey = blake.blake2bFinal(context);

	return newKey;
}

function generateAccountKeyPair(accountSecretKeyBytes) {
	return nacl.sign.keyPair.fromSecretKey(accountSecretKeyBytes);
}

function getPublicAccountID(accountPublicKeyBytes) {
	const accountHex = uint8ToHex(accountPublicKeyBytes);
	const keyBytes = uint4ToUint8(hexToUint4(accountHex)); // For some reason here we go from u, to hex, to 4, to 8??
	const checksum = uint5ToString(uint4ToUint5(uint8ToUint4(blake.blake2b(keyBytes, null, 5).reverse())));
	const account = uint5ToString(uint4ToUint5(hexToUint4(`0${accountHex}`)));

	return `qlc_${account}${checksum}`;
}

function getAccountPublicKey(account) {
	const errAccountMessage = 'Invalid QLC Account';
	if ((!account.startsWith('qlc_1') && !account.startsWith('qlc_3')) || account.length !== 64) {
		throw new Error(errAccountMessage);
	}
	const account_crop = account.substring(4, 64);
	const isValid = /^[13456789abcdefghijkmnopqrstuwxyz]+$/.test(account_crop);
	if (!isValid) {
		throw new Error(errAccountMessage);
	}

	const key_uint4 = array_crop(uint5ToUint4(stringToUint5(account_crop.substring(0, 52))));
	const hash_uint4 = uint5ToUint4(stringToUint5(account_crop.substring(52, 60)));
	const key_array = uint4ToUint8(key_uint4);
	const blake_hash = blake.blake2b(key_array, null, 5).reverse();

	const errChecksumMessage = 'Incorrect checksum';
	if (!equal_arrays(hash_uint4, uint8ToUint4(blake_hash))) {
		throw new Error(errChecksumMessage);
	}

	return uint4ToHex(key_uint4);
}

/**
 * Conversion functions
 */
const Mqlc = 100000000000; // 10^11
const QLC = 100000000; // 10^8
const kqlc = 1000; // 10^3
// const qlc = 1; // 10^0

function mqlcToRaw(value) {
	return new BigNumber(value).times(Mqlc);
}
function kqlcToRaw(value) {
	return new BigNumber(value).times(kqlc);
}
function qlcToRaw(value) {
	return new BigNumber(value).times(QLC);
}
function rawToMqlc(value) {
	return new BigNumber(value).div(Mqlc);
}
function rawToKqlc(value) {
	return new BigNumber(value).div(kqlc);
}
function rawToQlc(value) {
	return new BigNumber(value).div(QLC);
}

function array_crop(array) {
	const length = array.length - 1;
	const cropped_array = new Uint8Array(length);
	for (let i = 0; i < length; i++) {
		cropped_array[i] = array[i + 1];
	}
	return cropped_array;
}

function equal_arrays(array1, array2) {
	for (let i = 0; i < array1.length; i++) {
		if (array1[i] !== array2[i]) {
			return false;
		}
	}
	return true;
}

function generateSeedBytes() {
	return nacl.randomBytes(32);
}

const util = {
	hex: {
		toUint4: hexToUint4,
		fromUint8: uint8ToHex,
		toUint8: hexToUint8
	},
	uint4: {
		toUint5: uint4ToUint5,
		toUint8: uint4ToUint8
	},
	uint5: {
		toString: uint5ToString
	},
	uint8: {
		toUint4: uint8ToUint4,
		fromHex: hexToUint8,
		toHex: uint8ToHex
	},
	dec: {
		toHex: decToHex
	},
	account: {
		generateAccountSecretKeyBytes: generateAccountSecretKeyBytes,
		generateAccountKeyPair: generateAccountKeyPair,
		getPublicAccountID: getPublicAccountID,
		generateSeedBytes: generateSeedBytes,
		getAccountPublicKey: getAccountPublicKey
	},
	qlc: {
		mqlcToRaw: mqlcToRaw,
		kqlcToRaw: kqlcToRaw,
		qlcToRaw: qlcToRaw,
		rawToMqlc: rawToMqlc,
		rawToKqlc: rawToKqlc,
		rawToQlc: rawToQlc
	}
};
