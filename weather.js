const URL = Java.type("java.net.URL");
const HttpURLConnection = Java.type("java.net.HttpURLConnection");
const BufferedReader = Java.type("java.io.BufferedReader");
const InputStreamReader = Java.type("java.io.InputStreamReader");
const StringBuilder = Java.type("java.lang.StringBuilder");
const URLEncoder = Java.type("java.net.URLEncoder");
const System = Java.type("java.lang.System");


const WEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // 본인 키 입력
const LANG = "kr";
const UNITS = "metric";

function getWeatherInfo(cityName) {
    let connection = null;
    let reader = null;

    if (!WEATHER_API_KEY || WEATHER_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
        return "❌ 날씨 API 키가 설정되지 않았습니다.";
    }

    try {
        let encodedCity = URLEncoder.encode(cityName, "UTF-8");
        let urlStr =
            "https://api.openweathermap.org/data/2.5/weather" +
            "?q=" + encodedCity + ",KR" +
            "&appid=" + WEATHER_API_KEY +
            "&lang=" + LANG +
            "&units=" + UNITS;

        let url = new URL(urlStr);
        connection = url.openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);

        let code = connection.getResponseCode();

        if (code !== HttpURLConnection.HTTP_OK) {
            if (code === 404) return "❌ 도시를 찾을 수 없습니다.";
            if (code === 401) return "❌ API 키 오류 (401)";
            return "❌ 날씨 조회 실패 (HTTP " + code + ")";
        }

        reader = new BufferedReader(
            new InputStreamReader(connection.getInputStream(), "UTF-8")
        );

        let sb = new StringBuilder();
        let line;
        while ((line = reader.readLine()) !== null) {
            sb.append(line);
        }

        let data = JSON.parse(sb.toString());

        let now = new Date();
        let timeStr = now.getHours() + "시 " + now.getMinutes() + "분";

        return (
            "📍 " + data.name + " 현재 날씨 (" + timeStr + ")\n" +
            "🌡️ 기온: " + data.main.temp + "°C (체감 " + data.main.feels_like + "°C)\n" +
            "💧 습도: " + data.main.humidity + "%\n" +
            "🌬️ 바람: " + data.wind.speed + " m/s\n" +
            "☀️ 날씨: " + data.weather[0].description
        );

    } catch (e) {
        let msg = e.javaException
            ? e.javaException.getMessage()
            : e.toString();
        System.err.println(msg);
        return "❌ 오류 발생: " + msg;
    } finally {
        if (reader) try { reader.close(); } catch (e) {}
        if (connection) connection.disconnect();
    }
}


function onMessage(msg) {
    let text = msg.content.trim();

    if (!text.startsWith("!날씨 ")) return;

    let city = text.substring(4).trim();
    if (!city) {
        msg.reply("도시 이름을 입력해주세요.\n예) !날씨 서울");
        return;
    }

    msg.reply(getWeatherInfo(city));
}


// 리스너
const bot = BotManager.getCurrentBot();
bot.addListener(Event.MESSAGE, onMessage);
