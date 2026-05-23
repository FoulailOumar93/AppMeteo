import { useEffect, useState } from "react";

import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiThunderstorm,
  WiSnow,
  WiFog,
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

  const [toast, setToast] =
    useState("");

  /* =========================================================
     TOAST
  ========================================================= */

  function showToast(message) {

    setToast(message);

    setTimeout(() => {

      setToast("");

    }, 2500);
  }

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

      const weatherResponse =
        await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );

      const weatherData =
        await weatherResponse.json();

      setWeather(
        weatherData
      );

      setPlace({
        name:
          location.name,
        country:
          location.country,
      });

      setTimezone(
        weatherData.timezone
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
     POSITION
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
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
            );

          const weatherData =
            await weatherResponse.json();

          let cityName =
            "Ta position";

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

          } catch (err) {

            console.log(err);
          }

          setWeather(
            weatherData
          );

          setPlace({
            name:
              cityName,
            country:
              countryName,
          });

          setTimezone(
            weatherData.timezone
          );

          setInput(
            cityName
          );

          showToast(
            `📍 Tu es à ${cityName}`
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

      showToast(
        "Déjà dans les favoris ⭐"
      );

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

    showToast(
      `${place.name} ajouté aux favoris ⭐`
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

    showToast(
      `${cityName} retiré des favoris`
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

      {
        toast && (

          <div className="toast-message">

            {toast}

          </div>
        )
      }

    </main>
  );
}

export default App;