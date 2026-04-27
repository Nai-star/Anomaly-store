'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Game.belongsTo(models.User, { foreignKey: 'user_id' });
      Game.hasMany(models.DetectedAnomaly, { foreignKey: 'game_id' });
    }
  }
  Game.init({
    user_id: DataTypes.INTEGER,
    night_level: DataTypes.INTEGER,
    status: DataTypes.STRING,
    sanity_remaining: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Game',
  });
  return Game;
};