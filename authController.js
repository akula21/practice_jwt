const User = require('./models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {validationResult} = require('express-validator')
const {secret} = require('./config')

const generateAccessToken = (id, email) => {
    const payload = {
        id,
        email
    }
    let random = Math.floor(30 + Math.random() * (60 + 1 - 30))
    console.log(random)
    return jwt.sign(payload, secret, {expiresIn: `${random}s`})
}

class authController {

    async signUp(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Registration error', errors})
            }
            const {email, password} = req.body
            const userExistence = await User.findOne({email})
            if (userExistence) {
                return res.status(400).json({message: 'User with such email already exists'})
            }
            const hashPassword = bcrypt.hashSync(password, 6)
            const user = new User({email, password: hashPassword})
            await user.save()
            return res.json({message: 'User successfully registered'})
        } catch (err) {
            console.log(err)
            res.status(400).json({message: 'Registration failed'})
        }
    }

    async login(req, res) {
        try {
            const {email, password} = req.body
            const user = await User.findOne({email})         //!!!!!!!
            if (!user) {
                return res.status(400).json({message: `User ${email} not found`})
            }
            const passwordValidation = bcrypt.compareSync(password, user.password)
            if (!passwordValidation) {
                return res.status(400).json({message: `Wrong password`})
            }
            const token = generateAccessToken(user._id, user.email)
            return res.json({token})
        } catch (err) {
            console.log(err)
            res.status(400).json({message: 'Login failed'})
        }
    }

    async refresh(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return res.status(401).json({message: 'User unauthorized'})
            }
            const decodeData = jwt.verify(token, secret)
            const findInfoInToken = Object.values(decodeData)[0]
            const user = await User.findById(findInfoInToken)         //!!!!!!!
            if (!user) {
                return res.status(400).json({message: `Such user not found`})
            }
            const tokenRefreshed = generateAccessToken(user._id, user.email)
            return res.json({tokenRefreshed})
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                return res.status(401).json({message: 'User unauthorized, token expired'})
            }
            console.log(err)
        }
    }

    async meData(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return res.status(401).json({message: 'User unauthorized'})
            }
            const decodeData = jwt.verify(token, secret)
            const mockEmail = Object.values(decodeData)[1]
            res.json(mockEmail)
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                return res.status(401).json({message: 'User unauthorized, token expired'})
            }
            console.log(err)
        }

    }

}

module.exports = new authController()