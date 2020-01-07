const fastify = require('fastify')();
const oauthPlugin = require('fastify-oauth2')
const config = require(__basedir + '/config/discord.json');
// const db = require(__basedir + '/utils/database/db.js');
const path = require('path');

fastify.register(require('fastify-static'), {
  root: path.join(__basedir, 'utils/web/www')
});

fastify.listen(config.redirect_port, async () => {
  console.info(`Running on port ${config.redirect_port}`);
});

fastify.get('/', async (req, res) => {
  res.sendFile('index.html');
});

fastify.register(oauthPlugin, {
  name: 'discordOauth',
  scope: ['identify'],
  credentials: {
    client: {
      id: config.client_id,
      secret: config.client_secret
    },
    auth: {
      authorizeHost: 'https://discordapp.com',
      authorizePath: '/api/oauth2/authorize',
      tokenHost: 'https://discordapp.com',
      tokenPath: '/api/oauth2/token'
    }
  },
  startRedirectPath: '/login/discord',
  callbackUri: config.redirect_uri
});

fastify.get('/login/discord/callback', async function (request, reply) {
  try {
    const token = await fastify.discordOauth.getAccessTokenFromAuthorizationCodeFlow(request);
    console.log(token);
    reply.send({ access_token: token.access_token });
  } catch (err) {
    throw new Error(err);
  }
});