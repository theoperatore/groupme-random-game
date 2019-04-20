import * as dotenv from 'dotenv';
import { json } from 'body-parser';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as express from 'express';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(json());

app.get('/health_check', (req, res) => {
  console.log(`[log] - ${new Date().toLocaleString()} health_check`);
  res.sendStatus(204);
});

const PORT = process.env.PORT || 9966;
app.listen(PORT, () => {
  console.log(new Date().toLocaleString(), 'server listening on', PORT);
});
