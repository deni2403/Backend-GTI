const { v4: uuidv4 } = require('uuid');
const {repair,container,log_activity, sequelize, Sequelize}= require('../models')
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

class RepairController{
    //get all Repair
    static async getRepair(req,res){
        try{
            const page = parseInt(req.query.page== undefined? 1: req.query.page)
            const search = req.query.search || ''
            const pageSize = 5
            const start = (page-1)*pageSize
            const end = page*pageSize
            const exportData = req.query.export || false;

            const countRepair = await repair.count()
            const totalPage = (countRepair%pageSize !=0? (Math.floor(countRepair/pageSize))+1:(Math.floor(countRepair/pageSize)))
            
            const getAllRepair=await repair.findAll({
                where:{
                    '$container.number$':{[Sequelize.Op.like]:`%${search}%`}
                },
                attributes:['id','uuid','remarks','createdAt'],
                include: [{
                    model: container,
                    attributes:['number','type','location','age']
                }, container],
            })
            getAllRepair.sort((a, b) => a.createdAt - b.createdAt);

            const setresponse = getAllRepair.map(repair =>({
                id: repair.id,
                uuid: repair.uuid,
                remarks: repair.remarks,
                createdAt: repair.createdAt,
                container_number: repair.container.number,
                container_type: repair.container.type,
                container_location: repair.container.location,
                container_age: repair.container.age
            }))

            if (exportData) {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('repairs');
    
                worksheet.columns = [
                    { header: 'ID', key: 'id', width: 10 },
                    { header: 'UUID', key: 'uuid', width: 36 },
                    { header: 'Remarks', key: 'remarks', width: 36 },
                    { header: 'Container_Number', key: 'container_number', width: 20 },
                    { header: 'Container_Type', key: 'container_type', width: 15 },
                    { header: 'Container_Location', key: 'container_location', width: 15 },
                    { header: 'Container_Age', key: 'container_age', width: 10 },
                    { header: 'CreatedAt', key: 'createdAt', width: 10 }
                ];

                getAllRepair.map((value,idx)=>{
                    worksheet.addRow({
                        id:value.id,
                        uuid: value.uuid,
                        remarks: value.remarks,
                        container_number: value.container.number,
                        container_type: value.container.type,
                        container_location: value.container.location,
                        container_age: value.container.age,
                        createdAt: value.createdAt
                    })
                })
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=repairs.xlsx');
                await workbook.xlsx.write(res);
                res.end();
            } else {
                const pageRepair = setresponse.slice(start,end)

                res.status(200).json({
                    page: page,
                    totalRepair: countRepair,
                    totalPage: totalPage,
                    repairs: pageRepair
                })
            }
        }
        catch(err){
            res.status(500).json({message:err.message})
        }
    }
  
    // add a new Repair
    static async addRepair(req,res){
        try{
            const {number, remarks} = req.body            
            const cont_id =  await container.findOne({
                where:{
                    number: number
                },
                
            })  
            console.log(cont_id.status);
            
            if(cont_id.status == "Repair"){
                return res.status(400).json({ Pesan: 'Kontainer sudah dalam perbaikan' });
              };                        
            const create = await repair.create({
                uuid: uuidv4(),
                user_id: req.UserData.id,
                container_id: cont_id.id,
                remarks: remarks,
                image: req.file?req.file.path:null,            
            })
            const updateCont =await container.update({
                status:"Repair"
            },{
                where:{
                    id:cont_id.id
                }
            })
            const addRepairLog = await log_activity.create({
                user_id: req.UserData.id,
                shipment_id: null,
                repair_id: null,
                activity_info: "Added New Repairment"
            })
            res.status(201).json({
                meesage:"add repair successfull",
                repair: create
            })
        }catch(err){
            res.status(500).json({
                message: err.message,
                
            })
        }
    }

    //get Repair by id
    static async getRepairbyUuid(req,res){
        try{
            const {uuid} = req.params
            const getrepairId = await repair.findOne({
                where:{
                    uuid: uuid
                },
                attributes:['id','uuid','remarks','createdAt','image'],
                include: [{
                    model: container,
                    attributes:['number','age','location','type']
                }]
            })
            const setresponse = {
                id: getrepairId.id,
                uuid: getrepairId.uuid,
                remarks: getrepairId.remarks,
                image: getrepairId.image,
                createdAt: getrepairId.createdAt,
                container_number: getrepairId.container.number,
                container_type: getrepairId.container.type,
                container_location: getrepairId.container.location,
                container_age: getrepairId.container.age
            }
            res.status(200).json({repair:setresponse})
        }catch(err){
            res.status(501).json({
                message:err.message
            })
        }
    }    

    //delete Repair by id
    static async deleteRepair(req,res){
        try {
            const { uuid } = req.params;
            const getRepair = await repair.findOne({
              where: {
                uuid: uuid,
              },
              attributes: { only: ['image','container_id'] },
            });
            
            if(getRepair.image != null){
                const filename = getRepair.image.replace(/^uploads[\\\/]/, '');
                const filePath = path.join('uploads', filename);
      
                if (filename != null) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                        console.error(err);
                          return;
                    }
                    });
                }
            }
            const updateContainer = await container.update({
                status:"Ready"
            },{
                where:{
                    id:getRepair.container_id
                },
                returning:true
            })
            console.log(updateContainer[1][0].status);

            const deleteRepair = await repair.destroy({
                where: {
                    uuid: uuid,
                },
            });
            
            const addRepairLog = await log_activity.create({
                user_id: req.UserData.id,
                shipment_id: null,
                repair_id: deleteRepair.id,
                activity_info: "Deleted a Repairment"
            })
            res.status(200).json({
                message: 'delete Repair success',
            });
            } catch (err) {
                res.status(401).json({
                message: err.message,
               });
            }
    }

    static async EditRepair(req,res){
        try{
            const {number, remarks} = req.body
            const {uuid} = req.params
            const getRepair = await repair.findOne({
                where: {
                  uuid: uuid,
                },
                attributes: { only: ['image','container_id'] },
            });
            if(req.file!= undefined && getRepair.image!=null){
                const filename = getRepair.image.replace(/^uploads[\\\/]/, '');
                const filePath = path.join('uploads', filename);        
                if (filename != null) {
                    fs.unlink(filePath, (err) => {
                      if (err) {
                        console.error(err);
                        return;
                    }
                    });
                }
            }
            const cont_id =  await container.findOne({
                where:{
                    number: number
                },
                attributes:['id','number']
            })
            
            if(cont_id.id != getRepair.container_id){
                const updateContStatus = await container.update({
                    status: "Ready"
                },{
                    where:{
                        id: getRepair.container_id
                    }
                })
                const cont_id =  await container.findOne({
                    where:{
                        number: number
                    }
                })
                if(cont_id.status!= "Ready"){
                    throw{
                        code:401,
                        message:`container ${number} status ${cont_id.status}, please choose another container`
                    }
                }
            }
            const updateCont =await container.update({
                status:"Repair"
            },{
                where:{
                    number:number
                }
            })

            const editRepair = await repair.update({
                container_id: cont_id.id,
                remarks: remarks,
                image: req.file?req.file.path:getRepair.image,
            },{
                where:{uuid: uuid},
                returning: true
            })
            const editRepairLog = await log_activity.create({
                user_id: req.UserData.id,
                shipment_id: null,
                repair_id: getRepair.id,
                activity_info: "edit repair data"
            })
            res.status(200).json({
                status: "update Repair successful",
                repair:{
                    number: cont_id.number,
                    remarks: editRepair[1][0].remarks,
                    image: editRepair[1][0].image
                }
            })
        }catch(err){
            res.status(402).json({
                message:err.message
            })
        }
    }

    static async FinishRepair(req,res){
        try{
            const {uuid} = req.params
            const getRepair = await repair.findOne({
                where: {
                uuid: uuid,
                },
                attributes: ['container_id'],
            });
            const updateContainer = await container.update({
                status: "Ready"
            },{
                where:{
                    id: getRepair.container_id
                },
                returning:true
            })
            res.status(200).json({
                message: `repair container ${updateContainer[1][0].number} finished`
            })
        }catch(err){
            res.status(501).json({
                message:err.message
            })
        }
    }

    static async historyRepair(req,res){
        try{
            const {uuid} = req.params
            const getRepair = await container.findOne({
                where:{uuid:uuid},
                attributes:['id','number']
            })
            const getHistoryRepair = await repair.findAll({
                where:{
                    container_id: getRepair.id
                },
                attributes:['id','remarks','createdAt'],
                include:[{
                    model:container,
                    attributes: ['number']
                }]
            })
            const setresponse= getHistoryRepair.map(history=>({
                id: history.id,
                remarks: history.remarks,
                container_number: history.container.number,
                createdAt: history.createdAt
            }))
            res.status(200).json({
                status:`Get History repair from container ${getRepair.number}`,
                history:setresponse
            })
        }catch(err){
            res.status(501).json({
                message:err.message
            })
        }
    }
}

module.exports = RepairController