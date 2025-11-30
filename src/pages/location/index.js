import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Constant from "./../../constants";
import decrypt from "./../../decryption";

const Map = dynamic(() => import("./map"), { ssr: false });

const Location = () => {
  const router = useRouter();
  const { name } = router.query;

  const [key, setKey] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0 }); // Default location
  const [time, setTime] = useState(null);

  useEffect(() => {
    let intervalID;
    // Fetch location data from an API
    const fetchLocation = async () => {
      try {
        const response = await fetch(`/api/location?name=${name}`);
        if (!response.ok) {
          return;
        }
        const rawData = await response.json();
        const data = decrypt(Constant.IV, key, Buffer.from(rawData.data));
        if (Object.hasOwn(data, 'lat') && Object.hasOwn(data, 'lng'))
          setLocation(data);
        if (Object.hasOwn(data, 'time')) {
          const date = new Date(data.time * 1000);
          setTime(date.toLocaleString());
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };

    if (name) {
      fetchLocation();
      intervalID = setInterval(fetchLocation, 2500);
    }

    return () => {
      if (intervalID)
        clearInterval(intervalID);
    };
  }, [key, name]);

  return (
    <div className="center-container">
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
      <label>{time}</label>
      <div style={{ width: "100%", height: "90vh" }}>
        <Map name={name} position={location} />
      </div>
    </div>
  );
};

export default Location;
