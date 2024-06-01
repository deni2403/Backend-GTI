'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shipments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        validate:{
          isUUID:4
        }
      },
      shipment_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      container_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      return_empty: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM("Arrive","Departure","Pickup","Return","Gate in","Accident"),
        allowNull: false,
        validate:{
          isIn:[["Arrive","Departure","Pickup","Return","Gate in","Accident"]]
        }
      },
      shipment_detail_id: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      remark_description: {
        type: Sequelize.TEXT,
        allowNull:false
      },
      image: {
        type: Sequelize.STRING,
        allowNull:false,
        validate:{
          isUrl: true
        }
      },
      active_status: {
        type: Sequelize.BOOLEAN,
        allowNull:false
      },
      delete_by: {
        type: Sequelize.STRING,
        allowNull:false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('shipments');
  }
};