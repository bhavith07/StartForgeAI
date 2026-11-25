const tests = [
  {
    name: "Nominatim",
    url: "https://nominatim.openstreetmap.org/search?q=Bengaluru%2C%20Karnataka&format=jsonv2&limit=1",
    options: {
      headers: {
        "User-Agent": "StartForgeAI/1.0 (competitor research)",
        "Accept": "application/json"
      }
    }
  },
  {
    name: "Overpass",
    url: "https://overpass-api.de/api/interpreter",
    options: {
      method: "POST",
      headers: {
        "User-Agent": "StartForgeAI/1.0 (competitor research)",
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        data: '[out:json][timeout:20];node(around:1000,12.9767936,77.5900820)["amenity"="restaurant"]["name"];out 20;'
      })
    }
  }
];

for (const test of tests) {
  console.log("\nTesting:", test.name);

  try {
    const response = await fetch(test.url, {
      ...test.options,
      signal: AbortSignal.timeout(40000)
    });

    console.log("HTTP status:", response.status);

    const data = await response.json();
    console.log("Success:", test.name);
    console.log("Results:", data.elements?.length ?? data.length ?? "Response received");
  } catch (error) {
    console.log("Failed:", test.name);
    console.log("Error name:", error.name);
    console.log("Error message:", error.message);
    console.log("Cause:", error.cause);
  }
}
