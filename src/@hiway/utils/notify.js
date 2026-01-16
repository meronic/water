import { notify } from "@kyvg/vue3-notification"

export default {
  info(msg) {    
    notify({
      group: 'hiway',
      text: msg,
      type: 'info',
    })
  },
  success(msg) {
    notify({
      group: 'hiway',
      text: msg,
      type: 'success',
    })
  },
  warn(msg) {
    notify({
      group: 'hiway',
      text: msg,
      type: 'warn',
    })
  },
  err(msg) {
    notify({
      group: 'hiway',
      text: msg,
      type: 'error',
    })
  },
}
