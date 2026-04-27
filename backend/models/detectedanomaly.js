'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DetectedAnomaly extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DetectedAnomaly.belongsTo(models.Game, { foreignKey: 'game_id' });
      DetectedAnomaly.belongsTo(models.Anomaly, { foreignKey: 'anomaly_id' });
    }
  }
  DetectedAnomaly.init({
    game_id: DataTypes.INTEGER,
    anomaly_id: DataTypes.INTEGER,
    detected_correctly: DataTypes.BOOLEAN,
    timestamp: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'DetectedAnomaly',
  });
  return DetectedAnomaly;
};