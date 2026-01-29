// Date-related utility functions

function calculateAgeOnDate(birthDateText, futureDateText) {
    const birthDate = new Date(birthDateText); // e.g., '1990-05-15'
    const futureDate = new Date(futureDateText); // e.g., '2026-01-01'

    let age = futureDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = futureDate.getMonth() - birthDate.getMonth();

    // If the birthday hasn't happened yet in the future year, subtract 1
    if (monthDifference < 0 || (monthDifference === 0 && futureDate.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

exports.calculateAgeOnDate = calculateAgeOnDate;
