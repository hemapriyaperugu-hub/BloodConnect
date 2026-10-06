// Backend URL
const API_URL =
    "https://bloodconnect-backend-xk8k.onrender.com/api/donors";


// Load dashboard when page opens
showDashboard();


// Get donors from database
async function showDashboard() {

    try {

        const response = await fetch(API_URL);

        const data = await response.json();

        const donors = data.donors;


        // Total donors
        document.getElementById("totalDonors").innerText =
            donors.length;


        // Available donors
        let available = 0;

        for (let i = 0; i < donors.length; i++) {

            if (donors[i].availability === "Available") {
                available++;
            }

        }

        document.getElementById("availableDonors").innerText =
            available;


        // Count blood groups
        const bloodGroups = [];

        for (let i = 0; i < donors.length; i++) {

            if (!bloodGroups.includes(donors[i].bloodGroup)) {
                bloodGroups.push(donors[i].bloodGroup);
            }

        }

        document.getElementById("bloodGroups").innerText =
            bloodGroups.length;


        // Count cities
        const cities = [];

        for (let i = 0; i < donors.length; i++) {

            if (!cities.includes(donors[i].city)) {
                cities.push(donors[i].city);
            }

        }

        document.getElementById("cities").innerText =
            cities.length;


        // Display donors
        displayDonors(donors);

    }
    catch (error) {

        console.error("Dashboard error:", error);

        document.getElementById("dashboardResults").innerHTML =
            "<p>Unable to load donors.</p>";

    }

}



// Display donor table
function displayDonors(donors) {

    const result =
        document.getElementById("dashboardResults");


    if (donors.length === 0) {

        result.innerHTML =
            "<p>No donors registered yet.</p>";

        return;

    }


    let table = `

        <table class="donor-table">

            <tr>

                <th>Name</th>

                <th>Age</th>

                <th>Blood Group</th>

                <th>City</th>

                <th>Phone Number</th>

                <th>Availability</th>

                <th>Action</th>

            </tr>

    `;


    for (let i = 0; i < donors.length; i++) {

        table += `

            <tr>

                <td>
                    ${donors[i].name}
                </td>

                <td>
                    ${donors[i].age}
                </td>

                <td>
                    ${donors[i].bloodGroup}
                </td>

                <td>
                    ${donors[i].city}
                </td>

                <td>

                    <a
                        href="tel:${donors[i].phone}"
                        class="call-button"
                    >
                        📞 ${donors[i].phone}
                    </a>

                </td>

                <td id="availability-${donors[i]._id}">

                    ${donors[i].availability}

                </td>

                <td>

                    <button
                        class="edit-button"
                        onclick="editAvailability(
                            '${donors[i]._id}',
                            '${donors[i].availability}'
                        )"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteDonor('${donors[i]._id}')"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `;

    }


    table += "</table>";

    result.innerHTML = table;

}



// Edit availability
function editAvailability(id, currentAvailability) {

    const cell =
        document.getElementById(
            `availability-${id}`
        );


    cell.innerHTML = `

        <select id="availability-select-${id}">

            <option value="Available"
                ${currentAvailability === "Available"
                    ? "selected"
                    : ""}>
                Available
            </option>

            <option value="Not Available"
                ${currentAvailability === "Not Available"
                    ? "selected"
                    : ""}>
                Not Available
            </option>

        </select>

        <br><br>

        <button
            class="save-button"
            onclick="saveAvailability('${id}')"
        >
            Save
        </button>

        <button
            class="cancel-button"
            onclick="showDashboard()"
        >
            Cancel
        </button>

    `;

}



// Save availability
async function saveAvailability(id) {

    const select =
        document.getElementById(
            `availability-select-${id}`
        );


    const newAvailability =
        select.value;


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        availability:
                            newAvailability
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to update availability."
            );

            return;

        }


        alert(
            "Availability updated successfully!"
        );


        // Reload dashboard
        showDashboard();

    }
    catch (error) {

        console.error(error);

        alert(
            "Unable to update availability."
        );

    }

}



// Delete donor
async function deleteDonor(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this donor?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete donor."
            );

            return;

        }


        alert(
            "Donor deleted successfully!"
        );


        // Reload dashboard
        showDashboard();

    }
    catch (error) {

        console.error(error);

        alert(
            "Unable to delete donor."
        );

    }

}