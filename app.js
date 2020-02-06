const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const redis = require('redis');
const redisUrl = process.env.REDIS_URL;
const client = redis.createClient(redisUrl);
const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

app.post('/', async (req, res) => {
  const { body } = req;
  for (key in body) {
    await setAsync(key, body[key]);
  }
  res.sendStatus(200);
});

app.get('/', async (req, res) => {
  const { key } = req.query;
  if (!key) {
    res.sendStatus(400);
    return;
  }

  const value = await getAsync(key);
  if (!value) {
    res.sendStatus(404);
    return;
  }

  res.json({ [key]: value });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
