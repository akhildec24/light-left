module.exports = {
  apps: [{
    name: 'lightleft',
    script: 'server.js',
    cwd: '/home/coded-lightleft/htdocs/lightleft.coded.gdn',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3059,
    },
    max_memory_restart: '200M',
    error_file: '/home/coded-lightleft/.pm2/logs/lightleft-error.log',
    out_file: '/home/coded-lightleft/.pm2/logs/lightleft-out.log',
  }],
}
