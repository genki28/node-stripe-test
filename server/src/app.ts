import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import  cors from 'cors'

var indexRouter = require('#/routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

const PORT = 3000

app.listen(PORT, () => {
    console.log(`Runnning at Port localhost:${PORT}`)
})

app.use('/', indexRouter);