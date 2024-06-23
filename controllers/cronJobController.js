const { Sequelize, container } = require('../models');

const updateIddleDays = async () => {
  try {
    await container.update(
      { iddle_days: Sequelize.literal('iddle_days + 1') },
      { where: {}, logging: false },
    );
    response.status(200).json({ success: true });
  } catch (error) {
    response.status(500).json({ success: false, error });
  }
};

module.exports = {
  updateIddleDays,
};
