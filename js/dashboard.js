
const API_URL =
    "https://bloodconnect-backend-xk8k.onrender.com/api/donors";

let allDashboardDonors = [];

// Load dashboard when page opens
showDashboard();

// Load donors and update dashboard statistics
async function showDashboard() {
    const dashboardResults = document.getElementById("dashboardResults");

    dashboardResults.innerHTML =
        '<p class="no-results">Loading donors...</p>';

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok || !data.success) {
            dashboardResults.innerHTML =
                '<p class="no-results">Unable to load donors.</p>';
            return;
        }

        allDashboardDonors = Array.isArray(data.donors)
            ? data.donors
            : [];

        updateDashboardStatistics(allDashboardDonors);

        // Keep the current search after refreshing the data
        searchDashboard();
    } catch (error) {
        console.error("Error loading donors:", error);

        dashboardResults.innerHTML =
            '<p class="no-results">Unable to connect to the server.</p>';
    }
}

// Update statistics
function updateDashboardStatistics(donors) {
    document.getElementById("totalDonors").innerText =
        donors.length;

    document.getElementById("availableDonors").innerText =
        donors.filter(donor =>
            String(donor.availability || "").trim().toLowerCase() ===
            "available"
        ).length;

    document.getElementById("bloodGroups").innerText =
        new Set(
            donors.map(donor =>
                String(donor.bloodGroup || "").trim().toUpperCase()
            ).filter(Boolean)
        ).size;

    document.getElementById("cities").innerText =
        new Set(
            donors.map(donor =>
                String(donor.city || "").trim().toLowerCase()
            ).filter(Boolean)
        ).size;
}

// Search by name, phone number, city or blood group
function searchDashboard() {
    const searchInput = document.getElementById("dashboardSearch");

    if (!searchInput) return;

    const searchText = searchInput.value.trim().toLowerCase();

    const filteredDonors = allDashboardDonors.filter(donor => {
        const name = String(donor.name || "").toLowerCase();
        const phone = String(donor.phone || "").toLowerCase();
        const city = String(donor.city || "").toLowerCase();
        const bloodGroup = String(donor.bloodGroup || "").toLowerCase();

        return (
            name.includes(searchText) ||
            phone.includes(searchText) ||
            city.includes(searchText) ||
            bloodGroup.includes(searchText)
        );
    });

    displayDashboardSearchResults(filteredDonors);
}

// Clear search and show all donors
function clearDashboardSearch() {
    document.getElementById("dashboardSearch").value = "";
    displayDashboardSearchResults(allDashboardDonors);
}

// Escape text before inserting it into the table
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Display donor table for both full list and search results
function displayDashboardSearchResults(donors) {
    const dashboardResults =
        document.getElementById("dashboardResults");

    if (donors.length === 0) {
        dashboardResults.innerHTML = `
            <p class="no-results">
                No matching donors found. Try another name, phone number, city or blood group.
            </p>
        `;
        return;
    }

    let tableHTML = `
        <table class="donor-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Blood Group</th>
                    <th>City</th>
                    <th>Phone Number</th>
                    <th>Availability</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    donors.forEach(donor => {
        const id = escapeHTML(donor._id);
        const name = escapeHTML(donor.name || "Not provided");
        const age = escapeHTML(donor.age ?? "Not provided");
        const bloodGroup = escapeHTML(donor.bloodGroup || "Not provided");
        const city = escapeHTML(donor.city || "Not provided");
        const phone = String(donor.phone || "").trim();
        const availability = String(
            donor.availability || "Not specified"
        ).trim();

        const availabilityClass =
            availability.toLowerCase() === "available"
                ? "available"
                : "not-available";

        const phoneNumber = phone.replace(/[^\d+]/g, "");

        const phoneHTML = phone
            ? `<a class="call-button" href="tel:${escapeHTML(phoneNumber)}">📞 ${escapeHTML(phone)}</a>`
            : "Not provided";

        tableHTML += `
            <tr>
                <td>${name}</td>
                <td>${age}</td>
                <td>${bloodGroup}</td>
                <td>${city}</td>
                <td>${phoneHTML}</td>
                <td>
                    <span class="${availabilityClass}">
                        ${escapeHTML(availability)}
                    </span>
                </td>
                <td>
                    <button
                        class="edit-button"
                        onclick="editAvailability('${id}', '${escapeHTML(availability)}')"
                    >Edit</button>

                    <button
                        class="delete-button"
                        onclick="deleteDonor('${id}')"
                    >Delete</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    dashboardResults.innerHTML = tableHTML;
}

// Search when Enter is pressed
document.getElementById("dashboardSearch").addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Enter") {
            searchDashboard();
        }
    }
);

// Edit donor availability
async function editAvailability(donorId, currentAvailability) {
    const newAvailability = prompt(
        "Enter availability (Available / Not available):",
        currentAvailability
    );

    if (newAvailability === null || newAvailability.trim() === "") {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${donorId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                availability: newAvailability.trim()
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert("Donor availability updated successfully!");
            await showDashboard();
        } else {
            alert(data.message || "Failed to update availability.");
        }
    } catch (error) {
        console.error("Error updating availability:", error);
        alert("Unable to connect to the server.");
    }
}

// Delete donor
async function deleteDonor(donorId) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this donor?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/${donorId}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert("Donor deleted successfully!");
            await showDashboard();
        } else {
            alert(data.message || "Failed to delete donor.");
        }
    } catch (error) {
        console.error("Error deleting donor:", error);
        alert("Unable to connect to the server.");
    }
}
