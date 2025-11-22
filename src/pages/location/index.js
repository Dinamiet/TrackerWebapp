import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import crypto from 'crypto';
import Constant from "./constants";

// Dynamically import react-leaflet components with SSR disabled
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const decrypt = (ivString, keyString, data) => {
  try {
    const hash = (h) => {
      const hash = crypto.createHash('sha256');
      hash.update(h);
      return hash.digest();
    };

    // Example usage
    const iv = hash(ivString).slice(0, 16);
    const key = hash(keyString);

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(false);
    let decrypted = decipher.update(data);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    console.log("Decrypted:", decrypted.toString());
    const descryptedString = decrypted.toString();
    return JSON.parse(descryptedString.substring(0, descryptedString.lastIndexOf('}') + 1));
  } catch (error) {
    return { lat: 0, lng: 0 }; // Return a default location on error
  }
};

const Location = () => {
  const router = useRouter();
  const { name } = router.query;

  const [customIcon, setCustomIcon] = useState(null);
  const [key, setKey] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0 }); // Default location

  useEffect(() => {
    // Dynamically import Leaflet to create a custom icon
    const loadCustomIcon = async () => {
      const L = await import("leaflet");
      const icon = new L.Icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconSize: [25, 41], // Default size
        iconAnchor: [12, 41], // Anchor point
        popupAnchor: [1, -34], // Popup position
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41], // Shadow size
      });
      setCustomIcon(icon);
    };

    loadCustomIcon();
  }, []);

  useEffect(() => {
    let intervalID;
    // Fetch location data from an API
    const fetchLocation = async () => {
      try {
        const response = await fetch(`/api/location?name=${name}`);
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setLocation(decrypt(Constant.IV, key, Buffer.from(data.data)));
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };

    if (name) {
      fetchLocation();
      intervalID = setInterval(fetchLocation, 1000);
    }

    return () => {
      if (intervalID)
        clearInterval(intervalID);
    };
  }, [key, name]);

  return (
    <div className="center-container">
      <div>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <button />
      </div>
      <div style={{ width: "100%", height: "90vh" }}>
        <MapContainer
          center={[location.lat, location.lng]} // Default center (latitude, longitude)
          zoom={13} // Default zoom level
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {customIcon && (
            <Marker position={[location.lat, location.lng]} icon={customIcon}>
              <Popup>{name}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Location;
