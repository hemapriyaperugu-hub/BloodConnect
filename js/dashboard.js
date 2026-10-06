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

        if (!data.success) {
            console.log("Failed to load donors");
            return;
        }

        const donors = data.donors;

        const dashboardResults =
            document.getElementById("dashboardResults");


        // Dashboard statistics

        document.getElementById("totalDonors").innerText =
            donors.length;


        const availableDonors =
            donors.filter(
                donor =>
                    donor.availability.toLowerCase() === "available"
            );

        document.getElementById("availableDonors").innerText =
            availableDonors.length;


        const bloodGroups =
            [...new Set(
                donors.map(donor => donor.bloodGroup)
            )];

        document.getElementById("bloodGroups").innerText =
            bloodGroups.length;


        const cities =
            [...new Set(
                donors.map(donor => donor.city)
            )];

        document.getElementById("cities").innerText =
            cities.length;


        // If no donors

        if (donors.length === 0) {

            dashboardResults.innerHTML = `
                <p class="no-results">
                    No donors registered yet.
                </p>
            `;

            return;
        }


        // Create donor table

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


        for (let i = 0; i < donors.length; i++) {

            const donor = donors[i];

            tableHTML += `

                <tr>

                    <td>
                        ${donor.name}
                    </td>

                    <td>
                        ${donor.age}
                    </td>

                    <td>
                        ${donor.bloodGroup}
                    </td>

                    <td>
                        ${donor.city}
                    </td>

                    <td>

                        <a
                            href="tel:${donor.phone}"
                            class="call-button"
                        >
                            📞 ${donor.phone}
                        </a>

                    </td>

                    <td>
                        ${donor.availability}
                    </td>

                    <td>

                        <button
                            class="edit-button"
                            onclick="editAvailability(
                                '${donor._id}',
                                '${donor.availability}'
                            )"
                        >
                            Edit
                        </button>


                        <button
                            class="delete-button"
                            onclick="deleteDonor(
                                '${donor._id}'
                            )"
                        >
                            Delete
                        </button>

                    </td>

                </tr>

            `;
        }


        tableHTML += `

                </tbody>

            </table>

        `;


        dashboardResults.innerHTML =
            tableHTML;

    }

    catch (error) {

        console.error(
            "Error loading donors:",
            error
        );

    }

}



// Edit donor availability
async function editAvailability(
    donorId,
    currentAvailability
) {

    const newAvailability =
        prompt(
            "Enter availability (Available / Not Available):",
            currentAvailability
        );


    if (!newAvailability) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${donorId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        availability: newAvailability
                    })
                }
            );


        const data =
            await response.json();


        if (data.success) {

            alert(
                "Donor availability updated successfully!"
            );

            showDashboard();

        }

        else {

            alert(
                data.message ||
                "Failed to update availability"
            );

        }

    }

    catch (error) {

        console.error(error);

        alert(
            "Something went wrong"
        );

    }

}



// Delete donor
async function deleteDonor(donorId) {

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
                `${API_URL}/${donorId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (data.success) {

            alert(
                "Donor deleted successfully!"
            );

            showDashboard();

        }

        else {

            alert(
                data.message ||
                "Failed to delete donor"
            );

        }

    }

    catch (error) {

        console.error(error);

        alert(
            "Something went wrong"
        );

    }

}