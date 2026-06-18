const content = document.getElementById('content')
const form = document.getElementById('new-diary-form')

const diarySplit = window.location.href.split('/')
const diaryId = diarySplit[diarySplit.length - 2]

content.addEventListener('input', function () {
  this.style.height = 'auto'
  this.style.height = this.scrollHeight + 4 + 'px'
})

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const btn = document.querySelector('button')

  const editedDiary = new FormData(form)
  editedDiary.append('id', diaryId)

  try {
    btn.textContent = '작성중...'

    const res = await fetch('http://localhost:8787/api/diary/v1/edit', {
      method: 'PUT',
      body: editedDiary,
    })

    const redirectUrl = await res.json()

    if(!res.ok) {
      return document.getElementById('fetch-err').textContent = e
    }

    window.location.replace(`http://localhost:8787${redirectUrl.data}`);

  } catch (e) {
    document.getElementById('fetch-err').textContent = e
  } finally {
    btn.textContent = '작성 완료'
  }
})