module.exports = {
  apps: [{
    name: "bms-frontend",
    cwd: "/var/www/bms/frontend",
    script: "npm",
    args: "start",
    env: {
      "NODE_ENV": "production",
      "PORT": "3000"
    },
    watch: false,
    instances: 1,
    autorestart: true,
    max_memory_restart: "1G"
  }]
}
