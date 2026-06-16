/*
  0: 아무 일도 안 일어남
  1: 좋아요
  2: 싫어요
*/
let clickState = 0

const likeBtn = document.getElementById('like-btn')
const dislikeBtn = document.getElementById('dislike-btn')

const currentPageUrl = window.location.href
const diaryId = currentPageUrl.split('/').pop()

let likesCount = Number(likeBtn.dataset.likesCount)
let dislikesCount = Number(likeBtn.dataset.dislikesCount)

const ratingHandler = (status = clickState, change) => {
  if (status === 0) {
    if (change === 1) {
      likesCount++
      clickState = 1
    } else {
      dislikesCount++
      clickState = 2
    }
  } else if (status === 1) {
    if (change === 1) {
      likesCount--
      clickState = 0
    } else {
      likesCount--
      dislikesCount++
      clickState = 2
    }
  } else {
    if (change === 1) {
      dislikesCount--
      likesCount++
      clickState = 1
    } else {
      dislikesCount--
      clickState = 0
    }
  }

  return updateRatingStatus()
}

const updateRatingStatus = () => {
  likeBtn.textContent = '좋아요: ' + likesCount
  dislikeBtn.textContent = '싫어요: ' + dislikesCount
}

likeBtn.addEventListener('click', async (e) => {
  e.preventDefault()

  try {
    const response = await fetch(`http://localhost:8787/api/diary/v1/rating?diary=${diaryId}&rating=like`, {
      method: 'GET',
    })

    if (!response.ok) {
      return console.error(response.body, response.status)
    }

    // { success: true }
    const data = await response.json()

    if ((!'success') in data && (!'do') in data) {
      return console.error('data 형식 잘못됨')
    }

    switch (data.do) {
      case 'R-N-EQ-U':
        ratingHandler(2)
        break
      case 'R-EQ-D':
        ratingHandler(0)
        break
      case 'N-R-I':
        ratingHandler(1)
        break
    }
  } catch (e) {
    return console.error('fetch err: ', e)
  }
})

dislikeBtn.addEventListener('click', async (e) => {
  e.preventDefault()

  try {
    const response = await fetch(`http://localhost:8787/api/diary/v1/rating?diary=${diaryId}&rating=dislike`, {
      method: 'GET',
    })

    if (!response.ok) {
      return console.error(response.body, response.status)
    }

    const data = await response.json()

    if ((!'success') in data && (!'do') in data) {
      return console.error('data 형식 잘못됨')
    }

    switch (data.do) {
      case 'R-N-EQ-U':
        ratingHandler(2)
        break
      case 'R-EQ-D':
        ratingHandler(0)
        break
      case 'N-R-I':
        ratingHandler(1)
        break
    }
  } catch (e) {
    return console.error('fetch err: ', e)
  }
})
