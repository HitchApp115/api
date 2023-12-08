const crypto = require('crypto')
const degreesToRadians = (degrees) => {
    //console.log("degrees" + degrees)
    return degrees * (Math.PI / 180);
    
}

const radiansToDegrees = (rads) => {
    return rads / (Math.PI / 180)
}
const randomId = () => {
    return Math.floor(Math.random() * 10000000);
}

const loginHash = (username, time) => {
    const hash = crypto.createHash('sha256');
    hash.update(username + time);
    return hash.digest('hex');  
}

const passwordSalt = (username, password) => {
    console.log(username, password)
    const hash = crypto.createHash('sha256');
    hash.update(password)
    hash.update(username)
    return hash.digest('hex')
}

const verifyLoginHash = (loginHashMap, loginToken, currentDate) => {
    return new Date(loginHashMap[loginToken]?.expiry) >= currentDate
}

const getRoutesJSON = async (origin, destination) => {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin,
          destination,
          key: "AIzaSyDP9-25-Nle5WIbfouhwceH0Egiw8KgShA",
        },
      });

      return response
}

const getDist = async(origin, destination) => {
    console.log(origin, destination)
    let lat1, lon1, lat2, lon2, dLat, dLon
    lat1 = origin[0]
    lon1 = origin[1]
    
    lat2 = destination[0]
    lon2 = destination[1]
    //console.log(lat1, lon1, lat2, lon2)
    earthRadiusKm = 6371
    //console.log(lat1, lat2);
    dLat = degreesToRadians(lat2-lat1);
    dLon = degreesToRadians(lon2-lon1);
    
    lat1 = degreesToRadians(lat1);
    lat2 =  degreesToRadians(lat2);
  
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return earthRadiusKm * c;
}

function formatDateTime(inputDateTimeString) {
    const [datePart, timePart] = inputDateTimeString.split(', ');
    const [month, day, year] = datePart.split('/');
    const [time, meridiem] = timePart.split(' '); // Use U+202F as the separator
    const [hours, minutes, seconds] = time.split(':');
  
    let adjustedHours = parseInt(hours, 10);
    if (meridiem === 'PM' && adjustedHours !== 12) {
      adjustedHours += 12;
    }
    const formattedDateTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${adjustedHours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    return formattedDateTime;
  }
  

module.exports = {
    randomId,
    loginHash,
    passwordSalt,
    verifyLoginHash,
    getRoutesJSON,
    formatDateTime
}