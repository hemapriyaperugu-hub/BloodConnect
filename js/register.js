

let donorForm = document.getElementById("donorForm");
donorForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    let name = document.getElementById("name").value.trim();

    let age = document.getElementById("age").value;

    let gender = document.getElementById("gender").value;

    let bloodGroup = document.getElementById("bloodGroup").value;

    let phone = document.getElementById("phone").value.trim();

    let email = document.getElementById("email").value.trim();

    let city = document.getElementById("city").value.trim();

    let lastDonation = document.getElementById("lastDonation").value;

    let availability = document.getElementById("availability").value;


    if (
        name === "" ||
        age === "" ||
        gender === "" ||
        bloodGroup === "" ||
        phone === "" ||
        email === "" ||
        city === "" ||
        availability === ""
    ) {

        alert("Please fill all required fields.");

        return;
    }


    if (age < 18 || age > 65) {

        alert("Age must be between 18 and 65.");

        return;
    }


    let phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(phone)) {

        alert("Please enter a valid 10-digit phone number.");

        return;
    }


    let donor = {

        name: name,

        age: Number(age),

        gender: gender,

        bloodGroup: bloodGroup,

        phone: phone,

        email: email,

        city: city,

        lastDonation: lastDonation,

        availability: availability

    };


    try {

        let response = await fetch("http://localhost:5000/api/donors", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(donor)

        });


        let result = await response.json();

        if (response.ok && result.success) {

            alert("Donor registered successfully!");


            donorForm.reset();

            window.location.href = "dashboard.html";

        } else {

            alert("Failed to register donor. Please try again.");

        }

    } catch (error) {

        console.error("Registration error:", error);

        alert("Unable to connect to the BloodConnect server.");

    }

});
