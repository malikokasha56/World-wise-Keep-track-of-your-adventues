import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

const BASE_URL = "http://localhost:8000";

const CitiesContext = createContext();

const initialState = {
  currentCity: {},
  cities: [],
  isLoading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "loadingToggle":
      return { ...state, isLoading: !state.isLoading };

    case "cityData":
      return { ...state, cities: action.payload };

    case "currentCityData":
      return { ...state, currentCity: action.payload };

    case "createCity":
      return {
        ...state,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };

    case "deleteCity":
      return { ...state, cities: action.payload, currentCity: {} };

    default:
      throw new Error("Unknown action performed");
  }
}

function CittiesProvider({ children }) {
  const [{ currentCity, cities, isLoading }, dispatch] = useReducer(
    reducer,
    initialState
  );
  // const [currentCity, setCurrentCity] = useState({});
  // const [cities, setCities] = useState([]);
  // const [isLoading, setisLoading] = useState(false);

  useEffect(function () {
    async function fetchCities() {
      try {
        dispatch({ type: "loadingToggle" });
        // setisLoading(true);
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        // setCities(data);
        dispatch({ type: "cityData", payload: data });
      } catch (error) {
        alert("There was an error while loading data of cities");
      } finally {
        dispatch({ type: "loadingToggle" });
        // setisLoading(false);
      }
    }

    fetchCities();
  }, []);

  const getCity = useCallback(
    () =>
      async function getCity(id) {
        if (Number(id) === currentCity.id) return;

        try {
          dispatch({ type: "loadingToggle" });
          // setisLoading(true);
          const res = await fetch(`${BASE_URL}/cities/${id}`);
          const data = await res.json();

          // setCurrentCity(data);
          dispatch({ type: "currentCityData", payload: data });
        } catch {
          console.error("Cities  data not found");
        } finally {
          // setisLoading(false);
          dispatch({ type: "loadingToggle" });
        }
      },
    [currentCity.id]
  );

  async function createCity(newCity) {
    try {
      // setisLoading(true);
      dispatch({ type: "loadingToggle" });
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log(data);
      // setCities((city) => [...city, data]);
      dispatch({ type: "createCity", payload: data });
    } catch {
      console.error("Some problem while uploading data");
    } finally {
      // setisLoading(false);
      dispatch({ type: "loadingToggle" });
    }
  }
  async function deleteCity(id) {
    try {
      // setisLoading(true);
      dispatch({ type: "loadingToggle" });
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      const updatedData = cities.filter((city) => city.id !== id);
      dispatch({ type: "deleteCity", payload: updatedData });
      // setCities((city) => city.filter((ele) => ele.id !== id));
    } catch {
      console.error("Some problem while deleting data");
    } finally {
      dispatch({ type: "loadingToggle" });
      // setisLoading(false);
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        getCity,
        currentCity,
        dispatch,
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
