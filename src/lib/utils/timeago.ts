import TimeAgo from 'javascript-time-ago'

import sk from 'javascript-time-ago/locale/sk'

TimeAgo.addDefaultLocale(sk)

const timeAgo = new TimeAgo('sk-SK')

export default timeAgo
