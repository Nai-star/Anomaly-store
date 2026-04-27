CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    u.id as user_id,
    u.username,
    MAX(s.score) as max_score,
    COUNT(DISTINCT g.id) as games_played
FROM users_user u
LEFT JOIN scores_score s ON u.id = s.user_id
LEFT JOIN games_game g ON u.id = g.user_id
GROUP BY u.id, u.username;

CREATE OR REPLACE VIEW anomaly_stats_view AS
SELECT 
    a.id as anomaly_id,
    a.name as anomaly_name,
    COUNT(da.id) as times_detected,
    ROUND((SUM(CASE WHEN da.detected_correctly = 1 THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(da.id), 0), 2) as accuracy_rate
FROM anomalies_anomaly a
LEFT JOIN anomalies_detectedanomaly da ON a.id = da.anomaly_id
GROUP BY a.id, a.name;

CREATE OR REPLACE VIEW game_summary_view AS
SELECT 
    g.id as game_id,
    u.username,
    g.night_level,
    g.status,
    g.sanity_remaining,
    g.created_at
FROM games_game g
JOIN users_user u ON g.user_id = u.id;
