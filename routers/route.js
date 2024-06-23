const express = require('express')
const router = express.Router()
const users = require('./usersRoute')
const repair = require('./repairRoute')
const containers = require('./containersRoute')
const shipments = require('./shipmentsRoute')
const authentication = require('../middlewares/authentication')
const userAuthorization = require('../middlewares/authorization')
const { getLogActivity } = require('../controllers/log_activityController')
const {login, currentUser} = require('../controllers/userController')
const {updateIddleDays} = require('../controllers/cronJobController')


router.post('/login',login)
router.post('/updateIddleDays', updateIddleDays);
router.use(authentication)
router.get('/getMe',currentUser)
router.get('/logs',userAuthorization,getLogActivity)
router.use(users,repair,containers,shipments)

module.exports= router