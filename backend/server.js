require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const app = express();
const PORT = process.env.PORT || 3000;

const userSignupRouter = require('./routes/userSignup');
const userLoginRouter = require('./routes/userLogin');
const taskRouter = require('./routes/tasks');

// Enable CORS for frontend
app.use(
  cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true,
  }),
);

app.use(express.json());
app.use('/api/auth', userSignupRouter);
app.use('/api/auth', userLoginRouter);
app.use('/api', taskRouter);

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('Connection error ❌:', err));
