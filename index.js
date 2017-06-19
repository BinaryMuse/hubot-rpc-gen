const {Router} = require('express')
const bodyParser = require('body-parser')

class RpcMethod {
  constructor(name, options, handler) {
    this._name = name
    this._options = options
    this._handler = handler
  }

  handleRequest(req, res) {
    const {method, params, room_id, user} = req.body
    this._handler({params: params || {}, method, room_id, user}, (result, others) => {
      others = others || {}
      const resp = Object.assign({result: result}, others)
      res.json(resp)
    })
  }

  toJSON() {
    const rgxStr = this._options.regex.toString()
    return {
      help: this._options.help || '',
      regex: rgxStr.substr(1, rgxStr.length - 2),
      params: this._options.params,
      path: this._name
    }
  }
}

class RpcEndpoint {
  constructor (app, namespace, path) {
    this._app = app
    this._namespace = namespace
    this._path = path
    this._methods = {}

    this._router = Router()
    this._app.use(this._path, this._router)
    this._router.use(bodyParser.json())
    this._router.get('/', this.manifest.bind(this))
    this._router.post('*', this.handleMethod.bind(this))
  }

  method(name, options, handler) {
    if (this._methods[name]) {
      throw new Error(`Method ${name} already registered`)
    }

    this._methods[name] = new RpcMethod(name, options, handler)
  }

  handleMethod(req, res, ...args) {
    const name = req.path.substr(1)
    const method = this._methods[name]
    if (!method) {
      res.status(404).end()
    } else {
      method.handleRequest(req, res, ...args)
    }
  }

  manifest(req, res) {
    res.json({
      namespace: this._namespace,
      help: this._help || null,
      version: 2,
      error_response: this._errorResponse || '',
      methods: this.methods()
    })
  }

  methods() {
    return Object.keys(this._methods).reduce((acc, name) => {
      acc[name] = this._methods[name].toJSON()
      return acc
    }, {})
  }
}

function endpoint(app, namespace, path) {
  return new RpcEndpoint(app, namespace, path)
}

module.exports = {
  endpoint: endpoint
}
