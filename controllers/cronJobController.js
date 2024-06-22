const { Sequelize, container } = require('../models');

const updateIddleDays = async () => {
  try {
    await container.update(
      { iddle_days: Sequelize.literal('iddle_days + 1') },
      { where: {} },
    );
    console.log('iddle_days updated successfully');
  } catch (error) {
    console.error('Error updating iddle_days:', error);
  }
};

module.exports = {
  updateIddleDays,
};
