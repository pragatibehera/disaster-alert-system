import MapView from "@/components/MapView";

export default function MapPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Disaster Alert Map</h1>
      <MapView />
    </div>
  );
}
