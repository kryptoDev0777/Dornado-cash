const middleware = {}

middleware['provider'] = require('..\\middleware\\provider.js')
middleware['provider'] = middleware['provider'].default || middleware['provider']

export default middleware
