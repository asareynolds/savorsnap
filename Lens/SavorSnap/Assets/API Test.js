// JavaScript
async function testApiCall() {
    const url = 'https://api.savorsnap.one';
    
    try {
        const response = await fetch(url, {
            method: 'GET', // Change to 'POST', 'PUT', etc. as needed
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers here
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
    } catch (error) {
        console.error('Error during API call:', error);
    }
}

testApiCall();