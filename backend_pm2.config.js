module.exports = {
  apps: [{
    name: "bms-backend",
    script: "/var/www/bms/backend/start_backend.sh",
    cwd: "/var/www/bms/backend",
    watch: false,
    instances: 1,
    autorestart: true,
    max_memory_restart: "1G"
  }]
};
