'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Anomaly extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Anomaly.hasMany(models.DetectedAnomaly, { foreignKey: 'anomaly_id' });
    }
  }
  Anomaly.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    danger_level: DataTypes.INTEGER,
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Anomaly',
  });
  return Anomaly;
};