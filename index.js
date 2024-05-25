import express, {json} from "express";
import cors from "cors";
import axios from "axios";
import qs from "query-string";
import dotenv from "dotenv";
import https from 'https';
dotenv.config();

const app = express()
app.use(cors());
app.use(json());

app.post("/login", async (req, res) => {
  try {
    const data = await exchangeCodeForAccessToken(req.body.code);
    const queryString = qs.stringify(data);
    const parsedData = qs.parse(queryString);
    const token = parsedData.access_token

    const user = await fetchUser(token);
    console.log(user);
    const userLocal = await VinculaAlexa(user.user_id, req.body.state);
    res.send(data);
  } catch(err) {
    console.log("err", err);
    res.sendStatus(500);
  }
});

async function exchangeCodeForAccessToken(code) {
  const GITHUB_ACCESS_TOKEN_URL = 'https://api.amazon.com/auth/o2/token';
  const {REDIRECT_URL, CLIENT_ID, CLIENT_SECRET} = process.env;
  const params = {
    code,
    grant_type: 'authorization_code',
    redirect_uri: process.env['REDIRECT_URL'],
    client_id: process.env['CLIENT_ID'],
    client_secret: process.env['CLIENT_SECRET'],
  };

  const { data } = await axios.post(GITHUB_ACCESS_TOKEN_URL, params, {
    headers: {
      'Content-Type': 'application/json'
    },
  });
  return data;
}

async function fetchUser(token) {
  const GITHUB_ENDPOINT = "https://api.amazon.com/user/profile";
  console.log(token);
  try {
    const response = await axios.get(GITHUB_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch(error) {
    console.log(error);
  }

}

async function VinculaAlexa(userId, state) {
  const ENDPOINT = "https://api-newsletter.tiagoamaral4.repl.co/api/user/vincula";
  console.log(userId);
  try {
    const response = await axios.post(ENDPOINT, { userId, state });
    return response.data;
  } catch(error) {
    console.log(error);
  }

}

app.listen(5000, () => {
  console.log(`Server is up and running.`);
});