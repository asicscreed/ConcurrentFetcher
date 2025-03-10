<?php
$starttime = microtime(true);

$REFPARAMS;
$HTTPVERB;
$ACTION;

function getlost($error_code) {
    try {
        $headStr = '';
        $ret_error_code = $error_code;
        switch ($error_code) {
            case 301:
            case 302:
            case 303:
                $headStr = $_SERVER["SERVER_PROTOCOL"] . " 302 Found";
                $ret_error_code = 302;
                break;
            case 401:
                $headStr = $_SERVER["SERVER_PROTOCOL"] . " 401 Unauthorized";
                break;
            case 402:
            case 403:
                $headStr = $_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden";
                $ret_error_code = 403;
                break;
            case 405:
                $headStr = $_SERVER["SERVER_PROTOCOL"] . " 405 Method Not Allowed";
                break;
            case 406:
                $headStr = $_SERVER["SERVER_PROTOCOL"] . " 406 Not Acceptable";
                break;
            default:
                $headStr = $_SERVER["SERVER_PROTOCOL"] . " 404 Not Found";
                $ret_error_code = 404;
        }
        // Note that $filename and $linenum are passed in for later use.
        if (headers_sent($filename, $linenum)) {
            echo "Headers already sent in $filename on line $linenum\n"
                  . "Cannot proceed";
            exit(0);
        } else {
            header($headStr);
            exit(0);
        }
    } catch (\Throwable|\Exception $ex) {
        error_log($ex->getMessage, 0);
    }
    http_response_code($error_code);
    exit(0);
}

$HTTPVERB = '';
if (isset($_SERVER['REQUEST_METHOD'])) {
    $HTTPVERB = strtoupper($_SERVER['REQUEST_METHOD']);
}
$REFPARAMS = NULL;
if (!empty($_REQUEST)) {
    $REFPARAMS = &$_REQUEST;
} elseif (!empty($_POST)) {
    $REFPARAMS = &$_POST;
    if (empty($HTTPVERB)) {$HTTPVERB = 'POST';}
} elseif (!empty($_GET)) {
    $REFPARAMS = &$_GET;
    if (empty($HTTPVERB)) {$HTTPVERB = 'GET';}
} elseif (isset($_PUT) && !empty($_PUT)) {
    $REFPARAMS = &$_PUT;
    if (empty($HTTPVERB)) {$HTTPVERB = 'PUT';}
} elseif (isset($_DELETE) && !empty($_DELETE)) {
    $REFPARAMS = &$_DELETE;
    if (empty($HTTPVERB)) {$HTTPVERB = 'DELETE';}
}

if (empty($HTTPVERB)) {
    getlost(404);
}

if ($HTTPVERB == 'POST' || $HTTPVERB == 'PUT') {
    try {
        // Takes raw data from the request
        if (isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
            $body = file_get_contents('php://input');
            $REFPARAMS = json_decode($body, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new RuntimeException("Invalid JSON data");
            }
            if (isset($_SERVER['QUERY_STRING'])) {
                parse_str($_SERVER['QUERY_STRING'], $qstr);
                foreach ($qstr as $key => $value) {
                    $REFPARAMS[$key] = $value;
                }
            } else {
                $REFPARAMS = &$_REQUEST;
            }
        }
    } catch (\Throwable|\Exception $e) {
        error_log($e->getMessage());
    }
}

// 'action' parameter is mandatory.
$ACTION = '';
if (!empty($REFPARAMS['action'])) {
    $ACTION = strtoupper($REFPARAMS['action']);
} else {
    getlost(406);
}

$data;
$message = '';
$actionrequest = false;
try {
    switch ($ACTION) {
        case 'SAYHELLO':
            $data = 'Hello stranger';
            $actionrequest = true;
            break;
        case 'WAITFORME':
            $waittime = 0;
            if (isset($REFPARAMS['timeout'])) { 
                $waittime = intval($REFPARAMS['timeout']);
                if ($waittime > 0 && $waittime < 90) {
                    sleep($waittime);
                    $data = 'Successfully waited for '.$waittime.' second(s)';
                    $actionrequest = true;
                } else {
                    $message = 'Timeout must be between 1 and 90. It is ('.$REFPARAMS['timeout'].')';
                }
            } else {
                getlost(406);
                break;
            }
            break;
        default:
            getlost(403);
            break;
    }
} catch (\Throwable|\Exception $q) {
    $message = 'ERROR: ' . $q->getMessage();
}

header("Content-Type: application/json; charset=UTF-8");

$response = array();
if (isset($starttime)) {
    $response['elapsed'] = floor(1000*(microtime(true) - $starttime));
} else {
    $response['elapsed'] = 0;
}
if (!$actionrequest) {
    // Parameters (to a known action request) are either missing or invalid...
    $response['success'] = 0;
    if (empty($message)) {
        $response['message'] = 'No valid action request parameter';
    } else {
        $response['message'] = $message;
    }
} else {
    // SUCCESS!!
    $response['success'] = 1;
    if (isset($message) && !empty($message)) {
        $response['message'] = $message;
    } else {
        $response['message'] = 'OK';
    }
    if (isset($data) && !empty($data)) {
        $response['data'] = $data;
    }
}

http_response_code(200);
echo json_encode($response);
?>
