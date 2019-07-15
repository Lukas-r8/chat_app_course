const generateMSG = (username, text) => {
    return {
        text,
        createdAt: new Date().getTime(),
        username
    }
}

const generateLocMSG = (username, url) => {
    return {
        url,
        createdAt: new Date().getTime(),
        username
    }
}



module.exports = {generateMSG, generateLocMSG}