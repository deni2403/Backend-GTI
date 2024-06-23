const { Sequelize, container } = require('../models');

const updateIddleDays = async () => {
  try {
    const startTime = new Date();
    await container.update(
      { iddle_days: Sequelize.literal('iddle_days + 1') },
      { where: {}, logging: false },
    );
    const endTime = new Date();
    console.log(
      `updateIddleDays cronjob completed in ${endTime - startTime} ms`,
    );
  } catch (error) {
    console.error('Failed to update iddle days:', error);
  }
};

module.exports = {
  updateIddleDays,
};
