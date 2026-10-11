
function normalizeCity(city) {
    return String(city || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

function getCityName(city) {
    return String(city || "").split(",")[0].trim();
}

function getCachedCoordinates(city) {
    try {
        const key = "bloodConnectGeo_" + normalizeCity(city);
        const cached = localStorage.getItem(key);

        if (!cached) return null;

        const entry = JSON.parse(cached);
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        if (Date.now() - entry.savedAt > thirtyDays) {
            localStorage.removeItem(key);
            return null;
        }

        return entry.coordinates;
    } catch {
        return null;
    }
}

function saveCachedCoordinates(city, coordinates) {
    try {
        localStorage.setItem(
            "bloodConnectGeo_" + normalizeCity(city),
            JSON.stringify({
                coordinates,
                savedAt: Date.now()
            })
        );
    } catch {
        // Search still works if local storage is unavailable.
    }
}

function scoreLocation(place, requestedCity, requestedState) {
    const name = normalizeCity(place.name);
    const state = normalizeCity(place.state || place.admin1 || "");
    const city = normalizeCity(requestedCity);
    const wantedState = normalizeCity(requestedState);

    let score = 0;

    if (name === city) score += 100;
    else if (name.includes(city) || city.includes(name)) score += 30;

    if (wantedState && state === wantedState) score += 80;
    else if (wantedState && state.includes(wantedState)) score += 40;

    if (place.country_code === "IN" ||
        normalizeCity(place.country) === "india") {
        score += 50;
    }

    return score;
}

async function getCityCoordinates(city) {
    const query = String(city || "").trim();

    if (!query) return null;

    const cached = getCachedCoordinates(query);
    if (cached) return cached;

    const parts = query.split(",").map(part => part.trim());
    const requestedCity = parts[0];
    const requestedState = parts.length > 1 ? parts[1] : "";

    // Try Photon first, passing the complete location query.
    try {
        const url = new URL("https://photon.komoot.io/api/");
        url.searchParams.set("q", query);
        url.searchParams.set("limit", "10");
        url.searchParams.set("lang", "en");

        const response = await fetch(url);

        if (response.ok) {
            const data = await response.json();

            const places = (data.features || [])
                .map(feature => {
                    const p = feature.properties || {};
                    const coordinates = feature.geometry?.coordinates;

                    if (!coordinates || coordinates.length < 2) {
                        return null;
                    }

                    return {
                        name: p.name || p.city || "",
                        state: p.state || "",
                        country: p.country || "",
                        latitude: coordinates[1],
                        longitude: coordinates[0],
                        score: scoreLocation(
                            {
                                name: p.name || p.city || "",
                                state: p.state || "",
                                country: p.country || "",
                                country_code: p.countrycode || p.country_code
                            },
                            requestedCity,
                            requestedState
                        )
                    };
                })
                .filter(place =>
                    place &&
                    normalizeCity(place.country) === "india"
                )
                .sort((a, b) => b.score - a.score);

            if (places.length > 0 && places[0].score >= 50) {
                const coordinates = {
                    latitude: places[0].latitude,
                    longitude: places[0].longitude
                };

                saveCachedCoordinates(query, coordinates);
                return coordinates;
            }
        }
    } catch (error) {
        console.warn("Photon lookup failed; trying Open-Meteo.", error);
    }

    // Fallback to Open-Meteo.
    try {
        const url = new URL(
            "https://geocoding-api.open-meteo.com/v1/search"
        );

        url.searchParams.set("name", requestedCity);
        url.searchParams.set("count", "10");
        url.searchParams.set("language", "en");
        url.searchParams.set("format", "json");

        const response = await fetch(url);

        if (!response.ok) return null;

        const data = await response.json();

        const places = (data.results || [])
            .filter(place => place.country_code === "IN")
            .map(place => ({
                name: place.name,
                state: place.admin1 || "",
                country: "India",
                latitude: place.latitude,
                longitude: place.longitude,
                score: scoreLocation(
                    {
                        name: place.name,
                        state: place.admin1,
                        country: "India",
                        country_code: "IN"
                    },
                    requestedCity,
                    requestedState
                )
            }))
            .sort((a, b) => b.score - a.score);

        if (places.length === 0 || places[0].score < 50) {
            return null;
        }

        const coordinates = {
            latitude: places[0].latitude,
            longitude: places[0].longitude
        };

        saveCachedCoordinates(query, coordinates);
        return coordinates;
    } catch (error) {
        console.error("Location lookup failed:", error);
        return null;
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371;
    const toRadians = degrees => degrees * Math.PI / 180;

    const latitudeDifference = toRadians(lat2 - lat1);
    const longitudeDifference = toRadians(lon2 - lon1);

    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(longitudeDifference / 2) ** 2;

    return earthRadius * 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );
}


// Load donors from the shared database
async function getDonors() {
    const response = await fetch(
        "https://bloodconnect-backend-xk8k.onrender.com/api/donors"
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error("Unable to load donors");
    }

    return Array.isArray(data.donors) ? data.donors : [];
}


// Display all registered donors when the page opens
async function displayDonors() {
    const result = document.getElementById("donorResults");

    try {
        const donors = await getDonors();

        if (donors.length === 0) {
            result.innerHTML = "<p>No donors registered yet.</p>";
            return;
        }

        displayDonorTable(donors);
    } catch (error) {
        console.error(error);
        result.innerHTML =
            "<p>Unable to load donors. Please refresh and try again.</p>";
    }
}


// Search by blood group and optional location
async function searchDonors() {
    const selectedBloodGroup = document
        .getElementById("bloodGroup").value.trim().toLowerCase();

    const enteredCity = document
        .getElementById("city").value.trim();

    const result = document.getElementById("donorResults");
    result.innerHTML = "<p>Searching for donors...</p>";

    try {
        const donors = await getDonors();

        const matchingDonors = donors.filter(donor =>
            !selectedBloodGroup ||
            String(donor.bloodGroup || "").trim().toLowerCase() ===
                selectedBloodGroup
        );

        if (!enteredCity) {
            displayDonorTable(matchingDonors);
            return;
        }

        result.innerHTML = "<p>Finding nearby donors...</p>";

        const searchCoordinates = await getCityCoordinates(enteredCity);

        if (!searchCoordinates) {
            result.innerHTML =
                "<p>We couldn't identify that location. Try adding the state name.</p>";
            return;
        }

        const nearbyDonors = [];

        // Calculate each donor's distance from their recorded city.
        for (const donor of matchingDonors) {
            if (!donor.city) continue;

            const donorCoordinates =
                await getCityCoordinates(donor.city);

            if (!donorCoordinates) continue;

            const distance = calculateDistance(
                searchCoordinates.latitude,
                searchCoordinates.longitude,
                donorCoordinates.latitude,
                donorCoordinates.longitude
            );

            if (distance <= 35) {
                nearbyDonors.push({ donor, distance });
            }
        }

        nearbyDonors.sort((a, b) => a.distance - b.distance);

        if (nearbyDonors.length === 0) {
            result.innerHTML =
                "<p>No matching donors were found within 35 km.</p>";
            return;
        }

        displayDonorTable(
            nearbyDonors.map(item => item.donor),
            nearbyDonors
        );
    } catch (error) {
        console.error(error);
        result.innerHTML =
            "<p>Unable to complete the search. Please try again.</p>";
    }
}


// Escape text before inserting database values into HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


// Display donors with clickable phone numbers and optional distances
function displayDonorTable(donors, nearbyDonors = null) {
    const result = document.getElementById("donorResults");

    if (!donors.length) {
        result.innerHTML = "<p>No matching donors found.</p>";
        return;
    }

    let table = `
        <table class="donor-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Blood Group</th>
                    <th>City</th>
                    <th>Phone Number</th>
                    <th>Availability</th>
                    ${nearbyDonors ? "<th>Approx. Distance</th>" : ""}
                </tr>
            </thead>
            <tbody>
    `;

    donors.forEach((donor, index) => {
        const name = escapeHTML(donor.name || "Not provided");
        const bloodGroup = escapeHTML(donor.bloodGroup || "Not provided");
        const city = escapeHTML(donor.city || "Not provided");
        const availability = escapeHTML(donor.availability || "Not specified");

        const phone = String(donor.phone || "").trim();
        const telephoneNumber = phone.replace(/[^\d+]/g, "");

        const phoneDisplay =
            telephoneNumber && /\d/.test(telephoneNumber)
                ? `<a href="tel:${escapeHTML(telephoneNumber)}">${escapeHTML(phone)}</a>`
                : "Not provided";

        const distanceColumn = nearbyDonors
            ? `<td>${nearbyDonors[index].distance.toFixed(1)} km</td>`
            : "";

        table += `
            <tr>
                <td>${name}</td>
                <td>${bloodGroup}</td>
                <td>${city}</td>
                <td>${phoneDisplay}</td>
                <td>${availability}</td>
                ${distanceColumn}
            </tr>
        `;
    });

    table += "</tbody></table>";
    result.innerHTML = table;
}


// Automatically load donors when the page opens
displayDonors();
