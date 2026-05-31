import { useEffect, useState } from "react";

import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiThunderstorm,
  WiSnow,
  WiFog,
  WiHumidity,
  WiThermometer,
} from "react-icons/wi";

import {
  FiHome,
  FiMapPin,
  FiStar,
  FiSettings,
  FiSearch,
} from "react-icons/fi";

import { motion } from "framer-motion";

import "./App.css";

function App() {
  const [city, setCity] = useState("Paris");
  const [input, setInput] = useState("Paris");
  const [weather, setWeather] = useState(null);
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cityTime, setCityTime] = useState({
  current: new Date(),
  timezone: "Europe/Paris",
});
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [unit, setUnit] = useState("celsius");
  const [toast, setToast] = useState("");

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

 useEffect(() => {
  const interval = setInterval(() => {
    setCityTime((prev) => ({
      ...prev,
      current: new Date(),
    }));
  }, 1000);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(saved);
  }, []);

  useEffect(() => {
    getWeather(city);
  }, [city]);

  function getWeatherIcon(code, className = "") {
    if (code === 0) return <WiDaySunny className={className} />;
    if ([1, 2, 3].includes(code)) return <WiCloudy className={className} />;
    if ([45, 48].includes(code)) return <WiFog className={className} />;
    if ([51, 61, 63, 80, 81, 82].includes(code)) return <WiRain className={className} />;
    if ([95, 96, 99].includes(code)) return <WiThunderstorm className={className} />;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return <WiSnow className={className} />;

    return <WiCloudy className={className} />;
  }

  function getWeatherDescription(code, temp) {
    if (temp >= 40) return "🔥 Canicule";
    if (temp >= 30) return "🌡️ Forte chaleur";
    if (temp <= -5) return "🥶 Froid glacial";
    if (code === 0) return "Ensoleillé";
    if ([1, 2].includes(code)) return "Nuageux";
    if (code === 3) return "Couvert";
    if ([45, 48].includes(code)) return "Brouillard";
    if ([51, 61, 63, 80, 81, 82].includes(code)) return "Pluie";
    if ([95, 96, 99].includes(code)) return "Orage";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "Neige";

    return "Météo";
  }

  function convertTemp(temp) {
    if (temp === undefined || temp === null) return "--";

    if (unit === "fahrenheit") {
      return Math.round((temp * 9) / 5 + 32);
    }

    return Math.round(temp);
  }

  function unitSymbol() {
    return unit === "fahrenheit" ? "°F" : "°";
  }

  function getWeatherClass() {
    if (!weather) return "sunny";

    const code = weather.current.weather_code;
    const hour = Number(
  cityTime.current.toLocaleString("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: cityTime.timezone,
  })
);

    if ([51, 61, 63, 80, 81, 82].includes(code)) return "rain";
    if ([95, 96, 99].includes(code)) return "storm";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "cold";
    if (weather.current.temperature_2m >= 35) return "hot";
    if (hour >= 19 || hour <= 6) return "night";
    if (hour >= 16) return "afternoon";

    return "sunny";
  }

  async function getWeather(cityName) {
    try {
      setLoading(true);
      setError("");

      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=fr&format=json`
      );

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("Ville introuvable 😭");
        setLoading(false);
        return;
      }

      const location = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      const weatherData = await weatherResponse.json();

      setWeather(weatherData);
setCityTime({
  current: new Date(),
  timezone: weatherData.timezone,
});
      setPlace({
        name: location.name,
        country: location.country,
      });

      setInput(location.name);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError("Erreur météo.");
      setLoading(false);
    }
  }

  async function handleMyPosition() {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
          );

          const weatherData = await weatherResponse.json();

          let cityName = "Ta position";
          let countryName = "";

          try {
            const geoResponse = await fetch(
              `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=fr`
            );

            const geoData = await geoResponse.json();

            if (geoData?.results && geoData.results.length > 0) {
              cityName = geoData.results[0].name;
              countryName = geoData.results[0].country;
            }
          } catch (err) {
            console.log(err);
          }

          setWeather(weatherData);

          setPlace({
            name: cityName,
            country: countryName,
          });

          setInput(cityName);
          showToast(`📍 Tu es à ${cityName}`);
          setLoading(false);
        } catch (err) {
          console.log(err);
          setError("Impossible de récupérer la météo.");
          setLoading(false);
        }
      },
      () => {
        setError("Permission refusée.");
        setLoading(false);
      }
    );
  }

  async function fetchSuggestions(value) {
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${value}&count=5&language=fr&format=json`
      );

      const data = await response.json();
      setSuggestions(data.results || []);
    } catch (err) {
      console.log(err);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (input.trim()) {
      setCity(input.trim());
      setSuggestions([]);
    }
  }

  function addFavorite() {
    if (!place?.name) return;

    if (favorites.includes(place.name)) {
      showToast("Déjà dans les favoris ⭐");
      return;
    }

    const updated = [...favorites, place.name];

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
    showToast(`${place.name} ajouté aux favoris ⭐`);
  }

  function removeFavorite(cityName) {
    const updated = favorites.filter((fav) => fav !== cityName);

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
    showToast(`${cityName} retiré des favoris`);
  }

  function formatDate() {
  return cityTime.current.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: cityTime.timezone,
  });
}

 function formatTime() {
  return cityTime.current.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: cityTime.timezone,
  });
}

  const code = weather?.current?.weather_code;
  const currentTemp = weather?.current?.temperature_2m;
  const humidity = weather?.current?.relative_humidity_2m;
  const feelsLike = weather?.current?.apparent_temperature;

  return (
    <main className={`app ${darkMode ? "dark" : "light"} ${getWeatherClass()}`}>
      {toast && <div className="toast-message">{toast}</div>}

      <aside className="sidebar">
        <div className="side-logo">
          <WiDaySunny />
        </div>

        <button className="side-btn active" type="button">
          <FiHome />
        </button>

        <button
          className={`side-btn ${showFavorites ? "active" : ""}`}
          type="button"
          onClick={() => {
            setShowFavorites(!showFavorites);
            setShowSettings(false);
          }}
        >
          <FiStar />
        </button>

        <button
          className={`side-btn ${showSettings ? "active" : ""}`}
          type="button"
          onClick={() => {
            setShowSettings(!showSettings);
            setShowFavorites(false);
          }}
        >
          <FiSettings />
        </button>
      </aside>

      <section className="dashboard">
        <div className="topbar">
          <div className="search-wrapper">
            <form className="search" onSubmit={handleSubmit}>
              <FiSearch className="search-icon" />

              <input
                type="text"
                value={input}
                placeholder="Rechercher une ville..."
                onChange={(e) => {
                  setInput(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
              />
            </form>

            {suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.id}-${suggestion.latitude}`}
                    className="suggestion-item"
                    type="button"
                    onClick={() => {
                      setCity(suggestion.name);
                      setInput(suggestion.name);
                      setSuggestions([]);
                    }}
                  >
                    {suggestion.name}
                    {suggestion.admin1 ? `, ${suggestion.admin1}` : ""}
                    {suggestion.country ? ` — ${suggestion.country}` : ""}
                  </button>
                ))}
              </div>
            )}

            {showFavorites && (
              <div className="popup-panel">
                <div className="popup-header">
                  <h3>Favoris</h3>

                  <button
                    className="close-popup"
                    type="button"
                    onClick={() => setShowFavorites(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="favorites-scroll">
                  {favorites.length === 0 ? (
                    <p>Aucune ville favorite pour l’instant.</p>
                  ) : (
                    favorites.map((fav) => (
                      <div className="favorite-row" key={fav}>
                        <button
                          className="popup-item favorite-city"
                          type="button"
                          onClick={() => {
                            setCity(fav);
                            setShowFavorites(false);
                          }}
                        >
                          {fav}
                        </button>

                        <button
                          className="delete-fav"
                          type="button"
                          onClick={() => removeFavorite(fav)}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {showSettings && (
              <div className="popup-panel">
                <div className="popup-header">
                  <h3>Réglages</h3>

                  <button
                    className="close-popup"
                    type="button"
                    onClick={() => setShowSettings(false)}
                  >
                    ×
                  </button>
                </div>

                <button
                  className="popup-item"
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  Mode : {darkMode ? "Sombre" : "Clair"}
                </button>

                <button
                  className="popup-item"
                  type="button"
                  onClick={() =>
                    setUnit(unit === "celsius" ? "fahrenheit" : "celsius")
                  }
                >
                  Unité : {unit === "celsius" ? "Celsius °C" : "Fahrenheit °F"}
                </button>
              </div>
            )}
          </div>

          <button className="position-btn" type="button" onClick={handleMyPosition}>
            <FiMapPin />
            Ma position
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {loading && <p className="loading">Chargement de la météo...</p>}

        {!loading && weather && (
          <>
            <motion.section
              className="hero-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="hero-left">
                <h1>
                  {place?.name || "Ville"}
                  {place?.country ? `, ${place.country}` : ""}
                </h1>

                <p className="date">
                  {formatDate()} — {formatTime()}
                </p>

                <div className="temp-line">
                  <strong>
                    {convertTemp(currentTemp)}
                    {unitSymbol()}
                  </strong>

                  <div>
                    <h2>{getWeatherDescription(code, currentTemp)}</h2>
                    <p>
                      Ressenti {convertTemp(feelsLike)}
                      {unitSymbol()}
                    </p>
                    <span>Humidité : {humidity}%</span>
                  </div>
                </div>

                <button className="favorite-add" type="button" onClick={addFavorite}>
                  Ajouter aux favoris ⭐
                </button>
              </div>

              {getWeatherIcon(code, "main-weather-icon")}
            </motion.section>

            <section className="cards">
              <motion.div
                className="info-card"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <WiThermometer />
                <p>Ressenti</p>
                <strong>
                  {convertTemp(feelsLike)}
                  {unitSymbol()}
                </strong>
              </motion.div>

              <motion.div
                className="info-card"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <WiHumidity />
                <p>Humidité</p>
                <strong>{humidity}%</strong>
              </motion.div>

              <motion.div
                className="info-card"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                {getWeatherIcon(code)}
                <p>Condition</p>
                <strong>{getWeatherDescription(code, currentTemp)}</strong>
              </motion.div>
            </section>

            <section className="forecast">
              <div className="forecast-title">
                <h2>Prévisions 7 jours</h2>
              </div>

              <div className="forecast-grid">
                {weather.daily?.time?.map((day, index) => {
                  const dayName = new Date(day).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                  });

                  const max = weather.daily.temperature_2m_max[index];
                  const min = weather.daily.temperature_2m_min[index];
                  const dayCode = weather.daily.weather_code[index];

                  return (
                    <motion.article
                      className="forecast-card"
                      key={day}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                    >
                      <p>{dayName}</p>

                      {getWeatherIcon(dayCode, "forecast-icon")}

                      <strong>
                        {convertTemp(max)}
                        {unitSymbol()}
                      </strong>

                      <p>
                        min {convertTemp(min)}
                        {unitSymbol()}
                      </p>
                    </motion.article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default App;