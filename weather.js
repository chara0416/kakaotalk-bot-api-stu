importPackage(java.net);
importPackage(java.io);
importPackage(java.lang);

// --- 날씨 정보 가져오기 함수 ---
function getWeatherInfo(lat, lon) {
    // !!! 중요: 여기에 OpenWeatherMap 등에서 발급받은 API 키를 입력하세요 !!!
    var WEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY";

    if (!WEATHER_API_KEY || WEATHER_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
        return "오류: 날씨 API 키가 설정되지 않았습니다.";
    }

    var lang = "kr";
    var units = "metric";
    var urlString = "https://api.openweathermap.org/data/2.5/weather"
                  + "?lat=" + lat
                  + "&lon=" + lon
                  + "&appid=" + WEATHER_API_KEY
                  + "&lang=" + lang
                  + "&units=" + units;

    var weatherText = "날씨 정보를 가져오는 데 실패했습니다."; // 기본 오류 메시지
    var connection = null;
    var reader = null;

    try {
        var url = new URL(urlString);
        connection = url.openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(5000); // 연결 타임아웃 (5초)
        connection.setReadTimeout(5000);    // 읽기 타임아웃 (5초)
        connection.connect();

        var responseCode = connection.getResponseCode();

        if (responseCode === HttpURLConnection.HTTP_OK) {
            var inputStream = connection.getInputStream();
            reader = new BufferedReader(new InputStreamReader(inputStream, "UTF-8")); // UTF-8 인코딩 명시
            var response = new StringBuffer();
            var line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            var weatherData = JSON.parse(response.toString());

            // 날씨 정보 파싱 및 텍스트 생성
            var location_name = weatherData.name || "용인시";
            var description = weatherData.weather[0].description;
            var temp = weatherData.main.temp;
            var feels_like = weatherData.main.feels_like;
            var humidity = weatherData.main.humidity;
            var wind_speed = weatherData.wind.speed;

            // 현재 시간 (간단하게)
            var now = new Date();
            var now_str = now.getHours() + "시 " + now.getMinutes() + "분";

            weatherText = "📍 " + location_name + " 현재 날씨 (" + now_str + ")\n"
                        + "🌡️ 기온: " + temp + "°C (체감: " + feels_like + "°C)\n"
                        + "💧 습도: " + humidity + "%\n"
                        + "🌬️ 바람: " + wind_speed + " m/s\n"
                        + "☀️ 날씨: " + description;

        } else {
            weatherText = "날씨 정보 조회 실패 (HTTP 에러: " + responseCode + ")";
        }
    } catch (e) {
        // Java 예외 또는 JavaScript 예외 처리
        var errorMsg = e.javaException ? e.javaException.getMessage() : e.toString();
        weatherText = "날씨 정보 요청/처리 중 오류 발생: " + errorMsg;
        System.err.println(errorMsg); // 에러 로그 출력 (가능하다면)
        if (e.javaException) e.javaException.printStackTrace(); // Java 스택 트레이스 출력
    } finally {
        if (reader != null) {
            try { reader.close(); } catch (e) { /* 무시 */ }
        }
        if (connection != null) {
            connection.disconnect();
        }
    }
    return weatherText;
}

// --- 메시지 처리 리스너 ---
function onMessage(msg) {
    // 메시지 내용이 "!날씨" 로 시작하는지 확인
    if (msg.content.trim().startsWith("!날씨")) {
        // 용인시 위도, 경도 (예시)
        var YONGIN_LAT = 37.241086;
        var YONGIN_LON = 127.177553;

        // 날씨 정보 가져오기 시도 (네트워크 작업이므로 시간이 걸릴 수 있음)
        // 주의: 이 작업이 메인 스레드를 차단할 수 있으므로,
        // 앱 환경이 백그라운드 스레드 실행을 지원한다면 그곳에서 실행하는 것이 좋습니다.
        var weatherResult = getWeatherInfo(YONGIN_LAT, YONGIN_LON);

        // 결과 답장하기
        msg.reply(weatherResult);
    }

    // 여기에 다른 메시지 처리 로직 추가 가능
}

// --- 명령어 처리 리스너 (옵션) ---
// 만약 @날씨 형태로 사용하고 싶다면 아래 주석을 해제하고 onMessage 대신 사용하세요.
/*
function onCommand(msg) {
    if (msg.command === "날씨") {
        var YONGIN_LAT = 37.241086;
        var YONGIN_LON = 127.177553;

        // 날씨 정보 가져오기
        var weatherResult = getWeatherInfo(YONGIN_LAT, YONGIN_LON);

        // 결과 답장하기
        msg.reply(weatherResult);
    }
    // 여기에 다른 명령어 처리 로직 추가 가능
}
*/

// --- 봇 설정 및 리스너 등록 ---
const bot = BotManager.getCurrentBot();

// `onMessage` 리스너 등록
bot.addListener(Event.MESSAGE, onMessage);

// 만약 `@` 접두사 명령어를 사용하려면 아래 주석 해제
// bot.setCommandPrefix("@");
// bot.addListener(Event.COMMAND, onCommand);


function onCreate(savedInstanceState, activity) {

  var textView = new android.widget.TextView(activity);
  textView.setText("날씨 봇 실행 중..."); // 간단한 메시지 표시
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
  Log.i("날씨봇", "onCreate 실행됨"); // 로그 출력 (앱 환경 지원 시)
}

function onResume(activity) {
    // 앱이 화면에 표시될 때
    Log.i("날씨봇", "onResume 실행됨");
}

// 다른 Activity 생명주기 함수들
function onStart(activity) {}
function onPause(activity) {}
function onStop(activity) {}
function onRestart(activity) {}
function onDestroy(activity) {}
function onBackPressed(activity) {}

// Activity 리스너 등록
bot.addListener(Event.Activity.CREATE, onCreate);
bot.addListener(Event.Activity.START, onStart);
bot.addListener(Event.Activity.RESUME, onResume);
bot.addListener(Event.Activity.PAUSE, onPause);
bot.addListener(Event.Activity.STOP, onStop);
bot.addListener(Event.Activity.RESTART, onRestart);
bot.addListener(Event.Activity.DESTROY, onDestroy);
bot.addListener(Event.Activity.BACK_PRESSED, onBackPressed);

// Log 객체가 있다면 사용 (없으면 아래 줄 삭제)
// const Log = module.require("Log"); // 예시: Log 모듈 로드 (실제 경로는 다를 수 있음)
// Log.i("날씨봇 스크립트 로드 완료");
