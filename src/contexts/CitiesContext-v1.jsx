import { createContext, useContext, useEffect, useState } from "react";

const BASE_URL = "http://localhost:8000";

const CitiesContext = createContext();

function CittiesProvider({ children }) {
  const [currentCity, setCurrentCity] = useState({});

  const [cities, setCities] = useState([]);
  const [isLoading, setisLoading] = useState(false);

  useEffect(function () {
    async function fetchCities() {
      try {
        setisLoading(true);
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        setCities(data);
      } catch (error) {
        alert("There was an error while loading data of cities");
      } finally {
        setisLoading(false);
      }
    }

    fetchCities();
  }, []);

  async function getCity(id) {
    try {
      setisLoading(true);
      const res = await fetch(`${BASE_URL}/cities/${id}`);
      const data = await res.json();
      setCurrentCity(data);
      setisLoading(false);
    } catch {
      console.error("Cities  data not found");
    }
  }
  async function createCity(newCity) {
    try {
      setisLoading(true);
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log(data);
      setCities((city) => [...city, data]);
    } catch {
      console.error("Some problem while uploading data");
    } finally {
      setisLoading(false);
    }
  }
  async function deleteCity(id) {
    try {
      setisLoading(true);
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      setCities((city) => city.filter((ele) => ele.id !== id));
    } catch {
      console.error("Some problem while deleting data");
    } finally {
      setisLoading(false);
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        getCity,
        currentCity,
        setCities,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("Cities Context is used out of its provider");
  return context;
}

export { CittiesProvider, useCities };
