<?php
    date_default_timezone_set('America/Los_Angeles'); 
    $hereTime = date("H:i");
    //echo "<br/>";
    date_default_timezone_set('Asia/Bangkok');
    $thereTime = date("H:i");
    //echo "<br/>";
    date_default_timezone_set('America/Los_Angeles');

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
        "here": "$hereTime",
        "there": "$thereTime"
    },
    "daysLeft": {
        "remaining": "$daysLeft"
    }
}
EOT;
//{
//    "currentTime": {
//        "here": "8:19pm",
//        "there": "10:19am"
//    },
//    "daysLeft": {
//        "remaining": "8w 1d"
//    }
//}

?>
