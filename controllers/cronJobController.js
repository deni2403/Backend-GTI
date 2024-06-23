const { Sequelize, container } = require('../models');

const updateIddleDays = async (res) => {
  try {
    await container.update(
      { iddle_days: Sequelize.literal('iddle_days + 1') },
      { where: {}, logging: false },
    );
    res.status(200).send('iddle_days updated successfully');
  } catch (error) {
    res.status(500).send('Error updating iddle_days');
  }
};

module.exports = {
  updateIddleDays,
};
