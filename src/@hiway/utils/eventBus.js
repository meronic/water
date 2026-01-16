import mitt from 'mitt'

const bus = {}
const emitter = mitt()

emitter.once = (type, handler) => {
  const fn = (...args) => {    
    emitter.off(type)
    handler(args)
  }

  emitter.on(type, fn)
}

bus.$on = emitter.on
bus.$off = emitter.off
bus.$emit = emitter.emit
bus.$once = emitter.once

export default bus