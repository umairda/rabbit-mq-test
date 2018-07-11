'use strict'

const CHANNEL = 'hello'

const logThenExit = obj => {
  console.error(obj)
  process.exit(1)
}

const amqp = require('amqplib')

class Counter {
  constructor() {
    this.count = 0
  }

  get count() {
    return this._count
  }

  set count(c) {
    this._count = c
  }

  increment() {
    return ++this._count
  }
}

amqp.connect()
  .then(conn=>{
    
    conn.createChannel(CHANNEL)
      .then(channel=>{

        channel.on('error',error=>{
          console.error("caught error")
        })

        channel.purgeQueue(CHANNEL)
          .then(purged=>{
            console.log({ purged })
            channel.assertQueue(CHANNEL)
            .then(asserted=>{
              console.log({ asserted })
              
  
              const c = new Counter()
  
              channel.consume(CHANNEL, msg=>{
  
                console.log(c.count + ' ' + msg.content.toString())
  
                if (c.increment() > 5) {
                  process.exit(0)
                }
                
              }).then(consuming=>{
                console.log({ consuming })
              }).catch(logThenExit)
         
              setInterval(()=>{
                channel.sendToQueue(CHANNEL,new Buffer(`Hello World ${c.count}`))
                console.log(`message ${c.count} sent to channel: ${CHANNEL}`)
              },1000)
            }).catch(logThenExit)
          }).catch(logThenExit)

      }).catch(logThenExit)

  }).catch(logThenExit)