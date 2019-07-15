const socket = io()

//HTML elements...
const $div_messages = document.querySelector('#messages')
const $div_sidebar = document.querySelector('.chat__sidebar')

//Templates...
const msg_template = document.querySelector('#message_template').innerHTML
const location_template = document.querySelector('#location_template').innerHTML
const side_bar_template = document.querySelector('#side_bar_template').innerHTML

//Options...
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

//autoscroll logic

const autoscroll = () => {
    const newMessage = $div_messages.lastElementChild

    //height for new message...
    const computedStyle = getComputedStyle(newMessage)
    const marginHeight = parseInt(computedStyle.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + marginHeight

    //visible window height...
    const visibleHeight = $div_messages.offsetHeight

    //total height...
    const totalHeight = $div_messages.scrollHeight

    const scrollOffset = $div_messages.scrollTop + visibleHeight

    if (totalHeight - newMessageHeight <= scrollOffset) {
        $div_messages.scrollTop = totalHeight
    }



}

socket.on('messages', (message) => {
    console.log(message);
    const html = Mustache.render(msg_template, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username
    })  
    $div_messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


document.querySelector('#send_message')
.addEventListener('submit', (e) => {
    e.preventDefault()
    const message = e.target.elements.message.value
    if (message.length < 1){return}
    e.target.elements.message.value = ""
    e.target.elements.message.focus()
    socket.emit('send_message',message, (msg) => {
        console.log("acknowledge event received....", msg);
    })
})
var googleAPI = `https://google.com/maps?q=0,0`
document.querySelector('#send_location')
.addEventListener('click', (e) => {
    e.preventDefault()
    const sendLocationButton = e.target
    sendLocationButton.disabled = true;
    if (!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((pos) => {
        const coords = pos.coords
        const location = {
            lat: coords.latitude,
            long: coords.longitude
        }
        socket.emit('send_location',location, (serverCheck) => {
            console.log(serverCheck);
        })
        e.target.disabled = false;
    })
})

socket.on('send_locationURL', (loc) => {
    const html = Mustache.render(location_template, {
        url: loc.url,
        createdAt: moment(loc.createdAt).format('h:mm a'),
        username: loc.username
    })
    $div_messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('room_data', (data) => {    
    const html = Mustache.render(side_bar_template, { room: data.room, users: data.users })
    $div_sidebar.innerHTML = html
})


socket.emit('join',{username, room}, (error) => {
    if (error) { 
        alert(error)
        location.href = '/'
    }
})
