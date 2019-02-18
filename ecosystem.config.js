require('dotenv-safe/config')

module.exports = {
    apps: [
        {
            name: process.env.APP_NAME,
            script: './build/index.js',
            watch: true,
            instances: 4,
            exec_mode: 'cluster',
            max_restarts: 5,
            merge_logs: true,
            ignore_watch: ['node_modules', 'src/schemas', '.git'],
            env: {
                PORT: process.env.APP_PORT,
                NODE_ENV: 'development',
            },
            env_production: {
                PORT: process.env.APP_PORT,
                NODE_ENV: 'production',
            },
        },
    ],
}
