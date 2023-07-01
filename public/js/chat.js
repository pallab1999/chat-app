const socket=io()

//Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//options
//parse the query string from the url
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

//autoscrolling

const autoscroll=()=>{
    //new message element
    const $newMessage=$messages.lastElementChild

    //height of the new message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

    //visible height
    const visibleHeight=$messages.offsetHeight

    //height of messages container
    const containerHeight=$messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset=$messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }

}


socket.on('message',(message)=>{
    console.log(message)
    //mustache render the message
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    //Where the message is rendered
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

//Send location
socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

//rendering all the users of a particular room
socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

//event acknowledgement
//server(emit)->client(receive)--acknowledgement-->server(Tell the server that the process is done)
//client(emit)->server(recieve)--acknowledgement-->client(Tell the client that the process is done)

////server sends some information to the client.It is connected with socket.emit.(socket.on listen to other)
// socket.on('countUpdated',(count)=>{
//     console.log('The count has been updated.',count)
// })


//Do something with button in index.html
// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('Clicked')
//     //Do something by the client
//     //socket.emit send to other
//     socket.emit('increment')
// })

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    //disable the button
    const message=e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{   

         //event acknowledgement=>client sends the message to server and gets a message that the process is done
         $messageFormButton.removeAttribute('disabled')
         //enable
         $messageFormInput.value=''
         $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})

//geo-location sharing
$sendLocationButton.addEventListener('click',()=>{

    if(!navigator.geolocation){
        return alert('Geo location is not supported by your browser.')
    }
    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)

        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})







