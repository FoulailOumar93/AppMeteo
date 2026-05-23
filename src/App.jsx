import { useEffect, useState } from "react";

import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiThunderstorm,
  WiSnow,
  WiFog,
  WiHumidity,
  WiStrongWind,
  WiThermometer,
  WiBarometer,
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

  /* =========================================================
     STATES
  ========================================================= */

  const [city, setCity] =
    useState("Paris");

  const [input, setInput] =
    useState("Paris");

  const [weather, setWeather] =
    useState(null);

  const [place, setPlace] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [timezone, setTimezone] =
    useState("Europe/Paris");

  const [time, setTime] =
    useState(new Date());

  const [favorites, setFavorites] =
    useState([]);

  const [showFavorites, setShowFavorites] =
    useState(false);

  const [showSettings, setShowSettings] =
    useState(false);

  const [suggestions, setSuggestions] =
    useState([]);

  const [darkMode, setDarkMode] =
    useState(true);

  const [unit, setUnit] =
    useState("celsius");

  /* =========================================================
     CLOCK
  ========================================================= */

  useEffect(() => {

    const interval =
      setInterval(() => {

        setTime(new Date());

      }, 1000);

    return () =>
      clearInterval(interval);

  }, []);

  /* =========================================================
     FAVORITES LOAD
  ========================================================= */

  useEffect(() => {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "favorites"
        )
      ) || [];

    setFavorites(saved);

  }, []);

  /* =========================================================
     WEATHER LOAD
  ========================================================= */

  useEffect(() => {

    getWeather(city);

  }, [city]);

  /* =========================================================
     WEATHER ICON
  ========================================================= */

  function getWeatherIcon(
    code,
    className = ""
  ) {

    if (code === 0)
      return (
        <WiDaySunny
          className={className}
        />
      );

    if ([1,2,3].includes(code))
      return (
        <WiCloudy
          className={className}
        />
      );

    if ([45,48].includes(code))
      return (
        <WiFog
          className={className}
        />
      );

    if (
      [
        51,
        61,
        63,
        80,
        81,
        82,
      ].includes(code)
    )
      return (
        <WiRain
          className={className}
        />
      );

    if (
      [
        95,
        96,
        99,
      ].includes(code)
    )
      return (
        <WiThunderstorm
          className={className}
        />
      );

    if (
      [
        71,
        73,
        75,
        77,
        85,
        86,
      ].includes(code)
    )
      return (
        <WiSnow
          className={className}
        />
      );

    return (
      <WiCloudy
        className={className}
      />
    );
  }

  /* =========================================================
     DESCRIPTION
  ========================================================= */

  function getWeatherDescription(
    code,
    temp
  ) {

    if (temp >= 40)
      return "🔥 Canicule";

    if (temp >= 30)
      return "🌡️ Forte chaleur";

    if (temp <= -5)
      return "🥶 Froid glacial";

    if (code === 0)
      return "Ensoleillé";

    if ([1,2].includes(code))
      return "Nuageux";

    if (code === 3)
      return "Couvert";

    if ([45,48].includes(code))
      return "Brouillard";

    if (
      [
        51,
        61,
        63,
        80,
        81,
        82,
      ].includes(code)
    )
      return "Pluie";

    if (
      [
        95,
        96,
        99,
      ].includes(code)
    )
      return "Orage";

    if (
      [
        71,
        73,
        75,
        77,
        85,
        86,
      ].includes(code)
    )
      return "Neige";

    return "Météo";
  }

  /* =========================================================
     UNIT
  ========================================================= */

  function convertTemp(temp) {

    if (
      unit ===
      "fahrenheit"
    ) {

      return Math.round(
        (temp * 9) / 5 + 32
      );
    }

    return Math.round(temp);
  }

  function unitSymbol() {

    return unit ===
      "fahrenheit"
      ? "°F"
      : "°";
  }

  /* =========================================================
     WEATHER CLASS
  ========================================================= */

  function getWeatherClass() {

    if (!weather)
      return "sunny";

    const code =
      weather.current.weather_code;

    const hour =
      time.getHours();

    if (
      [51,61,63,80,81,82]
      .includes(code)
    ) {
      return "rain";
    }

    if (
      [95,96,99]
      .includes(code)
    ) {
      return "storm";
    }

    if (
      [71,73,75,77,85,86]
      .includes(code)
    ) {
      return "cold";
    }

    if (
      weather.current.temperature_2m >= 35
    ) {
      return "hot";
    }

    if (
      hour >= 19 ||
      hour <= 6
    ) {
      return "night";
    }

    if (
      hour >= 16
    ) {
      return "afternoon";
    }

    return "sunny";
  }

  /* =========================================================
     WEATHER BY COORDS
  ========================================================= */

  async function getWeatherByCoords(
    latitude,
    longitude,
    customPlace
  ) {

    const response =
      await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`
      );

    const data =
      await response.json();

    setWeather(data);

    setPlace(customPlace);

    setTimezone(
      data.timezone
    );
  }

  /* =========================================================
     GET WEATHER
  ========================================================= */

  async function getWeather(
    cityName
  ) {

    try {

      setLoading(true);

      setError("");

      const geoResponse =
        await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=fr&format=json`
        );

      const geoData =
        await geoResponse.json();

      if (
        !geoData.results ||
        geoData.results.length === 0
      ) {

        setError(
          "Ville introuvable 😭"
        );

        setLoading(false);

        return;
      }

      const location =
        geoData.results[0];

      await getWeatherByCoords(
        location.latitude,
        location.longitude,
        {
          name:
            location.name,

          country:
            location.country,
        }
      );

      setInput(
        location.name
      );

      setLoading(false);

    } catch (err) {

      console.log(err);

      setError(
        "Erreur météo."
      );

      setLoading(false);
    }
  }

  /* =========================================================
     GEOLOCATION
  ========================================================= */

  async function handleMyPosition() {

    if (!navigator.geolocation) {

      setError(
        "Géolocalisation non supportée."
      );

      return;
    }

    setLoading(true);

    setError("");

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        try {

          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const weatherResponse =
            await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`
            );

          const weatherData =
            await weatherResponse.json();

          let cityName =
            "Ma position";

          let countryName =
            "";

          try {

            const geoResponse =
              await fetch(
                `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=fr`
              );

            const geoData =
              await geoResponse.json();

            if (
              geoData?.results &&
              geoData.results.length > 0
            ) {

              cityName =
                geoData.results[0]
                  .name;

              countryName =
                geoData.results[0]
                  .country;
            }

          } catch (geoError) {

            console.log(
              geoError
            );
          }

          setWeather(
            weatherData
          );

          setPlace({
            name: cityName,
            country:
              countryName,
          });

          setTimezone(
            weatherData.timezone
          );

          setInput(
            cityName
          );

          setLoading(false);

        } catch (err) {

          console.log(err);

          setError(
            "Impossible de récupérer la météo."
          );

          setLoading(false);
        }
      },

      () => {

        setError(
          "Permission refusée."
        );

        setLoading(false);
      },

      {
        enableHighAccuracy:true,
        timeout:10000,
        maximumAge:0,
      }
    );
  }

  /* =========================================================
     SUGGESTIONS
  ========================================================= */

  async function fetchSuggestions(
    value
  ) {

    if (value.length < 2) {

      setSuggestions([]);

      return;
    }

    try {

      const response =
        await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${value}&count=5&language=fr&format=json`
        );

      const data =
        await response.json();

      setSuggestions(
        data.results || []
      );

    } catch (err) {

      console.log(err);
    }
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  function handleSubmit(e) {

    e.preventDefault();

    if (
      input.trim()
    ) {

      setCity(
        input.trim()
      );

      setSuggestions([]);
    }
  }

  /* =========================================================
     FAVORITES
  ========================================================= */

  function addFavorite() {

    if (!place?.name)
      return;

    if (
      favorites.includes(
        place.name
      )
    ) {
      return;
    }

    const updated =
      [
        ...favorites,
        place.name,
      ];

    setFavorites(updated);

    localStorage.setItem(
      "favorites",
      JSON.stringify(updated)
    );
  }

  function removeFavorite(
    cityName
  ) {

    const updated =
      favorites.filter(
        (fav) =>
          fav !== cityName
      );

    setFavorites(updated);

    localStorage.setItem(
      "favorites",
      JSON.stringify(updated)
    );
  }

  const code =
    weather?.current
      ?.weather_code;

  return (

    <main
      className={`app ${
        darkMode
          ? "dark"
          : "light"
      } ${
        getWeatherClass()
      }`}
    >

      <aside className="sidebar">

        <div className="side-logo">

          {
            getWeatherIcon(
              code || 1,
              "side-weather-icon"
            )
          }

        </div>

        <button className="side-btn active">
          <FiHome />
        </button>

        <button
          className="side-btn"
          onClick={
            handleMyPosition
          }
        >
          <FiMapPin />
        </button>

        <button
          className="side-btn"
          onClick={() => {

            setShowFavorites(
              !showFavorites
            );

            setShowSettings(
              false
            );
          }}
        >
          <FiStar />
        </button>

        <button
          className="side-btn"
          onClick={() => {

            setShowSettings(
              !showSettings
            );

            setShowFavorites(
              false
            );
          }}
        >
          <FiSettings />
        </button>

      </aside>

      {
        showFavorites && (

          <div className="popup-panel">

            <div className="popup-header">

              <h3>
                ⭐ Favoris
              </h3>

              <button
                className="close-popup"
                onClick={() =>
                  setShowFavorites(false)
                }
              >
                ✕
              </button>

            </div>

            <button
              className="popup-item"
              onClick={
                addFavorite
              }
            >
              + Ajouter {
                place?.name
              }
            </button>

            <div className="favorites-scroll">

              {
                favorites.length === 0 && (

                  <p className="empty-text">
                    Aucun favori 😭
                  </p>
                )
              }

              {
                favorites.map(
                  (fav) => (

                    <div
                      key={fav}
                      className="favorite-row"
                    >

                      <button
                        className="popup-item favorite-city"
                        onClick={() => {

                          setInput(fav);

                          setCity(fav);

                          setShowFavorites(false);
                        }}
                      >
                        {fav}
                      </button>

                      <button
                        className="delete-fav"
                        onClick={() =>
                          removeFavorite(
                            fav
                          )
                        }
                      >
                        ✕
                      </button>

                    </div>
                  )
                )
              }

            </div>

          </div>
        )
      }

      {
        showSettings && (

          <div className="popup-panel">

            <div className="popup-header">

              <h3>
                ⚙️ Paramètres
              </h3>

              <button
                className="close-popup"
                onClick={() =>
                  setShowSettings(false)
                }
              >
                ✕
              </button>

            </div>

            <button
              className="popup-item"
              onClick={() =>
                setDarkMode(
                  !darkMode
                )
              }
            >

              {
                darkMode
                  ? "☀️ Mode clair"
                  : "🌙 Mode sombre"
              }

            </button>

            <button
              className="popup-item"
              onClick={() =>
                setUnit(
                  unit ===
                    "celsius"
                    ? "fahrenheit"
                    : "celsius"
                )
              }
            >

              🌡️ {
                unit ===
                "celsius"
                  ? "Passer en Fahrenheit"
                  : "Passer en Celsius"
              }

            </button>

          </div>
        )
      }

      <section className="dashboard">

        <header className="topbar">

          <div className="search-wrapper">

            <form
              className="search"
              onSubmit={
                handleSubmit
              }
            >

              <FiSearch className="search-icon" />

              <input
                type="text"
                placeholder="Rechercher une ville..."
                value={input}
                onChange={(e) => {

                  setInput(
                    e.target.value
                  );

                  fetchSuggestions(
                    e.target.value
                  );
                }}
              />

            </form>

            {
              suggestions.length > 0 && (

                <div className="suggestions">

                  {
                    suggestions.map(
                      (item) => (

                        <button
                          key={item.id}
                          type="button"
                          className="suggestion-item"
                          onClick={() => {

                            setCity(
                              item.name
                            );

                            setInput(
                              item.name
                            );

                            setSuggestions([]);
                          }}
                        >

                          {
                            item.name
                          }

                          , {

                            item.country
                          }

                        </button>
                      )
                    )
                  }

                </div>
              )
            }

          </div>

          <button
            className="position-btn"
            onClick={
              handleMyPosition
            }
          >

            <FiMapPin />

            Ma position

          </button>

        </header>

        {
          error && (

            <p className="error-message">

              {error}

            </p>
          )
        }

        {
          loading && (

            <p className="loading">

              Chargement...

            </p>
          )
        }

        {
          !loading &&
          weather && (

            <>

              <motion.section
                className="hero-card"
                initial={{
                  opacity:0,
                  y:30,
                }}
                animate={{
                  opacity:1,
                  y:0,
                }}
              >

                <div className="hero-left">

                  <h1>

                    {
                      place?.name
                    }

                    , {

                      place?.country
                    }

                  </h1>

                  <p className="date">

                    {
                      new Intl.DateTimeFormat(
                        "fr-FR",
                        {
                          weekday:"long",
                          day:"2-digit",
                          month:"long",
                          hour:"2-digit",
                          minute:"2-digit",
                          timeZone:
                            timezone,
                        }
                      ).format(time)
                    }

                  </p>

                  <div className="temp-line">

                    <strong>

                      {
                        convertTemp(
                          weather.current.temperature_2m
                        )
                      }

                      {
                        unitSymbol()
                      }

                    </strong>

                    <div>

                      <h2>

                        {
                          getWeatherDescription(
                            code,
                            weather.current.temperature_2m
                          )
                        }

                      </h2>

                      <p>

                        Ressenti : {

                          convertTemp(
                            weather.current.apparent_temperature
                          )
                        }

                        {
                          unitSymbol()
                        }

                      </p>

                      <span>

                        ↑ {

                          convertTemp(
                            weather.daily.temperature_2m_max[0]
                          )
                        }

                        {
                          unitSymbol()
                        }

                        {"  "}

                        ↓ {

                          convertTemp(
                            weather.daily.temperature_2m_min[0]
                          )
                        }

                        {
                          unitSymbol()
                        }

                      </span>

                      <br />

                      <button
                        className="favorite-add"
                        onClick={
                          addFavorite
                        }
                      >

                        ⭐ Ajouter aux favoris

                      </button>

                    </div>

                  </div>

                </div>

                <div className="hero-weather">

                  {
                    getWeatherIcon(
                      code,
                      "main-weather-icon"
                    )
                  }

                </div>

              </motion.section>

              <section className="forecast">

                <div className="forecast-title">

                  <h2>
                    Prévisions 7 jours
                  </h2>

                </div>

                <div className="forecast-grid">

                  {
                    weather.daily.time
                      .slice(0, 7)
                      .map((day, index) => {

                        const dailyCode =
                          weather.daily.weather_code[index];

                        return (

                          <motion.div
                            key={day}
                            className="forecast-card"
                            whileHover={{
                              scale:1.04,
                            }}
                          >

                            <p>

                              {
                                new Intl.DateTimeFormat(
                                  "fr-FR",
                                  {
                                    weekday:"short",
                                    timeZone:
                                      timezone,
                                  }
                                ).format(
                                  new Date(day)
                                )
                              }

                            </p>

                            {
                              getWeatherIcon(
                                dailyCode,
                                "forecast-icon"
                              )
                            }

                            <strong>

                              {
                                convertTemp(
                                  weather.daily.temperature_2m_max[index]
                                )
                              }

                              {
                                unitSymbol()
                              }

                            </strong>

                            <span>

                              {" "} / {" "}

                              {
                                convertTemp(
                                  weather.daily.temperature_2m_min[index]
                                )
                              }

                              {
                                unitSymbol()
                              }

                            </span>

                          </motion.div>
                        );
                      })
                  }

                </div>

              </section>

            </>
          )
        }

      </section>

    </main>
  );
}

export default App;