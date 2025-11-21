// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

let location = {};

export default async function handler(req, res) {

  const {name} = req.query;

  switch (req.method) {
    case 'POST':
      let rawBody = Buffer.alloc(0);
      req.on('data', (chunk) => {
        rawBody = Buffer.concat([rawBody, chunk]);
      });

      req.on('end', () => {
        location[name] = rawBody;
        res.status(200).json({ message: 'Success' });
      });

      req.on('error', (err) => {
        res.status(500).json({ message: 'Error' });
      });
      return;

    case 'GET':
      return res.status(200).json(location[name]);

    default:
      return res.status(503).json({message: "Not implemented"});
  }

}

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing
  },
};
