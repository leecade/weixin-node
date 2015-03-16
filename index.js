/**
 * weixin signature
 * @author yuji <leecade@163.com>
 * 1. appid + appsecret -> access_token
 * 2. access_token -> ticket
 * 3. ticket + url -> signature
 */
'use strict'

var jsop = require('jsop')
var request = require('co-request')
var utils = require('./lib/utils')
var sign = require('./lib/sign')

// default config
var conf = {
  tokenApi: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=#{appid}&secret=#{secret}',
  ticketApi: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=#{access_token}&type=jsapi',
  expires_in: 7200
}

var tmpPath = './tmp'

function * getToken(appid, secret, expires_in, update) {

  // get tokens cache
  var tokens = jsop(tmpPath + '/tokens')
  var token = tokens[appid]

  if(!token

    // expires_in checking
    || (+new Date - token.timestamp > conf.expires_in * 1000)

    // force update
    || update == 1) {

    // request new token
    token = yield request(utils.replaceTpl(conf.tokenApi, {
      appid: appid
      , secret: secret
    }))

    try{
      token = JSON.parse(token.body)
    }
    catch(e) {
      return {"errcode":10000,"errmsg":"weixin server response error"}
    }

    // request error handle
    // body: '{"errcode":40001,"errmsg":"invalid credential"}' }
    // body: '{"access_token":"d3rdR0ExpGQoKpPHT8IH6VSDy1RicGsbVHXMBjfvl_2xmtYBKM3aMPPyxBz8OEVRrjMDsIThO8joFi_h9v1Chk0csHClOI7xyRvuHTeCow8","expires_in":7200}' }
    if(token.errcode) {
      return token
    }

    // save token
    tokens[appid] = token = {
      secret: secret
      , access_token: token
      , expires_in: expires_in || token.expires_in
      , timestamp: +new Date
    }
  }

  // secret validating
  else if(token.secret !== secret) {

    // from weixin offical
    return {"errcode":40001,"errmsg":"invalid credential"}
  }

  return token.access_token
}

function * getTicket(access_token, expires_in, update) {
  // tokens cache
  var tickets = jsop(tmpPath + '/tickets')
  var ticket = tickets[access_token]

  if(!ticket

    // expires_in checking
    || (+new Date - ticket.timestamp > conf.expires_in * 1000)

    // force update
    || update == 1) {

    ticket = yield request(utils.replaceTpl(conf.ticketApi, {
      access_token: access_token
    }))

    try{
      ticket = JSON.parse(ticket.body)
    }
    catch(e) {
      return {"errcode":10000,"errmsg":"weixin server response error"}
    }

    // error handle
    if(ticket.errcode !== 0) {
      return ticket
    }

    // save ticket
    tickets[access_token] = ticket = {
      ticket: ticket
      , expires_in: expires_in || ticket.expires_in
      , timestamp: +new Date
    }
  }

  return ticket.ticket
}

module.exports = {
  getToken: getToken,
  getTicket: getTicket,
  sign: sign
}