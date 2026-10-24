export const renderUnlockPage = (shortUrlId, nonce, errorMessage = "") => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Protected Link</title>
<style nonce="${nonce}">
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: radial-gradient(circle at top, #1e1b4b 0%, #0f0f23 60%, #05050f 100%);
    color: #f1f5f9;
    padding: 16px;
  }
  .card {
    width: 100%;
    max-width: 380px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(16px);
    border-radius: 20px;
    padding: 32px 28px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    text-align: center;
  }
  .icon {
    width: 56px; height: 56px; margin: 0 auto 16px;
    border-radius: 16px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
  }
  h1 { font-size: 19px; margin: 0 0 6px; }
  p.sub { color: #94a3b8; font-size: 14px; margin: 0 0 24px; }
  input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.05);
    color: #f1f5f9;
    font-size: 15px;
    outline: none;
    margin-bottom: 14px;
  }
  input:focus { border-color: #818cf8; }
  button {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }
  button:hover { opacity: 0.92; }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
  .error {
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.4);
    color: #fca5a5;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 14px;
    text-align: left;
  }
  .hidden { display: none; }
</style>
</head>
<body>
  <div class="card">
    <div class="icon">🔒</div>
    <h1>This link is password protected</h1>
    <p class="sub">Enter the password to continue</p>
    <div id="errorBox" class="error ${errorMessage ? "" : "hidden"}">${errorMessage}</div>
    <form id="unlockForm">
      <input type="password" id="password" placeholder="Password" autofocus required />
      <button type="submit" id="submitBtn">Unlock</button>
    </form>
  </div>
  <script nonce="${nonce}">
    const form = document.getElementById('unlockForm');
    const errorBox = document.getElementById('errorBox');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const password = document.getElementById('password').value;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Checking…';
      errorBox.classList.add('hidden');

      try {
        const res = await fetch('/api/create/${shortUrlId}/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        let data = {};
        try { data = await res.json(); } catch (parseErr) {
          data = { message: 'Unexpected response from server (status ' + res.status + ')' };
        }

        if (res.ok && data.url) {
          window.location.href = data.url;
          return;
        }

        errorBox.textContent = data.message || ('Something went wrong (status ' + res.status + ')');
        errorBox.classList.remove('hidden');
      } catch (err) {
        errorBox.textContent = 'Network error - could not reach the server. Check your connection and try again.';
        errorBox.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Unlock';
      }
    });
  </script>
</body>
</html>`;
