# weixin-node

微信(wechat)签名等后端接口封装(nodejs)

### require

- node 0.11+ use `--harmony` flag to to access to generators

> recommend [io.js](https://iojs.org/) for enjoy ES6 features

### USAGE

#### getToken

通过 `appid` 和 `secret` 获取 `access_token`

- params

 + **appid**
 + **secret**
 + expires_in 强制指定缓存时间(默认缓存 7200 秒)
 + update 是否强制服务端更新缓存

- return

```
{ access_token: 'yqtqCpfmJOnbJM6i2_JeWK_-r28jvIgO0Pzk66IXpFXRKVqrrDoqCXrOE4G1wgGiSERMKQ2qTH7l9xwDD1O--bxxLh8ahXbgrhx67o4qUZ0',
  expires_in: 7200 }
```

#### getTicket

通过 `access_token` 获取 `ticket`

- params

 + **access_token**
 + expires_in 强制指定缓存时间(默认缓存 7200 秒)
 + update 是否强制服务端更新缓存  

- return

```
{ errcode: 0,
  errmsg: 'ok',
  ticket: 'sM4AOVdWfPE4DxkXGEs8VDsWI7B-faDW7RPMNI7CBMYBwrOO_HqeX3cazP-FRv1zclArJLDw2_0WQA604Sc-GA',
  expires_in: 7200 }
```

#### sign

微信官方签名算法

- params

 + **ticket**
 + **url**

return

```
{ jsapi_ticket: 'sM4AOVdWfPE4DxkXGEs8VDsWI7B-faDW7RPMNI7CBMYBwrOO_HqeX3cazP-FRv1zclArJLDw2_0WQA604Sc-GA',
  nonceStr: '564m6gkt2dbwqao',
  timestamp: '1426509920',
  url: 'http://weixin.com',
  signature: 'fd0079efb712acfdcc0a398b85c74102f1cd1ef1' }
```

### example

simple

```javascript
var weixin = require('.')
var co = require('co')

co(function *(){
  var token = yield weixin.getToken('wx0e9ccf43c71f8bab', 'd97eb68dc872c9c940d96a1e55c2d7a3')
  console.log('token:', token)

  var ticket = yield weixin.getTicket(token.access_token)
  console.log('ticket:', ticket)

  var sign = yield weixin.sign(ticket.ticket, 'http://weixin.com')
  console.log('sign:', sign)
})
```

sign a url, just need `appid` + `secret`

```javascript
function *() {
  var query = this.query
  var token = yield weixin.getToken(query.appid, query.secret, query.expires_in, query.update)

  if(token.errcode) return this.body = token

  var ticket = yield weixin.getTicket(token.access_token)

  if(ticket.errcode !== 0) return this.body = ticket

  var result = weixin.sign(ticket, query.url)
  result.appId = query.appid
  this.body = result
}
```
