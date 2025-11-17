// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

let location = {name: "", lat: 0, lng: 0};

export default async function handler(req, res) {

  const {name} = req.query;

  switch (req.method) {
    case 'POST':
      location = req.body;
      console.log("POST:", location, name);
      return res.status(200).json({ message: 'Success' });

    case 'GET':
      return res.status(200).json(location);

    default:
      return res.status(503).json({message: "Not implemented"});
  }

}
