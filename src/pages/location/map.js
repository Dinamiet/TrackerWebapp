'use client'

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useMap, MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

// const { useMap, MapContainer, TileLayer, Marker, Popup } = dynamic(() => import("react-leaflet"), { ssr: false });

const Updater = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      // map.flyTo(position, Math.round(map.getZoom()), { duration: 1 });
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
};

const Map = ({ name, position }) => {

  const [isMounted, setIsMounted] = useState(false);
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    // Dynamically import Leaflet to create a custom icon
    const loadIcon = async () => {
      const L = await import("leaflet");
      const newIcon = new L.Icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconSize: [25, 41], // Default size
        iconAnchor: [12, 41], // Anchor point
        popupAnchor: [1, -34], // Popup position
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41], // Shadow size
      });
      setIcon(newIcon);
    };

    loadIcon();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted)
    return (
      <div />
    );

  return (
    <MapContainer
      key="static-map"
      center={[0, 0]} // Default center (latitude, longitude)
      zoom={16} // Default zoom level
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} icon={icon}>
        <Popup>{name}</Popup>
      </Marker>
      <Updater position={position} />
    </MapContainer>
  );
};

export default Map;
