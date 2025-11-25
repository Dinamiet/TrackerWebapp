// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Constant from '../../constants';
import decrypt from '../../decryption';

const sendNotification = (name, title, body) => {
	fetch(Constant.NOTIFY_URL, {
		method: 'POST',
		body: body,
		headers: {
			Title: name + ': ' + title
		}
	});
};

export default async function handler(req, res) {

	const { name } = req.query;

	switch (req.method) {
		case 'POST':
			let rawBody = Buffer.alloc(0);
			req.on('data', (chunk) => {
				rawBody = Buffer.concat([rawBody, chunk]);
			});

			req.on('end', () => {
				const data = decrypt(Constant.IV, Constant.KEY, rawBody);
				if (Object.hasOwn(data, 'title') && Object.hasOwn(data, 'body'))
					sendNotification(name, data.title, data.body);
				res.status(200).json({ message: 'Success' });
			});

			req.on('error', (err) => {
				res.status(500).json({ message: 'Error' });
			});
			return;

		default:
			return res.status(503).json({ message: "Not implemented" });
	}
}

export const config = {
	api: {
		bodyParser: false, // Disable Next.js body parsing
	},
};
