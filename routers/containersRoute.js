const express = require('express')
const router = express.Router()
const {addContainer, getContainer, getContainerbyUuid, deleteContainer, editContainer, ContainerReady, getContainerByStatus, historyContainer, getLocationContainer} = require('../controllers/containerController')
const {updateIddleDays} = require('../controllers/cronJobController')
const ContAuthorization = require('../middlewares/authorization')

router.get('/containers',getContainer )
router.get('/containers/location',getLocationContainer)
router.get('/containers/dashboard',getContainerByStatus)
router.get('/containers/:uuid/history',historyContainer)
router.post('/containers',ContAuthorization,addContainer)
router.get('/containers/ready', ContainerReady)
router.get('/containers/:uuid',getContainerbyUuid)
router.delete('/containers/:uuid',ContAuthorization, deleteContainer)
router.put('/containers/:uuid',ContAuthorization, editContainer)

router.get('/updateIddleDays', updateIddleDays);


module.exports =router