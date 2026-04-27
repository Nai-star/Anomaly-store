'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW leaderboard_view AS
      SELECT 
        u.username,
        MAX(s.score) as max_score,
        COUNT(DISTINCT g.id) as games_played
      FROM "Users" u
      LEFT JOIN "Scores" s ON u.id = s.user_id
      LEFT JOIN "Games" g ON u.id = g.user_id
      GROUP BY u.id, u.username;
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW anomaly_stats_view AS
      SELECT 
        a.name as anomaly_name,
        COUNT(da.id) as times_detected,
        ROUND((SUM(CASE WHEN da.detected_correctly = true THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(da.id), 0), 2) as accuracy_rate
      FROM "Anomalies" a
      LEFT JOIN "DetectedAnomalies" da ON a.id = da.anomaly_id
      GROUP BY a.id, a.name;
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW game_summary_view AS
      SELECT 
        g.id as game_id,
        u.username,
        g.night_level,
        g.status,
        g.sanity_remaining,
        g.createdAt as created_at
      FROM "Games" g
      JOIN "Users" u ON g.user_id = u.id;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS game_summary_view;');
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS anomaly_stats_view;');
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS leaderboard_view;');
  }
};
