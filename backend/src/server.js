// ESM
import Fastify from 'fastify';
import Datastore from 'nedb';
import Web3 from 'web3';
import fastifyCors from '@fastify/cors';

const dbUsers = new Datastore({ filename: './db.dat', autoload: true });
const web3 = new Web3('http://141.223.181.151:2232');

const fastify = Fastify({
    logger: true
});

fastify.register(fastifyCors, {
})

fastify.get('/', async (request, reply) => {
    return { hello: 'world' };
});

fastify.post('/signup', async (request, reply) => {
    dbUsers.find({username: request.body["username"]}, (err, users) => {
        if (users.length === 0) {
            dbUsers.insert({
                username: request.body["username"],
                password: request.body["password"],
                wallets: []
            })
            reply.code(200).send({ "msg": "username created!" });;
        } else {
            reply.code(403).send({"msg": "username existed!"});
        }
    });
});

fastify.post('/login', async (request, reply) => {
    dbUsers.find({ username: request.body["username"] }, (err, users) => {
        if (users.length === 1 && users[0].password === request.body["password"]) {
            reply.code(200).send({
                "msg": "logged in",
                "token": users[0].password });;
        } else {
            reply.code(403).send({ "msg": "forbidden" });
        }
    });
});

fastify.post('/add-wallet/:user', async (request, reply) => {
    dbUsers.find({username: request.params.user}, (err, users) => {
        if (users.length === 1) {
            const _wallets = users[0].wallets;
            let existed = false;

            _wallets.forEach((v, i) => {
                if (v.address === request.body.wallet) {
                    _wallets[i].password = request.body.ethPassword;
                    existed = true;
                }
            })

            if (!existed) {
                _wallets.push({
                    address: request.body.wallet,
                    password: request.body.ethPassword
                })
            }

            dbUsers.update(
                { username: request.params.user},
                {$set: {wallets: _wallets}}
            );
            reply.code(200);
        } else {
            reply.code(404);
        }
    });
});

fastify.get('/wallets/:user', async (request, reply) => {
    dbUsers.find({ username: request.params.user }, async (err, users) => {
        if (users.length === 0) {
            reply.code(404);
            return;
        }

        const _wallets = users[0].wallets;
        if (_wallets.length === 0) {
            reply.code(200).send([]);
            return;
        }

        const walletsWithBalances = await Promise.all(
            _wallets.map(async e => {
                const _balance = Web3.utils.fromWei(
                    await web3.eth.getBalance(e.address), 'ether'
                );
                return { wallet: e.address, balance: _balance}
            })
        );

        reply.code(200).send(walletsWithBalances);

    });
});

const start = async () => {
    try {
        await fastify.listen(3001, "0.0.0.0");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
