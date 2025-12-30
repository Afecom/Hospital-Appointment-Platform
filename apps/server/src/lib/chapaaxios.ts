import axios from 'axios';
import 'dotenv/config';

export const chapaAxios = axios.create({
  baseURL: 'https://api.chapa.co/v1',
  headers: {
    Authorization: `Bearer ${process.env.CHAPA_SECRET}`,
    'Content-Type': 'application/json',
  },
});
