<script lang="ts">
  import { fileRetentionPeriodInDays } from '$lib/constants'

  let days = fileRetentionPeriodInDays
  let hours = 24
  let minutes = 60
  let seconds = 60

  // Units in millisecond
  const _second = 1000
  const _minute = _second * 60
  const _hour = _minute * 60
  const _day = _hour * 24

  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + fileRetentionPeriodInDays)
  const startTimestamp = expirationDate.getTime()

  const animate = () => {
    var now = new Date()
    var distance = startTimestamp - now.getTime()

    if (distance < 0) {
      clearInterval(timer)
      // Done
      return
    }

    days = Math.floor(distance / _day)
    hours = Math.floor((distance % _day) / _hour)
    minutes = Math.floor((distance % _hour) / _minute)
    seconds = Math.floor((distance % _minute) / _second)
  }

  const timer = setInterval(animate, 1000)
</script>

<small class="text-xs text-gray-600">
  Expires in {days} days, {hours} hours, {minutes} minutes, {seconds} seconds.
</small>
