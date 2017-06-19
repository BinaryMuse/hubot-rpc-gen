# hubot-rpc-gen

Generate [Chatops RPC compatible servers](https://github.com/bhuga/hubot-chatops-rpc) for Hubot and more! Compatible with Express v4.

## Installation

```
npm install [--save] hubot-rpc-gen
```

## Usage

Assuming you already have an express server:

```javascript
const express = require('express')
const app = express()
```

you can add a CRPC endpoint easily! For example, to mount the endpoint at `/_chatops` with the namespace `'mynamespace'`:

```javascript
const crpc = require('hubot-rpc-gen')
const endpoint = crpc.endpoint(app, 'mynamespace', '/_chatops')
```

You can then add methods using the `method` method:

```javascript
endpoint.method('name', {
  help: 'An optional help message',
  regex: 'command regex (?<option>.+)',
  params: ['option']
}, ({user, method, params, room_id}, respond) => {
  respond(`User ${user} asked for method ${method} with option ${params.option} in ${room_id}`)
})
```

If you want to provide more advanced options, like `title` and `color` in the response, pass them as a second option to `respond`:

```javascript
rpc.method('github-lookup', {
  help: 'github me <query> - link to a GitHub user',
  regex: 'github me (?<query>.+)',
  params: ['query', 'color']
}, ({user, method, params, room_id}, respond) => {
  respond(`https://github.com/${params.query}`, {
    title: params.query,
    title_link: `https://github.com/${params.query}`,
    image_url: `https://github.com/${params.query}.png`,
    color: '0000ff'
  })
})
```
