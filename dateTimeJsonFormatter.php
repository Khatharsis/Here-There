<?php
    // Default vars
    $hereTimeOffset = ($_GET['here'] != null) ? $_GET['here'] : -8;
    $hereDst = ($_GET['hereDst'] != null) ? $_GET['hereDst'] : null;
    $thereTimeOffset = ($_GET['there'] != null) ? $_GET['there'] : 7;
    $thereDst = ($_GET['thereDst'] != null) ? $_GET['thereDst'] : null;
    //$futureDateString = ($_GET['date'] != null) ? $_GET['date'] : '05/10/2013';

    // Future Date Array
    $futureDateArray = array('11/10/2012', '05/10/2013', '11/10/2013', 
        '05/10/2014', '11/10/2014', '05/10/2015', '11/10/2015', 
        '05/10/2020');
    $i = 0;
    $now = strtotime('now');
    while ($now > strtotime($futureDateArray[$i])) {
        $i++;
    }
    $futureDateString = ($_GET['date'] != null) ? $_GET['date'] :
        $futureDateArray[$i];

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
        $gmtDate['hours'] = $gmtDate['hours'] + $timezoneOffset;
        if ($gmtDate['hours'] >= 24) {
            $gmtDate['hours'] = $gmtDate['hours'] - 24;
        }
        else if ($gmtDate['hours'] < 0) {
            $gmtDate['hours'] = $gmtDate['hours'] + 24;
        }
        return $gmtDate;
    }
    
    // GMT vars
    $gmtDate = gmGetDate();
    $gmtDateHour = $gmtDate['hours'];

    // Here: LA, must account for daylight savings
    $localT = localtime(time(), true);
    $isDst = $localT['tm_isdst'];
    $hereDst = ($hereDst == null) ? $isDst : $hereDst;
    $hereDate = null;
    if ($hereDst) {
        $hereDate = adjustGmtDate($gmtDate, $hereTimeOffset+1);
    }
    else {
        $hereDate = adjustGmtDate($gmtDate, $hereTimeOffset);
    }

    // There: BKK, no daylight savings
    $thereDst = ($thereDst == null) ? false : $thereDst;
    $thereDate = null;
    if ($thereDst > 0) {
        $thereDate = adjustGmtDate($gmtDate, $thereTimeOffset+1);
    }
    else {
        $thereDate = adjustGmtDate($gmtDate, $thereTimeOffset);
    }

    $hereHour = $hereDate['hours'];
    $thereHour = $thereDate['hours'];
    $minutes = $hereDate['minutes'];
    
    $daysLeft = '';
    $currentDate = strtotime("now");
    $futureDate = strtotime($futureDateString);
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
        "there_s": "0",
        "gmt_h": "$gmtDateHour",
        "gmt_m": "$minutes",
        "gmt_s": "0",
        "dst": "$isDst"
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
