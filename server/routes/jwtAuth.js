const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwtGenerator = require('../utils/jwtGenerator');
const validInfo = require("../middleware/validInfo");
const authorization = require('../middleware/authorization');

//registering

router.post('/register', validInfo, async (req, res) => {
    try {
        // 1. destructuring the req.body (name, email, password)

        const { name, email, password } = req.body;
        
        //2. check if user exit (if user exist then throw error)

        const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);

        if (user.rows.length !== 0) {
            //If user already exists
            return res.status(401).send('User already exists'); //unauthorized
        }

        //3. Bcrypt the user password

        const saltRound = 10; //how encrypted this is gonna be
        const salt = await bcrypt.genSalt(saltRound);

        const bcryptPassword = await bcrypt.hash(password, salt);

        //4. enter the new user inside data base
        const newUser = await pool.query(
            'INSERT INTO users (user_name,user_email,user_password) VALUES($1,$2,$3) RETURNING *',
            [name, email, bcryptPassword]
        );
        //5. generating our jwt token

        const token = jwtGenerator(newUser.rows[0].user_id);

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// login route

router.post('/login',validInfo, async (req, res) => {
    try {
        //1. destructure the req.body

        const { email, password } = req.body;

        //2. check if user doesn't exist (if not,we throw error)

        const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [
            email
        ]);

        if(user.rows.length === 0) {
            //if user doesn't exist
            return res.status(401).json('Password or email is incorrect');
        }

        //3. check if incoming password is the same as database password

        const validPassword = await bcrypt.compare(password, user.rows[0].user_password);

        if(!validPassword) {
            //if password is not valid
            return res.status(401).json('Password or email is incorrect');
        }

        //4. give them the jwt token

        const token = jwtGenerator(user.rows[0].user_id);

        res.json({token});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

router.get("/is-verify",authorization, async(req,res) => {
    try {
        res.json(true);
    }   catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
