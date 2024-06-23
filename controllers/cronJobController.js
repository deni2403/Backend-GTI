const { Sequelize, container } = require('../models');

const updateIddleDays = async () => {
  try {
    await container.update(
      { iddle_days: Sequelize.literal('iddle_days + 1') },
      { where: {}, logging: false },
    );
    return 'iddle_days updated successfully';
  } catch (error) {
    return 'Error updating iddle_days';
  }
};

module.exports = {
  updateIddleDays,
};
