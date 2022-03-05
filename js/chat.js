/* eslint-disable no-undef */
// 前端版面的JS
const socket = io('https://rocky-shelf-75930.herokuapp.com/') // 填寫要連接後端是伺服器網址

let userId // 當前使用者id
let userName // 當前使用者姓名

// HTML畫面元件
const loginName = document.querySelector('#loginName')
const loginWrap = document.querySelector('#login-wrap')
const chatWrap = document.querySelector('.chat-wrap')
const chatTitle = document.querySelector('#chat-title')
const chatCon = document.querySelector('.chat-con')
const sendtxt = document.querySelector('#sendtxt')

// socket事件監聽
// 登入成功
socket.on('loginSuccess', data => {
  console.log('登入成功回傳資料')
  userId = data.loginUserId
  userName = data.userName
  loginWrap.innerHTML = ''
  loginWrap.classList.remove('login-wrap')
  chatWrap.classList.remove('hide')
  data.messageData.forEach(i => {
    if (userId === i.userId) {
      chatCon.innerHTML += `
        <div class="chat-item item-right clearfix">
            <span class="abs uname">${i.User.name}</span>
            <span class="message fr">${i.message}</span>
            <span class="time-right">${i.createdAt}</span>
        </div>
      `
    } else {
      chatCon.innerHTML += `
        <div class="chat-item item-left clearfix rela">
            <span class="abs uname">${i.User.name}</span>
            <span class="fl message">${i.message}</span>
            <span class="time-left">${i.createdAt}</span>
        </div>
      `
    }
  })
  alert(`${userName}成功登入`)
})

// 登入失敗
socket.on('loginFail', data => {
  alert(data.message)
})

// 取得有人加入
socket.on('addUser', message => {
  console.log('有人登入')
  chatTitle.innerHTML = `目前上線人數${message.userNumber}人`
  chatCon.innerHTML += `<div>${message.message}</div>`
})

// 取得是否有人離開
socket.on('leave', message => {
  chatTitle.innerHTML = `目前上線人數${message.userNumber}人`
  chatCon.innerHTML += `<div>${message.message}</div>`
})

// 取得訊息
socket.on('receiveMessage', data => {
  if (userId === data.userId) {
    chatCon.innerHTML += `
      <div class="chat-item item-right clearfix">
        <span class="abs uname">${data.userId}</span>
        <span class="message fr">${data.message}</span>
      </div>
    `
  } else {
    chatCon.innerHTML += `
      <div class="chat-item item-left clearfix rela">
        <span class="abs uname">${data.userId}</span>
        <span class="fl message">${data.message}</span>
      </div>
    `
  }
})

socket.on('disconnect', (reason) => {
  console.log(reason)
})

// DOM事件操作
document.addEventListener('click', event => {
  const targe = event.target
  // 登入
  if (targe.matches('.login-btn')) {
    if (!loginName.value.trim()) {
      alert('請輸入Id')
    } else {
      socket.emit('login', loginName.value.trim())
    }
  }
  // 登出
  if (targe.matches('.leaveBtn')) {
    socket.emit('logout', userId)
    user = ''
    loginWrap.innerHTML = `
            <div class="login-con">
                <p>🍇</p>
                <span>Choose a great name</span>
                <input type="text" placeholder="Grape" id="loginName">
                <button class="login-btn">Start</button>
            </div>
        `
    loginWrap.classList.add('login-wrap')
    chatWrap.classList.add('hide')
    chatCon.innerHTML = ''
    alert('成功登出!!')
  }
  // 發送訊息
  if (targe.matches('.sendBtn') && sendtxt.value.trim()) {
    socket.emit('sendMessage', { userId, message: sendtxt.value.trim() })
    sendtxt.value = ''
  }
})
