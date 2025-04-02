import express from 'express';

const app = express();
const port = 8080;

app.use(express.static('client/login.html'));
app.use(express.json());


app.listen(port);
console.log('Listening on http://localhost:8080');