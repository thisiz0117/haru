const diaryId = window.location.href.split('/').pop()

const likeBtn = document.getElementById('like-btn')
const dislikeBtn = document.getElementById('dislike-btn')

let likeCount = Number(likeBtn.dataset.likesCount)
let dislikeCount = Number(dislikeBtn.dataset.dislikesCount)

let ratingStatus = 0 // default = 0, like = 1, dislike = 2

const getCurrentRating = async () => {
  const res = await fetch(`http://localhost:8787/api/diary/v1/current-rating?diary=${diaryId}`, {
    method: 'GET',
  })

  const data = await res.json()

  if (!res.ok) {
    ratingStatus = 0
  } else if ((!'reaction') in data) {
    ratingStatus = 0
  } else {
    if (data.reaction == 'default') {
      ratingStatus = 0
    } else if (data.reaction === 'like') {
      ratingStatus = 1
    } else {
      ratingStatus = 2
    }
  }
}

getCurrentRating()

const toggleRating = (rating) => {
  if (rating === 'like') {
    if (ratingStatus === 1) {
      ratingStatus = 0
      likeBtn.textContent = '좋아요: ' + --likeCount
    } else if (ratingStatus === 2) {
      ratingStatus = 1
      likeBtn.textContent = '좋아요: ' + ++likeCount
      dislikeBtn.textContent = '싫어요: ' + --dislikeCount
    } else {
      ratingStatus = 1
      likeBtn.textContent = '좋아요: ' + ++likeCount
    }
  } else {
    if (ratingStatus === 1) {
      ratingStatus = 2
      dislikeBtn.textContent = '싫어요: ' + ++dislikeCount
      likeBtn.textContent = '좋아요: ' + --likeCount
    } else if (ratingStatus === 2) {
      ratingStatus = 0
      dislikeBtn.textContent = '싫어요: ' + --dislikeCount
    } else {
      ratingStatus = 2
      dislikeBtn.textContent = '싫어요: ' + ++dislikeCount
    }
  }
}

likeBtn.addEventListener('click', async (c) => {
  console.log('like clicked')

  try {
    const response = await fetch(`http://localhost:8787/api/diary/v1/rating?diary=${diaryId}&rating=like`, {
      method: 'GET',
    })

    const data = await response.json()

    if (!response.ok) {
      return console.error({ msg: 'like rating api response not ok', err: data })
    }

    return toggleRating('like')
  } catch (e) {
    return console.error('like rating fetch err: ', e)
  }
})

dislikeBtn.addEventListener('click', (c) => {
  console.log('dislike clicked')
  toggleRating('dislike')
})
