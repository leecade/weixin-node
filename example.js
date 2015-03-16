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

