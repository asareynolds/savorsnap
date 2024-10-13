const axios = require('axios');

const {together_api_key} = require('../config.json');

const getImage = async (description) => {
    try {
        const response = await axios.post('https://api.together.xyz/v1/images/generations', {
            model: 'black-forest-labs/FLUX.1-schnell-Free',
            prompt: description,
            width: 512,
            height: 512,
            steps: 1,
            n: 1
        }, {
            headers: {
                'Authorization': `Bearer ${together_api_key}`,
                'Content-Type': 'application/json'
            }
        });
    
        return response.data.data[0].url;
    } catch (error) {
        console.error('Error in getImage:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = {
    getImage,
};
