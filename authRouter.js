const Router = require('express')
const router = new Router()
const controller = require('./authController')
const {check} = require('express-validator')

router.post('/sign_up',[
    check('email', 'Email can`t be empty').notEmpty(),
    check('password', 'Password must be more than 5 symbols').isLength({min: 5})
], controller.signUp)
router.post('/login', controller.login)
router.post('/refresh', controller.refresh)

router.get('/me', controller.meData)

module.exports = router
