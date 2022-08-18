import moment from 'moment'

import 'moment/locale/ru'
import 'moment/locale/zh-cn'
import 'moment/locale/fr'
import 'moment/locale/es'
import 'moment/locale/tr'
import 'moment/locale/uk'

moment.locale('en')

export default (ctx, inject) => {
  ctx.$moment = moment
  inject('moment', moment)
}
