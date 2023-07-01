const users=[]

//addUser,removeUser,getUser,getUsersInRoom


//addUser take 3 parameters 1.id->given by socket.io 2.username 3.room
const addUser=({id,username,room})=>{
    //clean the data
    //trim() for removing the space
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //validate the data
    if(!username||!room){
        return {
            error:'Username and room are required!'
        }
    }

    //check for existing user
    const existingUser=users.find((user)=>{
        return user.room===room && user.username===username
    })

    //validate username
    if(existingUser){
        return {
            error:'Same username in one room is not allowed!'
        }
    }

    //store user
    const user={id,username,room}
    users.push(user)
    return {user}
}


//remove the user
const removeUser=(id)=>{
    const index=users.findIndex((user)=>user.id===id)
    if(index!==-1){
        //.splice is used to remove an element by their index and return an array
        return users.splice(index,1)[0]
    }
}

//get the user
const getUser=(id)=>{
    return users.find((user)=>user.id===id)

}

//get the all users of a particular room
const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase()
    return users.filter((user)=>user.room===room)
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
