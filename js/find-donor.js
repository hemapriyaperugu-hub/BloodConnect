
// Load all donors when page opens
displayDonors();


async function displayDonors() {

    let result = document.getElementById("donorResults");


    try {

        let response =
            await fetch("http://localhost:5000/api/donors");

        let data = await response.json();


        if (!response.ok || !data.success) {

            result.innerHTML =
                "<p>Unable to load donors.</p>";

            return;

        }


        let donors = data.donors;


        if (donors.length === 0) {

            result.innerHTML =
                "<p>No donors registered yet.</p>";

            return;

        }


        displayDonorTable(donors);

    }
    catch (error) {

        console.log(error);

        result.innerHTML =
            "<p>Unable to connect to the server.</p>";

    }

}


// Search donors
async function searchDonors() {

    let selectedBloodGroup =
        document.getElementById("bloodGroup").value.trim().toLowerCase();

    let enteredCity =
        document.getElementById("city").value.trim().toLowerCase();

    let result =
        document.getElementById("donorResults");


    try {

        // Get donors from database
        let response =
            await fetch("http://localhost:5000/api/donors");

        let data = await response.json();


        if (!response.ok || !data.success) {

            result.innerHTML =
                "<p>Unable to load donors.</p>";

            return;

        }


        let donors = data.donors;


        // Filter donors
        let foundDonors = donors.filter(function(donor) {

            let donorBloodGroup =
                donor.bloodGroup.trim().toLowerCase();

            let donorCity =
                donor.city.trim().toLowerCase();


            let bloodMatches =
                selectedBloodGroup === "" ||
                donorBloodGroup === selectedBloodGroup;


            let cityMatches =
                enteredCity === "" ||
                donorCity === enteredCity;


            return bloodMatches && cityMatches;

        });


        if (foundDonors.length === 0) {

            result.innerHTML =
                "<p>No matching donors found.</p>";

            return;

        }


        displayDonorTable(foundDonors);

    }
    catch (error) {

        console.log(error);

        result.innerHTML =
            "<p>Unable to connect to the server.</p>";

    }

}


// Display donor table
function displayDonorTable(donors) {

    let result =
        document.getElementById("donorResults");


    let table = `
        <table class="donor-table">

            <tr>
                <th>Name</th>
                <th>Blood Group</th>
                <th>City</th>
                <th>Availability</th>
            </tr>
    `;


    for (let i = 0; i < donors.length; i++) {

        table += `
            <tr>

                <td>${donors[i].name}</td>

                <td>${donors[i].bloodGroup}</td>

                <td>${donors[i].city}</td>

                <td>${donors[i].availability}</td>

            </tr>
        `;

    }


    table += "</table>";

    result.innerHTML = table;

}
