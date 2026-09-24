const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const express = require('express');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));