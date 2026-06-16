/*
  0: 아무 일도 안 일어남
  1: 좋아요
  2: 싫어요
*/
let clickState = 0

const likeBtn = document.querySelector('#like-btn')
const dislikeBtn = document.querySelector('#dislike-btn')

likeBtn.addEventListener('click', (e) => {
  e.preventDefault()
  console.log('likebtn clicked')
})