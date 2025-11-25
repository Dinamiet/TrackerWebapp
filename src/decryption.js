import crypto from 'crypto';

export default function decrypt(ivString, keyString, data) {
	try {
		const hash = (h) => {
			const hash = crypto.createHash('sha256');
			hash.update(h);
			return hash.digest();
		};

		// Example usage
		const iv = hash(ivString).slice(0, 16);
		const key = hash(keyString);

		const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
		decipher.setAutoPadding(false);
		let decrypted = decipher.update(data);
		decrypted = Buffer.concat([decrypted, decipher.final()]);
		console.log("Decrypted:", decrypted.toString());
		const descryptedString = decrypted.toString();
		return JSON.parse(descryptedString.substring(0, descryptedString.lastIndexOf('}') + 1));
	} catch (error) {
		return {};
	}
};
