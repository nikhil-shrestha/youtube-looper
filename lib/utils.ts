export function parseDurationHMS(d: string) {
  var expression = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  var hours = 0,
    minutes = 0,
    seconds = 0;

  let result;
  while ((result = expression.exec(d)) !== null) {
    if (result[1]) {
      hours = Number(result[1]);
    }
    if (result[2]) {
      minutes = Number(result[2]);
    }
    if (result[3]) {
      seconds = Number(result[3]);
    }
  }
  return [hours, minutes, seconds];
}

export function durationToHMSString(num) {
  var d = Number(num);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);
  return (
    (h > 0 ? h + 'h ' + (m < 10 ? '0' : '') : '') +
    m +
    'm ' +
    (s < 10 ? '0' : '') +
    s +
    's'
  );
}

export function parseDurationHMSString(d: string) {
  const expression = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  let hours = 0,
    minutes = 0,
    seconds = 0;

  let second_str = '',
    minute_str = '',
    hour_str = '';

  let result;
  while ((result = expression.exec(d)) !== null) {
    if (result[1]) {
      hours = Number(result[1]);
    }
    if (result[2]) {
      minutes = Number(result[2]);
    }
    if (result[3]) {
      seconds = Number(result[3]);
    }

    second_str = seconds.toString();
    minute_str = minutes.toString();
    hour_str = hours.toString();

    if (seconds < 10) {
      second_str = '0' + second_str;
    }

    if (hours === 0) {
      return minute_str + ':' + second_str;
    }

    if (minutes < 10) {
      minute_str = '0' + minute_str;
    }

    if (hours < 10) {
      hour_str = '0' + hour_str;
    }
  }

  return hour_str + ':' + minute_str + ':' + second_str;
}

export function parseDuration(d: string) {
  if (!d && !d.length) {
    return 0;
  }

  const [h, m, s] = parseDurationHMS(d);
  return h * 3600 + m * 60 + s;
}
