export const SignUpPage = () => {
  return (
    <div className="sign-page">
      <form className="signup-form" action="/api/auth/v1/signup" method="post">
        <label htmlFor="username">사용자명</label>
        <br />
        <input type="text" name="username" id="username" required />
        <br />
        <br />
        <label htmlFor="description">설명</label>
        <textarea name="description" id="description" cols={40} rows={4}></textarea>
        <br />
        <br />
        <button type="submit">가입하기</button>
      </form>
    </div>
  )
}
