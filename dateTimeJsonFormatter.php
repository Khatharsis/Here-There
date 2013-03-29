<?php
    //http://www.php.net/manual/en/function.getdate.php#87691
    function gmGetDate($timestamp = null) {
        $arr = array('seconds', 'minutes', 'hours', 'mday', 'wday', 'mon',
        'year', 'yday', 'weekday', 'month', 0);
        return (array_combine($arr, split(':', 
            gmdate('s:i:G:j:w:n:Y:z:l:F:U', is_null($timestamp) ? time() :
            $timestamp))));
    }

    // Only changes the hour offset; can be modified to adjust for
    // date changes as well, but irrelevant in this script.
    function adjustGmtDate($gmtDate, $timezoneOffset) {
        $gmtDate["hours"] = $gmtDate["hours"] + $timezoneOffset;
        if ($gmtDate["hours"] > 24) {
            $gmtDate["hours"] = $gmtDate["hours"] - 24;
        }
        else if ($gmtDate["hours"] < 0) {
            $gmtDate["hours"] = $gmtDate["hours"] + 24;
        }
        return $gmtDate;
    }
    
    $gmtDate = gmGetDate();

    // Here: LA, must account for daylight savings
    $localT = localtime(time(), true);
    $hereDate = null;
    if ($localT['tm_isdst'] > 0) {
        $hereDate = adjustGmtDate($gmtDate, -7);
    }
    else {
        $hereDate = adjustGmtDate($gmtDate, -8);
    }

    // There: BKK, no daylight savings
    $thereDate = adjustGmtDate($gmtDate, 7);

    $hereHour = $hereDate['hours'];
    $thereHour = $thereDate['hours'];
    $minutes = $hereDate['minutes'];
    
    $daysLeft = '';
    $currentDate = strtotime("now");
    $futureDate = strtotime("05/10/2013");
    if ($currentDate < $futureDate) {
        $differenceInSec = $futureDate - $currentDate;
        $differenceInDetail = array(
            'y' => $differenceInSec / 31556926 % 12,
            'w' => $differenceInSec / 604800 % 52,
            'd' => $differenceInSec / 86400 %7
        );

        foreach($differenceInDetail as $key => $value) {
            if ($value > 0) {
                $ret[] = $value . $key;
            }
        }
        $daysLeft = join(' ', $ret);
    }

echo <<<EOT
{
    "currentTime": {
        "here": "$hereHour:$minutes",
        "here_h": "$hereHour",
        "here_m": "$minutes",
        "here_s": "0",
        "there": "$thereHour:$minutes",
        "there_h": "$thereHour",
        "there_m": "$minutes",
        "there_s": "0"
    },
    "daysLeft": {
        "remaining": "$daysLeft"
    }
}
EOT;
//{
//    "currentTime": {
//        "here": "20:19",
//        "here_h": "20",
//        "here_m": "19",
//        "there": "10:19"
//        "there_h": "10",
//        "there_m": "19"
//    },
//    "daysLeft": {
//        "remaining": "8w 1d"
//    }
//}

?>
