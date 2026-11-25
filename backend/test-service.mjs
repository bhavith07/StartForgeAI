import { searchOpenStreetMapCompetitors } from "./services/osmCompetitorService.js";

try {
  console.time("Competitor search");

  const result = await searchOpenStreetMapCompetitors({
    industry: "restaurant",
    location: "Mangaluru, Karnataka",
    radius: 1000
  });

  console.timeEnd("Competitor search");

  console.log("Location:", result.location);
  console.log("Total businesses:", result.total);
  console.log("Businesses:", result.businesses);
} catch (error) {
  console.error("SERVICE TEST FAILED");
  console.error("Error:", error);
  console.error("Cause:", error.cause);
}


