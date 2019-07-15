var users = [];



const addUser = (userInfo) => {
    if (!userInfo.name || !userInfo.room || !userInfo.id){
        return {
            error: 'Username and room are required!'
        }
    }
    const id = userInfo.id
    const name = userInfo.name.trim().toLowerCase()
    const room = userInfo.room.trim().toLowerCase()

    const existingUser = users.find((user) => {
        return user.room === room && user.name === name
    })

    if (existingUser) {
        return {
            error: "Username is in use!"
        }
    }

    const newUser = {id, name, room}
    users.push(newUser)
    return {user: newUser}
}


const removeUser = (id) => {
    const index  = users.findIndex( user => user.id == id)
    if (index != -1 ){
        return users.splice(index, 1)[0]
    } else {
        return undefined
    }
}



const getUser = (id) => {
    return users.find(user => user.id == id)
}

const getUsersInRoom = (room) => {
    return users.filter( user => user.room == room)
}



module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

