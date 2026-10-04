
// Load dashboard when page opens
showDashboard();


// Get donors from database
async function showDashboard() {

    try {

        let response = await fetch("http://localhost:5000/api/donors");

        let data = await response.json();

        let donors = data.donors;


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
        let bloodGroups = [];

        for (let i = 0; i < donors.length; i++) {

            if (!bloodGroups.includes(donors[i].bloodGroup)) {
                bloodGroups.push(donors[i].bloodGroup);
            }

        }

        document.getElementById("bloodGroups").innerText =
            bloodGroups.length;


        // Count cities
        let cities = [];

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

        console.log(error);

        document.getElementById("dashboardResults").innerHTML =
            "<p>Unable to load donors.</p>";

    }

}


// Display donor table
function displayDonors(donors) {

    let result =
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
                <th>Availability</th>
            </tr>
    `;


    for (let i = 0; i < donors.length; i++) {

        table += `
            <tr>

                <td>${donors[i].name}</td>

                <td>${donors[i].age}</td>

                <td>${donors[i].bloodGroup}</td>

                <td>${donors[i].city}</td>

                <td>${donors[i].availability}</td>

            </tr>
        `;

    }


    table += "</table>";

    result.innerHTML = table;

}
